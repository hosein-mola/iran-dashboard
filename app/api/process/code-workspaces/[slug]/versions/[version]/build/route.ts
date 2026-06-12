import { proxyDenoWorkerRequest } from '@/lib/deno-worker-api'

export const runtime = 'nodejs'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; version: string }> }
) {
  const { slug, version } = await params
  return proxyDenoWorkerRequest(
    req,
    `/api/process/code-workspaces/${encodeURIComponent(slug)}/versions/${encodeURIComponent(version)}/build`
  )
}
