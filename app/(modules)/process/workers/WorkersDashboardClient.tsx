'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ListRestart,
  Pause,
  Play,
  RefreshCcw,
  RotateCcw,
  Server,
  Square,
  TerminalSquare,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CodeJobCreateCard } from '@/components/code-jobs/CodeJobCreateCard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type DashboardData = {
  jobs: JobRow[]
  workers: WorkerRow[]
  logs: LogRow[]
  workspaces: WorkspaceOption[]
  counts: Record<string, number>
  runtime: {
    deno: { available: boolean; version: string }
  }
  pool: {
    localActiveWorkers: number
    workerIds: string[]
  }
}

type JobRow = {
  id: string
  workspaceSlug: string
  version: number
  entryPath: string
  functionName: string
  status: string
  queue: string
  runtime: string
  orchestrator: string
  attempt: number
  maxAttempts: number
  progress: number
  error: string | null
  workerId: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  worker?: {
    id: string
    name: string
    status: string
    heartbeatAt: string | null
  } | null
}

type WorkerRow = {
  id: string
  name: string
  kind: string
  queue: string
  status: string
  desiredStatus: string
  currentJobId: string | null
  heartbeatAt: string | null
  updatedAt: string
}

type LogRow = {
  id: number
  jobId: string
  workerId: string | null
  level: string
  message: string
  sequence: number
  createdAt: string
  job?: {
    id: string
    workspaceSlug: string
    entryPath: string
    functionName: string
  }
}

type WorkspaceOption = {
  id: string
  slug: string
  name: string
  currentVersion: number
  versions: {
    id: string
    version: number
    createdAt: string
    bundleEntries: string[]
  }[]
}

const statusLabel: Record<string, string> = {
  queued: 'در صف',
  running: 'در حال اجرا',
  paused: 'متوقف موقت',
  succeeded: 'موفق',
  failed: 'ناموفق',
  cancelled: 'لغو شده',
  idle: 'آماده',
  busy: 'مشغول',
  offline: 'خاموش',
  stopped: 'خاموش',
}

const statusClass: Record<string, string> = {
  queued: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  running:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  paused:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  succeeded: 'border-primary/30 bg-primary/10 text-primary',
  failed: 'border-destructive/30 bg-destructive/10 text-destructive',
  cancelled: 'border-muted-foreground/30 bg-muted text-muted-foreground',
  idle: 'border-primary/30 bg-primary/10 text-primary',
  busy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  offline: 'border-muted-foreground/30 bg-muted text-muted-foreground',
}

function asStatusLabel(status: string) {
  return statusLabel[status] ?? status
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-full px-2.5', statusClass[status])}
    >
      {asStatusLabel(status)}
    </Badge>
  )
}

function parseJsonField(value: string, fallback: unknown) {
  const trimmed = value.trim()
  if (!trimmed) return fallback
  return JSON.parse(trimmed)
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error ? String(data.error) : `HTTP ${res.status}`)
  }
  return data as T
}

function formatTime(value: string | null | undefined) {
  if (!value) return '-'
  return new Date(value).toLocaleString('fa-ir')
}

