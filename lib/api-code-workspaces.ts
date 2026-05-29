import type {
  SaveBundleResponse,
  SaveVersionResponse,
  WorkspaceLoadResponse,
  WorkspaceProject,
  WorkspaceSnapshotV1,
  WorkspaceVersionSummary,
} from '@/components/code-editor/types'

function assertOk(res: Response, fallback: string) {
  if (res.ok) return
  throw new Error(fallback)
}

async function parseErrorMessage(res: Response, fallback: string) {
  const data = await res.json().catch(() => null)
  const message = data?.error ? String(data.error) : fallback
  throw new Error(message)
}

export async function listCodeWorkspaces(): Promise<{ workspaces: WorkspaceProject[] }> {
  const res = await fetch('/api/process/code-workspaces', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    await parseErrorMessage(res, `Failed to list projects (HTTP ${res.status})`)
  }

  return (await res.json()) as { workspaces: WorkspaceProject[] }
}

export async function createCodeWorkspace(input: {
  slug: string
  name: string
  description?: string
  initialSnapshot?: WorkspaceSnapshotV1
}): Promise<{ workspace: WorkspaceProject; latest: { id: string; version: number } | null }> {
  const res = await fetch('/api/process/code-workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    await parseErrorMessage(res, `Failed to create project (HTTP ${res.status})`)
  }

  return (await res.json()) as {
    workspace: WorkspaceProject
    latest: { id: string; version: number } | null
  }
}

export async function fetchWorkspace(slug: string): Promise<WorkspaceLoadResponse> {
  const res = await fetch(`/api/process/code-workspaces/${encodeURIComponent(slug)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    await parseErrorMessage(res, `Failed to load project (HTTP ${res.status})`)
  }

  return (await res.json()) as WorkspaceLoadResponse
}

export async function saveWorkspaceVersion(opts: {
  slug: string
  snapshot: WorkspaceSnapshotV1
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

  if (!res.ok) {
    await parseErrorMessage(res, `Save failed (HTTP ${res.status})`)
  }

  return (await res.json()) as SaveVersionResponse
}

export async function saveWorkspaceBundle(opts: {
  slug: string
  version: number
  entryPath: string
  code: string
}) {
  const res = await fetch(
    `/api/process/code-workspaces/${encodeURIComponent(opts.slug)}/versions/${encodeURIComponent(String(opts.version))}/bundle`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryPath: opts.entryPath,
        code: opts.code,
      }),
    }
  )

  if (!res.ok) {
    await parseErrorMessage(res, `Bundle save failed (HTTP ${res.status})`)
  }

  return (await res.json()) as SaveBundleResponse
}

export async function fetchWorkspaceVersions(
  slug: string,
  limit = 50
): Promise<{ versions: WorkspaceVersionSummary[] }> {
  const url = new URL(
    `/api/process/code-workspaces/${encodeURIComponent(slug)}/versions`,
    window.location.origin
  )
  url.searchParams.set('limit', String(limit))

  const res = await fetch(url.toString(), { method: 'GET' })
  assertOk(res, `Failed to load versions (HTTP ${res.status})`)

  return (await res.json()) as { versions: WorkspaceVersionSummary[] }
}

export async function fetchWorkspaceVersionSnapshot(slug: string, version: number) {
  const res = await fetch(
    `/api/process/code-workspaces/${encodeURIComponent(slug)}/versions/${encodeURIComponent(String(version))}`,
    { method: 'GET' }
  )

  if (!res.ok) {
    await parseErrorMessage(res, `Failed to load version ${version} (HTTP ${res.status})`)
  }

  return (await res.json()) as {
    id: string
    version: number
    snapshot: string
    message: string
    createdAt: string
    snapshotHash: string
    sizeBytes: number
  }
}
