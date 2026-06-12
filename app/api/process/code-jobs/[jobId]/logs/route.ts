import { proxyDenoWorkerRequest } from '@/lib/deno-worker-api'

export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  return proxyDenoWorkerRequest(
    req,
    `/api/process/code-jobs/${encodeURIComponent(jobId)}/logs`
  )
}
