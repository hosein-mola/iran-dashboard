import { execFile } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'

import prisma from '@/lib/prisma'
import { resolveBundleFromMeta } from '@/lib/code-workspaces/bundles'
import {
  findWorkspaceBySlugForUser,
  normalizeEntryPath,
} from '@/lib/code-workspaces/server'
import { runRemoteCodeBundle } from '@/lib/code-runner/client'
import type { CreateCodeJobInput } from '@/schemas/code-job'

const execFileAsync = promisify(execFile)
const HEARTBEAT_MS = 2_000
const IDLE_SLEEP_MS = 1_200
const LEASE_GRACE_MS = 15_000
const DEFAULT_QUEUE = 'default'

type LocalWorkerLoop = {
  id: string
  queue: string
  active: boolean
  promise: Promise<void>
}

type CodeJobStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'succeeded'
  | 'failed'
  | 'cancelled'

type CodeWorkerStatus = 'idle' | 'busy' | 'paused' | 'offline'

declare global {
  var __codeJobWorkerPool:
    | {
        loops: Map<string, LocalWorkerLoop>
      }
    | undefined
}

function getPoolState() {
  if (!globalThis.__codeJobWorkerPool) {
    globalThis.__codeJobWorkerPool = {
      loops: new Map(),
    }
  }
  return globalThis.__codeJobWorkerPool
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function safeJsonStringify(value: unknown, fallback = 'null') {
  try {
    return JSON.stringify(value ?? null)
  } catch {
    try {
      return JSON.stringify(String(value))
    } catch {
      return fallback
    }
  }
}

function safeJsonParse(value: string | null | undefined, fallback: unknown) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function clampTimeout(value: unknown) {
  const timeoutMs = Number(value ?? 30_000)
  if (!Number.isFinite(timeoutMs)) return 30_000
  return Math.max(100, Math.min(300_000, Math.round(timeoutMs)))
}

function backoffForAttempt(attempt: number) {
  const seconds = Math.min(60, Math.max(2, 2 ** Math.max(0, attempt - 1)))
  return new Date(Date.now() + seconds * 1000)
}

async function addJobLog(input: {
  jobId: string
  workerId?: string | null
  level?: string
  message: string
  meta?: unknown
}) {
  const count = await prisma.codeJobLog.count({
    where: { jobId: input.jobId },
  })
  return await prisma.codeJobLog.create({
    data: {
      jobId: input.jobId,
      workerId: input.workerId ?? null,
      level: input.level ?? 'info',
      message: input.message,
      sequence: count + 1,
      meta: safeJsonStringify(input.meta, '{}'),
    },
  })
}

async function setWorkerStatus(
  workerId: string,
  status: CodeWorkerStatus,
  currentJobId: string | null = null
) {
  const now = new Date()
  await prisma.codeWorker.update({
    where: { id: workerId },
    data: {
      status,
      currentJobId,
      heartbeatAt: now,
      ...(status === 'offline' ? { stoppedAt: now } : {}),
      ...(status === 'idle' || status === 'busy' ? { startedAt: now } : {}),
    },
  })
}

export async function createCodeJob(input: {
  userId: string
  data: CreateCodeJobInput
}) {
  const workspace = await findWorkspaceBySlugForUser(
    input.data.workspaceSlug,
    input.userId
  )
  if (!workspace) {
    return { ok: false as const, status: 404, error: 'Workspace not found' }
  }

  const entryPath = normalizeEntryPath(input.data.entryPath)
  const versionRow = await prisma.codeWorkspaceVersion.findUnique({
    where: {
      workspaceId_version: {
        workspaceId: workspace.id,
        version: input.data.version,
      },
    },
    select: {
      id: true,
      version: true,
      meta: true,
    },
  })

  if (!versionRow) {
    return { ok: false as const, status: 404, error: 'Version not found' }
  }

  const resolved = resolveBundleFromMeta(versionRow.meta, entryPath)
  if (!resolved) {
    return {
      ok: false as const,
      status: 404,
      error: `Bundle not found in database for entry: ${entryPath}`,
    }
  }

  const job = await prisma.codeJob.create({
    data: {
      workspaceVersionId: versionRow.id,
      workspaceSlug: workspace.slug,
      version: versionRow.version,
      entryPath: resolved.entryPath,
      functionName: input.data.functionName,
      args: '[]',
      data: safeJsonStringify(input.data.data ?? null),
      queue: input.data.queue || DEFAULT_QUEUE,
      priority: input.data.priority ?? 0,
      timeoutMs: clampTimeout(input.data.timeoutMs),
      maxAttempts: input.data.maxAttempts ?? 1,
      runtime: 'deno',
      orchestrator: 'database',
      createdByUserId: input.userId,
      metadata: safeJsonStringify({
        requestedEntryPath: entryPath,
        bundleHash:
          typeof resolved.bundle.hash === 'string' ? resolved.bundle.hash : null,
      }),
    },
  })

  await addJobLog({
    jobId: job.id,
    level: 'info',
    message: `Job queued for ${workspace.slug} v${versionRow.version} ${resolved.entryPath}.${input.data.functionName}`,
  })

  return { ok: true as const, job }
}

async function ensureWorkerRows(workerCount: number, queue: string) {
  const count = Math.max(1, Math.min(8, workerCount))
  const workers: Array<{ id: string }> = []

  for (let index = 1; index <= count; index += 1) {
    const id = `local-${queue}-${index}`
    const worker = await prisma.codeWorker.upsert({
      where: { id },
      create: {
        id,
        name: `Local ${queue} worker ${index}`,
        kind: 'deno',
        queue,
        desiredStatus: 'running',
        status: 'idle',
        concurrency: 1,
        heartbeatAt: new Date(),
        startedAt: new Date(),
        metadata: safeJsonStringify({
          pool: 'local',
          durableStore: 'prisma-sqlite',
        }),
      },
      update: {
        desiredStatus: 'running',
        status: 'idle',
        heartbeatAt: new Date(),
        stoppedAt: null,
      },
      select: {
        id: true,
      },
    })
    workers.push(worker)
  }

  return workers
}

async function recoverExpiredJobs(queue = DEFAULT_QUEUE) {
  const now = new Date()
  const expired = await prisma.codeJob.findMany({
    where: {
      queue,
      status: 'running',
      leaseExpiresAt: {
        lt: now,
      },
    },
    select: {
      id: true,
      workerId: true,
      attempt: true,
      maxAttempts: true,
    },
  })

  for (const job of expired) {
    const shouldRetry = job.attempt < job.maxAttempts
    await prisma.codeJob.update({
      where: { id: job.id },
      data: {
        status: shouldRetry ? 'queued' : 'failed',
        workerId: null,
        requestedAction: null,
        leaseToken: null,
        lockedAt: null,
        leaseExpiresAt: null,
        nextRunAt: shouldRetry ? new Date() : undefined,
        completedAt: shouldRetry ? null : new Date(),
        error: shouldRetry
          ? 'Worker lease expired; job restored to queue'
          : 'Worker lease expired; max attempts reached',
      },
    })
    await addJobLog({
      jobId: job.id,
      workerId: job.workerId,
      level: shouldRetry ? 'warn' : 'error',
      message: shouldRetry
        ? 'Worker lease expired. Job restored to queue.'
        : 'Worker lease expired and max attempts were reached.',
    })
  }

  return expired.length
}

async function claimNextJob(workerId: string, queue: string) {
  const now = new Date()
  const candidate = await prisma.codeJob.findFirst({
    where: {
      queue,
      status: 'queued',
      nextRunAt: { lte: now },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      timeoutMs: true,
    },
  })

  if (!candidate) return null

  const leaseToken = randomUUID()
  const updated = await prisma.codeJob.updateMany({
    where: {
      id: candidate.id,
      status: 'queued',
    },
    data: {
      status: 'running',
      workerId,
      leaseToken,
      lockedAt: now,
      leaseExpiresAt: new Date(
        now.getTime() + clampTimeout(candidate.timeoutMs) + LEASE_GRACE_MS
      ),
      startedAt: now,
      completedAt: null,
      requestedAction: null,
      attempt: {
        increment: 1,
      },
    },
  })

  if (updated.count !== 1) return null

  return await prisma.codeJob.findUnique({
    where: { id: candidate.id },
    include: {
      workspaceVersion: {
        select: {
          id: true,
          meta: true,
        },
      },
    },
  })
}

async function executeClaimedJob(
  job: NonNullable<Awaited<ReturnType<typeof claimNextJob>>>,
  workerId: string
) {
  await setWorkerStatus(workerId, 'busy', job.id)
  await addJobLog({
    jobId: job.id,
    workerId,
    level: 'info',
    message: `Worker claimed attempt ${job.attempt}.`,
  })

  const resolved = resolveBundleFromMeta(job.workspaceVersion.meta, job.entryPath)
  if (!resolved || typeof resolved.bundle.code !== 'string') {
    await prisma.codeJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        error: `Bundle not found for entry ${job.entryPath}`,
        completedAt: new Date(),
        leaseToken: null,
        lockedAt: null,
        leaseExpiresAt: null,
      },
    })
    await addJobLog({
      jobId: job.id,
      workerId,
      level: 'error',
      message: `Bundle not found for entry ${job.entryPath}.`,
    })
    return
  }

  const data = safeJsonParse(job.data, null)
  const checkpoint = safeJsonParse(job.checkpoint, null)

  const result = await runRemoteCodeBundle({
    bundleName: job.workspaceSlug,
    bundleVersion: String(job.version),
    code: String(resolved.bundle.code),
    functionName: job.functionName,
    data,
    timeoutMs: job.timeoutMs,
    metadata: {
      databaseJobId: job.id,
      workspaceSlug: job.workspaceSlug,
      version: job.version,
      entryPath: job.entryPath,
      attempt: job.attempt,
      checkpoint,
    },
  })

  for (const entry of result.logs) {
    await addJobLog({
      jobId: job.id,
      workerId,
      level: entry.level,
      message: entry.message,
    })
  }

  const checkpointAfterRun = checkpoint

  const requestedAction = await prisma.codeJob.findUnique({
    where: { id: job.id },
    select: { requestedAction: true },
  })
  if (
    requestedAction?.requestedAction === 'pause' ||
    requestedAction?.requestedAction === 'cancel'
  ) {
    const action = requestedAction.requestedAction
    await prisma.codeJob.update({
      where: { id: job.id },
      data: {
        status: action === 'pause' ? 'paused' : 'cancelled',
        error: action === 'cancel' ? 'Job cancelled by operator.' : null,
        checkpoint: safeJsonStringify(checkpointAfterRun),
        requestedAction: null,
        completedAt: action === 'cancel' ? new Date() : null,
        leaseToken: null,
        lockedAt: null,
        leaseExpiresAt: null,
      },
    })
    await addJobLog({
      jobId: job.id,
      workerId,
      level: 'warn',
      message:
        action === 'pause'
          ? 'Job paused by operator after remote execution returned.'
          : 'Job cancelled by operator after remote execution returned.',
    })
    return
  }

  if (result.success) {
    await prisma.codeJob.update({
      where: { id: job.id },
      data: {
        status: 'succeeded',
        result: safeJsonStringify(result.result),
        error: null,
        checkpoint: safeJsonStringify(checkpointAfterRun),
        progress: 100,
        completedAt: new Date(),
        requestedAction: null,
        leaseToken: null,
        lockedAt: null,
        leaseExpiresAt: null,
      },
    })
    await addJobLog({
      jobId: job.id,
      workerId,
      level: 'info',
      message: `Job completed in ${result.durationMs}ms.`,
    })
    return
  }

  const shouldRetry = job.attempt < job.maxAttempts
  await prisma.codeJob.update({
    where: { id: job.id },
    data: {
      status: shouldRetry ? 'queued' : 'failed',
      error: result.error,
      checkpoint: safeJsonStringify(checkpointAfterRun),
      nextRunAt: shouldRetry ? backoffForAttempt(job.attempt) : undefined,
      completedAt: shouldRetry ? null : new Date(),
      requestedAction: null,
      leaseToken: null,
      lockedAt: null,
      leaseExpiresAt: null,
      workerId: shouldRetry ? null : workerId,
    },
  })
  await addJobLog({
    jobId: job.id,
    workerId,
    level: shouldRetry ? 'warn' : 'error',
    message: shouldRetry
      ? `Attempt failed: ${result.error}. Job will retry.`
      : `Job failed: ${result.error}`,
  })
}

