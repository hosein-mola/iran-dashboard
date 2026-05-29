import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const url = new URL(req.url)
  const limitRaw = url.searchParams.get('limit')
  const beforeVersionRaw = url.searchParams.get('beforeVersion')

  const limit = Math.max(1, Math.min(100, Number(limitRaw ?? '50') || 50))
  const beforeVersion =
    beforeVersionRaw && Number.isFinite(Number(beforeVersionRaw))
      ? Number(beforeVersionRaw)
      : null

  const ws = await prisma.codeWorkspace.findFirst({
    where: { slug },
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  })
  if (!ws) return NextResponse.json({ versions: [] })

  const versions = await prisma.codeWorkspaceVersion.findMany({
    where: {
      workspaceId: ws.id,
      ...(beforeVersion ? { version: { lt: beforeVersion } } : {}),
    },
    orderBy: { version: 'desc' },
    take: limit,
    select: {
      id: true,
      version: true,
      message: true,
      isAutosave: true,
      createdAt: true,
      snapshotHash: true,
      sizeBytes: true,
    },
  })

  return NextResponse.json({ versions })
}
