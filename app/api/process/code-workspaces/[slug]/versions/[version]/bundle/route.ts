import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  findWorkspaceBySlugForUser,
  getUserIdentity,
  normalizeEntryPath,
  sha256Hex,
} from '@/lib/code-workspaces/server'
import { saveCodeWorkspaceBundleSchema } from '@/schemas/code-workspace-bundle'

export const runtime = 'nodejs'

type BundleMeta = {
  bundles?: Record<
    string,
    {
      code: string
      hash: string
      sizeBytes: number
      savedAt: string
    }
  >
}

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || value.trim().length === 0) return fallback

  try {
    const parsed = JSON.parse(value)
    return (parsed ?? fallback) as T
  } catch {
    return fallback
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; version: string }> }
) {
  const { slug, version } = await params
  const parsedVersion = Number(version)

  if (!Number.isFinite(parsedVersion) || parsedVersion <= 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid version',
      },
      { status: 400 }
    )
  }

  const body = await req.json().catch(() => null)
  const parsedBody = saveCodeWorkspaceBundleSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request',
        issues: parsedBody.error.issues,
      },
      { status: 400 }
    )
  }

  const userId = getUserIdentity(req)
  const workspace = await findWorkspaceBySlugForUser(slug, userId)
  if (!workspace) {
    return NextResponse.json(
      {
        success: false,
        error: 'Workspace not found',
      },
      { status: 404 }
    )
  }

  const entryPath = normalizeEntryPath(parsedBody.data.entryPath)
  const code = parsedBody.data.code
  const sizeBytes = new TextEncoder().encode(code).byteLength

  if (sizeBytes > 2_000_000) {
    return NextResponse.json(
      {
        success: false,
        error: 'Bundle too large (max 2MB)',
      },
      { status: 413 }
    )
  }

  const hash = await sha256Hex(code)
  const savedAt = new Date().toISOString()

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.codeWorkspaceVersion.findUnique({
      where: {
        workspaceId_version: {
          workspaceId: workspace.id,
          version: parsedVersion,
        },
      },
      select: {
        id: true,
        meta: true,
      },
    })

    if (!row) return null

    const meta = safeJsonParse<BundleMeta>(row.meta, {})
    const bundles = meta.bundles ?? {}
    bundles[entryPath] = {
      code,
      hash,
      sizeBytes,
      savedAt,
    }

    const nextMeta: BundleMeta = {
      ...meta,
      bundles,
    }

    return await tx.codeWorkspaceVersion.update({
      where: {
        id: row.id,
      },
      data: {
        meta: JSON.stringify(nextMeta),
      },
      select: {
        id: true,
        version: true,
      },
    })
  })

  if (!updated) {
    return NextResponse.json(
      {
        success: false,
        error: 'Version not found',
      },
      { status: 404 }
    )
  }

  return NextResponse.json(
    {
      success: true,
      version: updated.version,
      entryPath,
      hash,
      sizeBytes,
      savedAt,
    },
    { status: 200 }
  )
}
