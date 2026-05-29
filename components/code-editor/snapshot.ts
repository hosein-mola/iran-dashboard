import type {
  SupportedLanguage,
  WorkspaceFile,
  WorkspaceSnapshotV1,
} from './types'

const DEFAULT_ENTRY_PATH = '/api/index.ts'

const TS_EXTENSIONS = new Set(['.ts', '.tsx'])

export function normalizeWorkspacePath(path: string): string {
  const trimmed = path.trim().replace(/\\+/g, '/')
  if (!trimmed) return '/'

  const withPrefix = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const parts = withPrefix
    .split('/')
    .filter(Boolean)
    .reduce<string[]>((acc, part) => {
      if (part === '.') return acc
      if (part === '..') {
        acc.pop()
        return acc
      }
      acc.push(part)
      return acc
    }, [])

  return `/${parts.join('/')}`
}

export function detectLanguageByPath(path: string): SupportedLanguage {
  const lower = path.toLowerCase()
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript'
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'javascript'
  if (lower.endsWith('.md') || lower.endsWith('.mdx')) return 'markdown'
  if (lower.endsWith('.json')) return 'json'
  return 'plaintext'
}

export function isTypeScriptPath(path: string): boolean {
  return TS_EXTENSIONS.has(path.slice(path.lastIndexOf('.')).toLowerCase())
}

function nowIso() {
  return new Date().toISOString()
}

export function createDefaultSnapshot(projectName = 'project'): WorkspaceSnapshotV1 {
  const normalizedProjectName = projectName.trim() || 'project'
  return {
    schemaVersion: 1,
    entryPath: DEFAULT_ENTRY_PATH,
    files: [
      {
        path: '/api/index.ts',
        language: 'typescript',
        updatedAt: nowIso(),
        content: `export function main(a: number, b: number) {\n  return a + b\n}\n`,
      },
      {
        path: '/README.md',
        language: 'markdown',
        updatedAt: nowIso(),
        content: `# ${normalizedProjectName}\n\nEntry point: \`${DEFAULT_ENTRY_PATH}\`\n`,
      },
    ],
  }
}

function dedupeAndSortFiles(files: WorkspaceFile[]): WorkspaceFile[] {
  const seen = new Set<string>()
  const out: WorkspaceFile[] = []

  for (const file of files) {
    const normalizedPath = normalizeWorkspacePath(file.path)
    if (normalizedPath === '/' || seen.has(normalizedPath)) continue

    seen.add(normalizedPath)
    out.push({
      ...file,
      path: normalizedPath,
      language: detectLanguageByPath(normalizedPath),
      updatedAt: file.updatedAt || nowIso(),
      content: String(file.content ?? ''),
    })
  }

  return out.sort((a, b) => a.path.localeCompare(b.path))
}