async function workerLoop(workerId: string, queue: string) {
  while (getPoolState().loops.get(workerId)?.active) {
    const worker = await prisma.codeWorker.findUnique({
      where: { id: workerId },
      select: { desiredStatus: true },
    })

    if (!worker || worker.desiredStatus === 'stopped') break

    if (worker.desiredStatus === 'paused') {
      await setWorkerStatus(workerId, 'paused')
      await sleep(HEARTBEAT_MS)
      continue
    }

    await recoverExpiredJobs(queue)
    const job = await claimNextJob(workerId, queue)
    if (!job) {
      await setWorkerStatus(workerId, 'idle')
      await sleep(IDLE_SLEEP_MS)
      continue
    }

    try {
      await executeClaimedJob(job, workerId)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Worker failed unexpectedly'
      await prisma.codeJob.update({
        where: { id: job.id },
        data: {
          status: job.attempt < job.maxAttempts ? 'queued' : 'failed',
          error: message,
          workerId: null,
          leaseToken: null,
          lockedAt: null,
          leaseExpiresAt: null,
          nextRunAt: job.attempt < job.maxAttempts ? backoffForAttempt(job.attempt) : undefined,
          completedAt: job.attempt < job.maxAttempts ? null : new Date(),
        },
      })
      await addJobLog({
        jobId: job.id,
        workerId,
        level: 'error',
        message,
      })
    } finally {
      await setWorkerStatus(workerId, 'idle')
    }
  }

  await setWorkerStatus(workerId, 'offline').catch(() => null)
  getPoolState().loops.delete(workerId)
}

