'use client'

import { loader } from '@monaco-editor/react'
import {
  Activity,
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
  History,
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeEditorJobPanel } from '@/components/code-jobs/CodeEditorJobPanel'
import { CodeSnippet } from '@/components/code-snippet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type ThemeMode,
  useTheme,
} from '@/components/providers/ThemeProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  buildWorkspaceBundle,
  createCodeWorkspace,
  fetchWorkspace,
  fetchWorkspaceVersionSnapshot,
  fetchWorkspaceVersions,
  listCodeWorkspaces,
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

type ActivityPanel = 'explorer' | 'versions' | 'jobs' | 'console' | 'endpoints'
type EditorThemeName =
  | 'iran-dashboard-editor-light'
  | 'iran-dashboard-editor-dark'
  | 'iran-dashboard-editor-wood'

const MAX_LOG_LINES = 80
const DEFAULT_WORKSPACE_SLUG = 'process'

const KNOWN_IMPORT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mdx',
]
const IMPORT_DIAGNOSTIC_CODES_TO_IGNORE = [2307, 7016]

let monacoWorkersConfigured = false

function configureMonacoWorkers() {
  if (monacoWorkersConfigured || typeof window === 'undefined') return
    ; (
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
    diagnosticCodesToIgnore: IMPORT_DIAGNOSTIC_CODES_TO_IGNORE,
  })

  m.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    onlyVisible: false,
    diagnosticCodesToIgnore: IMPORT_DIAGNOSTIC_CODES_TO_IGNORE,
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

  m.editor.defineTheme('iran-dashboard-editor-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'dbe4f0', background: '111827' },
      { token: 'comment', foreground: '7f8ea8' },
      { token: 'keyword', foreground: '7cc2ff' },
      { token: 'string', foreground: '8fd3ff' },
      { token: 'number', foreground: 'a5d8ff' },
      { token: 'type.identifier', foreground: 'a0c8ff' },
      { token: 'identifier', foreground: 'd9ecff' },
    ],
    colors: {
      'editor.background': '#111827',
      'editor.foreground': '#dbe4f0',
      'editorLineNumber.foreground': '#5f7592',
      'editorLineNumber.activeForeground': '#c8daef',
      'editorCursor.foreground': '#7cc2ff',
      'editor.selectionBackground': '#1e3a5f',
      'editor.inactiveSelectionBackground': '#162235',
      'editor.lineHighlightBackground': '#172033',
      'editorIndentGuide.background1': '#24324a',
      'editorIndentGuide.activeBackground1': '#5a7aa5',
      'editorWidget.background': '#172033',
      'editorSuggestWidget.background': '#172033',
      'editorSuggestWidget.border': '#2a3950',
      'editorSuggestWidget.foreground': '#dbe4f0',
      'editorSuggestWidget.selectedBackground': '#23456e',
      'editorHoverWidget.background': '#172033',
      'editorHoverWidget.border': '#2a3950',
      'editorGutter.background': '#111827',
      'editorBracketMatch.background': '#23456e',
      'editorBracketMatch.border': '#7cc2ff',
      'editor.findMatchBackground': '#2a5f99',
      'editor.findMatchHighlightBackground': '#23456e',
    },
  })

  m.editor.defineTheme('iran-dashboard-editor-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: '18181b', background: 'ffffff' },
      { token: 'comment', foreground: '71717a' },
      { token: 'keyword', foreground: '2563eb' },
      { token: 'string', foreground: '047857' },
      { token: 'number', foreground: 'a16207' },
      { token: 'type.identifier', foreground: '7c3aed' },
      { token: 'identifier', foreground: '0f172a' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#18181b',
      'editorLineNumber.foreground': '#a1a1aa',
      'editorLineNumber.activeForeground': '#3f3f46',
      'editorCursor.foreground': '#2563eb',
      'editor.selectionBackground': '#bfdbfe',
      'editor.inactiveSelectionBackground': '#e4e4e7',
      'editor.lineHighlightBackground': '#f4f4f5',
      'editorIndentGuide.background1': '#e4e4e7',
      'editorIndentGuide.activeBackground1': '#a1a1aa',
      'editorWidget.background': '#ffffff',
      'editorSuggestWidget.background': '#ffffff',
      'editorSuggestWidget.border': '#e4e4e7',
      'editorSuggestWidget.foreground': '#18181b',
      'editorSuggestWidget.selectedBackground': '#e0f2fe',
      'editorHoverWidget.background': '#ffffff',
      'editorHoverWidget.border': '#e4e4e7',
    },
  })

  m.editor.defineTheme('iran-dashboard-editor-wood', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: '33251a', background: 'fbf3e5' },
      { token: 'comment', foreground: '7c6a58' },
      { token: 'keyword', foreground: '8a4f25' },
      { token: 'string', foreground: '496c39' },
      { token: 'number', foreground: '9a5b1f' },
      { token: 'type.identifier', foreground: '76512c' },
      { token: 'identifier', foreground: '33251a' },
    ],
    colors: {
      'editor.background': '#fbf3e5',
      'editor.foreground': '#33251a',
      'editorLineNumber.foreground': '#9d8a73',
      'editorLineNumber.activeForeground': '#5f452f',
      'editorCursor.foreground': '#8a4f25',
      'editor.selectionBackground': '#ead2af',
      'editor.inactiveSelectionBackground': '#f0dfc4',
      'editor.lineHighlightBackground': '#f5ead8',
      'editorIndentGuide.background1': '#e2cda9',
      'editorIndentGuide.activeBackground1': '#b8966b',
      'editorWidget.background': '#fff8ee',
      'editorSuggestWidget.background': '#fff8ee',
      'editorSuggestWidget.border': '#e2cda9',
      'editorSuggestWidget.foreground': '#33251a',
      'editorSuggestWidget.selectedBackground': '#f0dfc4',
      'editorHoverWidget.background': '#fff8ee',
      'editorHoverWidget.border': '#e2cda9',
    },
  })
}

