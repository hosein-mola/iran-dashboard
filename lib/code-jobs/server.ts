import { proxyDenoWorkerRequest } from '@/lib/deno-worker-api'

import type { CreateCodeJobInput } from '@/schemas/code-job'

function jsonRequest(path: string, body?: unknown) {
  const req = new Request(`http://localhost${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return proxyDenoWorkerRequest(req, path)
}

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T
}

export async function createCodeJob(input: {
  userId: string
  data: CreateCodeJobInput
}) {
  const res = await jsonRequest('/api/process/code-jobs', input.data)
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    return {
      ok: false as const,
      status: res.status,
      error: String(payload?.error ?? 'Code job request failed'),
    }
  }
  const payload = await parseJson<{ job: unknown }>(res)
  return { ok: true as const, job: payload.job }
}

export async function startWorkerPool(input?: {
  workerCount?: number
  queue?: string
}) {
  const res = await jsonRequest('/api/process/code-jobs/workers', {
    action: 'start',
    ...input,
  })
  return parseJson(res)
}

export async function pauseWorkerPool(queue = 'default') {
  const res = await jsonRequest('/api/process/code-jobs/workers', {
    action: 'pause',
    queue,
  })
  return parseJson(res)
}

export async function resumeWorkerPool(input?: {
  workerCount?: number
  queue?: string
}) {
  const res = await jsonRequest('/api/process/code-jobs/workers', {
    action: 'resume',
    ...input,
  })
  return parseJson(res)
}

export async function stopWorkerPool(queue = 'default') {
  const res = await jsonRequest('/api/process/code-jobs/workers', {
    action: 'stop',
    queue,
  })
  return parseJson(res)
}

export async function controlCodeJob(jobId: string, action: string) {
  const res = await jsonRequest(
    `/api/process/code-jobs/${encodeURIComponent(jobId)}/actions`,
    { action }
  )
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    return {
      ok: false as const,
      status: res.status,
      error: String(payload?.error ?? 'Code job action failed'),
    }
  }
  return { ok: true as const }
}

export async function getCodeJobRuntimeInfo() {
  return {
    deno: { available: true, version: 'managed by deno-worker service' },
  }
}

export async function getCodeJobsDashboardData() {
  const res = await jsonRequest('/api/process/code-jobs')
  return parseJson(res)
}
