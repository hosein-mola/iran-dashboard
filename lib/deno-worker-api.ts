function getDenoWorkerBaseUrl() {
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
