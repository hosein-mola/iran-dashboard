import { proxyDenoWorkerRequest } from '@/lib/deno-worker-api'

export const runtime = 'nodejs'

function denoWorkerPath(params: { path?: string[] }) {
  const path = params.path?.map(encodeURIComponent).join('/') ?? ''
  return `/${path}`
}

export async function GET(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyDenoWorkerRequest(req, denoWorkerPath(await context.params))
}

export async function POST(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyDenoWorkerRequest(req, denoWorkerPath(await context.params))
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyDenoWorkerRequest(req, denoWorkerPath(await context.params))
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyDenoWorkerRequest(req, denoWorkerPath(await context.params))
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyDenoWorkerRequest(req, denoWorkerPath(await context.params))
}
