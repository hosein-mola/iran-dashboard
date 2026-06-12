import { proxyDenoWorkerRequest } from '@/lib/deno-worker-api'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  return proxyDenoWorkerRequest(req, '/api/process/code-jobs/workers')
}