export async function startWorkerPool(input?: {
  workerCount?: number
  queue?: string
}) {
  const queue = input?.queue || DEFAULT_QUEUE
  const workerCount = input?.workerCount ?? 2
  await recoverExpiredJobs(queue)
  const workers = await ensureWorkerRows(workerCount, queue)
  const pool = getPoolState()

  for (const worker of workers) {
    const existing = pool.loops.get(worker.id)
    if (existing?.active) continue

    const loop: LocalWorkerLoop = {
      id: worker.id,
      queue,
      active: true,
      promise: Promise.resolve(),
    }
    pool.loops.set(worker.id, loop)
    loop.promise = workerLoop(worker.id, queue)
  }

  return getWorkerPoolSnapshot()
}

async function reconcileDesiredWorkerPools() {
  const desired = await prisma.codeWorker.groupBy({
    by: ['queue'],
    where: {
      desiredStatus: 'running',
    },
    _count: {
      id: true,
    },
  })
  const pool = getPoolState()

  for (const item of desired) {
    const queue = item.queue
    const hasActiveLoop = Array.from(pool.loops.values()).some(
      (loop) => loop.queue === queue && loop.active
    )
    if (hasActiveLoop) continue

    await startWorkerPool({
      queue,
      workerCount: item._count.id,
    })
  }
}

