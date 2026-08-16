export function getDenoWorkerBaseUrl() {
  const raw =
    process.env.DENO_WORKER_API_BASE_URL?.trim() ||
    process.env.CODE_RUNNER_API_BASE_URL?.trim()

  if (!raw) {
    throw new Error(
      'CODE_RUNNER_API_BASE_URL or DENO_WORKER_API_BASE_URL is not configured'
    )
  }

  return raw.replace(/\/+$/, '')
}

export type DenoWorkerAiMessage = {
  role: 'system' | 'developer' | 'user' | 'assistant'
  content: string
}

export type DenoWorkerAiResponse = {
  id: string
  provider: 'parspack'
  model: string
  outputText: string
  reasoningText: string
}

export async function requestDenoWorkerAiResponse(input: {
  model: string
  messages: DenoWorkerAiMessage[]
  reasoningEffort?: 'low' | 'medium' | 'high'
}) {
  const response = await fetch(`${getDenoWorkerBaseUrl()}/ai/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  })

  const payload = (await response.json().catch(() => null)) as
    | DenoWorkerAiResponse
    | { error?: { message?: string }; message?: string }
    | null

  if (!response.ok) {
    const message =
      payload && 'error' in payload
        ? payload.error?.message
        : payload && 'message' in payload
          ? payload.message
          : undefined
    throw new Error(message || 'درخواست هوش مصنوعی پارس‌پک ناموفق بود.')
  }

  if (!payload || !('outputText' in payload)) {
    throw new Error('پاسخ هوش مصنوعی پارس‌پک نامعتبر است.')
  }

  return payload
}

export async function proxyDenoWorkerRequest(
  req: Request,
  path: string,
  init?: RequestInit
) {
  const url = new URL(req.url)
  const upstreamUrl = new URL(`${getDenoWorkerBaseUrl()}${path}`)
  upstreamUrl.search = url.search

  const headers = new Headers()
  const contentType = req.headers.get('content-type')
  const cookie = req.headers.get('cookie')
  const userAgent = req.headers.get('user-agent')
  const forwardedFor = req.headers.get('x-forwarded-for')

  if (contentType) headers.set('content-type', contentType)
  if (cookie) headers.set('cookie', cookie)
  if (userAgent) headers.set('user-agent', userAgent)
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor)

  const method = init?.method ?? req.method
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const body =
    init?.body ??
    (hasBody ? await req.text().catch(() => undefined) : undefined)

  const res = await fetch(upstreamUrl, {
    ...init,
    method,
    headers,
    body,
    cache: 'no-store',
  })

  const responseHeaders = new Headers()
  const responseType = res.headers.get('content-type')
  if (responseType) responseHeaders.set('content-type', responseType)

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  })
}
