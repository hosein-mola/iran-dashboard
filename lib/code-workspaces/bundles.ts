import { normalizeEntryPath } from '@/lib/code-workspaces/server'

export type StoredBundle = {
  code: string
  hash: string | null
  sizeBytes: number
  savedAt: string | null
}

export type ResolvedStoredBundle = {
  versionId: string
  version: number
  workspaceSlug: string
  entryPath: string
  requestedEntryPath: string | null
  bundle: StoredBundle
}

type BundleMeta = {
  bundles?: Record<
    string,
    { code?: unknown; hash?: unknown; sizeBytes?: unknown; savedAt?: unknown }
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

function withoutKnownExtension(path: string) {
  return path.replace(/\.(tsx?|jsx?)$/i, '')
}

export function resolveBundleFromMeta(
  metaValue: unknown,
  requestedPath: string | null
) {
  const meta = safeJsonParse<BundleMeta>(metaValue, {})
  const bundles = meta.bundles ?? {}
  const entries = Object.entries(bundles).filter(
    ([, bundle]) => typeof bundle?.code === 'string'
  )

  if (entries.length === 0) return null

  if (requestedPath) {
    const exact = bundles[requestedPath]
    if (typeof exact?.code === 'string') {
      return { entryPath: requestedPath, bundle: exact }
    }

    const requestedBase = withoutKnownExtension(requestedPath)
    const matched = entries.find(
      ([entryPath]) => withoutKnownExtension(entryPath) === requestedBase
    )
    if (matched) return { entryPath: matched[0], bundle: matched[1] }
  }

  if (entries.length === 1) {
    return { entryPath: entries[0][0], bundle: entries[0][1] }
  }

  return null
}

export function listAvailableBundleEntries(metaValue: unknown) {
  const meta = safeJsonParse<BundleMeta>(metaValue, {})
  return Object.entries(meta.bundles ?? {})
    .filter(([, bundle]) => typeof bundle?.code === 'string')
    .map(([entryPath]) => entryPath)
}

export async function resolveStoredBundle(input: {
  workspaceId: string
  workspaceSlug: string
  version: number
  entryPath?: string | null
}): Promise<ResolvedStoredBundle | null> {
  return {
    versionId: input.workspaceId,
    version: input.version,
    workspaceSlug: input.workspaceSlug,
    entryPath: normalizeEntryPath(input.entryPath ?? '/'),
    requestedEntryPath: input.entryPath ? normalizeEntryPath(input.entryPath) : null,
    bundle: {
      code: '',
      hash: null,
      sizeBytes: 0,
      savedAt: null,
    },
  }
}