export default function WorkersDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedJobLogs, setSelectedJobLogs] = useState<LogRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  const [version, setVersion] = useState('')
  const [entryPath, setEntryPath] = useState('')
  const [functionName, setFunctionName] = useState('main')
  const [dataJson, setDataJson] = useState('{}')
  const [timeoutMs, setTimeoutMs] = useState('30000')
  const [maxAttempts, setMaxAttempts] = useState('1')
  const [priority, setPriority] = useState('0')
  const [workerCount, setWorkerCount] = useState('2')

  const selectedWorkspace = useMemo(
    () => data?.workspaces.find((item) => item.slug === workspaceSlug) ?? null,
    [data?.workspaces, workspaceSlug]
  )
  const selectedVersion = useMemo(
    () =>
      selectedWorkspace?.versions.find(
        (item) => String(item.version) === version
      ) ?? null,
    [selectedWorkspace?.versions, version]
  )
  const selectedJob = useMemo(
    () => data?.jobs.find((job) => job.id === selectedJobId) ?? null,
    [data?.jobs, selectedJobId]
  )

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true)
      try {
        const next = await requestJson<DashboardData>('/api/process/code-jobs')
        setData(next)
        setError(null)

        if (!workspaceSlug && next.workspaces[0]) {
          const workspace = next.workspaces[0]
          const latestVersion =
            workspace.versions.find(
              (item) => item.version === workspace.currentVersion
            ) ?? workspace.versions[0]
          setWorkspaceSlug(workspace.slug)
          setVersion(latestVersion ? String(latestVersion.version) : '')
          setEntryPath(latestVersion?.bundleEntries[0] ?? '')
        }

        if (!selectedJobId && next.jobs[0]) {
          setSelectedJobId(next.jobs[0].id)
        }
      } catch (nextError) {
        setError(
          nextError instanceof Error ? nextError.message : 'خطا در دریافت داده'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [selectedJobId, workspaceSlug]
  )

  const loadSelectedLogs = useCallback(async (jobId: string | null) => {
    if (!jobId) {
      setSelectedJobLogs([])
      return
    }
    try {
      const result = await requestJson<{ logs: LogRow[] }>(
        `/api/process/code-jobs/${encodeURIComponent(jobId)}/logs`
      )
      setSelectedJobLogs(result.logs)
    } catch {
      setSelectedJobLogs([])
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadData])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSelectedLogs(selectedJobId)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadSelectedLogs, selectedJobId])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadData(true)
      void loadSelectedLogs(selectedJobId)
    }, 2_500)
    return () => window.clearInterval(timer)
  }, [loadData, loadSelectedLogs, selectedJobId])

  const mutate = async (fn: () => Promise<void>) => {
    setIsMutating(true)
    try {
      await fn()
      setError(null)
      await loadData(true)
      await loadSelectedLogs(selectedJobId)
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'عملیات ناموفق بود'
      )
    } finally {
      setIsMutating(false)
    }
  }

  const enqueueJob = async () => {
    await mutate(async () => {
      const result = await requestJson<{ success: boolean; job: JobRow }>(
        '/api/process/code-jobs',
        {
          method: 'POST',
          body: JSON.stringify({
            workspaceSlug,
            version: Number(version),
            entryPath,
            functionName,
            data: parseJsonField(dataJson, null),
            timeoutMs: Number(timeoutMs),
            maxAttempts: Number(maxAttempts),
            priority: Number(priority),
            runNow: true,
          }),
        }
      )
      setSelectedJobId(result.job.id)
    })
  }

  const controlWorkers = async (
    action: 'start' | 'pause' | 'resume' | 'stop'
  ) => {
    await mutate(async () => {
      await requestJson('/api/process/code-jobs/workers', {
        method: 'POST',
        body: JSON.stringify({
          action,
          workerCount: Number(workerCount),
          queue: 'default',
        }),
      })
    })
  }

  const controlJob = async (
    jobId: string,
    action: 'pause' | 'resume' | 'cancel' | 'retry'
  ) => {
    await mutate(async () => {
      await requestJson(
        `/api/process/code-jobs/${encodeURIComponent(jobId)}/actions`,
        {
          method: 'POST',
          body: JSON.stringify({ action }),
        }
      )
      setSelectedJobId(jobId)
    })
  }

  const stats = [
    {
      title: 'در صف',
      value: data?.counts.queued ?? 0,
      icon: ListRestart,
      status: 'queued',
    },
    {
      title: 'در حال اجرا',
      value: data?.counts.running ?? 0,
      icon: Activity,
      status: 'running',
    },
    {
      title: 'موفق',
      value: data?.counts.succeeded ?? 0,
      icon: Play,
      status: 'succeeded',
    },
    {
      title: 'خطا',
      value: data?.counts.failed ?? 0,
      icon: AlertTriangle,
      status: 'failed',
    },
  ]

  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="from-background via-background to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="relative z-10 space-y-6">
        <div className="bg-background/98 sticky top-0 z-[180] space-y-4 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="border-border/60 bg-card/90 supports-[backdrop-filter]:bg-card/80 space-y-3 rounded-xl border p-4 shadow-md backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  اجرای کد ذخیره‌شده
                </p>
                <h1 className="text-3xl font-bold">داشبورد Worker Pool</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  Deno: {data?.runtime.deno.available ? 'آماده' : 'ناموجود'}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void loadData()}
                  disabled={isLoading}
                >
                  <RefreshCcw className="me-2 size-4" />
                  تازه‌سازی
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {stats.map((stat) => (
                <Card
                  key={stat.title}
                  className="border-border/60 bg-card/90 rounded-lg border shadow-sm"
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon
                      className={cn('size-8', statusClass[stat.status])}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </header>
        </div>

        {error ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
          <CodeJobCreateCard
            workspaces={data?.workspaces ?? []}
            workspaceSlug={workspaceSlug}
            version={version}
            entryPath={entryPath}
            functionName={functionName}
            dataJson={dataJson}
            timeoutMs={timeoutMs}
            maxAttempts={maxAttempts}
            priority={priority}
            isMutating={isMutating}
            onWorkspaceSlugChange={(nextSlug) => {
              const workspace = data?.workspaces.find(
                (item) => item.slug === nextSlug
              )
              const latestVersion =
                workspace?.versions.find(
                  (item) => item.version === workspace.currentVersion
                ) ?? workspace?.versions[0]
              setWorkspaceSlug(nextSlug)
              setVersion(latestVersion ? String(latestVersion.version) : '')
              setEntryPath(latestVersion?.bundleEntries[0] ?? '')
            }}
            onVersionChange={(nextVersion) => {
              const versionItem = selectedWorkspace?.versions.find(
                (item) => String(item.version) === nextVersion
              )
              setVersion(nextVersion)
              setEntryPath(versionItem?.bundleEntries[0] ?? '')
            }}
            onEntryPathChange={setEntryPath}
            onFunctionNameChange={setFunctionName}
            onDataJsonChange={setDataJson}
            onTimeoutMsChange={setTimeoutMs}
            onMaxAttemptsChange={setMaxAttempts}
            onPriorityChange={setPriority}
            onSubmit={() => void enqueueJob()}
          />

          <div className="space-y-4">
            <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Server className="text-primary size-5" />
                  Worker Pool
                </CardTitle>
                <CardDescription>
                  فعال: {data?.pool.localActiveWorkers ?? 0} / ثبت‌شده:{' '}
                  {data?.workers.length ?? 0}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Workers</span>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      className="w-24"
                      value={workerCount}
                      onChange={(event) => setWorkerCount(event.target.value)}
                    />
                  </label>
                  <Button
                    type="button"
                    onClick={() => void controlWorkers('start')}
                    disabled={isMutating}
                  >
                    <Play className="me-2 size-4" />
                    Run
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void controlWorkers('pause')}
                    disabled={isMutating}
                  >
                    <Pause className="me-2 size-4" />
                    Pause
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void controlWorkers('resume')}
                    disabled={isMutating}
                  >
                    <RotateCcw className="me-2 size-4" />
                    Resume
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void controlWorkers('stop')}
                    disabled={isMutating}
                  >
                    <Square className="me-2 size-4" />
                    Stop
                  </Button>
                </div>

                <div className="border-border/60 overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>نام</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Heartbeat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.workers.length ? (
                        data.workers.map((worker) => (
                          <TableRow key={worker.id}>
                            <TableCell className="text-right">
                              <div className="space-y-1">
                                <p className="font-medium">{worker.name}</p>
                                <p className="text-muted-foreground text-xs">
                                  {worker.kind} / {worker.queue}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={worker.status} />
                            </TableCell>
                            <TableCell dir="ltr" className="font-mono text-xs">
                              {worker.currentJobId ?? '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {formatTime(worker.heartbeatAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-muted-foreground py-8"
                          >
                            Worker ثبت نشده است
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Runtime</CardTitle>
                <CardDescription>
                  Orchestrator: Deno worker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-border/60 rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">Deno</span>
                    <StatusBadge
                      status={data?.runtime.deno.available ? 'idle' : 'failed'}
                    />
                  </div>
                  <p
                    dir="ltr"
                    className="text-muted-foreground line-clamp-3 text-xs"
                  >
                    {data?.runtime.deno.version ?? '-'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Jobs</CardTitle>
              <CardDescription>
                {data?.counts.total ?? 0} مورد اخیر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-border/60 overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>هدف</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>پیشرفت</TableHead>
                      <TableHead>تلاش</TableHead>
                      <TableHead>Worker</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.jobs.length ? (
                      data.jobs.map((job) => (
                        <TableRow
                          key={job.id}
                          data-state={
                            selectedJobId === job.id ? 'selected' : undefined
                          }
                          className="cursor-pointer"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          <TableCell className="min-w-64 text-right">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {job.workspaceSlug} / v{job.version}
                              </p>
                              <p
                                dir="ltr"
                                className="text-muted-foreground text-xs"
                              >
                                {job.entryPath}.{job.functionName}
                              </p>
                              {job.error ? (
                                <p className="text-destructive line-clamp-1 text-xs">
                                  {job.error}
                                </p>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={job.status} />
                          </TableCell>
                          <TableCell className="min-w-32">
                            <div className="space-y-1">
                              <Progress value={job.progress} />
                              <p className="text-muted-foreground text-xs">
                                {job.progress}٪
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {job.attempt}/{job.maxAttempts}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {job.worker?.name ?? job.workerId ?? '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap justify-center gap-1">
                              {job.status === 'running' ||
                              job.status === 'queued' ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    void controlJob(job.id, 'pause')
                                  }}
                                  disabled={isMutating}
                                >
                                  <Pause className="size-3.5" />
                                </Button>
                              ) : null}
                              {job.status === 'paused' ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    void controlJob(job.id, 'resume')
                                  }}
                                  disabled={isMutating}
                                >
                                  <Play className="size-3.5" />
                                </Button>
                              ) : null}
                              {job.status === 'failed' ||
                              job.status === 'cancelled' ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    void controlJob(job.id, 'retry')
                                  }}
                                  disabled={isMutating}
                                >
                                  <RefreshCcw className="size-3.5" />
                                </Button>
                              ) : null}
                              {job.status !== 'succeeded' &&
                              job.status !== 'cancelled' ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    void controlJob(job.id, 'cancel')
                                  }}
                                  disabled={isMutating}
                                >
                                  <Square className="size-3.5" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-muted-foreground py-8"
                        >
                          Job ثبت نشده است
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <TerminalSquare className="text-primary size-5" />
                Logs
              </CardTitle>
              <CardDescription>
                {selectedJob
                  ? `${selectedJob.workspaceSlug} / ${selectedJob.functionName}`
                  : 'آخرین رخدادها'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-border/60 bg-background/80 h-[520px] overflow-auto rounded-lg border p-3">
                {(selectedJobId ? selectedJobLogs : (data?.logs ?? []))
                  .length ? (
                  <div className="space-y-2">
                    {(selectedJobId ? selectedJobLogs : (data?.logs ?? [])).map(
                      (log) => (
                        <div
                          key={log.id}
                          className="border-border/50 bg-card/70 rounded-md border px-3 py-2"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                'rounded-full',
                                log.level === 'error'
                                  ? statusClass.failed
                                  : log.level === 'warn'
                                    ? statusClass.paused
                                    : statusClass.queued
                              )}
                            >
                              {log.level}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {formatTime(log.createdAt)}
                            </span>
                          </div>
                          <p
                            dir="ltr"
                            className="text-left font-mono text-xs break-words whitespace-pre-wrap"
                          >
                            {log.message}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                    لاگی برای نمایش وجود ندارد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
