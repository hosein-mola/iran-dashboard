import { NextResponse } from 'next/server'

import {
  pauseWorkerPool,
  resumeWorkerPool,
  startWorkerPool,
  stopWorkerPool,
} from '@/lib/code-jobs/server'
import { codeWorkerControlSchema } from '@/schemas/code-job'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = codeWorkerControlSchema.safeParse(body)
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

  const queue = parsed.data.queue || 'default'
  const workerCount = parsed.data.workerCount ?? 2
  const pool =
    parsed.data.action === 'start'
      ? await startWorkerPool({ workerCount, queue })
      : parsed.data.action === 'pause'
        ? await pauseWorkerPool(queue)
        : parsed.data.action === 'resume'
          ? await resumeWorkerPool({ workerCount, queue })
          : await stopWorkerPool(queue)

  return NextResponse.json({
    success: true,
    pool,
  })
}
