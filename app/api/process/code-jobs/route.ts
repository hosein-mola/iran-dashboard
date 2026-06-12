import { proxyDenoWorkerRequest } from '@/lib/deno-worker-api'

export const runtime = 'nodejs'

const path = '/api/process/code-jobs'

export async function GET(req: Request) {
  return proxyDenoWorkerRequest(req, path)
}

export async function POST(req: Request) {
  return proxyDenoWorkerRequest(req, path)
}