function getMonacoThemeName(
  theme: ThemeMode,
  resolvedTheme: 'light' | 'dark'
): EditorThemeName {
  if (theme === 'wood') return 'iran-dashboard-editor-wood'
  return resolvedTheme === 'dark'
    ? 'iran-dashboard-editor-dark'
    : 'iran-dashboard-editor-light'
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

function basenamePath(path: string) {
  const normalized = normalizeWorkspacePath(path)
  const parts = normalized.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? ''
}

function replacePathPrefix(
  path: string,
  sourcePath: string,
  targetPath: string
) {
  const normalizedPath = normalizeWorkspacePath(path)
  const normalizedSource = normalizeWorkspacePath(sourcePath)
  const normalizedTarget = normalizeWorkspacePath(targetPath)

  if (normalizedPath === normalizedSource) {
    return normalizedTarget
  }

  const sourcePrefix = `${normalizedSource}/`
  if (!normalizedPath.startsWith(sourcePrefix)) {
    return normalizedPath
  }

  return normalizeWorkspacePath(
    `${normalizedTarget}${normalizedPath.slice(normalizedSource.length)}`
  )
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

function stripImportPathPrefix(path: string) {
  return path.replace(/^(\.\.\/|\.\/|\/)+/, '')
}

function matchesImportCandidate(candidate: string, typedPath: string) {
  if (!typedPath) return true
  if (candidate.startsWith(typedPath)) return true

  const typedSansPrefix = stripImportPathPrefix(typedPath)
  if (!typedSansPrefix) return true

  const candidateSansPrefix = stripImportPathPrefix(candidate)
  return candidateSansPrefix.startsWith(typedSansPrefix)
}

export default function CodeEditor({
  workspaceSlug = DEFAULT_WORKSPACE_SLUG,
}: {
  workspaceSlug?: string
}) {
  const { theme, resolvedTheme } = useTheme()
  const monacoThemeName = useMemo(
    () => getMonacoThemeName(theme, resolvedTheme),
    [resolvedTheme, theme]
  )
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
  const [activeActivityPanel, setActiveActivityPanel] =
    useState<ActivityPanel>('explorer')
  const [fileContextMenu, setFileContextMenu] =
    useState<FileContextMenuState | null>(null)
  const [projectNameInput, setProjectNameInput] = useState('')
  const [projectSlugInput, setProjectSlugInput] = useState('')
  const [newFileInput, setNewFileInput] = useState('')
  const [publishEnabled, setPublishEnabled] = useState(false)
  const [publishMessage, setPublishMessage] = useState('')
  const [publishDescription, setPublishDescription] = useState('')
  const [collapsedFolders, setCollapsedFolders] = useState<
    Record<string, boolean>
  >({})
  const [draggedFilePath, setDraggedFilePath] = useState<string | null>(null)
  const [dropFolderPath, setDropFolderPath] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const fileContextMenuRef = useRef<HTMLDivElement | null>(null)
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
  const viewStateByPathRef = useRef<
    Map<string, monacoEditor.editor.ICodeEditorViewState | null>
  >(new Map())
  const snapshotRef = useRef(snapshot)
  const activePathRef = useRef(activePath)
  const selectedProjectSlugRef = useRef(selectedProjectSlug)
  const loadingNonceRef = useRef(0)
  const hasAppliedInitialLayoutRef = useRef(false)
  const hasBootstrappedRef = useRef(false)

  const isDirty = useMemo(
    () => Object.keys(dirtyPaths).length > 0,
    [dirtyPaths]
  )
  const isExplorerOpen = activeActivityPanel === 'explorer'
  const isEndpointsOpen = activeActivityPanel === 'endpoints'

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
    if (editorRef.current || !containerRef.current || !isExplorerOpen) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return
    if (rect.width < 2 || rect.height < 2) return

    editorRef.current = monaco.editor.create(container, {
      theme: monacoThemeName,
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
      stopRenderingLineAfter: 2000,
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
  }, [ensureModel, isExplorerOpen, monacoThemeName])

  useEffect(() => {
    monacoRef.current?.editor.setTheme(monacoThemeName)
  }, [monacoThemeName])

  useEffect(() => {
    if (!isExplorerOpen || !editorRef.current) return

    const frameId = window.requestAnimationFrame(() => {
      editorRef.current?.layout()
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [isExplorerOpen])

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
      setActiveActivityPanel('explorer')
      addLog('success', `Added file ${normalizedPath}`)

      return true
    },
    [addLog]
  )

  const createFolderAtPath = useCallback(
    (rawPath: string) => {
      const normalizedPath = normalizeWorkspacePath(rawPath)
      if (normalizedPath === '/') {
        addLog('error', 'Invalid folder path')
        return false
      }

      const folderPrefix = `${normalizedPath}/`
      if (
        snapshotRef.current.files.some((file) =>
          file.path.startsWith(folderPrefix)
        )
      ) {
        addLog('error', `Folder already exists: ${normalizedPath}`)
        return false
      }

      const starterFilePath = normalizeWorkspacePath(
        `${normalizedPath}/index.ts`
      )
      const created = createFileAtPath(starterFilePath)
      if (!created) {
        return false
      }

      setCollapsedFolders((prev) => ({
        ...prev,
        [normalizedPath]: false,
      }))
      addLog('success', `Added folder ${normalizedPath}`)
      return true
    },
    [addLog, createFileAtPath]
  )

  const promptCreateFileAtBasePath = useCallback(
    (basePath: string) => {
      const suggested = normalizeWorkspacePath(`${basePath}/new-file.ts`)
      const next = window.prompt('New file path', suggested)
      if (next) {
        createFileAtPath(next)
      }
    },
    [createFileAtPath]
  )

  const promptCreateFolderAtBasePath = useCallback(
    (basePath: string) => {
      const suggested = normalizeWorkspacePath(`${basePath}/new-folder`)
      const next = window.prompt('New folder path', suggested)
      if (!next) return
      createFolderAtPath(next)
    },
    [createFolderAtPath]
  )

  const moveFilePath = useCallback(
    (sourcePath: string, targetPathRaw: string, actionLabel = 'Moved') => {
      const normalizedSource = normalizeWorkspacePath(sourcePath)
      const normalizedTarget = normalizeWorkspacePath(targetPathRaw)
      if (normalizedTarget === normalizedSource) return false

      const sourceExists = snapshotRef.current.files.some(
        (file) => file.path === normalizedSource
      )
      if (!sourceExists) {
        addLog('error', `File not found: ${normalizedSource}`)
        return false
      }

      if (
        snapshotRef.current.files.some((file) => file.path === normalizedTarget)
      ) {
        addLog('error', `Target path already exists: ${normalizedTarget}`)
        return false
      }

      const nextSnapshot = renameFile(
        snapshotRef.current,
        normalizedSource,
        normalizedTarget
      )
      setSnapshot(nextSnapshot)
      snapshotRef.current = nextSnapshot

      const savedValue = savedContentsRef.current[normalizedSource]
      if (typeof savedValue === 'string') {
        savedContentsRef.current[normalizedTarget] = savedValue
        delete savedContentsRef.current[normalizedSource]
      }

      const model = modelsRef.current.get(normalizedSource)
      if (model) {
        const content = model.getValue()
        removeModel(normalizedSource)
        ensureModel(normalizedTarget, content)
      }

      setTabs((prev) =>
        prev.map((path) =>
          path === normalizedSource ? normalizedTarget : path
        )
      )
      setActivePath((prev) =>
        prev === normalizedSource ? normalizedTarget : prev
      )
      setDirtyPaths((prev) => {
        const next = { ...prev }
        if (next[normalizedSource]) {
          delete next[normalizedSource]
          next[normalizedTarget] = true
        }
        return next
      })

      addLog(
        'success',
        `${actionLabel} ${normalizedSource} -> ${normalizedTarget}`
      )
      return true
    },
    [addLog, ensureModel, removeModel]
  )

  const moveFileToFolder = useCallback(
    (sourcePath: string, targetFolderPath: string) => {
      const normalizedSource = normalizeWorkspacePath(sourcePath)
      const normalizedTargetFolder = normalizeWorkspacePath(targetFolderPath)
      const fileName = basenamePath(normalizedSource)
      if (!fileName) {
        addLog('error', `Invalid file path: ${normalizedSource}`)
        return false
      }

      const targetPath = normalizeWorkspacePath(
        `${normalizedTargetFolder}/${fileName}`
      )
      return moveFilePath(normalizedSource, targetPath, 'Moved')
    },
    [addLog, moveFilePath]
  )

  const renameFilePath = useCallback(
    (sourcePath: string) => {
      const nextPathRaw = window.prompt('Rename file path', sourcePath)
      if (!nextPathRaw) return

      const nextPath = normalizeWorkspacePath(nextPathRaw)
      moveFilePath(sourcePath, nextPath, 'Renamed')
    },
    [moveFilePath]
  )

  const handleFileDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>, path: string) => {
      const normalizedPath = normalizeWorkspacePath(path)
      setDraggedFilePath(normalizedPath)
      setDropFolderPath(null)
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', normalizedPath)
    },
    []
  )

  const handleFileDragEnd = useCallback(() => {
    setDraggedFilePath(null)
    setDropFolderPath(null)
  }, [])

  const handleFolderDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>, targetFolderPath: string) => {
      if (!draggedFilePath) return
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'move'
      setDropFolderPath(normalizeWorkspacePath(targetFolderPath))
    },
    [draggedFilePath]
  )

  const handleFolderDrop = useCallback(
    (event: React.DragEvent<HTMLElement>, targetFolderPath: string) => {
      event.preventDefault()
      event.stopPropagation()
      const sourcePath =
        draggedFilePath || event.dataTransfer.getData('text/plain')
      if (!sourcePath) {
        setDropFolderPath(null)
        return
      }

      moveFileToFolder(sourcePath, targetFolderPath)
      setDraggedFilePath(null)
      setDropFolderPath(null)
    },
    [draggedFilePath, moveFileToFolder]
  )

  const handleExplorerDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!draggedFilePath) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setDropFolderPath('/')
    },
    [draggedFilePath]
  )

  const handleExplorerDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const sourcePath =
        draggedFilePath || event.dataTransfer.getData('text/plain')
      if (!sourcePath) {
        setDropFolderPath(null)
        return
      }

      moveFileToFolder(sourcePath, '/')
      setDraggedFilePath(null)
      setDropFolderPath(null)
    },
    [draggedFilePath, moveFileToFolder]
  )

  const handleFileRowDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>, targetPath: string) => {
      if (!draggedFilePath) return
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'move'
      setDropFolderPath(dirnamePath(targetPath))
    },
    [draggedFilePath]
  )

  const handleFileRowDrop = useCallback(
    (event: React.DragEvent<HTMLElement>, targetPath: string) => {
      event.preventDefault()
      event.stopPropagation()
      const sourcePath =
        draggedFilePath || event.dataTransfer.getData('text/plain')
      if (!sourcePath) {
        setDropFolderPath(null)
        return
      }

      moveFileToFolder(sourcePath, dirnamePath(targetPath))
      setDraggedFilePath(null)
      setDropFolderPath(null)
    },
    [draggedFilePath, moveFileToFolder]
  )

  const renameFolderPath = useCallback(
    (sourcePath: string) => {
      const normalizedSource = normalizeWorkspacePath(sourcePath)
      const sourcePrefix = `${normalizedSource}/`
      const sourceFiles = snapshotRef.current.files.filter((file) =>
        file.path.startsWith(sourcePrefix)
      )

      if (sourceFiles.length === 0) {
        addLog('error', `Folder not found: ${normalizedSource}`)
        return
      }

      const nextPathRaw = window.prompt('Rename folder path', normalizedSource)
      if (!nextPathRaw) return

      const normalizedTarget = normalizeWorkspacePath(nextPathRaw)
      if (normalizedTarget === normalizedSource) return

      if (normalizedTarget === '/') {
        addLog('error', 'Invalid folder path')
        return
      }

      if (normalizedTarget.startsWith(sourcePrefix)) {
        addLog('error', 'Target folder cannot be inside source folder')
        return
      }

      const outsidePaths = new Set(
        snapshotRef.current.files
          .filter((file) => !file.path.startsWith(sourcePrefix))
          .map((file) => file.path)
      )

      const pathMap = new Map<string, string>()
      for (const file of sourceFiles) {
        const targetPath = replacePathPrefix(
          file.path,
          normalizedSource,
          normalizedTarget
        )

        if (outsidePaths.has(targetPath)) {
          addLog('error', `Target path already exists: ${targetPath}`)
          return
        }

        if (pathMap.has(targetPath)) {
          addLog('error', `Invalid rename target: ${targetPath}`)
          return
        }

        pathMap.set(file.path, targetPath)
      }

      let nextSnapshot = snapshotRef.current
      for (const [fromPath, toPath] of pathMap.entries()) {
        nextSnapshot = renameFile(nextSnapshot, fromPath, toPath)
      }

      setSnapshot(nextSnapshot)
      snapshotRef.current = nextSnapshot

      for (const [fromPath, toPath] of pathMap.entries()) {
        const savedValue = savedContentsRef.current[fromPath]
        if (typeof savedValue === 'string') {
          savedContentsRef.current[toPath] = savedValue
          delete savedContentsRef.current[fromPath]
        }

        const model = modelsRef.current.get(fromPath)
        if (model) {
          const content = model.getValue()
          removeModel(fromPath)
          ensureModel(toPath, content)
        }
      }

      setTabs((prev) =>
        prev.map((path) =>
          replacePathPrefix(path, normalizedSource, normalizedTarget)
        )
      )
      setActivePath((prev) =>
        prev
          ? replacePathPrefix(prev, normalizedSource, normalizedTarget)
          : prev
      )
      setDirtyPaths((prev) => {
        const next: Record<string, boolean> = {}
        for (const [path, dirty] of Object.entries(prev)) {
          if (!dirty) continue
          next[replacePathPrefix(path, normalizedSource, normalizedTarget)] =
            true
        }
        return next
      })
      setCollapsedFolders((prev) => {
        const next: Record<string, boolean> = {}
        for (const [path, collapsed] of Object.entries(prev)) {
          next[replacePathPrefix(path, normalizedSource, normalizedTarget)] =
            collapsed
        }
        return next
      })

      addLog(
        'success',
        `Renamed folder ${normalizedSource} -> ${normalizedTarget}`
      )
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

  const deleteFolderPath = useCallback(
    (targetPath: string) => {
      const normalizedPath = normalizeWorkspacePath(targetPath)
      const folderPrefix = `${normalizedPath}/`
      const filesToDelete = snapshotRef.current.files
        .filter((file) => file.path.startsWith(folderPrefix))
        .map((file) => file.path)

      if (filesToDelete.length === 0) {
        addLog('error', `Folder not found: ${normalizedPath}`)
        return
      }

      const confirmed = window.confirm(
        `Delete folder ${normalizedPath} and ${filesToDelete.length} file(s)?`
      )
      if (!confirmed) return

      let nextSnapshot = snapshotRef.current
      for (const filePath of filesToDelete) {
        nextSnapshot = removeFile(nextSnapshot, filePath)
      }

      setSnapshot(nextSnapshot)
      snapshotRef.current = nextSnapshot

      for (const filePath of filesToDelete) {
        delete savedContentsRef.current[filePath]
        removeModel(filePath)
      }

      setDirtyPaths((prev) => {
        const next = { ...prev }
        for (const path of Object.keys(next)) {
          if (path.startsWith(folderPrefix)) {
            delete next[path]
          }
        }
        return next
      })

      const nextTabs = tabs.filter((path) => !path.startsWith(folderPrefix))
      const nextActivePath =
        activePathRef.current && !activePathRef.current.startsWith(folderPrefix)
          ? activePathRef.current
          : (nextTabs[nextTabs.length - 1] ?? null)
      setTabs(nextTabs)
      setActivePath(nextActivePath)
      setCollapsedFolders((prev) => {
        const next: Record<string, boolean> = {}
        for (const [path, collapsed] of Object.entries(prev)) {
          if (path === normalizedPath || path.startsWith(folderPrefix)) {
            continue
          }
          next[path] = collapsed
        }
        return next
      })

      addLog('success', `Deleted folder ${normalizedPath}`)
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
        setActiveActivityPanel('explorer')
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
      setActiveActivityPanel('explorer')
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

      if (!hasAppliedInitialLayoutRef.current) {
        hasAppliedInitialLayoutRef.current = true
        const initialTab = normalizedEntry
        setTabs([initialTab])
        setActivePath(initialTab)
        setActiveActivityPanel('explorer')
        return
      }

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

  const persistCurrentSnapshot = useCallback(async (saveMode: 'draft' | 'publish') => {
    const slug = selectedProjectSlugRef.current
    if (!slug || !snapshotRef.current) return

    const isPublish = saveMode === 'publish'
    const trimmedMessage = publishMessage.trim()
    const trimmedDescription = publishDescription.trim()

    if (isPublish && !trimmedMessage) {
      setActiveActivityPanel('versions')
      addLog('error', 'Commit message is required to publish a version')
      return
    }

    const snapshotForSave = hydrateSnapshotFromModels(snapshotRef.current)
    snapshotRef.current = snapshotForSave
    setSnapshot(snapshotForSave)

    setIsSaving(true)
    try {
      const saved = await saveWorkspaceVersion({
        slug,
        snapshot: snapshotForSave,
        saveMode,
        targetVersion: isPublish ? undefined : (selectedVersion ?? undefined),
        message: isPublish ? trimmedMessage : undefined,
        description: isPublish ? trimmedDescription : undefined,
        clientRequestId: isPublish ? crypto.randomUUID() : undefined,
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

        const buildResponse = await buildWorkspaceBundle({
          slug,
          version: saved.version,
          entryPath: buildTarget,
          files: snapshotToFileMap(snapshotForSave),
        })

        if (buildResponse.ok) {
          for (const warning of buildResponse.warnings) {
            addLog('info', warning)
          }

          addLog(
            'success',
            `${isPublish ? 'Published' : 'Updated'} v${saved.version} with bundle for ${buildResponse.entryPath}`
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
          `${isPublish ? 'Published' : 'Updated'} v${saved.version} (no TypeScript entry found to bundle)`
        )
      }

      savedContentsRef.current = Object.fromEntries(
        snapshotForSave.files.map((file) => [file.path, file.content])
      )
      setDirtyPaths({})

      const versionsPayload = await fetchWorkspaceVersions(slug)
      setVersions(versionsPayload.versions)
      setSelectedVersion(saved.version)
      setProjects((prev) =>
        prev.map((project) =>
          project.slug === slug
            ? {
              ...project,
              currentVersion:
                isPublish || project.currentVersion === 0
                  ? saved.version
                  : project.currentVersion,
            }
            : project
        )
      )
      if (isPublish) {
        setPublishEnabled(false)
        setPublishMessage('')
        setPublishDescription('')
      }
    } catch (error) {
      addLog('error', error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }, [
    addLog,
    hydrateSnapshotFromModels,
    publishDescription,
    publishMessage,
    selectedVersion,
  ])

  const handleSave = useCallback(async () => {
    await persistCurrentSnapshot('draft')
  }, [persistCurrentSnapshot])

  const handlePublish = useCallback(async () => {
    await persistCurrentSnapshot('publish')
  }, [persistCurrentSnapshot])

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

    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (
        target instanceof Node &&
        fileContextMenuRef.current?.contains(target)
      ) {
        return
      }

      setFileContextMenu(null)
    }
    const closeOnBlur = () => setFileContextMenu(null)

    window.addEventListener('pointerdown', closeOnPointerDown)
    window.addEventListener('blur', closeOnBlur)

    return () => {
      window.removeEventListener('pointerdown', closeOnPointerDown)
      window.removeEventListener('blur', closeOnBlur)
    }
  }, [fileContextMenu])

  useEffect(() => {
    configureMonacoWorkers()

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
              if (!matchesImportCandidate(candidate, context.typedPath))
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

      disposeModels()
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [disposeModels, ensureEditorInstance])

  useEffect(() => {
    ensureEditorInstance()
  }, [ensureEditorInstance, isExplorerOpen, tabs.length])

  useEffect(() => {
    if (hasBootstrappedRef.current) return
    hasBootstrappedRef.current = true
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

  const selectedVersionRecord = useMemo(
    () => versions.find((version) => version.version === selectedVersion) ?? null,
    [selectedVersion, versions]
  )

  const fileTree = useMemo(
    () => buildTree(snapshot.files.map((file) => file.path)),
    [snapshot.files]
  )

  const activeVersionForExamples =
    selectedVersion ?? selectedProject?.currentVersion ?? 1
  const endpointProjectSlug = selectedProjectSlug || DEFAULT_WORKSPACE_SLUG
  const runnerOrigin = 'http://localhost:3001'
  const endpointBasePath = `/api/process/code-workspaces/${endpointProjectSlug}`
  const endpointRunPath = `${endpointBasePath}/versions/${activeVersionForExamples}/run`
  const endpointBuildPath = `${endpointBasePath}/versions/${activeVersionForExamples}/build`
  const endpointVersionPath = `${endpointBasePath}/versions/${activeVersionForExamples}`
  const endpointVersionsPath = `${endpointBasePath}/versions?limit=50`
  const endpointEntryPath = normalizeWorkspacePath(
    entryPathInput || snapshot.entryPath || '/api/index.ts'
  )
  const runnerRunUrl = `${runnerOrigin}/run`
  const runnerBundleCode = [
    `export function main(data, ctx) {`,
    `  ctx.log('workspace: ${endpointProjectSlug}')`,
    `  return { ok: true, entryPath: '${endpointEntryPath}', data }`,
    `}`,
  ].join('\n')
  const runnerRunPayload = {
    jobId: `${endpointProjectSlug}-v${activeVersionForExamples}-main`,
    bundle: {
      name: endpointProjectSlug,
      version: String(activeVersionForExamples),
      code: runnerBundleCode,
    },
    functionName: 'main',
    data: {
      a: 1,
      b: 2,
    },
    permissions: 'none',
    timeoutMs: 5000,
    metadata: {
      workspaceSlug: endpointProjectSlug,
      entryPath: endpointEntryPath,
      source: 'process-code-editor',
    },
  }
  const runnerCodeRefPayload = {
    codeRef: {
      name: endpointProjectSlug,
      version: String(activeVersionForExamples),
    },
    functionName: 'main',
    data: {
      a: 1,
      b: 2,
    },
    permissions: 'none',
    timeoutMs: 5000,
  }
  const runPayloadExample = JSON.stringify(runnerRunPayload, null, 2)
  const codeRefPayloadExample = JSON.stringify(runnerCodeRefPayload, null, 2)
  const runCurlExample = [
    `curl -sS -X POST '${runnerRunUrl}' \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -d '${runPayloadExample}'`,
  ].join('\n')
  const endpointItems = [
    {
      method: 'GET',
      path: endpointBasePath,
      description: 'Load workspace metadata, latest snapshot, and versions.',
    },
    {
      method: 'GET',
      path: endpointVersionsPath,
      description: 'List saved versions for the active workspace.',
    },
    {
      method: 'GET',
      path: endpointVersionPath,
      description: 'Fetch the selected version snapshot.',
    },
    {
      method: 'POST',
      path: endpointBuildPath,
      description:
        'Build the workspace remotely and store the compiled ESM bundle.',
    },
    {
      method: 'POST',
      path: `${runnerOrigin}/run`,
      description:
        'Runner service endpoint from Swagger. Send exactly one of bundle or codeRef.',
    },
    {
      method: 'POST',
      path: endpointRunPath,
      description:
        'Dashboard proxy endpoint. The dashboard resolves the saved bundle before calling the runner.',
    },
  ]
  const runClientExamples = [
    {
      label: 'Fetch',
      description: 'Browser or Node 18+',
      language: 'javascript' as const,
      code: [
        `const payload = ${runPayloadExample.replace(/\n/g, '\n')}`,
        ``,
        `const response = await fetch('${runnerRunUrl}', {`,
        `  method: 'POST',`,
        `  headers: { 'Content-Type': 'application/json' },`,
        `  body: JSON.stringify(payload),`,
        `})`,
        ``,
        `const result = await response.json()`,
      ].join('\n'),
    },
    {
      label: 'Axios',
      description: 'Web or Node client',
      language: 'javascript' as const,
      code: [
        `import axios from 'axios'`,
        ``,
        `const payload = ${runPayloadExample.replace(/\n/g, '\n')}`,
        ``,
        `const { data } = await axios.post('${runnerRunUrl}', payload)`,
      ].join('\n'),
    },
    {
      label: 'curl',
      description: 'Terminal and CI scripts',
      language: 'bash' as const,
      code: runCurlExample,
    },
    {
      label: 'Postman',
      description: 'Import as raw curl',
      language: 'bash' as const,
      code: [
        `curl --location '${runnerRunUrl}' \\`,
        `  --header 'Content-Type: application/json' \\`,
        `  --data '${runPayloadExample}'`,
      ].join('\n'),
    },
    {
      label: '.NET',
      description: 'HttpClient',
      language: 'csharp' as const,
      code: [
        `using System.Net.Http.Json;`,
        ``,
        `var payload = new`,
        `{`,
        `    jobId = "${endpointProjectSlug}-v${activeVersionForExamples}-main",`,
        `    bundle = new`,
        `    {`,
        `        name = "${endpointProjectSlug}",`,
        `        version = "${activeVersionForExamples}",`,
        `        code = "export function main(data, ctx) { return { ok: true, data }; }"`,
        `    },`,
        `    functionName = "main",`,
        `    data = new { a = 1, b = 2 },`,
        `    permissions = "none",`,
        `    timeoutMs = 2000`,
        `};`,
        ``,
        `var result = await httpClient.PostAsJsonAsync("${runnerRunUrl}", payload);`,
        `var json = await result.Content.ReadAsStringAsync();`,
      ].join('\n'),
    },
    {
      label: 'Python',
      description: 'requests',
      language: 'python' as const,
      code: [
        `import requests`,
        ``,
        `payload = ${JSON.stringify(runnerRunPayload)}`,
        `response = requests.post("${runnerRunUrl}", json=payload)`,
        `print(response.json())`,
      ].join('\n'),
    },
  ]
  const hasOpenTabs = tabs.length > 0
  const activeTabPath =
    activePath && tabs.includes(activePath) ? activePath : null
  const activePathLabel = isEndpointsOpen
    ? 'API Endpoints'
    : (activeTabPath ?? 'No file selected')

  const logLevelClass = useCallback((level: BuildLogEntry['level']) => {
    if (level === 'error') return 'text-destructive'
    if (level === 'success') return 'text-primary'
    return 'text-muted-foreground'
  }, [])

  function renderTree(nodes: FileTreeNode[], depth = 0): ReactNode[] {
    return nodes.map((node) => {
      const collapsed = Boolean(collapsedFolders[node.fullPath])
      const style = {
        paddingInlineStart: `${depth * 14 + 10}px`,
      } as CSSProperties

      if (node.type === 'folder') {
        const folderDropActive =
          draggedFilePath !== null && dropFolderPath === node.fullPath
        return (
          <div key={node.fullPath}>
            <button
              type="button"
              className={cn(
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-1 py-1 text-left text-xs',
                folderDropActive && 'bg-primary/15 text-primary'
              )}
              style={style}
              onClick={() => {
                setCollapsedFolders((prev) => ({
                  ...prev,
                  [node.fullPath]: !prev[node.fullPath],
                }))
              }}
              onDragOver={(event) => handleFolderDragOver(event, node.fullPath)}
              onDrop={(event) => handleFolderDrop(event, node.fullPath)}
              onContextMenu={(event) =>
                openFileContextMenu(event, node.fullPath, 'folder')
              }
            >
              {collapsed ? (
                <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
              )}
              {collapsed ? (
                <Folder className="text-primary h-3.5 w-3.5" />
              ) : (
                <FolderOpen className="text-primary h-3.5 w-3.5" />
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
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full cursor-grab items-center gap-2 py-1 text-left text-xs active:cursor-grabbing',
            active && 'bg-primary/15 text-primary'
          )}
          style={style}
          draggable
          onClick={() => openFile(node.fullPath)}
          onDragStart={(event) => handleFileDragStart(event, node.fullPath)}
          onDragEnd={handleFileDragEnd}
          onDragOver={(event) => handleFileRowDragOver(event, node.fullPath)}
          onDrop={(event) => handleFileRowDrop(event, node.fullPath)}
          onContextMenu={(event) =>
            openFileContextMenu(event, node.fullPath, 'file')
          }
        >
          <Icon className="text-primary h-3.5 w-3.5" />
          <span className="truncate">{node.name}</span>
          {dirty ? (
            <span className="ms-auto text-[10px] text-amber-500">●</span>
          ) : null}
        </button>
      )
    })
  }

  return (
    <div
      dir="ltr"
      className="bg-background text-foreground relative flex h-full min-h-0 w-full overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="bg-card flex h-12 items-center gap-2 border-b px-2">
          <Select
            value={selectedProjectSlug}
            onValueChange={(nextSlug) => {
              setSelectedProjectSlug(nextSlug)
              void loadProject(nextSlug)
            }}
            disabled={isBootstrapping}
          >
            <SelectTrigger size="sm" className="min-w-[220px] text-xs">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.slug}>
                  {project.name} ({project.slug})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
            className="h-8 w-36 text-xs"
          />

          <Input
            value={projectSlugInput}
            onChange={(event) =>
              setProjectSlugInput(asSlug(event.target.value))
            }
            placeholder="project-slug"
            className="h-8 w-36 text-xs"
          />

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={() => void handleCreateProject()}
          >
            <Plus className="me-1 h-3.5 w-3.5" />
            New Project
          </Button>

          <div className="ms-auto flex items-center gap-2">
            <span className="text-muted-foreground text-[11px]">Entry</span>
            <Input
              value={entryPathInput}
              onChange={(event) =>
                setEntryPathInput(normalizeWorkspacePath(event.target.value))
              }
              className="h-8 w-56 text-xs"
            />

            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 px-3 text-xs"
              onClick={() => setActiveActivityPanel('versions')}
            >
              <History className="me-1 h-3.5 w-3.5" />
              v{selectedVersion ?? selectedProject?.currentVersion ?? 1}
            </Button>

            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => void handleSave()}
              disabled={isSaving || isLoading || isBootstrapping}
            >
              <Save className="me-1 h-3.5 w-3.5" />
              {isSaving
                ? 'Saving...'
                : isDirty
                  ? 'Save Changes'
                  : 'Update Version'}
            </Button>
          </div>
        </div>

        <Tabs
          value={activeActivityPanel}
          onValueChange={(value) =>
            setActiveActivityPanel(value as ActivityPanel)
          }
          className="min-h-0 flex-1 flex-row gap-0 overflow-hidden"
        >
          <TabsList className="bg-muted/50 flex h-auto w-12 shrink-0 flex-col justify-start gap-1 rounded-none border-r p-2">
            <TabsTrigger
              value="explorer"
              className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary h-9 w-9 flex-none p-0"
              title="Explorer"
            >
              {isExplorerOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="versions"
              className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary h-9 w-9 flex-none p-0"
              title="Versions"
            >
              <History className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary h-9 w-9 flex-none p-0"
              title="Jobs"
            >
              <Activity className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="console"
              className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary h-9 w-9 flex-none p-0"
              title="Console"
            >
              <TerminalSquare className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="endpoints"
              className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary h-9 w-9 flex-none p-0"
              title="API Endpoints"
            >
              <FileJson className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <div
            className={cn(
              'm-0 min-h-0 flex-1 overflow-hidden',
              activeActivityPanel !== 'explorer' && 'hidden'
            )}
          >
            <div className="flex h-full min-h-0">
              <aside className="bg-card flex min-h-0 w-72 flex-col border-r">
                <div className="flex h-9 items-center justify-between border-b px-2">
                  <div className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold tracking-wide">
                    <Files className="h-3.5 w-3.5" />
                    Explorer
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md p-1"
                      onClick={() => {
                        const basePath = activePath
                          ? dirnamePath(activePath)
                          : '/'
                        promptCreateFileAtBasePath(basePath)
                      }}
                      title="New file"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md p-1"
                      onClick={() => {
                        const basePath = activePath
                          ? dirnamePath(activePath)
                          : '/'
                        promptCreateFolderAtBasePath(basePath)
                      }}
                      title="New folder"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-b p-2">
                  <Input
                    value={newFileInput}
                    onChange={(event) => setNewFileInput(event.target.value)}
                    placeholder="/api/service.ts"
                    className="h-7 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-xs"
                    onClick={handleCreateFile}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 border-b px-2 py-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 flex-1 px-2 text-xs"
                    onClick={handleRenameFile}
                    disabled={!activePath}
                  >
                    <Pencil className="me-1 h-3 w-3" />
                    Rename
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 flex-1 px-2 text-xs"
                    onClick={handleDeleteFile}
                    disabled={!activePath}
                  >
                    <Trash2 className="me-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>

                <div
                  className={cn(
                    'min-h-0 flex-1 overflow-auto py-1',
                    draggedFilePath && dropFolderPath === '/' && 'bg-primary/10'
                  )}
                  onDragOver={handleExplorerDragOver}
                  onDrop={handleExplorerDrop}
                >
                  {renderTree(fileTree)}
                </div>
              </aside>

              <section className="bg-background relative flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="bg-muted/40 h-9 overflow-x-auto border-b [scrollbar-gutter:stable]">
                  <div className="flex h-full min-w-full items-center gap-1 px-2">
                    {!hasOpenTabs ? (
                      <span className="text-muted-foreground px-2 text-xs">
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
                            'group flex h-7 shrink-0 items-center gap-2 rounded-md border border-transparent px-2 text-xs',
                            active
                              ? 'border-border bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground bg-transparent'
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
                            <Icon className="text-primary h-3.5 w-3.5" />
                            <span className="truncate">{fileName}</span>
                          </button>
                          {dirty ? (
                            <span className="text-[10px] text-amber-500">
                              ●
                            </span>
                          ) : null}
                          <button
                            type="button"
                            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded p-0.5 opacity-70 hover:opacity-100"
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
                </div>

                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <div ref={containerRef} className="h-full w-full" />
                </div>

                <div className="bg-primary text-primary-foreground flex h-7 items-center justify-between border-t px-2 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span>{selectedProject?.name ?? 'No Project'}</span>
                    <span>{activePathLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="hover:bg-primary-foreground/15 rounded px-1.5"
                      onClick={() => setActiveActivityPanel('console')}
                    >
                      Show Console
                    </button>
                    <span>{isDirty ? 'Unsaved changes' : 'Saved'}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div
            className={cn(
              'm-0 min-h-0 flex-1 overflow-hidden',
              activeActivityPanel !== 'versions' && 'hidden'
            )}
          >
            <section className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
              <div className="flex h-10 items-center justify-between border-b px-3">
                <p className="text-sm font-semibold">Versions</p>
                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  <span>Active: v{selectedVersion ?? '-'}</span>
                  <span>{versions.length} total</span>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden">
                <aside className="bg-card flex min-h-0 flex-col border-r">
                  <div className="space-y-3 border-b p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label
                        htmlFor="publish-version-toggle"
                        className="text-xs"
                      >
                        Publish version
                      </Label>
                      <Switch
                        id="publish-version-toggle"
                        checked={publishEnabled}
                        onCheckedChange={setPublishEnabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publish-message" className="text-xs">
                        Commit message
                      </Label>
                      <Input
                        id="publish-message"
                        value={publishMessage}
                        onChange={(event) =>
                          setPublishMessage(event.target.value)
                        }
                        disabled={!publishEnabled}
                        placeholder="Release scheduler workflow"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publish-description" className="text-xs">
                        Description
                      </Label>
                      <Textarea
                        id="publish-description"
                        value={publishDescription}
                        onChange={(event) =>
                          setPublishDescription(event.target.value)
                        }
                        disabled={!publishEnabled}
                        placeholder="Changed inputs, runner behavior, or deployment notes"
                        className="min-h-20 resize-none text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 flex-1 text-xs"
                        onClick={() => void handlePublish()}
                        disabled={
                          !publishEnabled ||
                          isSaving ||
                          isLoading ||
                          isBootstrapping
                        }
                      >
                        <Save className="me-1 h-3.5 w-3.5" />
                        New Version
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8 flex-1 text-xs"
                        onClick={() => void handleSave()}
                        disabled={isSaving || isLoading || isBootstrapping}
                      >
                        Update v{selectedVersion ?? selectedProject?.currentVersion ?? 1}
                      </Button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto">
                    {versions.length === 0 ? (
                      <p className="text-muted-foreground p-3 text-xs">
                        No versions
                      </p>
                    ) : (
                      <div className="divide-y">
                        {versions.map((version) => {
                          const active = version.version === selectedVersion
                          return (
                            <button
                              key={version.id}
                              type="button"
                              className={cn(
                                'hover:bg-accent flex w-full items-start gap-3 px-3 py-3 text-left text-xs',
                                active && 'bg-primary/10 text-primary'
                              )}
                              onClick={() =>
                                void handleCheckoutVersion(version.version)
                              }
                            >
                              <span className="bg-muted text-foreground mt-0.5 rounded px-1.5 py-0.5 font-mono">
                                v{version.version}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">
                                  {version.message || `Version ${version.version}`}
                                </span>
                                <span className="text-muted-foreground mt-1 block truncate">
                                  {new Date(version.createdAt).toLocaleString()}
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </aside>

                <div className="min-h-0 overflow-auto p-4">
                  <div className="mx-auto max-w-3xl space-y-3">
                    <div className="rounded-md border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm">
                            v{selectedVersionRecord?.version ?? '-'}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium">
                            {selectedVersionRecord?.message ||
                              (selectedVersionRecord
                                ? `Version ${selectedVersionRecord.version}`
                                : '-')}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {selectedVersionRecord?.isAutosave
                            ? 'Autosave'
                            : 'Manual'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-3 whitespace-pre-wrap text-sm">
                        {selectedVersionRecord?.description ||
                          'No description'}
                      </p>
                      <div className="text-muted-foreground mt-4 grid gap-2 text-xs sm:grid-cols-3">
                        <span>
                          Size:{' '}
                          {selectedVersionRecord
                            ? `${selectedVersionRecord.sizeBytes.toLocaleString()} bytes`
                            : '-'}
                        </span>
                        <span className="truncate">
                          Hash: {selectedVersionRecord?.snapshotHash ?? '-'}
                        </span>
                        <span>
                          Created:{' '}
                          {selectedVersionRecord
                            ? new Date(
                              selectedVersionRecord.createdAt
                            ).toLocaleString()
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div
            className={cn(
              'm-0 min-h-0 flex-1 overflow-hidden',
              activeActivityPanel !== 'jobs' && 'hidden'
            )}
          >
            <section className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
              <CodeEditorJobPanel
                preferredWorkspaceSlug={selectedProjectSlug}
              />
            </section>
          </div>

          <div
            className={cn(
              'm-0 min-h-0 flex-1 overflow-hidden',
              activeActivityPanel !== 'console' && 'hidden'
            )}
          >
            <section className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex h-10 items-center justify-between border-b px-3">
                <p className="text-sm font-semibold">Console</p>
                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  <span>Project: {selectedProject?.slug ?? '-'}</span>
                  <span>Version: {selectedVersion ?? 'latest'}</span>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No logs yet</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((entry) => (
                      <p
                        key={entry.id}
                        className={cn(
                          'font-mono text-sm',
                          logLevelClass(entry.level)
                        )}
                      >
                        {entry.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div
            className={cn(
              'm-0 min-h-0 flex-1 overflow-hidden',
              activeActivityPanel !== 'endpoints' && 'hidden'
            )}
          >
            <section className="bg-background h-full min-h-0 overflow-auto px-4 py-4">
              <div className="mx-auto flex max-w-5xl flex-col gap-4">
                <Card className="overflow-hidden">
                  <CardHeader className="border-b p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          API Endpoints
                        </CardTitle>
                        <p className="text-muted-foreground text-xs">
                          Mirrors the runner Swagger operation{' '}
                          <code>POST /run</code>. The examples below inject the
                          active workspace, version, entry path, and runtime
                          data from this editor context.
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        Swagger /run
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                    <div className="bg-muted/30 rounded-md border p-3">
                      <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                        Workspace
                      </p>
                      <p
                        dir="ltr"
                        className="mt-1 truncate text-left font-mono text-sm"
                      >
                        {endpointProjectSlug}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-md border p-3">
                      <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                        Version
                      </p>
                      <p className="mt-1 font-mono text-sm">
                        v{activeVersionForExamples}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-md border p-3">
                      <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                        Entry
                      </p>
                      <p
                        dir="ltr"
                        className="mt-1 truncate text-left font-mono text-sm"
                      >
                        {endpointEntryPath}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-sm">Endpoint Catalog</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="divide-y rounded-md border">
                      {endpointItems.map((item) => (
                        <div
                          key={`${item.method}-${item.path}`}
                          className="grid gap-2 p-3 sm:grid-cols-[92px_minmax(0,1fr)]"
                        >
                          <Badge
                            variant={
                              item.method === 'POST' ? 'default' : 'outline'
                            }
                            className="w-fit rounded-full font-mono"
                          >
                            {item.method}
                          </Badge>
                          <div className="min-w-0">
                            <p
                              dir="ltr"
                              className="truncate text-left font-mono text-xs"
                            >
                              {item.path}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-sm">
                      Runner Request Schema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
                      <CodeSnippet
                        code={runPayloadExample}
                        language="json"
                        className="bg-muted/50 text-muted-foreground"
                      />
                      <div className="grid content-start gap-2 text-xs">
                        <div className="bg-muted/30 rounded-md border p-3">
                          <p className="font-medium">Required</p>
                          <p className="text-muted-foreground mt-1">
                            <code>data</code> plus exactly one of{' '}
                            <code>bundle</code> or <code>codeRef</code>.
                          </p>
                        </div>
                        <div className="bg-muted/30 rounded-md border p-3">
                          <p className="font-medium">Bundle</p>
                          <p className="text-muted-foreground mt-1">
                            Use <code>bundle.code</code> for the compiled ESM
                            code saved from this editor.
                          </p>
                        </div>
                        <div className="bg-muted/30 rounded-md border p-3">
                          <p className="font-medium">Context</p>
                          <p className="text-muted-foreground mt-1">
                            Keep editor-only fields in <code>metadata</code>;
                            runtime input belongs in <code>data</code>.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/20 mt-3 rounded-md border p-3">
                      <p className="text-muted-foreground text-xs">
                        Stored-code alternative after the runner already has the
                        version:
                      </p>
                      <CodeSnippet
                        code={codeRefPayloadExample}
                        language="json"
                        className="mt-2 border-0 bg-transparent p-0"
                        showLineNumbers={false}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-sm">Client Examples</CardTitle>
                    <p className="text-muted-foreground text-xs">
                      These examples use the current editor context. For
                      Postman, import the curl block or set the body to raw
                      JSON.
                    </p>
                  </CardHeader>
                  <CardContent className="grid gap-3 p-4 pt-0 lg:grid-cols-2">
                    {runClientExamples.map((example) => (
                      <div
                        key={example.label}
                        className="bg-muted/20 overflow-hidden rounded-md border"
                      >
                        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                          <div>
                            <p className="text-sm font-medium">
                              {example.label}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                              {example.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="rounded-full">
                            POST
                          </Badge>
                        </div>
                        <CodeSnippet
                          code={example.code}
                          language={example.language}
                          className="max-h-80 rounded-none border-0 bg-transparent"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </Tabs>
      </div>

      {fileContextMenu ? (
        <div
          ref={fileContextMenuRef}
          className="bg-popover text-popover-foreground fixed z-50 min-w-[170px] rounded-md border py-1 shadow-2xl"
          style={{ left: fileContextMenu.x, top: fileContextMenu.y }}
        >
          <button
            type="button"
            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs"
            onClick={() => {
              const context = fileContextMenu
              setFileContextMenu(null)

              const basePath =
                context.nodeType === 'folder'
                  ? context.path
                  : dirnamePath(context.path)

              promptCreateFileAtBasePath(basePath)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New File
          </button>

          <button
            type="button"
            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs"
            onClick={() => {
              const context = fileContextMenu
              setFileContextMenu(null)

              const basePath =
                context.nodeType === 'folder'
                  ? context.path
                  : dirnamePath(context.path)
              promptCreateFolderAtBasePath(basePath)
            }}
          >
            <FolderPlus className="h-3.5 w-3.5" />
            New Folder
          </button>

          <button
            type="button"
            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs"
            onClick={() => {
              const context = fileContextMenu
              setFileContextMenu(null)

              if (context.nodeType === 'folder') {
                renameFolderPath(context.path)
                return
              }
              renameFilePath(context.path)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            {fileContextMenu.nodeType === 'folder' ? 'Rename Folder' : 'Rename'}
          </button>

          <button
            type="button"
            className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs"
            onClick={() => {
              const context = fileContextMenu
              setFileContextMenu(null)

              if (context.nodeType === 'folder') {
                deleteFolderPath(context.path)
                return
              }
              deleteFilePath(context.path)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {fileContextMenu.nodeType === 'folder' ? 'Delete Folder' : 'Delete'}
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="bg-background/90 text-muted-foreground absolute inset-x-0 bottom-0 border-t px-3 py-1.5 text-xs backdrop-blur">
          Loading project data from remote...
        </div>
      ) : null}
    </div>
  )
}
