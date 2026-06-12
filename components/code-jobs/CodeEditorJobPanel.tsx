'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Clock3,
  FileJson,
  ListRestart,
  Pause,
  Play,
  RefreshCcw,
  RotateCcw,
  Square,
  TerminalSquare,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CodeSnippet } from '@/components/code-snippet'
import {
  CodeJobCreateCard,
  type CodeJobWorkspaceOption,
} from './CodeJobCreateCard'
import { cn } from '@/lib/utils'

type DashboardData = {
  jobs: JobRow[]
  logs: LogRow[]
  workspaces: CodeJobWorkspaceOption[]
  counts: Record<string, number>
  pool?: {
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
  queue?: string
  runtime?: string
  orchestrator?: string
  attempt: number
  maxAttempts: number
  progress: number
  timeoutMs?: number
  priority?: number
  data?: string
  checkpoint?: string
  result?: string | null
  error: string | null
  metadata?: string
  workerId?: string | null
  requestedAction?: string | null
  createdAt: string
  updatedAt?: string
  completedAt: string | null
}

type LogRow = {
  id: number
  jobId: string
  workerId: string | null
  level: string
  message: string
  sequence: number
  createdAt: string
}

type DetailTab = 'result' | 'error' | 'debug' | 'logs'

const statusLabel: Record<string, string> = {
  queued: 'در صف',
  running: 'در حال اجرا',
  paused: 'متوقف موقت',
  succeeded: 'موفق',
  failed: 'ناموفق',
  cancelled: 'لغو شده',
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
}

const logLevelClass: Record<string, string> = {
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  warn: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  info: 'border-primary/30 bg-primary/10 text-primary',
  debug: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
}

function parseJsonField(value: string, fallback: unknown) {
  const trimmed = value.trim()
  if (!trimmed) return fallback
  return JSON.parse(trimmed)
}

function safeParseJson(value: string | null | undefined, fallback: unknown) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function formatJson(value: unknown) {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
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
  return new Date(value).toLocaleTimeString('fa-ir', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function elapsedMs(job: JobRow | null) {
  if (!job) return null
  const start = new Date(job.createdAt).getTime()
  const end = new Date(job.completedAt ?? job.updatedAt ?? Date.now()).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  return Math.max(0, end - start)
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-full px-2.5', statusClass[status])}
    >
      {statusLabel[status] ?? status}
    </Badge>
  )
}

function JsonBlock({
  title,
  value,
  empty = 'داده‌ای برای نمایش وجود ندارد',
}: {
  title: string
  value: unknown
  empty?: string
}) {
  const text = formatJson(value)
  const isEmpty =
    value === null ||
    value === undefined ||
    text === '' ||
    text === 'null' ||
    text === '{}'

  return (
    <div className="min-h-0 rounded-md border bg-background/70">
      <div className="flex h-8 items-center justify-between border-b px-3">
        <p className="text-xs font-semibold">{title}</p>
        <FileJson className="text-muted-foreground size-3.5" />
      </div>
      {isEmpty ? (
        <p className="text-muted-foreground px-3 py-6 text-center text-xs">
          {empty}
        </p>
      ) : (
        <CodeSnippet code={text} language="json" className="max-h-72" />
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof TerminalSquare
  tone: string
}) {
  return (
    <div className="rounded-md border bg-card/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <Icon className={cn('size-6', tone)} />
      </div>
    </div>
  )
}

export function CodeEditorJobPanel({
  preferredWorkspaceSlug,
}: {
  preferredWorkspaceSlug: string
}) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedJobLogs, setSelectedJobLogs] = useState<LogRow[]>([])
  const [detailTab, setDetailTab] = useState<DetailTab>('result')
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workspaceSlug, setWorkspaceSlug] = useState(preferredWorkspaceSlug)
  const [version, setVersion] = useState('')
  const [entryPath, setEntryPath] = useState('')
  const [functionName, setFunctionName] = useState('main')
  const [dataJson, setDataJson] = useState('{}')
  const [timeoutMs, setTimeoutMs] = useState('30000')
  const [maxAttempts, setMaxAttempts] = useState('1')
  const [priority, setPriority] = useState('0')

  const selectedWorkspace = useMemo(
    () => data?.workspaces.find((item) => item.slug === workspaceSlug) ?? null,
    [data?.workspaces, workspaceSlug]
  )
  const selectedJob = useMemo(
    () => data?.jobs.find((job) => job.id === selectedJobId) ?? null,
    [data?.jobs, selectedJobId]
  )
  const selectedResult = useMemo(
    () => safeParseJson(selectedJob?.result, null),
    [selectedJob?.result]
  )
  const selectedData = useMemo(
    () => safeParseJson(selectedJob?.data, null),
    [selectedJob?.data]
  )
  const selectedCheckpoint = useMemo(
    () => safeParseJson(selectedJob?.checkpoint, null),
    [selectedJob?.checkpoint]
  )
  const selectedMetadata = useMemo(
    () => safeParseJson(selectedJob?.metadata, {}),
    [selectedJob?.metadata]
  )
  const durationMs = elapsedMs(selectedJob)

  const stats = useMemo(
    () => [
      {
        label: 'موفق',
        value: data?.counts.succeeded ?? 0,
        icon: CheckCircle2,
        tone: 'text-primary',
      },
      {
        label: 'در حال اجرا',
        value: data?.counts.running ?? 0,
        icon: Play,
        tone: 'text-emerald-600',
      },
      {
        label: 'در صف',
        value: data?.counts.queued ?? 0,
        icon: Clock3,
        tone: 'text-sky-600',
      },
      {
        label: 'خطا',
        value: data?.counts.failed ?? 0,
        icon: XCircle,
        tone: 'text-destructive',
      },
    ],
    [data?.counts]
  )

  const applyWorkspaceDefaults = useCallback(
    (workspace: CodeJobWorkspaceOption) => {
      const latestVersion =
        workspace.versions.find(
          (item) => item.version === workspace.currentVersion
        ) ?? workspace.versions[0]
      setWorkspaceSlug(workspace.slug)
      setVersion(latestVersion ? String(latestVersion.version) : '')
      setEntryPath(latestVersion?.bundleEntries[0] ?? '')
    },
    []
  )

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true)
      try {
        const next = await requestJson<DashboardData>('/api/process/code-jobs')
        setData(next)
        setError(null)

        if (
          !workspaceSlug ||
          !next.workspaces.some((item) => item.slug === workspaceSlug)
        ) {
          const preferred =
            next.workspaces.find(
              (item) => item.slug === preferredWorkspaceSlug
            ) ?? next.workspaces[0]
          if (preferred) applyWorkspaceDefaults(preferred)
        } else if (!version) {
          const workspace = next.workspaces.find(
            (item) => item.slug === workspaceSlug
          )
          if (workspace) applyWorkspaceDefaults(workspace)
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
    [
      applyWorkspaceDefaults,
      preferredWorkspaceSlug,
      selectedJobId,
      version,
      workspaceSlug,
    ]
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

  const enqueueJob = async () => {
    setIsMutating(true)
    try {
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
      setDetailTab('logs')
      setError(null)
      await loadData(true)
      await loadSelectedLogs(result.job.id)
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'عملیات ناموفق بود'
      )
    } finally {
      setIsMutating(false)
    }
  }

  const controlJob = async (action: 'pause' | 'resume' | 'cancel' | 'retry') => {
    if (!selectedJobId) return
    setIsMutating(true)
    try {
      await requestJson(
        `/api/process/code-jobs/${encodeURIComponent(selectedJobId)}/actions`,
        {
          method: 'POST',
          body: JSON.stringify({ action }),
        }
      )
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

  const logsToShow = selectedJobId ? selectedJobLogs : (data?.logs ?? [])

  return (
    <div
      dir="rtl"
      className="bg-background text-foreground flex h-full min-h-0 flex-col"
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md">
            <TerminalSquare className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Jobs</p>
            <p className="text-muted-foreground text-[11px]">
              اجرای باندل‌ها، خروجی، خطا و دیباگ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full">
            Workers: {data?.pool?.localActiveWorkers ?? 0}
          </Badge>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => void loadData()}
            disabled={isLoading}
            title="Refresh jobs"
          >
            <RefreshCcw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3">
        {error ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive mb-3 rounded-md border px-3 py-2 text-xs">
            {error}
          </div>
        ) : null}

        <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <CodeJobCreateCard
              compact
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
                if (workspace) {
                  applyWorkspaceDefaults(workspace)
                } else {
                  setWorkspaceSlug(nextSlug)
                }
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

            <Card className="min-h-0 flex-1 overflow-hidden">
              <CardHeader className="flex-row items-center justify-between p-3 pb-2">
                <CardTitle className="text-sm">Recent jobs</CardTitle>
                <Badge variant="outline" className="rounded-full">
                  {data?.counts.total ?? 0}
                </Badge>
              </CardHeader>
              <CardContent className="min-h-0 overflow-auto p-2 pt-0">
                {data?.jobs.length ? (
                  <div className="space-y-1.5">
                    {data.jobs.map((job) => {
                      const active = job.id === selectedJobId
                      return (
                        <button
                          key={job.id}
                          type="button"
                          className={cn(
                            'hover:bg-accent hover:text-accent-foreground w-full rounded-md border p-2 text-right transition-colors',
                            active
                              ? 'border-primary/40 bg-primary/10'
                              : 'border-border/70 bg-card/70'
                          )}
                          onClick={() => {
                            setSelectedJobId(job.id)
                            void loadSelectedLogs(job.id)
                          }}
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <StatusBadge status={job.status} />
                            <span className="text-muted-foreground text-[10px]">
                              {formatTime(job.createdAt)}
                            </span>
                          </div>
                          <p
                            dir="ltr"
                            className="truncate text-left font-mono text-xs font-semibold"
                          >
                            {job.entryPath}.{job.functionName}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress
                              value={Math.max(0, Math.min(100, job.progress))}
                              className="h-1.5"
                            />
                            <span className="text-muted-foreground w-8 text-left text-[10px]">
                              {job.progress}%
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1 text-[11px]">
                            v{job.version} · attempt {job.attempt}/
                            {job.maxAttempts}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-8 text-center text-xs">
                    هنوز Job ثبت نشده است
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>

          <section className="flex min-h-0 flex-col gap-3 overflow-hidden">
            <Card className="shrink-0">
              <CardContent className="p-3">
                {selectedJob ? (
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={selectedJob.status} />
                        <Badge variant="outline" className="rounded-full">
                          {selectedJob.runtime ?? 'remote'}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          {selectedJob.orchestrator ?? 'database'}
                        </Badge>
                      </div>
                      <p
                        dir="ltr"
                        className="truncate text-left font-mono text-sm font-semibold"
                      >
                        {selectedJob.entryPath}.{selectedJob.functionName}
                      </p>
                      <div className="grid gap-2 text-xs sm:grid-cols-4">
                        <div className="rounded-md border bg-background/70 p-2">
                          <p className="text-muted-foreground">Version</p>
                          <p className="font-semibold">v{selectedJob.version}</p>
                        </div>
                        <div className="rounded-md border bg-background/70 p-2">
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-semibold">
                            {durationMs === null ? '-' : `${durationMs}ms`}
                          </p>
                        </div>
                        <div className="rounded-md border bg-background/70 p-2">
                          <p className="text-muted-foreground">Timeout</p>
                          <p className="font-semibold">
                            {selectedJob.timeoutMs ?? '-'}ms
                          </p>
                        </div>
                        <div className="rounded-md border bg-background/70 p-2">
                          <p className="text-muted-foreground">Worker</p>
                          <p
                            dir="ltr"
                            className="truncate text-left font-mono font-semibold"
                          >
                            {selectedJob.workerId ?? '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap content-start gap-2 lg:justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void controlJob('retry')}
                        disabled={isMutating}
                      >
                        <RotateCcw className="me-2 size-4" />
                        Retry
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void controlJob('pause')}
                        disabled={
                          isMutating ||
                          !['queued', 'running'].includes(selectedJob.status)
                        }
                      >
                        <Pause className="me-2 size-4" />
                        Pause
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void controlJob('resume')}
                        disabled={isMutating || selectedJob.status !== 'paused'}
                      >
                        <ListRestart className="me-2 size-4" />
                        Resume
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => void controlJob('cancel')}
                        disabled={
                          isMutating ||
                          ['succeeded', 'failed', 'cancelled'].includes(
                            selectedJob.status
                          )
                        }
                      >
                        <Square className="me-2 size-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
                    <TerminalSquare className="size-4" />
                    یک Job را برای مشاهده جزئیات انتخاب کنید
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex shrink-0 flex-wrap gap-2 rounded-md border bg-card/70 p-1">
              {(
                [
                  ['result', 'Result', CheckCircle2],
                  ['error', 'Errors', AlertTriangle],
                  ['debug', 'Debug', Bug],
                  ['logs', 'Logs', TerminalSquare],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    'flex h-8 items-center gap-2 rounded px-3 text-xs font-medium transition-colors',
                    detailTab === key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => setDetailTab(key)}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {detailTab === 'result' ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  <JsonBlock title="Run output" value={selectedResult} />
                  <JsonBlock title="Input data" value={selectedData} />
                  <JsonBlock title="Checkpoint" value={selectedCheckpoint} />
                </div>
              ) : null}

              {detailTab === 'error' ? (
                <Card>
                  <CardContent className="p-3">
                    {selectedJob?.error ? (
                      <pre
                        dir="ltr"
                        className="border-destructive/30 bg-destructive/10 text-destructive max-h-[520px] overflow-auto rounded-md border p-3 text-left font-mono text-xs leading-6 whitespace-pre-wrap"
                      >
                        {selectedJob.error}
                      </pre>
                    ) : (
                      <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
                        <CheckCircle2 className="text-primary size-5" />
                        خطایی برای Job انتخاب‌شده ثبت نشده است
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {detailTab === 'debug' ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  <JsonBlock
                    title="Metadata"
                    value={{
                      ...((selectedMetadata &&
                      typeof selectedMetadata === 'object'
                        ? selectedMetadata
                        : {}) as Record<string, unknown>),
                      queue: selectedJob?.queue,
                      priority: selectedJob?.priority,
                      requestedAction: selectedJob?.requestedAction,
                    }}
                  />
                  <JsonBlock
                    title="Execution"
                    value={{
                      id: selectedJob?.id,
                      workspaceSlug: selectedJob?.workspaceSlug,
                      entryPath: selectedJob?.entryPath,
                      functionName: selectedJob?.functionName,
                      attempt: selectedJob
                        ? `${selectedJob.attempt}/${selectedJob.maxAttempts}`
                        : null,
                      progress: selectedJob?.progress,
                      createdAt: selectedJob?.createdAt,
                      updatedAt: selectedJob?.updatedAt,
                      completedAt: selectedJob?.completedAt,
                    }}
                  />
                  <JsonBlock title="Data" value={selectedData} />
                </div>
              ) : null}

              {detailTab === 'logs' ? (
                <Card>
                  <CardHeader className="flex-row items-center justify-between p-3 pb-2">
                    <CardTitle className="text-sm">Logs</CardTitle>
                    <Badge variant="outline" className="rounded-full">
                      {logsToShow.length}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {logsToShow.length ? (
                      <div className="space-y-2">
                        {logsToShow.map((log) => (
                          <div
                            key={log.id}
                            className="rounded-md border bg-background/80 px-3 py-2"
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'rounded-full text-[10px]',
                                  logLevelClass[log.level]
                                )}
                              >
                                {log.level}
                              </Badge>
                              <span className="text-muted-foreground text-[10px]">
                                #{log.sequence} · {formatTime(log.createdAt)}
                              </span>
                            </div>
                            <p
                              dir="ltr"
                              className="text-left font-mono text-[11px] leading-5 break-words whitespace-pre-wrap"
                            >
                              {log.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-16 text-center text-xs">
                        لاگی برای نمایش وجود ندارد
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
