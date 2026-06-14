import { proxyWorkflowRequest } from '@/lib/workflow-api'

export const runtime = 'nodejs'

function workflowPath(params: { path?: string[] }) {
  return `/${params.path?.join('/') ?? ''}`
}

export async function GET(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyWorkflowRequest(req, workflowPath(await context.params))
}

export async function POST(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyWorkflowRequest(req, workflowPath(await context.params))
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyWorkflowRequest(req, workflowPath(await context.params))
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyWorkflowRequest(req, workflowPath(await context.params))
}
