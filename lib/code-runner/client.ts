type RunnerLogEntry = {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

type SerializedRunnerError = {
  type?: string
  message?: string
  stack?: string
  retryable?: boolean
}

type RemoteRunnerResponse = {
  jobId?: string
  success?: boolean
  output?: unknown
  error?: SerializedRunnerError | string
  logs?: RunnerLogEntry[]
  durationMs?: number
}

export type RemoteCodeRunInput = {
  jobId?: string
  bundleName: string
  bundleVersion: string
  code: string
  functionName: string
  data?: unknown
  timeoutMs?: number
  metadata?: Record<string, unknown>
}

export type RemoteCodeRunResult =
  | {
      success: true
      jobId: string | null
      result: unknown
      logs: RunnerLogEntry[]
      durationMs: number
    }
  | {
      success: false
      jobId: string | null
      error: string
      errorType: string | null
      retryable: boolean | null
      logs: RunnerLogEntry[]
      durationMs: number
    }

const MAX_REMOTE_TIMEOUT_MS = 60_000
const JS_IDENTIFIER_PATTERN = /^[A-Za-z_$][0-9A-Za-z_$]*$/

function getCodeRunnerBaseUrl() {
  const raw = process.env.CODE_RUNNER_API_BASE_URL?.trim()
  if (!raw) {
    throw new Error('CODE_RUNNER_API_BASE_URL is not configured')
  }
  return raw.replace(/\/+$/, '')
}

function normalizeTimeoutMs(value: unknown) {
  const timeoutMs = Number(value ?? 10_000)
  if (!Number.isFinite(timeoutMs)) return 10_000
  return Math.max(100, Math.min(MAX_REMOTE_TIMEOUT_MS, Math.round(timeoutMs)))
}

function normalizeLogs(value: unknown): RunnerLogEntry[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => {
    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>
      const level = String(record.level || 'info')
      return {
        level:
          level === 'warn' ||
          level === 'error' ||
          level === 'debug' ||
          level === 'info'
            ? level
            : 'info',
        message: String(record.message ?? ''),
      }
    }
    return {
      level: 'info',
      message: String(entry),
    }
  })
}

function isLikelyCommonJsBundle(code: string) {
  return /\bmodule\.exports\b|\bexports\.[A-Za-z_$]/.test(code)
}

export function prepareCodeForRemoteModuleImport(
  code: string,
  functionName: string
) {
  if (!isLikelyCommonJsBundle(code)) return code
  if (!JS_IDENTIFIER_PATTERN.test(functionName)) return code

  const exportKey = JSON.stringify(functionName)

  return [
    'const module = { exports: {} };',
    'let exports = module.exports;',
    '{',
    code,
    '}',
    `const __runnerExport = module.exports?.[${exportKey}] ?? exports?.[${exportKey}];`,
    `export { __runnerExport as ${functionName} };`,
  ].join('\n')
}

function normalizeError(value: unknown) {
  if (typeof value === 'string') {
    return { message: value, type: null, retryable: null }
  }
  if (value && typeof value === 'object') {
    const record = value as SerializedRunnerError
    return {
      message: record.message || 'Code runner failed',
      type: record.type || null,
      retryable:
        typeof record.retryable === 'boolean' ? record.retryable : null,
    }
  }
  return { message: 'Code runner failed', type: null, retryable: null }
}

export async function runRemoteCodeBundle(
  input: RemoteCodeRunInput
): Promise<RemoteCodeRunResult> {
  const startedAt = Date.now()
  const body = {
    bundle: {
      name: input.bundleName,
      version: input.bundleVersion,
      code: prepareCodeForRemoteModuleImport(input.code, input.functionName),
    },
    functionName: input.functionName,
    data: input.data ?? null,
    permissions: 'none',
    timeoutMs: normalizeTimeoutMs(input.timeoutMs),
    metadata: input.metadata,
    ...(input.jobId ? { jobId: input.jobId } : {}),
  }

  const res = await fetch(`${getCodeRunnerBaseUrl()}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = (await res.json().catch(() => null)) as
    | RemoteRunnerResponse
    | null

  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      jobId: null,
      error: `Code runner returned invalid JSON (HTTP ${res.status})`,
      errorType: null,
      retryable: null,
      logs: [],
      durationMs: Date.now() - startedAt,
    }
  }

  const logs = normalizeLogs(payload.logs)
  const durationMs =
    typeof payload.durationMs === 'number'
      ? payload.durationMs
      : Date.now() - startedAt
  const jobId = typeof payload.jobId === 'string' ? payload.jobId : null

  if (res.ok && payload.success) {
    return {
      success: true,
      jobId,
      result: payload.output,
      logs,
      durationMs,
    }
  }

  const error = normalizeError(payload.error)
  return {
    success: false,
    jobId,
    error: error.message,
    errorType: error.type,
    retryable: error.retryable,
    logs,
    durationMs,
  }
}
