import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { saveCodeWorkspaceVersionSchema } from '@/schemas/code-workspace'

function getClientIp(req: Request) {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() || null
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    null
  )
}

function getUserIdentity(req: Request) {
  // Minimal, forward-compatible identity resolution.
  // In production, replace with real auth and stable user id.
  const cookie = req.headers.get('cookie') ?? ''
  const m = cookie.match(/(?:^|;\s*)session=([^;]+)/)
  if (m?.[1]) {
    try {
      const parsed = JSON.parse(decodeURIComponent(m[1]))
      const userId =
        parsed?.userId ?? parsed?.id ?? parsed?.email ?? parsed?.token
      if (typeof userId === 'string' && userId.length > 0) return userId
    } catch {}
  }
  return 'local-dev'
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const userId = getUserIdentity(req)
  const res = await prisma.codeWorkspace.findUnique({
    where: { createdByUserId_slug: { createdByUserId: userId, slug } },
    include: {
      versions: {
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
      },
    },
  })

  if (!res) {
    return NextResponse.json(
      {
        workspace: null,
        latest: null,
        versions: [],
      },
      { status: 200 }
    )
  }

  const latest =
    res.versions.length > 0
      ? await prisma.codeWorkspaceVersion.findFirst({
          where: { workspaceId: res.id },
          orderBy: { version: 'desc' },
          select: {
            id: true,
            version: true,
            snapshot: true,
            message: true,
            createdAt: true,
          },
        })
      : null

  return NextResponse.json({
    workspace: {
      id: res.id,
      slug: res.slug,
      name: res.name,
      language: res.language,
      currentVersion: res.currentVersion,
      updatedAt: res.updatedAt,
    },
    latest,
    versions: res.versions,
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const userId = getUserIdentity(req)
  const body = await req.json().catch(() => null)
  const parsed = saveCodeWorkspaceVersionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const snapshotStr = JSON.stringify(parsed.data.snapshot)
  const sizeBytes = new TextEncoder().encode(snapshotStr).byteLength
  if (sizeBytes > 2_000_000) {
    return NextResponse.json(
      { error: 'Snapshot too large (max 2MB)' },
      { status: 413 }
    )
  }

  const clientRequestId = parsed.data.clientRequestId
  const message = parsed.data.message?.trim() ?? ''
  const isAutosave = parsed.data.isAutosave ?? false

  let workspace = await prisma.codeWorkspace.findUnique({
    where: { createdByUserId_slug: { createdByUserId: userId, slug } },
  })

  if (!workspace) {
    workspace = await prisma.codeWorkspace.create({
      data: {
        slug,
        name: slug,
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
    if (existing) return NextResponse.json({ workspaceId: workspace.id, ...existing })
  }

  const snapshotHash = await sha256Hex(snapshotStr)
  const ip = getClientIp(req)
  const userAgent = req.headers.get('user-agent')
  const referer = req.headers.get('referer')

  const created = await prisma.$transaction(async (tx) => {
    // Re-read inside transaction.
    const ws = await tx.codeWorkspace.findUniqueOrThrow({
      where: { id: workspace.id },
    })

    const nextVersion = ws.currentVersion + 1
    const versionRow = await tx.codeWorkspaceVersion.create({
      data: {
        workspaceId: ws.id,
        version: nextVersion,
        snapshot: snapshotStr,
        snapshotHash,
        sizeBytes,
        message,
        isAutosave,
        clientRequestId,
        ip,
        userAgent,
        referer,
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
        currentVersion: nextVersion,
        updatedByUserId: userId,
      },
    })

    return versionRow
  })

  return NextResponse.json({ workspaceId: workspace.id, ...created }, { status: 201 })
}
