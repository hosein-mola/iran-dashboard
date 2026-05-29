import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { runCodeWorkspaceVersionSchema } from '@/schemas/code-workspace-run'
import { executeSavedCode } from '@/lib/execute-saved-code'

export const runtime = 'nodejs'

function normalizePath(p?: string) {
  if (!p) return null
  const trimmed = p.trim()
  if (!trimmed) return null
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
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

type BundleMeta = {
  bundles?: Record<string, { code?: unknown; hash?: unknown; sizeBytes?: unknown; savedAt?: unknown }>
}

function withoutKnownExtension(path: string) {
  return path.replace(/\.(tsx?|jsx?)$/i, '')
}

function resolveBundle(
  bundles: NonNullable<BundleMeta['bundles']>,
  requestedPath: string | null
) {
  const entries = Object.entries(bundles).filter(([, bundle]) => typeof bundle?.code === 'string')
  if (entries.length === 0) return null

  if (requestedPath) {
    const exact = bundles[requestedPath]
    if (typeof exact?.code === 'string') {
      return { entryPath: requestedPath, bundle: exact }
    }

    const requestedBase = withoutKnownExtension(requestedPath)
    const matched = entries.find(([entryPath]) => withoutKnownExtension(entryPath) === requestedBase)
    if (matched) return { entryPath: matched[0], bundle: matched[1] }
  }

  if (entries.length === 1) {
    return { entryPath: entries[0][0], bundle: entries[0][1] }
  }

  return null
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; version: string }> }
) {
  const { slug, version } = await params
  const v = Number(version)
  if (!Number.isFinite(v) || v <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid version' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const parsed = runCodeWorkspaceVersionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const ws = await prisma.codeWorkspace.findFirst({
    where: { slug },
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  })
  if (!ws) {
    return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 })
  }

  const row = await prisma.codeWorkspaceVersion.findUnique({
    where: { workspaceId_version: { workspaceId: ws.id, version: v } },
    select: { meta: true },
  })
  if (!row) {
    return NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 })
  }

  const meta = safeJsonParse<BundleMeta>(row.meta, {})
  const bundles = meta.bundles ?? {}
  const requestedPath = normalizePath(parsed.data.entryPath)
  const resolved = resolveBundle(bundles, requestedPath)
  if (!resolved) {
    const availableEntries = Object.entries(bundles)
      .filter(([, bundle]) => typeof bundle?.code === 'string')
      .map(([entryPath]) => entryPath)

    return NextResponse.json(
      {
        success: false,
        error: requestedPath
          ? `Bundle not found in database for entry: ${requestedPath}`
          : 'Bundle not found in database for this version',
        availableEntries,
      },
      { status: 404 }
    )
  }

  const code = resolved.bundle.code as string
  if (code.length > 2_000_000) {
    return NextResponse.json(
      { success: false, error: 'Bundle code too large (max 2MB)' },
      { status: 413 }
    )
  }

  const result = await executeSavedCode({
    code,
    functionName: parsed.data.functionName,
    args: parsed.data.args ?? [],
    data: parsed.data.data,
    timeoutMs: parsed.data.timeoutMs,
  })

  return NextResponse.json(
    {
      ...result,
      meta: {
        used: 'bundle',
        entryPath: resolved.entryPath,
        requestedEntryPath: requestedPath,
        hash: typeof resolved.bundle.hash === 'string' ? resolved.bundle.hash : null,
        sizeBytes:
          typeof resolved.bundle.sizeBytes === 'number' ? resolved.bundle.sizeBytes : code.length,
        savedAt: typeof resolved.bundle.savedAt === 'string' ? resolved.bundle.savedAt : null,
      },
    },
    { status: 200 }
  )
}
