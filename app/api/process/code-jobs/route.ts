import { NextResponse } from 'next/server'

import {
  createCodeJob,
  getCodeJobsDashboardData,
  startWorkerPool,
} from '@/lib/code-jobs/server'
import { getUserIdentity } from '@/lib/code-workspaces/server'
import { createCodeJobSchema } from '@/schemas/code-job'

export const runtime = 'nodejs'

export async function GET() {
  const data = await getCodeJobsDashboardData()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = createCodeJobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request',
        issues: parsed.error.issues,
      },
      { status: 400 }
    )
  }

  const created = await createCodeJob({
    userId: getUserIdentity(req),
    data: parsed.data,
  })

  if (!created.ok) {
    return NextResponse.json(
      { success: false, error: created.error },
      { status: created.status }
    )
  }

  if (parsed.data.runNow ?? true) {
    await startWorkerPool({
      workerCount: 2,
      queue: parsed.data.queue || 'default',
    })
  }

  return NextResponse.json({
    success: true,
    job: created.job,
  })
}