export async function pauseWorkerPool(queue = DEFAULT_QUEUE) {
  await prisma.codeWorker.updateMany({
    where: { queue },
    data: { desiredStatus: 'paused', status: 'paused', heartbeatAt: new Date() },
  })
  await prisma.codeJob.updateMany({
    where: { queue, status: 'running' },
    data: { requestedAction: 'pause' },
  })
  return getWorkerPoolSnapshot()
}

export async function resumeWorkerPool(input?: {
  workerCount?: number
  queue?: string
}) {
  const queue = input?.queue || DEFAULT_QUEUE
  await prisma.codeJob.updateMany({
    where: { queue, status: 'paused' },
    data: {
      status: 'queued',
      requestedAction: null,
      nextRunAt: new Date(),
      workerId: null,
      leaseToken: null,
      lockedAt: null,
      leaseExpiresAt: null,
    },
  })
  return await startWorkerPool(input)
}

export async function stopWorkerPool(queue = DEFAULT_QUEUE) {
  const pool = getPoolState()
  for (const loop of pool.loops.values()) {
    if (loop.queue === queue) loop.active = false
  }
  await prisma.codeWorker.updateMany({
    where: { queue },
    data: {
      desiredStatus: 'stopped',
      status: 'offline',
      heartbeatAt: new Date(),
      stoppedAt: new Date(),
    },
  })
  await prisma.codeJob.updateMany({
    where: { queue, status: 'running' },
    data: { requestedAction: 'pause' },
  })
  return getWorkerPoolSnapshot()
}

