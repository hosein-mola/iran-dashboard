import { proxyDenoWorkerRequest } from '@/lib/deno-worker-api'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return proxyDenoWorkerRequest(
    req,
    `/api/process/code-workspaces/${encodeURIComponent(slug)}`
  )
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return proxyDenoWorkerRequest(
    req,
    `/api/process/code-workspaces/${encodeURIComponent(slug)}`
  )
}
