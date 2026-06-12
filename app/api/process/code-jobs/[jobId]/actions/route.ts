import { NextResponse } from 'next/server'

import { controlCodeJob } from '@/lib/code-jobs/server'
import { codeJobActionSchema } from '@/schemas/code-job'

export const runtime = 'nodejs'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  const body = await req.json().catch(() => null)
  const parsed = codeJobActionSchema.safeParse(body)

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

  const result = await controlCodeJob(jobId, parsed.data.action)
  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status }
    )
  }

  return NextResponse.json({ success: true })
}