export async function controlCodeJob(jobId: string, action: string) {
  const job = await prisma.codeJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      queue: true,
      maxAttempts: true,
    },
  })
  if (!job) return { ok: false as const, status: 404, error: 'Job not found' }

  if (action === 'pause') {
    const nextStatus = job.status === 'queued' ? 'paused' : job.status
    await prisma.codeJob.update({
      where: { id: job.id },
      data: {
        status: nextStatus,
        requestedAction: job.status === 'running' ? 'pause' : null,
      },
    })
    await addJobLog({
      jobId: job.id,
      level: 'warn',
      message: 'Pause requested by operator.',
    })
    return { ok: true as const }
  }

  if (action === 'resume') {
    await prisma.codeJob.update({
      where: { id: job.id },
      data: {
        status: 'queued',
        requestedAction: null,
        nextRunAt: new Date(),
        workerId: null,
        leaseToken: null,
        lockedAt: null,
        leaseExpiresAt: null,
        completedAt: null,
      },
    })
    await addJobLog({
      jobId: job.id,
      level: 'info',
      message: 'Job resumed by operator.',
    })
    await startWorkerPool({ queue: job.queue })
    return { ok: true as const }
  }

  if (action === 'cancel') {
    if (job.status === 'running') {
      await prisma.codeJob.update({
        where: { id: job.id },
        data: { requestedAction: 'cancel' },
      })
    } else {
      await prisma.codeJob.update({
        where: { id: job.id },
        data: {
          status: 'cancelled',
          requestedAction: null,
          completedAt: new Date(),
          leaseToken: null,
          lockedAt: null,
          leaseExpiresAt: null,
        },
      })
    }
    await addJobLog({
      jobId: job.id,
      level: 'warn',
      message: 'Cancel requested by operator.',
    })
    return { ok: true as const }
  }

  if (action === 'retry') {
    await prisma.codeJob.update({
      where: { id: job.id },
      data: {
        status: 'queued',
        requestedAction: null,
        error: null,
        result: null,
        progress: 0,
        attempt: 0,
        nextRunAt: new Date(),
        completedAt: null,
        workerId: null,
        leaseToken: null,
        lockedAt: null,
        leaseExpiresAt: null,
      },
    })
    await addJobLog({
      jobId: job.id,
      level: 'info',
      message: 'Retry requested by operator.',
    })
    await startWorkerPool({ queue: job.queue })
    return { ok: true as const }
  }

  return { ok: false as const, status: 400, error: 'Invalid action' }
}

