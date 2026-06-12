import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { runCodeWorkspaceVersionSchema } from '@/schemas/code-workspace-run'
import { runRemoteCodeBundle } from '@/lib/code-runner/client'
import {
  listAvailableBundleEntries,
  resolveStoredBundle,
} from '@/lib/code-workspaces/bundles'
import {
  findWorkspaceBySlugForUser,
  getUserIdentity,
  normalizeEntryPath,
} from '@/lib/code-workspaces/server'

export const runtime = 'nodejs'

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
  const parsed = runCodeWorkspaceVersionSchema.safeParse(body)
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

  const requestedEntryPath = parsed.data.entryPath
    ? normalizeEntryPath(parsed.data.entryPath)
    : null

  const resolved = await resolveStoredBundle({
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    version: parsedVersion,
    entryPath: requestedEntryPath,
  })
  if (!resolved) {
    const versionRow = await prisma.codeWorkspaceVersion.findUnique({
      where: {
        workspaceId_version: {
          workspaceId: workspace.id,
          version: parsedVersion,
        },
      },
      select: { meta: true },
    })

    return NextResponse.json(
      {
        success: false,
        error: versionRow
          ? requestedEntryPath
            ? `Bundle not found in database for entry: ${requestedEntryPath}`
            : 'Bundle not found in database for this version'
          : 'Version not found',
        availableEntries: versionRow
          ? listAvailableBundleEntries(versionRow.meta)
          : [],
      },
      { status: 404 }
    )
  }

  const code = resolved.bundle.code
  if (code.length > 2_000_000) {
    return NextResponse.json(
      {
        success: false,
        error: 'Bundle code too large (max 2MB)',
      },
      { status: 413 }
    )
  }

  const result = await runRemoteCodeBundle({
    bundleName: workspace.slug,
    bundleVersion: String(parsedVersion),
    code,
    functionName: parsed.data.functionName,
    data: parsed.data.data,
    timeoutMs: parsed.data.timeoutMs,
    metadata: {
      workspaceSlug: workspace.slug,
      version: parsedVersion,
      entryPath: resolved.entryPath,
    },
  }).catch((error) => ({
    success: false as const,
    jobId: null,
    error:
      error instanceof Error
        ? error.message
        : 'Remote code runner request failed',
    errorType: null,
    retryable: null,
    logs: [],
    durationMs: 0,
  }))

  return NextResponse.json(
    {
      ...result,
      logs: result.logs.map((entry) => entry.message),
      meta: {
        used: 'remote-runner',
        entryPath: resolved.entryPath,
        requestedEntryPath,
        hash: resolved.bundle.hash,
        sizeBytes: resolved.bundle.sizeBytes,
        savedAt: resolved.bundle.savedAt,
      },
    },
    { status: result.success ? 200 : 400 }
  )
}
