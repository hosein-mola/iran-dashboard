import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  findWorkspaceBySlugForUser,
  getClientIp,
  getUserIdentity,
  sha256Hex,
} from '@/lib/code-workspaces/server'
import { saveCodeWorkspaceVersionSchema } from '@/schemas/code-workspace'

const MAX_SNAPSHOT_BYTES = 2_000_000

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const userId = getUserIdentity(req)

  const workspace = await findWorkspaceBySlugForUser(slug, userId)
  if (!workspace) {
    return NextResponse.json({
      workspace: null,
      latest: null,
      versions: [],
    })
  }

  const [versions, latest] = await Promise.all([
    prisma.codeWorkspaceVersion.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { version: 'desc' },
      take: 50,
      select: {
        id: true,
        version: true,
        message: true,
        isAutosave: true,
        createdAt: true,
        snapshotHash: true,
        sizeBytes: true,
      },
    }),
    prisma.codeWorkspaceVersion.findFirst({
      where: { workspaceId: workspace.id },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        snapshot: true,
        message: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({
    workspace: {
      id: workspace.id,
      slug: workspace.slug,
      name: workspace.name,
      description: workspace.description,
      language: workspace.language,
      currentVersion: workspace.currentVersion,
      updatedAt: workspace.updatedAt,
    },
    latest,
    versions,
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await req.json().catch(() => null)
  const parsed = saveCodeWorkspaceVersionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid request',
        issues: parsed.error.issues,
      },
      { status: 400 }
    )
  }

  const snapshotStr = JSON.stringify(parsed.data.snapshot)
  const sizeBytes = new TextEncoder().encode(snapshotStr).byteLength
  if (sizeBytes > MAX_SNAPSHOT_BYTES) {
    return NextResponse.json(
      {
        error: 'Snapshot too large (max 2MB)',
      },
      { status: 413 }
    )
  }

  const userId = getUserIdentity(req)
  const message = parsed.data.message ?? ''
  const isAutosave = parsed.data.isAutosave ?? false
  const clientRequestId = parsed.data.clientRequestId

  let workspace = await findWorkspaceBySlugForUser(slug, userId)
  if (!workspace) {
    workspace = await prisma.codeWorkspace.create({
      data: {
        slug,
        name: slug,
        description: '',
        language: 'typescript',
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    })
  }

  if (clientRequestId) {
    const existing = await prisma.codeWorkspaceVersion.findUnique({
      where: {
        workspaceId_clientRequestId: {
          workspaceId: workspace.id,
          clientRequestId,
        },
      },
      select: {
        id: true,
        version: true,
        createdAt: true,
        message: true,
        snapshotHash: true,
        sizeBytes: true,
        isAutosave: true,
      },
    })

    if (existing) {
      return NextResponse.json({
        workspaceId: workspace.id,
        ...existing,
      })
    }
  }

  const snapshotHash = await sha256Hex(snapshotStr)
  const ip = getClientIp(req)
  const userAgent = req.headers.get('user-agent')
  const referer = req.headers.get('referer')

  const created = await prisma.$transaction(async (tx) => {
    const ws = await tx.codeWorkspace.findUniqueOrThrow({
      where: { id: workspace.id },
      select: {
        id: true,
        currentVersion: true,
      },
    })

    const version = ws.currentVersion + 1
    const row = await tx.codeWorkspaceVersion.create({
      data: {
        workspaceId: ws.id,
        version,
        snapshot: snapshotStr,
        snapshotHash,
        message,
        isAutosave,
        clientRequestId,
        ip,
        userAgent,
        referer,
        sizeBytes,
        createdByUserId: userId,
      },
      select: {
        id: true,
        version: true,
        createdAt: true,
        message: true,
        snapshotHash: true,
        sizeBytes: true,
        isAutosave: true,
      },
    })

    await tx.codeWorkspace.update({
      where: { id: ws.id },
      data: {
        currentVersion: version,
        updatedByUserId: userId,
      },
    })

    return row
  })

  return NextResponse.json(
    {
      workspaceId: workspace.id,
      ...created,
    },
    { status: 201 }
  )
}
