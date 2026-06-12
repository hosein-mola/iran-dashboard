import { proxyDenoWorkerRequest } from '@/lib/deno-worker-api'

const path = '/api/process/code-workspaces'

export async function GET(req: Request) {
  return proxyDenoWorkerRequest(req, path)
}

export async function POST(req: Request) {
  return proxyDenoWorkerRequest(req, path)
}
