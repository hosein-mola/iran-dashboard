import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  getUserIdentity,
  sha256Hex,
} from '@/lib/code-workspaces/server'
import { createCodeWorkspaceSchema } from '@/schemas/code-workspace'

const MAX_SNAPSHOT_BYTES = 2_000_000

function toWorkspaceDto(workspace: {
  id: string
  slug: string
  name: string
  description: string
  language: string
  currentVersion: number
  updatedAt: Date
  createdByUserId: string
}) {
  return {
    id: workspace.id,
    slug: workspace.slug,
    name: workspace.name,
    description: workspace.description,
    language: workspace.language,
    currentVersion: workspace.currentVersion,
    updatedAt: workspace.updatedAt.toISOString(),
  }
}

export async function GET(req: Request) {
  const userId = getUserIdentity(req)
  const ownerIds = userId === 'public' ? ['public'] : [userId, 'public']

  const workspaces = await prisma.codeWorkspace.findMany({
    where: {
      createdByUserId: { in: ownerIds },
      active: true,
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      language: true,
      currentVersion: true,
      updatedAt: true,
      createdByUserId: true,
    },
  })

  const dedupedBySlug = new Map<string, (typeof workspaces)[number]>()
  for (const workspace of workspaces) {
    const existing = dedupedBySlug.get(workspace.slug)
    if (!existing) {
      dedupedBySlug.set(workspace.slug, workspace)
      continue
    }

    if (workspace.id === existing.id) continue

    const shouldReplace =
      (existing.createdByUserId !== userId &&
        workspace.createdByUserId === userId) ||
      workspace.updatedAt > existing.updatedAt
    if (shouldReplace) dedupedBySlug.set(workspace.slug, workspace)
  }

  return NextResponse.json({
    workspaces: Array.from(dedupedBySlug.values()).map(toWorkspaceDto),
  })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = createCodeWorkspaceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid request',
        issues: parsed.error.issues,
      },
      { status: 400 }
    )
  }

  const userId = getUserIdentity(req)
  const existing = await prisma.codeWorkspace.findUnique({
    where: {
      createdByUserId_slug: {
        createdByUserId: userId,
        slug: parsed.data.slug,
      },
    },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json(
      {
        error: `Project slug already exists: ${parsed.data.slug}`,
      },
      { status: 409 }
    )
  }

  const snapshotStr = parsed.data.initialSnapshot
    ? JSON.stringify(parsed.data.initialSnapshot)
    : null

  if (snapshotStr) {
    const sizeBytes = new TextEncoder().encode(snapshotStr).byteLength
    if (sizeBytes > MAX_SNAPSHOT_BYTES) {
      return NextResponse.json(
        {
          error: 'Initial snapshot too large (max 2MB)',
        },
        { status: 413 }
      )
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const workspace = await tx.codeWorkspace.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description ?? '',
        language: 'typescript',
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    })

    if (!snapshotStr) {
      return {
        workspace,
        latest: null,
      }
    }

    const sizeBytes = new TextEncoder().encode(snapshotStr).byteLength
    const snapshotHash = await sha256Hex(snapshotStr)

    const latest = await tx.codeWorkspaceVersion.create({
      data: {
        workspaceId: workspace.id,
        version: 1,
        snapshot: snapshotStr,
        snapshotHash,
        message: 'Initial version',
        isAutosave: false,
        sizeBytes,
        createdByUserId: userId,
      },
      select: {
        id: true,
        version: true,
      },
    })

    const updatedWorkspace = await tx.codeWorkspace.update({
      where: { id: workspace.id },
      data: {
        currentVersion: 1,
        updatedByUserId: userId,
      },
    })

    return {
      workspace: updatedWorkspace,
      latest,
    }
  })

  return NextResponse.json(
    {
      workspace: toWorkspaceDto(created.workspace),
      latest: created.latest,
    },
    { status: 201 }
  )
}
