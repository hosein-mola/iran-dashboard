import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  findWorkspaceBySlugForUser,
  getUserIdentity,
} from '@/lib/code-workspaces/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; version: string }> }
) {
  const { slug, version } = await params
  const parsedVersion = Number(version)

  if (!Number.isFinite(parsedVersion) || parsedVersion <= 0) {
    return NextResponse.json(
      {
        error: 'Invalid version',
      },
      { status: 400 }
    )
  }

  const userId = getUserIdentity(req)
  const workspace = await findWorkspaceBySlugForUser(slug, userId)

  if (!workspace) {
    return NextResponse.json(
      {
        error: 'Workspace not found',
      },
      { status: 404 }
    )
  }

  const row = await prisma.codeWorkspaceVersion.findUnique({
    where: {
      workspaceId_version: {
        workspaceId: workspace.id,
        version: parsedVersion,
      },
    },
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

  if (!row) {
    return NextResponse.json(
      {
        error: 'Version not found',
      },
      { status: 404 }
    )
  }

  return NextResponse.json(row)
}