export function getWorkerPoolSnapshot() {
  const pool = getPoolState()
  return {
    localActiveWorkers: Array.from(pool.loops.values()).filter(
      (loop) => loop.active
    ).length,
    workerIds: Array.from(pool.loops.keys()),
  }
}

async function readPackageJson() {
  const path = join(process.cwd(), 'package.json')
  const raw = await readFile(path, 'utf8').catch(() => '{}')
  return safeJsonParse(raw, {}) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
}

async function commandVersion(command: string, args: string[]) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      timeout: 2_000,
      maxBuffer: 32_000,
    })
    return {
      available: true,
      version: `${stdout}${stderr}`.trim(),
    }
  } catch (error) {
    return {
      available: false,
      version:
        error instanceof Error
          ? error.message
          : 'Command failed',
    }
  }
}

function getDenoCommand() {
  return (
    process.env.DENO_BIN ||
    (process.env.HOME ? join(process.env.HOME, '.deno', 'bin', 'deno') : 'deno')
  )
}

export async function getCodeJobRuntimeInfo() {
  const deno = await commandVersion(getDenoCommand(), ['--version'])
  const temporalPath = join(process.cwd(), 'bin', 'temporal')
  const temporalBinaryExists = await access(temporalPath)
    .then(() => true)
    .catch(() => false)
  const temporal = temporalBinaryExists
    ? await commandVersion(temporalPath, ['--version'])
    : { available: false, version: 'bin/temporal not found' }
  const packageJson = await readPackageJson()
  const deps = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  }
  const temporalSdkAvailable = Boolean(
    deps['@temporalio/client'] &&
      deps['@temporalio/worker'] &&
      deps['@temporalio/workflow']
  )

  return {
    deno,
    temporal: {
      ...temporal,
      sdkAvailable: temporalSdkAvailable,
      mode: temporalSdkAvailable ? 'temporal-ready' : 'database-durable',
    },
  }
}

export async function getCodeJobsDashboardData() {
  await reconcileDesiredWorkerPools()
  await recoverExpiredJobs(DEFAULT_QUEUE)

  const [jobs, workers, logs, workspaces, runtime] = await Promise.all([
    prisma.codeJob.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            status: true,
            heartbeatAt: true,
          },
        },
      },
    }),
    prisma.codeWorker.findMany({
      orderBy: [{ queue: 'asc' }, { name: 'asc' }],
    }),
    prisma.codeJobLog.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: 80,
      include: {
        job: {
          select: {
            id: true,
            workspaceSlug: true,
            entryPath: true,
            functionName: true,
          },
        },
      },
    }),
    prisma.codeWorkspace.findMany({
      where: { active: true },
      orderBy: { updatedAt: 'desc' },
      take: 25,
      select: {
        id: true,
        slug: true,
        name: true,
        currentVersion: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 10,
          select: {
            id: true,
            version: true,
            meta: true,
            createdAt: true,
          },
        },
      },
    }),
    getCodeJobRuntimeInfo(),
  ])

  const counts = jobs.reduce(
    (acc, job) => {
      acc.total += 1
      acc[job.status as CodeJobStatus] =
        (acc[job.status as CodeJobStatus] ?? 0) + 1
      return acc
    },
    {
      total: 0,
      queued: 0,
      running: 0,
      paused: 0,
      succeeded: 0,
      failed: 0,
      cancelled: 0,
    } as Record<CodeJobStatus | 'total', number>
  )

  return {
    jobs,
    workers,
    logs,
    workspaces: workspaces.map((workspace) => ({
      ...workspace,
      versions: workspace.versions.map((version) => ({
        id: version.id,
        version: version.version,
        createdAt: version.createdAt,
        bundleEntries: Object.entries(
          (safeJsonParse(version.meta, {}) as { bundles?: Record<string, unknown> })
            .bundles ?? {}
        )
          .filter(([, value]) => Boolean(value))
          .map(([entryPath]) => entryPath),
      })),
    })),
    counts,
    runtime,
    pool: getWorkerPoolSnapshot(),
  }
}
