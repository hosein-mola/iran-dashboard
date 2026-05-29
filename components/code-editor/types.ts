export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'markdown'
  | 'json'
  | 'plaintext'

export type WorkspaceFile = {
  path: string
  content: string
  language: SupportedLanguage
  updatedAt: string
}

export type WorkspaceSnapshotV1 = {
  schemaVersion: 1
  entryPath: string
  files: WorkspaceFile[]
}

export type WorkspaceProject = {
  id: string
  slug: string
  name: string
  description: string
  language: string
  currentVersion: number
  updatedAt: string
}

export type WorkspaceVersionSummary = {
  id: string
  version: number
  message: string
  isAutosave: boolean
  createdAt: string
  snapshotHash: string
  sizeBytes: number
}

export type WorkspaceLoadResponse = {
  workspace: WorkspaceProject | null
  latest: {
    id: string
    version: number
    snapshot: string
    message: string
    createdAt: string
  } | null
  versions: WorkspaceVersionSummary[]
}

export type SaveVersionResponse = {
  workspaceId: string
  id: string
  version: number
  createdAt: string
  message: string
  snapshotHash: string
  sizeBytes: number
  isAutosave: boolean
}

export type SaveBundleResponse = {
  success: boolean
  version: number
  entryPath: string
  hash: string
  sizeBytes: number
  savedAt: string
}

export type BuildWorkerRequest = {
  requestId: string
  entryPath: string
  files: Record<string, string>
}

export type BuildWorkerResponse =
  | {
      requestId: string
      ok: true
      entryPath: string
      output: string
      warnings: string[]
    }
  | {
      requestId: string
      ok: false
      entryPath: string
      error: string
      warnings: string[]
    }

export type EditorTab = {
  path: string
  dirty: boolean
}

export type BuildLogLevel = 'info' | 'error' | 'success'

export type BuildLogEntry = {
  id: string
  level: BuildLogLevel
  message: string
  at: string
}
