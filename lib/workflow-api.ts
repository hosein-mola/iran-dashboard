function getWorkflowBaseUrl() {
  return (process.env.WORKFLOW_API_BASE_URL?.trim() || 'http://localhost:3002').replace(/\/+$/, '')
}

export async function proxyWorkflowRequest(
  req: Request,
  path: string,
  init?: RequestInit
) {
  const url = new URL(req.url)
  const upstreamUrl = new URL(`${getWorkflowBaseUrl()}${path}`)
  upstreamUrl.search = url.search

  const headers = new Headers()
  const contentType = req.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)

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
