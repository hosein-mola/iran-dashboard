import type { FileSystem } from '@/components/code-editor/types'

export type WorkspaceVersionSummary = {
  id: string
  version: number
  message: string
  isAutosave: boolean
  createdAt: string
  snapshotHash: string
  sizeBytes: number
}

export async function fetchWorkspace(slug: string) {
  const res = await fetch(`/api/process/code-workspaces/${encodeURIComponent(slug)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to load workspace (HTTP ${res.status})`)
  return res.json() as Promise<{
    workspace: { id: string; slug: string; name: string; language: string; currentVersion: number } | null
    latest: { id: string; version: number; snapshot: string; message: string; createdAt: string } | null
    versions: WorkspaceVersionSummary[]
  }>
}

export async function saveWorkspaceVersion(opts: {
  slug: string
  snapshot: FileSystem
  message?: string
  isAutosave?: boolean
  clientRequestId?: string
}) {
  const res = await fetch(`/api/process/code-workspaces/${encodeURIComponent(opts.slug)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snapshot: opts.snapshot,
      message: opts.message,
      isAutosave: opts.isAutosave,
      clientRequestId: opts.clientRequestId,
    }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.error ? String(data.error) : `HTTP ${res.status}`
    throw new Error(`Save failed: ${msg}`)
  }
  return data as {
    workspaceId: string
    id: string
    version: number
    createdAt: string
    message: string
    snapshotHash: string
    sizeBytes: number
    isAutosave: boolean
  }
}

export async function fetchWorkspaceVersions(slug: string, limit = 50) {
  const url = new URL(`/api/process/code-workspaces/${encodeURIComponent(slug)}/versions`, window.location.origin)
  url.searchParams.set('limit', String(limit))
  const res = await fetch(url.toString(), { method: 'GET' })
  if (!res.ok) throw new Error(`Failed to load versions (HTTP ${res.status})`)
  return res.json() as Promise<{ versions: WorkspaceVersionSummary[] }>
}

export async function fetchWorkspaceVersionSnapshot(slug: string, version: number) {
  const res = await fetch(
    `/api/process/code-workspaces/${encodeURIComponent(slug)}/versions/${encodeURIComponent(String(version))}`,
    { method: 'GET' }
  )
  if (!res.ok) throw new Error(`Failed to load version (HTTP ${res.status})`)
  return res.json() as Promise<{ id: string; version: number; snapshot: string; message: string; createdAt: string }>
}
