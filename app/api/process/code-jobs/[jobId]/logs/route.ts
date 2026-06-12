import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  const logs = await prisma.codeJobLog.findMany({
    where: { jobId },
    orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }],
    take: 500,
  })

  return NextResponse.json({ logs })
}
