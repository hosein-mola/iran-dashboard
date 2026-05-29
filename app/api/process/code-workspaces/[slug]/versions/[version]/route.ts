import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  {
    params,
  }: { params: Promise<{ slug: string; version: string }> }
) {
  const { slug, version } = await params
  const v = Number(version)
  if (!Number.isFinite(v) || v <= 0) {
    return NextResponse.json({ error: 'Invalid version' }, { status: 400 })
  }

  const ws = await prisma.codeWorkspace.findFirst({
    where: { slug },
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  })
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const row = await prisma.codeWorkspaceVersion.findUnique({
    where: { workspaceId_version: { workspaceId: ws.id, version: v } },
    select: {
      id: true,
      version: true,
      snapshot: true,
      message: true,
      createdAt: true,
      snapshotHash: true,
      sizeBytes: true,
    },
  })

  if (!row) return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  return NextResponse.json(row)
}