function pickEntryPath(files: WorkspaceFile[], desiredPath?: string): string {
  const normalizedDesired = desiredPath ? normalizeWorkspacePath(desiredPath) : null

  if (normalizedDesired && files.some((file) => file.path === normalizedDesired)) {
    return normalizedDesired
  }

  const tsFile = files.find((file) => isTypeScriptPath(file.path))
  if (tsFile) return tsFile.path

  return files[0]?.path ?? DEFAULT_ENTRY_PATH
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

type LegacyNode = {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  content?: string
}

type LegacySnapshot = {
  nodes: Record<string, LegacyNode>
}

function isLegacySnapshot(value: unknown): value is LegacySnapshot {
  if (!isObjectRecord(value)) return false
  if (!isObjectRecord(value.nodes)) return false
  return true
}

function extractLegacyFiles(snapshot: LegacySnapshot): WorkspaceFile[] {
  const files: WorkspaceFile[] = []
  const nodes = snapshot.nodes
  const memo = new Map<string, string>()

  const buildNodePath = (nodeId: string): string => {
    const cached = memo.get(nodeId)
    if (cached) return cached

    const node = nodes[nodeId]
    if (!node) return '/unknown'

    const selfName = (node.name || 'untitled').replace(/\//g, '')
    if (!node.parentId) {
      const path = normalizeWorkspacePath(`/${selfName}`)
      memo.set(nodeId, path)
      return path
    }

    const parentPath = buildNodePath(node.parentId)
    const nextPath = normalizeWorkspacePath(`${parentPath}/${selfName}`)
    memo.set(nodeId, nextPath)
    return nextPath
  }

  for (const node of Object.values(nodes)) {
    if (node.type !== 'file') continue
    const filePath = buildNodePath(node.id)

    files.push({
      path: filePath,
      content: String(node.content ?? ''),
      language: detectLanguageByPath(filePath),
      updatedAt: nowIso(),
    })
  }

  return files
}

export function parseWorkspaceSnapshot(input: unknown): WorkspaceSnapshotV1 {
  if (isObjectRecord(input) && input.schemaVersion === 1 && Array.isArray(input.files)) {
    const parsedFiles = input.files
      .map((raw): WorkspaceFile | null => {
        if (!isObjectRecord(raw)) return null
        const path = typeof raw.path === 'string' ? raw.path : ''
        if (!path) return null
        return {
          path,
          content: typeof raw.content === 'string' ? raw.content : '',
          language:
            typeof raw.language === 'string'
              ? (raw.language as SupportedLanguage)
              : detectLanguageByPath(path),
          updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : nowIso(),
        }
      })
      .filter((file): file is WorkspaceFile => Boolean(file))

    const files = dedupeAndSortFiles(parsedFiles)
    const entryPathRaw = typeof input.entryPath === 'string' ? input.entryPath : undefined

    return {
      schemaVersion: 1,
      files,
      entryPath: pickEntryPath(files, entryPathRaw),
    }
  }

  if (isLegacySnapshot(input)) {
    const files = dedupeAndSortFiles(extractLegacyFiles(input))
    return {
      schemaVersion: 1,
      files,
      entryPath: pickEntryPath(files, DEFAULT_ENTRY_PATH),
    }
  }

  return createDefaultSnapshot('process')
}

export function snapshotToFileMap(snapshot: WorkspaceSnapshotV1): Record<string, string> {
  const map: Record<string, string> = {}
  for (const file of snapshot.files) {
    map[file.path] = file.content
  }
  return map
}

export function applyFileContent(
  snapshot: WorkspaceSnapshotV1,
  path: string,
  content: string
): WorkspaceSnapshotV1 {
  const normalizedPath = normalizeWorkspacePath(path)
  const existing = snapshot.files.find((file) => file.path === normalizedPath)
  if (!existing) return snapshot

  const files = snapshot.files.map((file) =>
    file.path === normalizedPath
      ? {
          ...file,
          content,
          updatedAt: nowIso(),
        }
      : file
  )

  return {
    ...snapshot,
    files,
  }
}

export function upsertFile(
  snapshot: WorkspaceSnapshotV1,
  nextFile: Pick<WorkspaceFile, 'path' | 'content'>
): WorkspaceSnapshotV1 {
  const normalizedPath = normalizeWorkspacePath(nextFile.path)
  const language = detectLanguageByPath(normalizedPath)
  const updatedAt = nowIso()
  const existingIndex = snapshot.files.findIndex((file) => file.path === normalizedPath)

  if (existingIndex === -1) {
    const files = dedupeAndSortFiles([
      ...snapshot.files,
      {
        path: normalizedPath,
        content: nextFile.content,
        language,
        updatedAt,
      },
    ])
    return {
      ...snapshot,
      files,
      entryPath: pickEntryPath(files, snapshot.entryPath),
    }
  }

  const files = snapshot.files.map((file, index) =>
    index === existingIndex
      ? {
          ...file,
          content: nextFile.content,
          language,
          updatedAt,
        }
      : file
  )

  return {
    ...snapshot,
    files: dedupeAndSortFiles(files),
  }
}

export function removeFile(snapshot: WorkspaceSnapshotV1, path: string): WorkspaceSnapshotV1 {
  const normalizedPath = normalizeWorkspacePath(path)
  const files = snapshot.files.filter((file) => file.path !== normalizedPath)
  return {
    ...snapshot,
    files,
    entryPath: pickEntryPath(files, snapshot.entryPath),
  }
}

export function renameFile(
  snapshot: WorkspaceSnapshotV1,
  sourcePath: string,
  targetPath: string
): WorkspaceSnapshotV1 {
  const normalizedSource = normalizeWorkspacePath(sourcePath)
  const normalizedTarget = normalizeWorkspacePath(targetPath)

  if (normalizedSource === normalizedTarget) return snapshot

  const existing = snapshot.files.find((file) => file.path === normalizedSource)
  if (!existing) return snapshot

  const withoutSource = snapshot.files.filter((file) => file.path !== normalizedSource)
  const files = dedupeAndSortFiles([
    ...withoutSource,
    {
      ...existing,
      path: normalizedTarget,
      language: detectLanguageByPath(normalizedTarget),
      updatedAt: nowIso(),
    },
  ])

  const nextEntryPath =
    snapshot.entryPath === normalizedSource ? normalizedTarget : snapshot.entryPath

  return {
    ...snapshot,
    files,
    entryPath: pickEntryPath(files, nextEntryPath),
  }
}

export function pickBuildTarget(
  snapshot: WorkspaceSnapshotV1,
  activePath: string | null
): string | null {
  const candidate = activePath ? normalizeWorkspacePath(activePath) : null
  if (candidate && snapshot.files.some((file) => file.path === candidate && isTypeScriptPath(file.path))) {
    return candidate
  }

  const entry = normalizeWorkspacePath(snapshot.entryPath)
  if (snapshot.files.some((file) => file.path === entry && isTypeScriptPath(file.path))) {
    return entry
  }

  const firstTs = snapshot.files.find((file) => isTypeScriptPath(file.path))
  return firstTs?.path ?? null
}

export function ensureTabTargetsExist(
  snapshot: WorkspaceSnapshotV1,
  tabs: string[],
  activePath: string | null
): { tabs: string[]; activePath: string | null } {
  const validPathSet = new Set(snapshot.files.map((file) => file.path))
  const uniqueTabs = tabs.filter((path, index) => tabs.indexOf(path) === index)
  const filteredTabs = uniqueTabs.filter((path) => validPathSet.has(path))

  const nextActivePath =
    activePath && validPathSet.has(activePath)
      ? activePath
      : filteredTabs[0] ?? snapshot.files[0]?.path ?? null

  const nextTabs = filteredTabs.length > 0
    ? filteredTabs
    : nextActivePath
      ? [nextActivePath]
      : []

  return {
    tabs: nextTabs,
    activePath: nextActivePath,
  }
}
