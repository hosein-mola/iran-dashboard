'use client'

import { loader } from '@monaco-editor/react'
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
  normalizeWorkspacePath,
  parseWorkspaceSnapshot,
  pickBuildTarget,
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

const MAX_LOG_LINES = 80
const DEFAULT_WORKSPACE_SLUG = 'process'

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
    allowJs: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    resolveJsonModule: true,
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

    for (let i = 0; i < parts.length; i += 1) {
      const name = parts[i]
      currentPath = `${currentPath}/${name}`
      const isFile = i === parts.length - 1

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
      .map((node) => {
        const children = toSorted(Array.from(node.children.values()))
        return {
          name: node.name,
          fullPath: node.fullPath,
          type: node.type,
          children,
        }
      })
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

    modelListenersRef.current.clear()
    modelsRef.current.clear()
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
      const disposable = model.onDidChangeContent(() => {
        updateDirtyForPath(normalizedPath)
      })
      modelListenersRef.current.set(normalizedPath, disposable)
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

  const hydrateSnapshotFromModels = useCallback(
    (baseSnapshot: WorkspaceSnapshotV1) => {
      let next = baseSnapshot

      for (const file of baseSnapshot.files) {
        const model = modelsRef.current.get(file.path)
        if (!model) continue
        const value = model.getValue()
        if (value !== file.content) {
          next = applyFileContent(next, file.path, value)
        }
      }

      return {
        ...next,
        entryPath: normalizeWorkspacePath(entryPathInput || next.entryPath),
      }
    },
    [entryPathInput]
  )

  const openFile = useCallback(
    (path: string) => {
      const normalized = normalizeWorkspacePath(path)
      const file = snapshotRef.current.files.find(
        (item) => item.path === normalized
      )
      if (!file) return

      const editor = editorRef.current
      if (editor && activePathRef.current) {
        const state = editor.saveViewState()
        viewStateByPathRef.current.set(activePathRef.current, state)
      }

      const model = ensureModel(normalized, file.content)
      if (!model || !editor) {
        setActivePath(normalized)
        setTabs((prev) =>
          prev.includes(normalized) ? prev : [...prev, normalized]
        )
        return
      }

      editor.setModel(model)
      const savedState = viewStateByPathRef.current.get(normalized)
      if (savedState) {
        editor.restoreViewState(savedState)
      }
      editor.focus()

      setTabs((prev) =>
        prev.includes(normalized) ? prev : [...prev, normalized]
      )
      setActivePath(normalized)
    },
    [ensureModel]
  )

  const applyLoadedSnapshot = useCallback(
    (nextSnapshot: WorkspaceSnapshotV1) => {
      const normalizedEntry = normalizeWorkspacePath(nextSnapshot.entryPath)
      const files = nextSnapshot.files
      const normalizedSnapshot: WorkspaceSnapshotV1 = {
        ...nextSnapshot,
        entryPath: normalizedEntry,
        files,
      }
      snapshotRef.current = normalizedSnapshot

      savedContentsRef.current = Object.fromEntries(
        files.map((file) => [file.path, file.content])
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
    if (!slug) return
    if (!snapshotRef.current) return

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

      const buildTarget = pickBuildTarget(
        snapshotForSave,
        activePathRef.current
      )
      if (buildTarget) {
        addLog('info', `Bundling ${buildTarget}...`)

        const buildResponse = await runBuild({
          requestId: crypto.randomUUID(),
          entryPath: buildTarget,
          files: snapshotToFileMap(snapshotForSave),
        })

        if (buildResponse.ok) {
          if (buildResponse.warnings.length > 0) {
            for (const warning of buildResponse.warnings) {
              addLog('info', warning)
            }
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
          if (buildResponse.warnings.length > 0) {
            for (const warning of buildResponse.warnings) {
              addLog('info', warning)
            }
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

    const normalizedPath = normalizeWorkspacePath(rawPath)
    if (normalizedPath === '/') {
      addLog('error', 'Invalid file path')
      return
    }

    if (
      snapshotRef.current.files.some((file) => file.path === normalizedPath)
    ) {
      addLog('error', `File already exists: ${normalizedPath}`)
      return
    }

    const nextSnapshot = upsertFile(snapshotRef.current, {
      path: normalizedPath,
      content: pickDefaultContent(normalizedPath),
    })

    setSnapshot(nextSnapshot)
    snapshotRef.current = nextSnapshot
    setNewFileInput('')

    setDirtyPaths((prev) => ({
      ...prev,
      [normalizedPath]: true,
    }))

    setTabs((prev) =>
      prev.includes(normalizedPath) ? prev : [...prev, normalizedPath]
    )
    setActivePath(normalizedPath)

    addLog('success', `Added file ${normalizedPath}`)
  }, [addLog, newFileInput])

  const handleRenameFile = useCallback(() => {
    const path = activePathRef.current
    if (!path) return

    const suggested = path
    const nextPathRaw = window.prompt('Rename file path', suggested)
    if (!nextPathRaw) return

    const nextPath = normalizeWorkspacePath(nextPathRaw)
    if (nextPath === path) return

    if (snapshotRef.current.files.some((file) => file.path === nextPath)) {
      addLog('error', `Target path already exists: ${nextPath}`)
      return
    }

    const nextSnapshot = renameFile(snapshotRef.current, path, nextPath)
    setSnapshot(nextSnapshot)
    snapshotRef.current = nextSnapshot

    const existingSaved = savedContentsRef.current[path]
    if (typeof existingSaved === 'string') {
      savedContentsRef.current[nextPath] = existingSaved
      delete savedContentsRef.current[path]
    }

    const model = modelsRef.current.get(path)
    if (model) {
      const content = model.getValue()
      removeModel(path)
      ensureModel(nextPath, content)
    }

    setTabs((prev) =>
      prev.map((tabPath) => (tabPath === path ? nextPath : tabPath))
    )
    setActivePath(nextPath)

    setDirtyPaths((prev) => {
      const next = { ...prev }
      if (next[path]) {
        delete next[path]
        next[nextPath] = true
      }
      return next
    })

    addLog('success', `Renamed ${path} -> ${nextPath}`)
  }, [addLog, ensureModel, removeModel])

  const handleDeleteFile = useCallback(() => {
    const path = activePathRef.current
    if (!path) return

    const confirmed = window.confirm(`Delete file ${path}?`)
    if (!confirmed) return

    const nextSnapshot = removeFile(snapshotRef.current, path)
    setSnapshot(nextSnapshot)
    snapshotRef.current = nextSnapshot

    delete savedContentsRef.current[path]
    removeModel(path)

    setDirtyPaths((prev) => {
      const next = { ...prev }
      delete next[path]
      return next
    })

    const nextTabs = tabs.filter((tabPath) => tabPath !== path)
    const nextActive = nextTabs[0] ?? nextSnapshot.files[0]?.path ?? null

    setTabs(nextTabs)
    setActivePath(nextActive)
    addLog('success', `Deleted ${path}`)
  }, [addLog, removeModel, tabs])

  useEffect(() => {
    snapshotRef.current = snapshot
    activePathRef.current = activePath
    selectedProjectSlugRef.current = selectedProjectSlug
  }, [activePath, selectedProjectSlug, snapshot])

  useEffect(() => {
    configureMonacoWorkers()
    const pendingBuildsMap = pendingBuildsRef.current

    let cancelled = false
    void loader.init().then((monaco) => {
      if (cancelled) return
      monacoRef.current = monaco
      configureTypeScriptLanguageService(monaco)

      if (!containerRef.current || editorRef.current) return

      editorRef.current = monaco.editor.create(containerRef.current, {
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 14,
        fontFamily:
          'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'selection',
        wordWrap: 'on',
        smoothScrolling: true,
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
  }, [disposeModels, ensureModel])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (!activePath) return

    const file = snapshot.files.find((item) => item.path === activePath)
    if (!file) return

    const model = ensureModel(activePath, file.content)
    const editor = editorRef.current
    if (!model || !editor) return

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

  const logLevelClass = useCallback((level: BuildLogEntry['level']) => {
    if (level === 'error') return 'text-destructive'
    if (level === 'success') return 'text-emerald-600 dark:text-emerald-400'
    return 'text-muted-foreground'
  }, [])

  function renderTree(nodes: FileTreeNode[], depth = 0): ReactNode[] {
    return nodes.map((node) => {
      const collapsed = Boolean(collapsedFolders[node.fullPath])
      const style = {
        paddingInlineStart: `${depth * 14 + 8}px`,
      } as CSSProperties

      if (node.type === 'folder') {
        return (
          <div key={node.fullPath}>
            <button
              type="button"
              className="text-muted-foreground hover:bg-muted flex w-full items-center py-1 text-left text-xs"
              style={style}
              onClick={() => {
                setCollapsedFolders((prev) => ({
                  ...prev,
                  [node.fullPath]: !prev[node.fullPath],
                }))
              }}
            >
              <span className="inline-block w-4">{collapsed ? '▸' : '▾'}</span>
              <span>{node.name}</span>
            </button>
            {!collapsed && renderTree(node.children, depth + 1)}
          </div>
        )
      }

      const dirty = Boolean(dirtyPaths[node.fullPath])
      const active = node.fullPath === activePath

      return (
        <button
          key={node.fullPath}
          type="button"
          className={cn(
            'hover:bg-muted flex w-full items-center gap-2 py-1 text-left text-xs',
            active && 'bg-muted/80 text-foreground font-medium'
          )}
          style={style}
          onClick={() => openFile(node.fullPath)}
        >
          <span className="text-muted-foreground inline-block w-4">•</span>
          <span className="truncate">{node.name}</span>
          {dirty ? (
            <span className="ms-auto text-[10px] text-amber-600">●</span>
          ) : null}
        </button>
      )
    })
  }

  return (
    <div
      dir="ltr"
      className="bg-background text-foreground flex h-full min-h-[600px] w-full flex-col"
    >
      <div className="flex flex-wrap items-center gap-2 border-b p-2">
        <select
          className="bg-background h-9 min-w-[180px] rounded-md border px-2 text-sm"
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
          className="h-9 w-40"
        />

        <Input
          value={projectSlugInput}
          onChange={(event) => setProjectSlugInput(asSlug(event.target.value))}
          placeholder="project-slug"
          className="h-9 w-40"
        />

        <Button
          type="button"
          variant="secondary"
          className="h-9"
          onClick={() => void handleCreateProject()}
        >
          New Project
        </Button>

        <div className="ms-auto flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Entry</span>
          <Input
            value={entryPathInput}
            onChange={(event) =>
              setEntryPathInput(normalizeWorkspacePath(event.target.value))
            }
            className="h-9 w-52"
          />

          <select
            className="bg-background h-9 min-w-[120px] rounded-md border px-2 text-sm"
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
            className="h-9"
            onClick={() => void handleSave()}
            disabled={isSaving || isLoading || isBootstrapping}
          >
            {isSaving ? 'Saving...' : isDirty ? 'Save Changes' : 'Save Version'}
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr]">
        <aside className="flex min-h-0 flex-col border-e">
          <div className="flex items-center gap-2 border-b p-2">
            <Input
              value={newFileInput}
              onChange={(event) => setNewFileInput(event.target.value)}
              placeholder="/api/service.ts or /README.md"
              className="h-8"
            />
            <Button
              type="button"
              variant="secondary"
              className="h-8 px-2"
              onClick={handleCreateFile}
            >
              Add
            </Button>
          </div>

          <div className="flex items-center gap-2 border-b p-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 flex-1"
              onClick={handleRenameFile}
              disabled={!activePath}
            >
              Rename
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 flex-1"
              onClick={handleDeleteFile}
              disabled={!activePath}
            >
              Delete
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {renderTree(fileTree)}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="flex items-center gap-1 border-b px-2 py-1">
            {tabs.map((tabPath) => {
              const active = tabPath === activePath
              const dirty = Boolean(dirtyPaths[tabPath])
              const fileName =
                tabPath.split('/').filter(Boolean).pop() ?? tabPath

              return (
                <div
                  key={tabPath}
                  className={cn(
                    'group flex items-center gap-2 rounded-md border px-2 py-1 text-xs',
                    active
                      ? 'border-primary/40 bg-primary/10 text-foreground'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted border-transparent'
                  )}
                >
                  <button
                    type="button"
                    className="max-w-[180px] truncate text-left"
                    onClick={() => openFile(tabPath)}
                  >
                    {fileName}
                  </button>
                  {dirty ? <span className="text-amber-600">●</span> : null}
                  <button
                    type="button"
                    className="hover:bg-muted rounded px-1 text-[10px] opacity-60 hover:opacity-100"
                    onClick={() => {
                      const nextTabs = tabs.filter(
                        (candidate) => candidate !== tabPath
                      )
                      setTabs(nextTabs)

                      if (activePath === tabPath) {
                        const nextActive =
                          nextTabs[nextTabs.length - 1] ??
                          snapshot.files[0]?.path ??
                          null
                        setActivePath(nextActive)
                      }
                    }}
                  >
                    x
                  </button>
                </div>
              )
            })}
          </div>

          <div className="min-h-0 flex-1">
            <div ref={containerRef} className="h-full w-full" />
          </div>

          <div className="bg-muted/20 h-36 border-t">
            <div className="flex items-center justify-between border-b px-3 py-1">
              <p className="text-muted-foreground text-xs">Build / Save Logs</p>
              <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                <span>Project: {selectedProject?.slug ?? '-'}</span>
                <span>Version: {selectedVersion ?? 'latest'}</span>
              </div>
            </div>
            <div className="h-[calc(100%-29px)] overflow-auto px-3 py-2">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-xs">No logs yet</p>
              ) : (
                logs.map((entry) => (
                  <p
                    key={entry.id}
                    className={cn(
                      'font-mono text-[11px]',
                      logLevelClass(entry.level)
                    )}
                  >
                    {entry.message}
                  </p>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground border-t px-3 py-2 text-xs">
          Loading project data from remote...
        </div>
      ) : null}
    </div>
  )
}
