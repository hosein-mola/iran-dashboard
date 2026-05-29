'use client'

import { loader } from '@monaco-editor/react'
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  FileCode2,
  FileJson,
  FileText,
  Files,
  Folder,
  FolderOpen,
  FolderPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Save,
  TerminalSquare,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'
import * as monacoEditor from 'monaco-editor'
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  createCodeWorkspace,
  fetchWorkspace,
  fetchWorkspaceVersionSnapshot,
  fetchWorkspaceVersions,
  listCodeWorkspaces,
  saveWorkspaceBundle,
  saveWorkspaceVersion,
} from '@/lib/api-code-workspaces'
import {
  applyFileContent,
  createDefaultSnapshot,
  detectLanguageByPath,
  ensureTabTargetsExist,
  isTypeScriptPath,
  normalizeWorkspacePath,
  parseWorkspaceSnapshot,
  renameFile,
  removeFile,
  snapshotToFileMap,
  upsertFile,
} from './snapshot'
import type {
  BuildLogEntry,
  BuildWorkerRequest,
  BuildWorkerResponse,
  WorkspaceProject,
  WorkspaceSnapshotV1,
  WorkspaceVersionSummary,
} from './types'

loader.config({ monaco: monacoEditor })

type MonacoApi = typeof monacoEditor
type MonacoEditorInstance = monacoEditor.editor.IStandaloneCodeEditor

type FileTreeNode = {
  name: string
  fullPath: string
  type: 'file' | 'folder'
  children: FileTreeNode[]
}

type MutableTreeNode = {
  name: string
  fullPath: string
  type: 'file' | 'folder'
  children: Map<string, MutableTreeNode>
}

type BuildWorkerPending = {
  resolve: (value: BuildWorkerResponse) => void
  reject: (reason?: unknown) => void
  timeoutId: ReturnType<typeof setTimeout>
}

type FileContextMenuState = {
  x: number
  y: number
  path: string
  nodeType: 'file' | 'folder'
}

type ImportContext = {
  typedPath: string
  startColumn: number
}

const MAX_LOG_LINES = 80
const DEFAULT_WORKSPACE_SLUG = 'process'
const CONSOLE_HEIGHT = 900

const KNOWN_IMPORT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mdx',
]

let monacoWorkersConfigured = false

function configureMonacoWorkers() {
  if (monacoWorkersConfigured || typeof window === 'undefined') return
  ;(
    self as Window & typeof globalThis & { MonacoEnvironment?: unknown }
  ).MonacoEnvironment = {
    getWorker(_: unknown, label: string) {
      if (label === 'json') {
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/json/json.worker.js',
            import.meta.url
          ),
          { type: 'module' }
        )
      }

      if (label === 'css' || label === 'scss' || label === 'less') {
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/css/css.worker.js',
            import.meta.url
          ),
          { type: 'module' }
        )
      }

      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/html/html.worker.js',
            import.meta.url
          ),
          { type: 'module' }
        )
      }

      if (label === 'typescript' || label === 'javascript') {
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/typescript/ts.worker.js',
            import.meta.url
          ),
          { type: 'module' }
        )
      }

      return new Worker(
        new URL(
          'monaco-editor/esm/vs/editor/editor.worker.js',
          import.meta.url
        ),
        { type: 'module' }
      )
    },
  }

  monacoWorkersConfigured = true
}

function configureTypeScriptLanguageService(m: MonacoApi) {
  const commonCompilerOptions = {
    target: m.languages.typescript.ScriptTarget.ES2020,
    module: m.languages.typescript.ModuleKind.ESNext,
    moduleResolution: m.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    allowImportingTsExtensions: true,
    allowJs: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    baseUrl: '/',
    paths: {
      '*': ['*'],
    },
  }

  m.languages.typescript.typescriptDefaults.setCompilerOptions(
    commonCompilerOptions
  )
  m.languages.typescript.javascriptDefaults.setCompilerOptions(
    commonCompilerOptions
  )

  m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    onlyVisible: false,
  })

  m.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    onlyVisible: false,
  })

  m.languages.typescript.typescriptDefaults.setEagerModelSync(true)
  m.languages.typescript.javascriptDefaults.setEagerModelSync(true)

  const nonCodeModuleDecl = `
declare module '*.md' {
  const content: string
  export default content
}
declare module '*.mdx' {
  const content: string
  export default content
}
`
  m.languages.typescript.typescriptDefaults.addExtraLib(
    nonCodeModuleDecl,
    'file:///__types__/vfs-modules.d.ts'
  )
  m.languages.typescript.javascriptDefaults.addExtraLib(
    nonCodeModuleDecl,
    'file:///__types__/vfs-modules-js.d.ts'
  )

  m.editor.defineTheme('vscode-deep-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'd4d4d4', background: '1e1e1e' },
      { token: 'comment', foreground: '6a9955' },
      { token: 'keyword', foreground: '569cd6' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'number', foreground: 'b5cea8' },
      { token: 'type.identifier', foreground: '4ec9b0' },
      { token: 'identifier', foreground: '9cdcfe' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#c6c6c6',
      'editorCursor.foreground': '#aeafad',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editor.lineHighlightBackground': '#2a2d2e',
      'editorIndentGuide.background1': '#404040',
      'editorIndentGuide.activeBackground1': '#707070',
      'editorWidget.background': '#252526',
      'editorSuggestWidget.background': '#252526',
      'editorSuggestWidget.border': '#3c3c3c',
      'editorSuggestWidget.foreground': '#d4d4d4',
      'editorSuggestWidget.selectedBackground': '#04395e',
      'editorHoverWidget.background': '#252526',
      'editorHoverWidget.border': '#3c3c3c',
    },
  })

  m.editor.setTheme('vscode-deep-dark')
}

function asSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildTree(paths: string[]): FileTreeNode[] {
  const root = new Map<string, MutableTreeNode>()

  for (const path of paths) {
    const normalized = normalizeWorkspacePath(path)
    const parts = normalized.split('/').filter(Boolean)
    if (parts.length === 0) continue

    let currentMap = root
    let currentPath = ''

    for (let index = 0; index < parts.length; index += 1) {
      const name = parts[index]
      currentPath = `${currentPath}/${name}`
      const isFile = index === parts.length - 1

      if (!currentMap.has(name)) {
        currentMap.set(name, {
          name,
          fullPath: currentPath,
          type: isFile ? 'file' : 'folder',
          children: new Map<string, MutableTreeNode>(),
        })
      }

      const node = currentMap.get(name)
      if (!node) continue

      if (!isFile) {
        node.type = 'folder'
        currentMap = node.children
      }
    }
  }

  const toSorted = (nodes: MutableTreeNode[]): FileTreeNode[] => {
    return nodes
      .map((node) => ({
        name: node.name,
        fullPath: node.fullPath,
        type: node.type,
        children: toSorted(Array.from(node.children.values())),
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
  }

  return toSorted(Array.from(root.values()))
}

function pickDefaultContent(path: string): string {
  const lower = path.toLowerCase()

  if (lower.endsWith('.md')) {
    return '# Notes\n\n'
  }

  if (lower.endsWith('.json')) {
    return '{\n  \n}\n'
  }

  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) {
    return 'export {}\n'
  }

  if (lower.endsWith('.js') || lower.endsWith('.jsx')) {
    return 'export {}\n'
  }

  return ''
}

function monacoLanguageForPath(path: string) {
  const language = detectLanguageByPath(path)
  if (language === 'typescript') return 'typescript'
  if (language === 'javascript') return 'javascript'
  if (language === 'markdown') return 'markdown'
  if (language === 'json') return 'json'
  return 'plaintext'
}

function pickFileIcon(path: string): LucideIcon {
  const lower = path.toLowerCase()
  if (
    lower.endsWith('.ts') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.js') ||
    lower.endsWith('.jsx')
  ) {
    return FileCode2
  }

  if (lower.endsWith('.json')) {
    return FileJson
  }

  if (lower.endsWith('.md') || lower.endsWith('.mdx')) {
    return FileText
  }

  return FileIcon
}

function dirnamePath(path: string) {
  const normalized = normalizeWorkspacePath(path)
  const index = normalized.lastIndexOf('/')
  if (index <= 0) return '/'
  return normalized.slice(0, index)
}

function stripKnownExtension(path: string) {
  for (const extension of KNOWN_IMPORT_EXTENSIONS) {
    if (path.endsWith(extension)) {
      return path.slice(0, -extension.length)
    }
  }

  return path
}

function toRelativePath(fromDir: string, toFile: string) {
  const fromParts = normalizeWorkspacePath(fromDir).split('/').filter(Boolean)
  const toParts = normalizeWorkspacePath(toFile).split('/').filter(Boolean)

  let commonLength = 0
  while (
    commonLength < fromParts.length &&
    commonLength < toParts.length &&
    fromParts[commonLength] === toParts[commonLength]
  ) {
    commonLength += 1
  }

  const upCount = fromParts.length - commonLength
  const downParts = toParts.slice(commonLength)

  const upPrefix = upCount > 0 ? '../'.repeat(upCount) : './'
  return `${upPrefix}${downParts.join('/')}`
}

function buildImportCandidates(
  fromFilePath: string,
  targetFilePath: string,
  typedPath: string
) {
  const targetNormalized = normalizeWorkspacePath(targetFilePath)
  const relativeBase = toRelativePath(
    dirnamePath(fromFilePath),
    targetNormalized
  )

  const absoluteCandidates = new Set<string>()
  const relativeCandidates = new Set<string>()

  const absoluteNoExt = stripKnownExtension(targetNormalized)
  const relativeNoExt = stripKnownExtension(relativeBase)

  absoluteCandidates.add(targetNormalized)
  absoluteCandidates.add(absoluteNoExt)
  relativeCandidates.add(relativeBase)
  relativeCandidates.add(relativeNoExt)

  if (absoluteNoExt.endsWith('/index')) {
    absoluteCandidates.add(absoluteNoExt.slice(0, -'/index'.length) || '/')
  }

  if (relativeNoExt.endsWith('/index')) {
    const compact = relativeNoExt.slice(0, -'/index'.length)
    relativeCandidates.add(compact || './')
  }

  if (typedPath.startsWith('/')) {
    return Array.from(absoluteCandidates)
  }

  return Array.from(relativeCandidates)
}

function matchImportStringContext(linePrefix: string): ImportContext | null {
  const match = linePrefix.match(
    /(?:import\s+(?:[^'"\n]*from\s*)?|import\s*\(\s*|export\s+[^'"\n]*from\s*|require\s*\(\s*)['"]([^'"\n]*)$/
  )

  if (!match) return null

  const typedPath = match[1] ?? ''
  const startColumn = linePrefix.length - typedPath.length + 1

  return {
    typedPath,
    startColumn,
  }
}

export default function CodeEditor({
  workspaceSlug = DEFAULT_WORKSPACE_SLUG,
}: {
  workspaceSlug?: string
}) {
  const [projects, setProjects] = useState<WorkspaceProject[]>([])
  const [selectedProjectSlug, setSelectedProjectSlug] = useState(workspaceSlug)
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshotV1>(() =>
    createDefaultSnapshot(workspaceSlug)
  )
  const [tabs, setTabs] = useState<string[]>([])
  const [activePath, setActivePath] = useState<string | null>(null)
  const [versions, setVersions] = useState<WorkspaceVersionSummary[]>([])
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [entryPathInput, setEntryPathInput] = useState('/api/index.ts')
  const [dirtyPaths, setDirtyPaths] = useState<Record<string, boolean>>({})
  const [logs, setLogs] = useState<BuildLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isExplorerOpen, setIsExplorerOpen] = useState(true)
  const [isConsoleOpen, setIsConsoleOpen] = useState(true)
  const [isEndpointsOpen, setIsEndpointsOpen] = useState(false)
  const [fileContextMenu, setFileContextMenu] =
    useState<FileContextMenuState | null>(null)
  const [projectNameInput, setProjectNameInput] = useState('')
  const [projectSlugInput, setProjectSlugInput] = useState('')
  const [newFileInput, setNewFileInput] = useState('')
  const [collapsedFolders, setCollapsedFolders] = useState<
    Record<string, boolean>
  >({})

  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<MonacoEditorInstance | null>(null)
  const monacoRef = useRef<MonacoApi | null>(null)
  const modelsRef = useRef<Map<string, monacoEditor.editor.ITextModel>>(
    new Map()
  )
  const modelListenersRef = useRef<Map<string, monacoEditor.IDisposable>>(
    new Map()
  )
  const completionDisposablesRef = useRef<monacoEditor.IDisposable[]>([])
  const savedContentsRef = useRef<Record<string, string>>({})
  const workerRef = useRef<Worker | null>(null)
  const pendingBuildsRef = useRef<Map<string, BuildWorkerPending>>(new Map())
  const viewStateByPathRef = useRef<
    Map<string, monacoEditor.editor.ICodeEditorViewState | null>
  >(new Map())
  const snapshotRef = useRef(snapshot)
  const activePathRef = useRef(activePath)
  const selectedProjectSlugRef = useRef(selectedProjectSlug)
  const loadingNonceRef = useRef(0)

  const isDirty = useMemo(
    () => Object.keys(dirtyPaths).length > 0,
    [dirtyPaths]
  )

  const addLog = useCallback(
    (level: BuildLogEntry['level'], message: string) => {
      setLogs((prev) => {
        const next = [
          ...prev,
          {
            id: crypto.randomUUID(),
            level,
            message,
            at: new Date().toISOString(),
          },
        ]

        if (next.length > MAX_LOG_LINES) {
          return next.slice(next.length - MAX_LOG_LINES)
        }

        return next
      })
    },
    []
  )

  const disposeModels = useCallback(() => {
    for (const disposable of modelListenersRef.current.values()) {
      disposable.dispose()
    }

    for (const model of modelsRef.current.values()) {
      model.dispose()
    }

    for (const disposable of completionDisposablesRef.current) {
      disposable.dispose()
    }

    modelListenersRef.current.clear()
    modelsRef.current.clear()
    completionDisposablesRef.current = []
    viewStateByPathRef.current.clear()
  }, [])

  const ensureBuildWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current

    const worker = new Worker(
      new URL('../../workers/esbuild.worker.ts', import.meta.url),
      {
        type: 'module',
        name: 'workspace-esbuild',
      }
    )

    worker.onmessage = (event: MessageEvent<BuildWorkerResponse>) => {
      const payload = event.data
      const pending = pendingBuildsRef.current.get(payload.requestId)
      if (!pending) return

      clearTimeout(pending.timeoutId)
      pendingBuildsRef.current.delete(payload.requestId)
      pending.resolve(payload)
    }

    worker.onerror = (event) => {
      for (const [requestId, pending] of pendingBuildsRef.current.entries()) {
        clearTimeout(pending.timeoutId)
        pendingBuildsRef.current.delete(requestId)
        pending.reject(new Error(event.message || 'Build worker error'))
      }
    }

    workerRef.current = worker
    return worker
  }, [])

  const runBuild = useCallback(
    async (request: BuildWorkerRequest): Promise<BuildWorkerResponse> => {
      const worker = ensureBuildWorker()

      return await new Promise<BuildWorkerResponse>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          pendingBuildsRef.current.delete(request.requestId)
          reject(new Error('Build timeout'))
        }, 15_000)

        pendingBuildsRef.current.set(request.requestId, {
          resolve,
          reject,
          timeoutId,
        })

        worker.postMessage(request)
      })
    },
    [ensureBuildWorker]
  )

  const updateDirtyForPath = useCallback((path: string) => {
    const model = modelsRef.current.get(path)
    if (!model) return

    const savedValue = savedContentsRef.current[path] ?? ''
    const currentValue = model.getValue()
    const nextDirty = currentValue !== savedValue

    setDirtyPaths((prev) => {
      const alreadyDirty = Boolean(prev[path])
      if (alreadyDirty === nextDirty) return prev

      if (nextDirty) {
        return {
          ...prev,
          [path]: true,
        }
      }

      const next = { ...prev }
      delete next[path]
      return next
    })
  }, [])

  const ensureModel = useCallback(
    (path: string, initialContent: string) => {
      const m = monacoRef.current
      if (!m) return null

      const normalizedPath = normalizeWorkspacePath(path)
      const existing = modelsRef.current.get(normalizedPath)
      if (existing) return existing

      const uri = m.Uri.parse(`file://${normalizedPath}`)
      const model = m.editor.createModel(
        initialContent,
        monacoLanguageForPath(normalizedPath),
        uri
      )

      modelsRef.current.set(normalizedPath, model)

      const listener = model.onDidChangeContent(() => {
        updateDirtyForPath(normalizedPath)
      })
      modelListenersRef.current.set(normalizedPath, listener)

      return model
    },
    [updateDirtyForPath]
  )

  const removeModel = useCallback((path: string) => {
    const normalizedPath = normalizeWorkspacePath(path)
    const listener = modelListenersRef.current.get(normalizedPath)
    if (listener) {
      listener.dispose()
      modelListenersRef.current.delete(normalizedPath)
    }

    const model = modelsRef.current.get(normalizedPath)
    if (model) {
      model.dispose()
      modelsRef.current.delete(normalizedPath)
    }

    viewStateByPathRef.current.delete(normalizedPath)
  }, [])

  const ensureEditorInstance = useCallback(() => {
    const monaco = monacoRef.current
    if (!monaco) return
    if (editorRef.current || !containerRef.current) return

    editorRef.current = monaco.editor.create(containerRef.current, {
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 20,
      lineHeight: 32,
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      wordWrap: 'on',
      smoothScrolling: true,
      fontFamily:
        'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
      scrollBeyondLastLine: false,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      snippetSuggestions: 'inline',
      padding: { top: 8, bottom: 8 },
      glyphMargin: true,
    })

    if (activePathRef.current) {
      const file = snapshotRef.current.files.find(
        (item) => item.path === activePathRef.current
      )
      if (file) {
        const model = ensureModel(file.path, file.content)
        if (model) {
          editorRef.current.setModel(model)
        }
      }
    }
  }, [ensureModel])

  const createFileAtPath = useCallback(
    (rawPath: string) => {
      const normalizedPath = normalizeWorkspacePath(rawPath)
      if (normalizedPath === '/') {
        addLog('error', 'Invalid file path')
        return false
      }

      if (
        snapshotRef.current.files.some((file) => file.path === normalizedPath)
      ) {
        addLog('error', `File already exists: ${normalizedPath}`)
        return false
      }

      const nextSnapshot = upsertFile(snapshotRef.current, {
        path: normalizedPath,
        content: pickDefaultContent(normalizedPath),
      })

      setSnapshot(nextSnapshot)
      snapshotRef.current = nextSnapshot
      setDirtyPaths((prev) => ({ ...prev, [normalizedPath]: true }))
      setTabs((prev) =>
        prev.includes(normalizedPath) ? prev : [...prev, normalizedPath]
      )
      setActivePath(normalizedPath)
      setIsEndpointsOpen(false)
      addLog('success', `Added file ${normalizedPath}`)

      return true
    },
    [addLog]
  )

  const renameFilePath = useCallback(
    (sourcePath: string) => {
      const nextPathRaw = window.prompt('Rename file path', sourcePath)
      if (!nextPathRaw) return

      const nextPath = normalizeWorkspacePath(nextPathRaw)
      if (nextPath === sourcePath) return

      if (snapshotRef.current.files.some((file) => file.path === nextPath)) {
        addLog('error', `Target path already exists: ${nextPath}`)
        return
      }

      const nextSnapshot = renameFile(snapshotRef.current, sourcePath, nextPath)
      setSnapshot(nextSnapshot)
      snapshotRef.current = nextSnapshot

      const savedValue = savedContentsRef.current[sourcePath]
      if (typeof savedValue === 'string') {
        savedContentsRef.current[nextPath] = savedValue
        delete savedContentsRef.current[sourcePath]
      }

      const model = modelsRef.current.get(sourcePath)
      if (model) {
        const content = model.getValue()
        removeModel(sourcePath)
        ensureModel(nextPath, content)
      }

      setTabs((prev) =>
        prev.map((path) => (path === sourcePath ? nextPath : path))
      )
      setActivePath(nextPath)
      setDirtyPaths((prev) => {
        const next = { ...prev }
        if (next[sourcePath]) {
          delete next[sourcePath]
          next[nextPath] = true
        }
        return next
      })

      addLog('success', `Renamed ${sourcePath} -> ${nextPath}`)
    },
    [addLog, ensureModel, removeModel]
  )

  const deleteFilePath = useCallback(
    (targetPath: string) => {
      const confirmed = window.confirm(`Delete file ${targetPath}?`)
      if (!confirmed) return

      const nextSnapshot = removeFile(snapshotRef.current, targetPath)
      setSnapshot(nextSnapshot)
      snapshotRef.current = nextSnapshot

      delete savedContentsRef.current[targetPath]
      removeModel(targetPath)

      setDirtyPaths((prev) => {
        const next = { ...prev }
        delete next[targetPath]
        return next
      })

      const nextTabs = tabs.filter((path) => path !== targetPath)
      const nextActivePath = nextTabs[nextTabs.length - 1] ?? null
      setTabs(nextTabs)
      setActivePath(nextActivePath)

      addLog('success', `Deleted ${targetPath}`)
    },
    [addLog, removeModel, tabs]
  )

  const hydrateSnapshotFromModels = useCallback(
    (baseSnapshot: WorkspaceSnapshotV1) => {
      let nextSnapshot = baseSnapshot

      for (const file of baseSnapshot.files) {
        const model = modelsRef.current.get(file.path)
        if (!model) continue

        const value = model.getValue()
        if (value !== file.content) {
          nextSnapshot = applyFileContent(nextSnapshot, file.path, value)
        }
      }

      return {
        ...nextSnapshot,
        entryPath: normalizeWorkspacePath(
          entryPathInput || nextSnapshot.entryPath
        ),
      }
    },
    [entryPathInput]
  )

  const openFile = useCallback(
    (path: string) => {
      const normalizedPath = normalizeWorkspacePath(path)
      const file = snapshotRef.current.files.find(
        (item) => item.path === normalizedPath
      )
      if (!file) return

      const editor = editorRef.current
      if (editor && activePathRef.current) {
        const state = editor.saveViewState()
        viewStateByPathRef.current.set(activePathRef.current, state)
      }

      const model = ensureModel(normalizedPath, file.content)
      if (!model || !editor) {
        setTabs((prev) =>
          prev.includes(normalizedPath) ? prev : [...prev, normalizedPath]
        )
        setActivePath(normalizedPath)
        setIsEndpointsOpen(false)
        return
      }

      editor.setModel(model)
      const savedState = viewStateByPathRef.current.get(normalizedPath)
      if (savedState) {
        editor.restoreViewState(savedState)
      }

      editor.focus()
      setTabs((prev) =>
        prev.includes(normalizedPath) ? prev : [...prev, normalizedPath]
      )
      setActivePath(normalizedPath)
      setIsEndpointsOpen(false)
    },
    [ensureModel]
  )

  const openFileContextMenu = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      path: string,
      nodeType: 'file' | 'folder'
    ) => {
      event.preventDefault()
      setFileContextMenu({
        x: event.clientX,
        y: event.clientY,
        path,
        nodeType,
      })
    },
    []
  )

  const applyLoadedSnapshot = useCallback(
    (nextSnapshot: WorkspaceSnapshotV1) => {
      const normalizedEntry = normalizeWorkspacePath(nextSnapshot.entryPath)
      const normalizedSnapshot: WorkspaceSnapshotV1 = {
        ...nextSnapshot,
        entryPath: normalizedEntry,
      }

      snapshotRef.current = normalizedSnapshot
      savedContentsRef.current = Object.fromEntries(
        normalizedSnapshot.files.map((file) => [file.path, file.content])
      )

      disposeModels()
      setDirtyPaths({})
      setSnapshot(normalizedSnapshot)
      setEntryPathInput(normalizedEntry)

      const tabTargets = ensureTabTargetsExist(
        normalizedSnapshot,
        [],
        normalizedEntry
      )
      setTabs(tabTargets.tabs)
      setActivePath(tabTargets.activePath)
    },
    [disposeModels]
  )

  const loadProject = useCallback(
    async (slug: string) => {
      const nonce = loadingNonceRef.current + 1
      loadingNonceRef.current = nonce
      setIsLoading(true)

      try {
        const payload = await fetchWorkspace(slug)
        if (loadingNonceRef.current !== nonce) return

        const parsedSnapshot = payload.latest?.snapshot
          ? parseWorkspaceSnapshot(JSON.parse(payload.latest.snapshot))
          : createDefaultSnapshot(slug)

        applyLoadedSnapshot(parsedSnapshot)
        setVersions(payload.versions)
        setSelectedVersion(payload.latest?.version ?? null)
        addLog('info', `Loaded project "${slug}"`)
      } catch (error) {
        if (loadingNonceRef.current !== nonce) return
        addLog(
          'error',
          error instanceof Error ? error.message : 'Failed to load project'
        )
      } finally {
        if (loadingNonceRef.current === nonce) {
          setIsLoading(false)
        }
      }
    },
    [addLog, applyLoadedSnapshot]
  )

  const refreshProjects = useCallback(async () => {
    const response = await listCodeWorkspaces()
    setProjects(response.workspaces)
    return response.workspaces
  }, [])

  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true)

    try {
      const listed = await refreshProjects()
      const preferredSlug = workspaceSlug || DEFAULT_WORKSPACE_SLUG

      if (listed.length === 0) {
        const defaultSnapshot = createDefaultSnapshot(preferredSlug)
        const created = await createCodeWorkspace({
          slug: preferredSlug,
          name: preferredSlug,
          initialSnapshot: defaultSnapshot,
        })

        setProjects([created.workspace])
        setSelectedProjectSlug(created.workspace.slug)
        await loadProject(created.workspace.slug)
        return
      }

      const selected =
        listed.find((item) => item.slug === preferredSlug) ?? listed[0]
      setSelectedProjectSlug(selected.slug)
      await loadProject(selected.slug)
    } catch (error) {
      addLog(
        'error',
        error instanceof Error ? error.message : 'Failed to initialize editor'
      )
      setIsLoading(false)
    } finally {
      setIsBootstrapping(false)
    }
  }, [addLog, loadProject, refreshProjects, workspaceSlug])

  const handleSave = useCallback(async () => {
    const slug = selectedProjectSlugRef.current
    if (!slug || !snapshotRef.current) return

    const snapshotForSave = hydrateSnapshotFromModels(snapshotRef.current)
    snapshotRef.current = snapshotForSave
    setSnapshot(snapshotForSave)

    setIsSaving(true)
    try {
      const saved = await saveWorkspaceVersion({
        slug,
        snapshot: snapshotForSave,
        clientRequestId: crypto.randomUUID(),
      })

      const normalizedEntryPath = normalizeWorkspacePath(
        snapshotForSave.entryPath
      )
      const hasEntryTs = snapshotForSave.files.some(
        (file) =>
          file.path === normalizedEntryPath && isTypeScriptPath(file.path)
      )
      const normalizedActivePath = activePathRef.current
        ? normalizeWorkspacePath(activePathRef.current)
        : null
      const hasActiveTs =
        normalizedActivePath !== null &&
        snapshotForSave.files.some(
          (file) =>
            file.path === normalizedActivePath && isTypeScriptPath(file.path)
        )
      const fallbackTsPath = snapshotForSave.files.find((file) =>
        isTypeScriptPath(file.path)
      )?.path

      const buildTarget = hasEntryTs
        ? normalizedEntryPath
        : hasActiveTs
          ? normalizedActivePath
          : (fallbackTsPath ?? null)
      if (buildTarget) {
        addLog('info', `Bundling ${buildTarget}...`)

        const buildResponse = await runBuild({
          requestId: crypto.randomUUID(),
          entryPath: buildTarget,
          files: snapshotToFileMap(snapshotForSave),
        })

        if (buildResponse.ok) {
          for (const warning of buildResponse.warnings) {
            addLog('info', warning)
          }

          await saveWorkspaceBundle({
            slug,
            version: saved.version,
            entryPath: buildResponse.entryPath,
            code: buildResponse.output,
          })

          addLog(
            'success',
            `Saved v${saved.version} with bundle for ${buildResponse.entryPath}`
          )
        } else {
          addLog('error', buildResponse.error)
          for (const warning of buildResponse.warnings) {
            addLog('info', warning)
          }
        }
      } else {
        addLog(
          'info',
          `Saved v${saved.version} (no TypeScript entry found to bundle)`
        )
      }

      savedContentsRef.current = Object.fromEntries(
        snapshotForSave.files.map((file) => [file.path, file.content])
      )
      setDirtyPaths({})

      const versionsPayload = await fetchWorkspaceVersions(slug)
      setVersions(versionsPayload.versions)
      setSelectedVersion(saved.version)
    } catch (error) {
      addLog('error', error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }, [addLog, hydrateSnapshotFromModels, runBuild])

  const handleCheckoutVersion = useCallback(
    async (version: number) => {
      const slug = selectedProjectSlugRef.current
      if (!slug) return

      if (isDirty) {
        const confirmed = window.confirm(
          'You have unsaved changes. Checkout will discard local edits. Continue?'
        )
        if (!confirmed) return
      }

      try {
        setIsLoading(true)
        const data = await fetchWorkspaceVersionSnapshot(slug, version)
        const parsed = parseWorkspaceSnapshot(JSON.parse(data.snapshot))
        applyLoadedSnapshot(parsed)
        setSelectedVersion(version)
        addLog('success', `Checked out version ${version}`)
      } catch (error) {
        addLog(
          'error',
          error instanceof Error ? error.message : 'Checkout failed'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [addLog, applyLoadedSnapshot, isDirty]
  )

  const handleCreateProject = useCallback(async () => {
    const name = projectNameInput.trim()
    const slug = asSlug(projectSlugInput || projectNameInput)

    if (!name || !slug) {
      addLog('error', 'Project name and slug are required')
      return
    }

    try {
      const snapshotTemplate = createDefaultSnapshot(name)
      const created = await createCodeWorkspace({
        slug,
        name,
        initialSnapshot: snapshotTemplate,
      })

      const nextProjects = await refreshProjects()
      setSelectedProjectSlug(created.workspace.slug)
      setProjectNameInput('')
      setProjectSlugInput('')

      if (!nextProjects.find((item) => item.slug === created.workspace.slug)) {
        setProjects((prev) => [created.workspace, ...prev])
      }

      await loadProject(created.workspace.slug)
      addLog('success', `Project created: ${created.workspace.slug}`)
    } catch (error) {
      addLog(
        'error',
        error instanceof Error ? error.message : 'Failed to create project'
      )
    }
  }, [addLog, loadProject, projectNameInput, projectSlugInput, refreshProjects])

  const handleCreateFile = useCallback(() => {
    const rawPath = newFileInput.trim()
    if (!rawPath) return

    const created = createFileAtPath(rawPath)
    if (created) {
      setNewFileInput('')
    }
  }, [createFileAtPath, newFileInput])

  const handleRenameFile = useCallback(() => {
    const path = activePathRef.current
    if (!path) return
    renameFilePath(path)
  }, [renameFilePath])

  const handleDeleteFile = useCallback(() => {
    const path = activePathRef.current
    if (!path) return
    deleteFilePath(path)
  }, [deleteFilePath])

  const toggleEndpointsPanel = useCallback(() => {
    setIsEndpointsOpen((prev) => !prev)
  }, [])

  const openEntryFile = useCallback(() => {
    const targetPath = normalizeWorkspacePath(
      entryPathInput || snapshotRef.current.entryPath || '/api/index.ts'
    )
    const targetFile = snapshotRef.current.files.find(
      (file) => file.path === targetPath
    )

    if (targetFile) {
      openFile(targetPath)
      return
    }

    createFileAtPath(targetPath)
  }, [createFileAtPath, entryPathInput, openFile])

  useEffect(() => {
    snapshotRef.current = snapshot
    activePathRef.current = activePath
    selectedProjectSlugRef.current = selectedProjectSlug
  }, [activePath, selectedProjectSlug, snapshot])

  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco) return

    const snapshotPaths = new Set(snapshot.files.map((file) => file.path))

    for (const file of snapshot.files) {
      const model = ensureModel(file.path, file.content)
      if (!model) continue

      const expectedLanguage = monacoLanguageForPath(file.path)
      if (model.getLanguageId() !== expectedLanguage) {
        monaco.editor.setModelLanguage(model, expectedLanguage)
      }

      const savedValue = savedContentsRef.current[file.path] ?? ''
      const isDirtyModel = model.getValue() !== savedValue
      if (!isDirtyModel && model.getValue() !== file.content) {
        model.setValue(file.content)
      }
    }

    for (const existingPath of Array.from(modelsRef.current.keys())) {
      if (!snapshotPaths.has(existingPath)) {
        removeModel(existingPath)
      }
    }
  }, [ensureModel, removeModel, snapshot.files])

  useEffect(() => {
    if (!fileContextMenu) return

    const close = () => setFileContextMenu(null)
    window.addEventListener('mousedown', close)
    window.addEventListener('blur', close)

    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('blur', close)
    }
  }, [fileContextMenu])

  useEffect(() => {
    configureMonacoWorkers()
    const pendingBuildsMap = pendingBuildsRef.current

    let cancelled = false
    void loader.init().then((monaco) => {
      if (cancelled) return

      monacoRef.current = monaco
      configureTypeScriptLanguageService(monaco)

      const provideImportPathCompletions: monacoEditor.languages.CompletionItemProvider['provideCompletionItems'] =
        (model, position) => {
          const linePrefix = model
            .getLineContent(position.lineNumber)
            .slice(0, position.column - 1)
          const context = matchImportStringContext(linePrefix)
          if (!context) {
            return { suggestions: [] }
          }

          const fromFilePath = normalizeWorkspacePath(model.uri.path)
          const allPaths = snapshotRef.current.files
            .map((file) => file.path)
            .filter((path) => path !== fromFilePath)

          const suggestionsSet = new Set<string>()

          for (const targetPath of allPaths) {
            const candidates = buildImportCandidates(
              fromFilePath,
              targetPath,
              context.typedPath
            )
            for (const candidate of candidates) {
              if (!candidate) continue
              if (candidate === '.') continue
              if (context.typedPath && !candidate.startsWith(context.typedPath))
                continue
              suggestionsSet.add(candidate)
            }
          }

          const suggestions = Array.from(suggestionsSet)
            .sort((a, b) => a.localeCompare(b))
            .slice(0, 120)
            .map((candidate) => ({
              label: candidate,
              kind: monaco.languages.CompletionItemKind.File,
              insertText: candidate,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: context.startColumn,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
              detail: 'Workspace path',
              sortText: `0_${candidate}`,
            }))

          return { suggestions }
        }

      for (const disposable of completionDisposablesRef.current) {
        disposable.dispose()
      }

      completionDisposablesRef.current = [
        monaco.languages.registerCompletionItemProvider('typescript', {
          triggerCharacters: ['"', "'", '/', '.'],
          provideCompletionItems: provideImportPathCompletions,
        }),
        monaco.languages.registerCompletionItemProvider('javascript', {
          triggerCharacters: ['"', "'", '/', '.'],
          provideCompletionItems: provideImportPathCompletions,
        }),
      ]

      ensureEditorInstance()
    })

    return () => {
      cancelled = true

      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }

      const pendingBuilds = Array.from(pendingBuildsMap.values())
      for (const pending of pendingBuilds) {
        clearTimeout(pending.timeoutId)
        pending.reject(new Error('Build cancelled'))
      }
      pendingBuildsMap.clear()

      disposeModels()
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [disposeModels, ensureEditorInstance])

  useEffect(() => {
    ensureEditorInstance()
  }, [ensureEditorInstance, isEndpointsOpen, tabs.length])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    if (!activePath) {
      editor.setModel(null)
      return
    }

    const file = snapshot.files.find((item) => item.path === activePath)
    if (!file) {
      editor.setModel(null)
      return
    }

    const model = ensureModel(activePath, file.content)
    if (!model) return

    const currentModel = editor.getModel()
    if (currentModel !== model) {
      if (activePathRef.current) {
        const state = editor.saveViewState()
        viewStateByPathRef.current.set(activePathRef.current, state)
      }

      editor.setModel(model)
      const state = viewStateByPathRef.current.get(activePath)
      if (state) editor.restoreViewState(state)
      editor.focus()
    }
  }, [activePath, ensureModel, snapshot.files])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (!isSaving) {
          void handleSave()
        }
      }

      if (event.key === 'Escape') {
        setFileContextMenu(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave, isSaving])

  const selectedProject = useMemo(
    () =>
      projects.find((project) => project.slug === selectedProjectSlug) ?? null,
    [projects, selectedProjectSlug]
  )

  const fileTree = useMemo(
    () => buildTree(snapshot.files.map((file) => file.path)),
    [snapshot.files]
  )

  const activeVersionForExamples =
    selectedVersion ?? selectedProject?.currentVersion ?? 1
  const endpointBasePath = `/api/process/code-workspaces/${selectedProjectSlug || DEFAULT_WORKSPACE_SLUG}`
  const endpointRunPath = `${endpointBasePath}/versions/${activeVersionForExamples}/run`
  const endpointBundlePath = `${endpointBasePath}/versions/${activeVersionForExamples}/bundle`
  const endpointVersionPath = `${endpointBasePath}/versions/${activeVersionForExamples}`
  const endpointVersionsPath = `${endpointBasePath}/versions?limit=50`
  const endpointEntryPath = normalizeWorkspacePath(
    entryPathInput || snapshot.entryPath || '/api/index.ts'
  )
  const runPayloadExample = JSON.stringify(
    {
      entryPath: endpointEntryPath,
      functionName: 'main',
      args: [1, 2],
      data: {
        x: 1,
      },
      timeoutMs: 2000,
    },
    null,
    2
  )
  const runCurlExample = [
    `curl -sS -X POST 'http://localhost:3000${endpointRunPath}' \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -d '${runPayloadExample}'`,
  ].join('\n')
  const hasOpenTabs = tabs.length > 0
  const activeTabPath =
    activePath && tabs.includes(activePath) ? activePath : null
  const activePathLabel = isEndpointsOpen
    ? 'API Endpoints'
    : (activeTabPath ?? 'No file selected')

  const logLevelClass = useCallback((level: BuildLogEntry['level']) => {
    if (level === 'error') return 'text-[#f48771]'
    if (level === 'success') return 'text-[#89d185]'
    return 'text-[#9da5b4]'
  }, [])

  function renderTree(nodes: FileTreeNode[], depth = 0): ReactNode[] {
    return nodes.map((node) => {
      const collapsed = Boolean(collapsedFolders[node.fullPath])
      const style = {
        paddingInlineStart: `${depth * 14 + 10}px`,
      } as CSSProperties

      if (node.type === 'folder') {
        return (
          <div key={node.fullPath}>
            <button
              type="button"
              className="flex w-full items-center gap-1 py-1 text-left text-xs text-[#c7c7c7] hover:bg-[#2a2d2e]"
              style={style}
              onClick={() => {
                setCollapsedFolders((prev) => ({
                  ...prev,
                  [node.fullPath]: !prev[node.fullPath],
                }))
              }}
              onContextMenu={(event) =>
                openFileContextMenu(event, node.fullPath, 'folder')
              }
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5 text-[#8c8c8c]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#8c8c8c]" />
              )}
              {collapsed ? (
                <Folder className="h-3.5 w-3.5 text-[#dcb67a]" />
              ) : (
                <FolderOpen className="h-3.5 w-3.5 text-[#dcb67a]" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {!collapsed && renderTree(node.children, depth + 1)}
          </div>
        )
      }

      const dirty = Boolean(dirtyPaths[node.fullPath])
      const active = node.fullPath === activePath
      const Icon = pickFileIcon(node.fullPath)

      return (
        <button
          key={node.fullPath}
          type="button"
          className={cn(
            'flex w-full items-center gap-2 py-1 text-left text-xs text-[#c7c7c7] hover:bg-[#2a2d2e]',
            active && 'bg-[#37373d] text-white'
          )}
          style={style}
          onClick={() => openFile(node.fullPath)}
          onContextMenu={(event) =>
            openFileContextMenu(event, node.fullPath, 'file')
          }
        >
          <Icon className="h-3.5 w-3.5 text-[#8ac6f2]" />
          <span className="truncate">{node.name}</span>
          {dirty ? (
            <span className="ms-auto text-[10px] text-[#e2c08d]">●</span>
          ) : null}
        </button>
      )
    })
  }

  return (
    <div
      dir="ltr"
      className="relative flex h-full min-h-0 w-full overflow-hidden bg-[#1e1e1e] text-[#d4d4d4]"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-10 items-center gap-2 border-b border-[#2d2d2d] bg-[#181818] px-2">
          <select
            className="h-8 min-w-[190px] rounded border border-[#3a3a3a] bg-[#252526] px-2 text-xs text-[#d4d4d4] outline-none"
            value={selectedProjectSlug}
            onChange={(event) => {
              const nextSlug = event.target.value
              setSelectedProjectSlug(nextSlug)
              void loadProject(nextSlug)
            }}
            disabled={isBootstrapping}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.slug}>
                {project.name} ({project.slug})
              </option>
            ))}
          </select>

          <Input
            value={projectNameInput}
            onChange={(event) => {
              const value = event.target.value
              setProjectNameInput(value)
              if (!projectSlugInput) {
                setProjectSlugInput(asSlug(value))
              }
            }}
            placeholder="Project name"
            className="h-8 w-36 border-[#3a3a3a] bg-[#252526] text-xs text-[#d4d4d4]"
          />

          <Input
            value={projectSlugInput}
            onChange={(event) =>
              setProjectSlugInput(asSlug(event.target.value))
            }
            placeholder="project-slug"
            className="h-8 w-36 border-[#3a3a3a] bg-[#252526] text-xs text-[#d4d4d4]"
          />

          <Button
            type="button"
            className="h-8 bg-[#2d2d2d] px-3 text-xs text-[#d4d4d4] hover:bg-[#3a3a3a]"
            onClick={() => void handleCreateProject()}
          >
            <Plus className="me-1 h-3.5 w-3.5" />
            New Project
          </Button>

          <div className="ms-auto flex items-center gap-2">
            <span className="text-[11px] text-[#9da5b4]">Entry</span>
            <Input
              value={entryPathInput}
              onChange={(event) =>
                setEntryPathInput(normalizeWorkspacePath(event.target.value))
              }
              className="h-8 w-56 border-[#3a3a3a] bg-[#252526] text-xs text-[#d4d4d4]"
            />

            <select
              className="h-8 min-w-[120px] rounded border border-[#3a3a3a] bg-[#252526] px-2 text-xs text-[#d4d4d4] outline-none"
              value={selectedVersion ?? ''}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (Number.isFinite(value) && value > 0) {
                  void handleCheckoutVersion(value)
                }
              }}
            >
              <option value="">Latest</option>
              {versions.map((version) => (
                <option key={version.id} value={version.version}>
                  v{version.version}
                </option>
              ))}
            </select>

            <Button
              type="button"
              className="h-8 bg-[#0e639c] px-3 text-xs text-white hover:bg-[#1177bb]"
              onClick={() => void handleSave()}
              disabled={isSaving || isLoading || isBootstrapping}
            >
              <Save className="me-1 h-3.5 w-3.5" />
              {isSaving
                ? 'Saving...'
                : isDirty
                  ? 'Save Changes'
                  : 'Save Version'}
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="flex w-12 flex-col items-center border-r border-[#2d2d2d] bg-[#333333] py-2">
            <button
              type="button"
              className={cn(
                'mb-1 flex h-9 w-9 items-center justify-center rounded text-[#c5c5c5] hover:bg-[#454545]',
                isExplorerOpen && 'bg-[#4c4c4c] text-white'
              )}
              onClick={() => setIsExplorerOpen((prev) => !prev)}
              title="Explorer"
            >
              {isExplorerOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              className={cn(
                'mb-1 flex h-9 w-9 items-center justify-center rounded text-[#c5c5c5] hover:bg-[#454545]',
                isConsoleOpen && 'bg-[#4c4c4c] text-white'
              )}
              onClick={() => setIsConsoleOpen((prev) => !prev)}
              title="Console"
            >
              <TerminalSquare className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={cn(
                'mb-1 flex h-9 w-9 items-center justify-center rounded text-[#c5c5c5] hover:bg-[#454545]',
                isEndpointsOpen && 'bg-[#4c4c4c] text-white'
              )}
              onClick={toggleEndpointsPanel}
              title="API Endpoints"
            >
              <FileJson className="h-4 w-4" />
            </button>
          </aside>

          {isExplorerOpen ? (
            <aside className="flex min-h-0 w-72 flex-col border-r border-[#2d2d2d] bg-[#252526]">
              <div className="flex h-9 items-center justify-between border-b border-[#2d2d2d] px-2">
                <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-[#cccccc]">
                  <Files className="h-3.5 w-3.5" />
                  Explorer
                </div>
                <button
                  type="button"
                  className="rounded p-1 text-[#bdbdbd] hover:bg-[#2f2f2f] hover:text-white"
                  onClick={() => {
                    const defaultPath = activePath
                      ? `${dirnamePath(activePath)}/new-file.ts`
                      : '/new-file.ts'
                    const next = window.prompt(
                      'New file path',
                      normalizeWorkspacePath(defaultPath)
                    )
                    if (next) {
                      createFileAtPath(next)
                    }
                  }}
                  title="New file"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 border-b border-[#2d2d2d] p-2">
                <Input
                  value={newFileInput}
                  onChange={(event) => setNewFileInput(event.target.value)}
                  placeholder="/api/service.ts"
                  className="h-7 border-[#3a3a3a] bg-[#1f1f1f] text-xs text-[#d4d4d4]"
                />
                <Button
                  type="button"
                  className="h-7 bg-[#2d2d2d] px-2 text-xs text-[#d4d4d4] hover:bg-[#3a3a3a]"
                  onClick={handleCreateFile}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-2 border-b border-[#2d2d2d] px-2 py-1">
                <Button
                  type="button"
                  className="h-7 flex-1 bg-[#2d2d2d] px-2 text-xs text-[#d4d4d4] hover:bg-[#3a3a3a]"
                  onClick={handleRenameFile}
                  disabled={!activePath}
                >
                  <Pencil className="me-1 h-3 w-3" />
                  Rename
                </Button>
                <Button
                  type="button"
                  className="h-7 flex-1 bg-[#2d2d2d] px-2 text-xs text-[#d4d4d4] hover:bg-[#3a3a3a]"
                  onClick={handleDeleteFile}
                  disabled={!activePath}
                >
                  <Trash2 className="me-1 h-3 w-3" />
                  Delete
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-auto py-1">
                {renderTree(fileTree)}
              </div>
            </aside>
          ) : null}

          <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#1e1e1e]">
            <div className="flex h-9 items-center gap-1 overflow-x-auto border-b border-[#2d2d2d] bg-[#2d2d2d] px-2">
              {!hasOpenTabs ? (
                <span className="px-2 text-xs text-[#9da5b4]">
                  No open tabs
                </span>
              ) : null}
              {tabs.map((tabPath) => {
                const active = tabPath === activePath
                const dirty = Boolean(dirtyPaths[tabPath])
                const fileName =
                  tabPath.split('/').filter(Boolean).pop() ?? tabPath
                const Icon = pickFileIcon(tabPath)

                return (
                  <div
                    key={tabPath}
                    className={cn(
                      'group flex h-7 items-center gap-2 rounded border border-transparent px-2 text-xs',
                      active
                        ? 'border-[#3f3f46] bg-[#1e1e1e] text-white'
                        : 'bg-[#2d2d2d] text-[#cccccc] hover:bg-[#383838]'
                    )}
                  >
                    <button
                      type="button"
                      className="flex max-w-[180px] items-center gap-1.5 truncate"
                      onClick={() => openFile(tabPath)}
                      onContextMenu={(event) =>
                        openFileContextMenu(event, tabPath, 'file')
                      }
                    >
                      <Icon className="h-3.5 w-3.5 text-[#8ac6f2]" />
                      <span className="truncate">{fileName}</span>
                    </button>
                    {dirty ? (
                      <span className="text-[10px] text-[#e2c08d]">●</span>
                    ) : null}
                    <button
                      type="button"
                      className="rounded p-0.5 text-[#9da5b4] opacity-70 hover:bg-[#444] hover:text-white hover:opacity-100"
                      onClick={() => {
                        const nextTabs = tabs.filter(
                          (candidate) => candidate !== tabPath
                        )
                        setTabs(nextTabs)

                        if (activePath === tabPath) {
                          const nextActive =
                            nextTabs[nextTabs.length - 1] ?? null
                          setActivePath(nextActive)
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 transition-[bottom] duration-200"
                style={{
                  bottom: isConsoleOpen ? `${CONSOLE_HEIGHT}px` : '0px',
                }}
              >
                {isEndpointsOpen ? (
                  <div className="h-full w-full overflow-auto px-4 py-4">
                    <div className="mx-auto flex max-w-5xl flex-col gap-4">
                      <div className="rounded border border-[#2d2d2d] bg-[#1a1a1a] p-4">
                        <p className="text-sm font-semibold text-[#e5e5e5]">
                          API Endpoints
                        </p>
                        <p className="mt-2 text-xs text-[#9da5b4]">
                          Use the active project slug and a saved version when
                          running code from the database.
                        </p>
                        <div className="mt-3 grid gap-2 text-xs text-[#d4d4d4]">
                          <p>
                            Project slug:{' '}
                            <code className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[#c9d1d9]">
                              {selectedProjectSlug || DEFAULT_WORKSPACE_SLUG}
                            </code>
                          </p>
                          <p>
                            Selected version:{' '}
                            <code className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[#c9d1d9]">
                              {activeVersionForExamples}
                            </code>
                          </p>
                        </div>
                      </div>

                      <div className="rounded border border-[#2d2d2d] bg-[#1a1a1a] p-4">
                        <p className="text-xs font-semibold tracking-wide text-[#9da5b4] uppercase">
                          Endpoints
                        </p>
                        <ul className="mt-3 space-y-2 text-xs text-[#d4d4d4]">
                          <li>
                            <code className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[#c9d1d9]">
                              GET {endpointBasePath}
                            </code>{' '}
                            Load workspace and latest version.
                          </li>
                          <li>
                            <code className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[#c9d1d9]">
                              GET {endpointVersionsPath}
                            </code>{' '}
                            List saved versions.
                          </li>
                          <li>
                            <code className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[#c9d1d9]">
                              GET {endpointVersionPath}
                            </code>{' '}
                            Fetch one version snapshot.
                          </li>
                          <li>
                            <code className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[#c9d1d9]">
                              POST {endpointBundlePath}
                            </code>{' '}
                            Store a compiled bundle for an entry file.
                          </li>
                          <li>
                            <code className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[#c9d1d9]">
                              POST {endpointRunPath}
                            </code>{' '}
                            Execute stored bundle by entry path.
                          </li>
                        </ul>
                      </div>

                      <div className="rounded border border-[#2d2d2d] bg-[#1a1a1a] p-4">
                        <p className="text-xs font-semibold tracking-wide text-[#9da5b4] uppercase">
                          Run Request Example
                        </p>
                        <p className="mt-2 text-xs text-[#9da5b4]">
                          If you get <code>Workspace not found</code>, confirm
                          the slug in the URL matches the selected project.
                        </p>
                        <pre className="mt-3 overflow-x-auto rounded border border-[#2d2d2d] bg-[#111111] p-3 font-mono text-[11px] leading-5 text-[#d7e3f4]">
                          {runCurlExample}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-full w-full">
                    <div ref={containerRef} className="h-full w-full" />
                    {!hasOpenTabs ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] px-5">
                        <div className="w-full max-w-xl rounded border border-[#2d2d2d] bg-[#1a1a1a] p-5 text-center">
                          <p className="text-sm font-semibold text-[#e5e5e5]">
                            No open editors
                          </p>
                          <p className="mt-2 text-xs text-[#9da5b4]">
                            Open a file from Explorer or reopen the current
                            entry file to continue coding.
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              className="h-8 bg-[#0e639c] px-3 text-xs text-white hover:bg-[#1177bb]"
                              onClick={openEntryFile}
                            >
                              Open Entry File
                            </Button>
                            <Button
                              type="button"
                              className="h-8 bg-[#2d2d2d] px-3 text-xs text-[#d4d4d4] hover:bg-[#3a3a3a]"
                              onClick={() => setIsEndpointsOpen(true)}
                            >
                              Show API Endpoints
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div
                className={cn(
                  'absolute inset-x-0 bottom-0 border-t border-[#2d2d2d] bg-[#181818] transition-transform duration-200',
                  isConsoleOpen
                    ? 'translate-y-0'
                    : 'pointer-events-none translate-y-full'
                )}
                style={{ height: `${CONSOLE_HEIGHT}px` }}
              >
                <div className="flex h-8 items-center justify-between border-b border-[#2d2d2d] px-3">
                  <p className="text-xs text-[#cccccc]">Console</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#9da5b4]">
                    <span>Project: {selectedProject?.slug ?? '-'}</span>
                    <span>Version: {selectedVersion ?? 'latest'}</span>
                  </div>
                </div>
                <div className="h-[calc(100%-32px)] overflow-auto px-3 py-2">
                  {logs.length === 0 ? (
                    <p className="text-xs text-[#9da5b4]">No logs yet</p>
                  ) : (
                    logs.map((entry) => (
                      <p
                        key={entry.id}
                        className={cn(
                          'font-mono text-[1rem]',
                          logLevelClass(entry.level)
                        )}
                      >
                        {entry.message}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex h-7 items-center justify-between bg-[#007acc] px-2 text-[11px] text-white">
              <div className="flex items-center gap-3">
                <span>{selectedProject?.name ?? 'No Project'}</span>
                <span>{activePathLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded px-1.5 hover:bg-[#0b86d4]"
                  onClick={() => setIsConsoleOpen((prev) => !prev)}
                >
                  {isConsoleOpen ? 'Hide Console' : 'Show Console'}
                </button>
                <span>{isDirty ? 'Unsaved changes' : 'Saved'}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {fileContextMenu ? (
        <div
          className="fixed z-50 min-w-[170px] rounded border border-[#454545] bg-[#252526] py-1 shadow-2xl"
          style={{ left: fileContextMenu.x, top: fileContextMenu.y }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#d4d4d4] hover:bg-[#094771]"
            onClick={() => {
              const basePath =
                fileContextMenu.nodeType === 'folder'
                  ? fileContextMenu.path
                  : dirnamePath(fileContextMenu.path)

              const suggested = normalizeWorkspacePath(
                `${basePath}/new-file.ts`
              )
              const next = window.prompt('New file path', suggested)
              if (next) {
                createFileAtPath(next)
              }
              setFileContextMenu(null)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New File
          </button>

          {fileContextMenu.nodeType === 'file' ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#d4d4d4] hover:bg-[#094771]"
              onClick={() => {
                renameFilePath(fileContextMenu.path)
                setFileContextMenu(null)
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Rename
            </button>
          ) : null}

          {fileContextMenu.nodeType === 'file' ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#d4d4d4] hover:bg-[#094771]"
              onClick={() => {
                deleteFilePath(fileContextMenu.path)
                setFileContextMenu(null)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="absolute inset-x-0 bottom-0 border-t border-[#2d2d2d] bg-[#111111cc] px-3 py-1.5 text-xs text-[#d4d4d4]">
          Loading project data from remote...
        </div>
      ) : null}
    </div>
  )
}
