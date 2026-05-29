"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { motion, AnimatePresence } from "framer-motion";
import { runCode } from "../../lib/api-code";
import {
  fetchWorkspace,
  fetchWorkspaceVersionSnapshot,
  saveWorkspaceVersion,
  type WorkspaceVersionSummary,
} from "../../lib/api-code-workspaces";

import {
  type FileId,
  type FileNode,
  type FileSystem,
  type Tab,
  type CtxMenu,
} from "./types";
import {
  loadFS,
  saveFS,
  langFromName,
  getDepth,
  deleteNode,
  uid,
  moveNode,
  debounce,
} from "./helpers";
import { Icon, ActionBtn } from "./icons";
import ActivityBar from "./ActivityBar";
import FileTree from "./FileTree";
import TabBar from "./TabBar";
import EditorPanel from "./EditorPanel";
import ContextMenu from "./ContextMenu";

loader.config({ monaco });

export default function CodeEditor({
  workspaceSlug = "process",
}: {
  workspaceSlug?: string;
}) {
  const editorRef = useRef<{
    editor: monaco.editor.IStandaloneCodeEditor;
    monaco: typeof monaco;
  } | null>(null);
  const modelsRef = useRef<Record<FileId, monaco.editor.ITextModel>>({});
  const disposablesRef = useRef<monaco.IDisposable[]>([]);

  const [explorerOpen, setExplorerOpen] = useState(true);
  const [showConsole, setShowConsole] = useState(true);

  const [fs, setFs] = useState<FileSystem>(loadFS);
  const fsRef = useRef(fs);
  fsRef.current = fs;

  const [selectedId, setSelectedId] = useState<FileId | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<FileId | null>(null);
  const activeTabIdRef = useRef(activeTabId);
  activeTabIdRef.current = activeTabId;
  const [expanded, setExpanded] = useState<Set<FileId>>(new Set(["src"]));
  const [editingId, setEditingId] = useState<FileId | null>(null);
  const [creating, setCreating] = useState<{
    parentId: FileId | null;
    type: "file" | "folder";
    depth: number;
  } | null>(null);

  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const ctxNodeRef = useRef<FileId | null>(null);

  const [logs, setLogs] = useState<string[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<WorkspaceVersionSummary[]>([]);
  const [remoteCurrentVersion, setRemoteCurrentVersion] = useState<number>(0);
  const [isRemoteBusy, setIsRemoteBusy] = useState(false);
  const workspaceSlugRef = useRef(workspaceSlug);
  workspaceSlugRef.current = workspaceSlug;

  // Build system refs
  const buildWorkerRef = useRef<Worker | null>(null);
  const [isBuildReady, setIsBuildReady] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  // Persist FS with debounce
  const debouncedSave = useMemo(() => debounce(saveFS, 500), []);

  useEffect(() => {
    debouncedSave(fs);
  }, [fs, debouncedSave]);

  // Load latest snapshot from DB (if present) and hydrate versions list.
  useEffect(() => {
    let cancelled = false;

    async function loadRemote() {
      if (!workspaceSlugRef.current) return;
      try {
        setIsRemoteBusy(true);
        const data = await fetchWorkspace(workspaceSlugRef.current);
        if (cancelled) return;

        setVersions(data.versions ?? []);
        setRemoteCurrentVersion(data.workspace?.currentVersion ?? 0);

        if (data.latest?.snapshot) {
          const parsed = JSON.parse(data.latest.snapshot);
          if (parsed && typeof parsed === "object" && parsed.nodes) {
            setFs(parsed);
            setTabs([]);
            setActiveTabId(null);
            setSelectedId(null);
            setExpanded(new Set(Array.isArray(parsed.rootIds) ? parsed.rootIds : []));
            setLogs((prev) => [
              ...prev,
              `📥 Loaded workspace "${workspaceSlugRef.current}" (v${data.latest?.version ?? "?"})`,
            ]);
          }
        }
      } catch (e: any) {
        if (cancelled) return;
        setLogs((prev) => [
          ...prev,
          `⚠️ Failed to load remote workspace: ${e?.message || "unknown error"}`,
        ]);
      } finally {
        if (!cancelled) setIsRemoteBusy(false);
      }
    }

    loadRemote();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize build worker
  useEffect(() => {
    let worker: Worker | null = null;

    try {
      const workerUrl = new URL(
        "../../workers/esbuild.worker.ts",
        import.meta.url,
      );

      console.log("Worker URL:", workerUrl.href);

      worker = new Worker(workerUrl, {
        type: "module",
        name: "esbuild-worker",
      });

      buildWorkerRef.current = worker;

      // Add this to the worker.onmessage handler in CodeEditor
      worker.onmessage = (e: MessageEvent) => {
        const { type, ...data } = e.data;
        console.log("Worker message:", type, data);

        if (type === "initialized") {
          setIsBuildReady(true);
          setLogs((prev) => [...prev, "✅ Build system ready"]);
        } else if (type === "dependency-tree") {
          // Display the dependency tree
          setLogs((prev) => [
            ...prev,
            ``,
            `🌳 Dependency Tree for: ${data.entryPoint}`,
            `📊 Total dependencies: ${data.totalFiles}`,
            ...data.tree.map((line: string) => `  ${line}`),
            ``,
          ]);
        } else if (type === "build-start") {
          setIsBuilding(true);

          setLogs((prev) => [
            ...prev,
            `🔨 Building ${data.entryPoint || "file"}...`,
            `📁 Resolving imports...`,
          ]);

          if (data.files && data.files.length > 0) {
            setLogs((prev) => [
              ...prev,
              `📋 Entry point:`,
              ...data.files.map((file: string) => `  ⭐ ${file}`),
            ]);
          }
        } else if (type === "progress") {
          if (data.currentFile && !data.currentFile.startsWith("⚠️")) {
            setLogs((prev) => [...prev, `⏳ ${data.currentFile}`]);
          }
        } else if (type === "build-result") {
          setIsBuilding(false);

          // DEBUG: Log what we received
          console.log("=== BUILD RESULT RECEIVED ===");
          console.log("Entry point:", data.entryPoint);
          console.log("Code length:", data.code?.length);
          console.log("Code preview:", data.code?.substring(0, 200));
          console.log("==============================");

          try {
            const compiled = {
              code: data.code,
              timestamp: Date.now(),
              entryPoint: data.entryPoint,
            };

            // IMPORTANT: Store with the SAME key format used to retrieve
            const stored = JSON.parse(
              localStorage.getItem("compiled-code") || "{}",
            );

            // Store with original entry point (as received from worker)
            stored[data.entryPoint] = compiled;

            // ALSO store without leading slash if present
            if (data.entryPoint.startsWith("/")) {
              stored[data.entryPoint.substring(1)] = compiled;
            } else {
              stored["/" + data.entryPoint] = compiled;
            }

            localStorage.setItem("compiled-code", JSON.stringify(stored));

            console.log("Saved compiled code with keys:", [data.entryPoint]);
            console.log("All stored keys:", Object.keys(stored));

            // ... rest of build result handling (logs, etc.)
          } catch (err) {
            console.error("Failed to store compiled code:", err);
          }
        }
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setIsBuilding(false);
        setLogs((prev) => [
          ...prev,
          `❌ Worker error: ${error.message || "Unknown"}`,
          `📍 File: ${error.filename || "unknown"}`,
          `📍 Line: ${error.lineno || "unknown"}`,
        ]);
      };

      // Initialize worker
      worker.postMessage({ type: "initialize" });
    } catch (error: any) {
      console.error("Failed to create worker:", error);
      setLogs((prev) => [
        ...prev,
        `❌ Failed to create build worker: ${error.message}`,
      ]);
    }

    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  // Cleanup Monaco models on unmount
  useEffect(() => {
    return () => {
      // Dispose all models
      Object.values(modelsRef.current).forEach((model) => {
        try {
          model.dispose();
        } catch (e) {
          console.log(e);
          // Ignore dispose errors
        }
      });
      modelsRef.current = {};

      // Dispose other disposables
      disposablesRef.current.forEach((d) => d.dispose());
      disposablesRef.current = [];
    };
  }, []);

  // ── Formatting Function ─────────────────────────────────────────────────

  function formatDocument(): Promise<void> {
    return new Promise((resolve) => {
      if (!editorRef.current) {
        resolve();
        return;
      }

      const { editor } = editorRef.current;
      const model = editor.getModel();

      if (!model) {
        resolve();
        return;
      }

      // Use Monaco's built-in formatting
      editor
        .getAction("editor.action.formatDocument")
        ?.run()
        .then(() => {
          console.log("✅ Document formatted");
          resolve();
        })
        .catch((error) => {
          console.warn("Formatting failed:", error);
          // Resolve anyway to not block saving
          resolve();
        });
    });
  }

  // ── Helper Functions ──────────────────────────────────────────────────

  function getFilePath(fileId: FileId): string {
    const parts: string[] = [];
    let current: FileId | null = fileId;

    while (current) {
      const node = fsRef.current.nodes[current];
      if (!node) break;
      parts.unshift(node.name);
      current = node.parentId;
    }

    return "/" + parts.join("/");
  }
  // ── Local Evaluation Function ─────────────────────────────────────────

  function localEval(code: string): string {
    try {
      // Create a sandboxed environment for execution
      const consoleLogs: string[] = [];

      // Mock console.log to capture output
      const mockConsole = {
        log: (...args: any[]) => {
          const formatted = args
            .map((arg) => {
              if (typeof arg === "object" && arg !== null) {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            })
            .join(" ");
          consoleLogs.push(formatted);
          // Also log to actual console for debugging
          console.log("[Eval]", ...args);
        },
        error: (...args: any[]) => {
          const formatted = args.map((arg) => String(arg)).join(" ");
          consoleLogs.push(`[ERROR] ${formatted}`);
          console.error("[Eval]", ...args);
        },
        warn: (...args: any[]) => {
          const formatted = args.map((arg) => String(arg)).join(" ");
          consoleLogs.push(`[WARN] ${formatted}`);
          console.warn("[Eval]", ...args);
        },
        info: (...args: any[]) => {
          const formatted = args.map((arg) => String(arg)).join(" ");
          consoleLogs.push(`[INFO] ${formatted}`);
          console.info("[Eval]", ...args);
        },
      };

      // Create a sandbox with limited globals
      const sandbox = {
        console: mockConsole,
        Date,
        Math,
        JSON,
        Promise,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Map,
        Set,
        Error,
        // Add any other safe globals you want to expose
      };

      // Extract exports or return value from the code
      const wrappedCode = `
        (function() {
          const module = { exports: {} };
          const exports = module.exports;
          ${code}
          return module.exports || exports;
        })()
      `;

      // Use Function constructor for evaluation (safer than eval)
      const fn = new Function(
        ...Object.keys(sandbox),
        `"use strict"; ${wrappedCode}`,
      );
      const result = fn(...Object.values(sandbox));

      // Format the result
      let output = "";

      // Add console logs
      if (consoleLogs.length > 0) {
        output += consoleLogs.join("\n") + "\n";
      }

      // Add return value
      if (result !== undefined && result !== null) {
        if (typeof result === "object") {
          try {
            output += JSON.stringify(result, null, 2);
          } catch {
            output += String(result);
          }
        } else {
          output += String(result);
        }
      }

      return output || "✅ Code executed successfully (no output)";
    } catch (error: any) {
      console.error("Eval error:", error);
      return `❌ Runtime Error: ${error.message}\n${error.stack || ""}`;
    }
  }

  // ── Monaco Configuration ──────────────────────────────────────────────

  function configureMonaco(m: typeof monaco) {
    // Configure TypeScript with proper module resolution
    m.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: m.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: m.languages.typescript.ModuleResolutionKind.NodeJs,
      module: m.languages.typescript.ModuleKind.ESNext,
      strict: true,
      noEmit: true,
      jsx: m.languages.typescript.JsxEmit.React,
      esModuleInterop: true,
      allowJs: true,
      typeRoots: ["node_modules/@types"],
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      isolatedModules: true,
    });

    m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false, // Enable semantic validation
      noSyntaxValidation: false, // Enable syntax validation
      noSuggestionDiagnostics: false, // Enable suggestions
      onlyVisible: false,
      diagnosticCodesToIgnore: [], // Don't ignore any diagnostics
    });

    m.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    // Force re-check all models
    const models = m.editor.getModels();
    models.forEach((model) => {
      if (
        model.getLanguageId() === "typescript" ||
        model.getLanguageId() === "javascript"
      ) {
        m.editor.setModelLanguage(model, model.getLanguageId());
      }
    });

    // Add extra lib declarations for type imports
    m.languages.typescript.typescriptDefaults.setExtraLibs([
      {
        content: `declare module "*.ts" { const content: any; export default content; }`,
        filePath: "file:///node_modules/@types/ambient.d.ts",
      },
    ]);

    m.editor.defineTheme("vscode-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#D4D4D4",
        "editorLineNumber.foreground": "#858585",
        "editorLineNumber.activeForeground": "#C6C6C6",
        "editor.lineHighlightBackground": "#2A2D2E",
        "editorCursor.foreground": "#FFDB58",
        "editor.selectionBackground": "#264F78",
        "editorWidget.background": "#252526",
        "editorSuggestWidget.background": "#252526",
        "editorSuggestWidget.border": "#454545",
        "editorSuggestWidget.selectedBackground": "#062F4A",
      },
    });
  }

  function getOrCreateModel(
    fileId: FileId,
    content: string,
    lang: string,
    m: typeof monaco,
  ) {
    // Check if model exists and is not disposed
    if (modelsRef.current[fileId]) {
      try {
        // Verify model is still valid
        if (!modelsRef.current[fileId].isDisposed()) {
          return modelsRef.current[fileId];
        }
      } catch (e) {
        console.log(e);
        // Model was disposed, remove reference
        delete modelsRef.current[fileId];
      }
    }

    const uri = m.Uri.parse(`file:///${fileId}`);
    let model = m.editor.getModel(uri);

    // If model exists but is disposed, remove it
    if (model && model.isDisposed()) {
      model = null;
    }

    if (!model) {
      model = m.editor.createModel(content, lang, uri);
    }

    modelsRef.current[fileId] = model;
    return model;
  }

  function handleEditorDidMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    m: typeof monaco,
  ) {
    editorRef.current = { editor, monaco: m };
    configureMonaco(m);
    m.editor.setTheme("vscode-dark");

    // Optimize typing performance
    editor.updateOptions({
      showUnused: true, // Show unused variables
      showDeprecated: true, // Show deprecated items
      renderValidationDecorations: "on",
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      quickSuggestionsDelay: 10,
      parameterHints: {
        enabled: true,
        cycle: true,
      },
      suggest: {
        showWords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showInterfaces: true,
        showIssues: true,
        showModules: true,
        showProperties: true,
        showReferences: true,
        showStructs: true,
        showTypeParameters: true,
      },
      fontSize: 18,
      lineHeight: 32,
      fontFamily: "'JetBrains Mono', monospace",
      fontLigatures: true,
      cursorStyle: "block",
      lineNumbers: "on",
      lineNumbersMinChars: 1,
      renderLineHighlight: "all",
      automaticLayout: true,
      wordWrap: "off",
      minimap: { enabled: true, scale: 50 },
      scrollBeyondLastLine: false,
      glyphMargin: true,
      folding: true,
      tabSize: 2,
      insertSpaces: true,
      snippetSuggestions: "top",
      formatOnPaste: true,
      formatOnType: true,
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true, indentation: true },
      stickyScroll: { enabled: true },
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      // Performance optimizations
      renderWhitespace: "selection",
      renderControlCharacters: false,
      occurrencesHighlight: "singleFile",
      selectionHighlight: true,
      codeLens: false,
      links: false,
      // NEW: Enhanced formatting options
      autoIndent: "full",
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      autoSurround: "languageDefined",
      // Add TypeScript-specific formatting
      tabCompletion: "on",
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: "on",
    });

    // Ctrl+S → save
    editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.KeyS, () => handleSave());

    // Ctrl+Shift+F → Format document
    editor.addCommand(
      m.KeyMod.CtrlCmd | m.KeyMod.Shift | m.KeyCode.KeyF,
      () => {
        formatDocument().then(() => {
          setLogs((prev) => [...prev, `🎨 Formatted document`]);
        });
      },
    );

    // Ctrl+Q → close active tab
    editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Period, () => {
      if (activeTabId) {
        setTabs((prev) => {
          const next = prev.filter((t) => t.fileId !== activeTabId);
          const idx = prev.findIndex((t) => t.fileId === activeTabId);
          const fallback = next[idx] ?? next[idx - 1] ?? null;
          setActiveTabId(fallback?.fileId ?? null);
          return next;
        });
        return null;
      }
    });

    window.addEventListener("keydown", handleGlobalKeys, true);
    disposablesRef.current.push({
      dispose: () => window.removeEventListener("keydown", handleGlobalKeys),
    });

    // Open initial file
    if (activeTabId) {
      const node = fsRef.current.nodes[activeTabId];
      if (node?.type === "file") {
        const model = getOrCreateModel(
          activeTabId,
          node.content ?? "",
          langFromName(node.name),
          m,
        );
        editor.setModel(model);
      }
    }
  }

  function handleGlobalKeys(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "q") {
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === ".") {
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "q") {
      e.preventDefault();
    }
  }

  // ── File Operations ───────────────────────────────────────────────────

  function openFile(fileId: FileId) {
    const node = fs.nodes[fileId];
    if (!node || node.type !== "file") return;

    setTabs((prev) => {
      if (prev.find((t) => t.fileId === fileId)) return prev;
      return [...prev, { fileId, dirty: false }];
    });
    setActiveTabId(fileId);
    setSelectedId(fileId);

    const { editor, monaco: m } = editorRef.current ?? {};
    if (editor && m) {
      try {
        const model = getOrCreateModel(
          fileId,
          node.content ?? "",
          langFromName(node.name),
          m,
        );
        editor.setModel(model);
        editor.focus();
      } catch (err) {
        console.error("Error opening file:", err);
      }
    }
  }

  // Sync tab switch with model
  useEffect(() => {
    if (!activeTabId || !editorRef.current) return;
    const { editor, monaco: m } = editorRef.current;
    const node = fs.nodes[activeTabId];
    if (!node || node.type !== "file") return;

    try {
      const model = getOrCreateModel(
        activeTabId,
        node.content ?? "",
        langFromName(node.name),
        m,
      );
      if (editor.getModel() !== model) {
        editor.setModel(model);
      }
      const model2 = editorRef.current.editor.getModel();
      if (
        model2 &&
        (model2.getLanguageId() === "typescript" ||
          model2.getLanguageId() === "javascript")
      ) {
        // Trigger a manual validation
      }
    } catch (err) {
      console.error("Error switching model:", err);
    }
  }, [activeTabId, fs]);

  // Handle save with build
  // Handle save with formatting and build
  async function handleSave() {
    if (!activeTabId || !editorRef.current) return;

    // Format the document before saving
    setLogs((prev) => [...prev, `🎨 Formatting document...`]);
    await formatDocument();

    // Now get the formatted content
    const content = editorRef.current.editor.getValue();
    const currentFs = fsRef.current;
    const filePath = getFilePath(activeTabId);
    const activeName = currentFs.nodes[activeTabId]?.name ?? "file";

    // Compute next FS snapshot synchronously (so remote save uses the same data).
    const nextFs = (() => {
      const node = currentFs.nodes[activeTabId];
      if (!node) return currentFs;
      return {
        ...currentFs,
        nodes: {
          ...currentFs.nodes,
          [activeTabId]: { ...node, content },
        },
      };
    })();

    // Update filesystem with formatted content
    setFs(nextFs);

    setTabs((prev) =>
      prev.map((t) => (t.fileId === activeTabId ? { ...t, dirty: false } : t)),
    );

    setLogs((prev) => [
      ...prev,
      `💾 Saved ${activeName} at ${new Date().toLocaleTimeString()}`,
    ]);

    // Persist snapshot to DB as a new version.
    if (workspaceSlugRef.current) {
      try {
        setIsRemoteBusy(true);
        const saved = await saveWorkspaceVersion({
          slug: workspaceSlugRef.current,
          snapshot: nextFs,
          message: `save: ${activeName}`,
          isAutosave: false,
          clientRequestId: crypto.randomUUID(),
        });
        setRemoteCurrentVersion(saved.version);
        setVersions((prev) => [
          {
            id: saved.id,
            version: saved.version,
            message: saved.message ?? "",
            isAutosave: saved.isAutosave,
            createdAt: saved.createdAt,
            snapshotHash: saved.snapshotHash,
            sizeBytes: saved.sizeBytes,
          },
          ...prev,
        ]);
        setLogs((prev) => [
          ...prev,
          `🗄️ Stored workspace version v${saved.version}`,
        ]);
      } catch (e: any) {
        setLogs((prev) => [
          ...prev,
          `⚠️ Remote save failed: ${e?.message || "unknown error"}`,
        ]);
      } finally {
        setIsRemoteBusy(false);
      }
    }

    // Build after save
    try {
      setLogs((prev) => [...prev, `🔨 Building ${filePath}...`]);
      await buildFile(filePath);
    } catch (error: any) {
      console.error("Build failed:", error);
      setLogs((prev) => [...prev, `❌ Build failed: ${error.message}`]);
    }
  }

  // Replace the existing buildFile function with this:
  // Update the buildFile function
  const buildFile = useCallback(
    async (filePath: string) => {
      if (!buildWorkerRef.current) {
        console.warn("Build worker not created");
        setLogs((prev) => [...prev, "❌ Build system not available"]);
        return;
      }

      if (!isBuildReady) {
        console.warn("Build system not ready yet");
        setLogs((prev) => [
          ...prev,
          "⏳ Build system initializing... Please wait",
        ]);

        await new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (isBuildReady) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 5000);
        });

        if (!isBuildReady) {
          setLogs((prev) => [...prev, "❌ Build system failed to initialize"]);
          return;
        }
      }

      setIsBuilding(true);

      // IMPORTANT: Use fsRef.current to get the LATEST filesystem state
      const currentFs = fsRef.current;
      const allFiles = gatherAllFilesFromFS(currentFs);

      // Log the current state
      console.log("Building with latest filesystem state:");
      Object.entries(allFiles).forEach(([path, content]) => {
        console.log(`  ${path}: ${content.length} chars`);
      });

      setLogs((prev) => [
        ...prev,
        `🎯 Building: ${filePath}`,
        `📦 Available files in workspace: ${Object.keys(allFiles).length}`,
      ]);

      // Send to worker with LATEST files
      buildWorkerRef.current.postMessage({
        type: "build",
        data: {
          entryPoint: filePath,
          files: allFiles,
        },
      });
    },
    [isBuildReady],
  );

  // Add this helper function to gather files from a specific FS state
  function gatherAllFilesFromFS(fsState: FileSystem): Record<string, string> {
    const allFiles: Record<string, string> = {};

    Object.entries(fsState.nodes).forEach(([id, node]) => {
      if (node.type === "file" && node.content !== undefined) {
        const path = getFilePathFromFS(id, fsState);
        allFiles[path] = node.content;
      }
    });

    return allFiles;
  }

  // Update getFilePath to accept optional fs parameter
  function getFilePathFromFS(fileId: FileId, fsState?: FileSystem): string {
    const parts: string[] = [];
    let current: FileId | null = fileId;
    const fs = fsState || fsRef.current;

    while (current) {
      const node = fs.nodes[current];
      if (!node) break;
      parts.unshift(node.name);
      current = node.parentId;
    }

    return "/" + parts.join("/");
  }
  // Debounced editor change handler
  const handleEditorChange = useCallback(
    (fileId: string, value: string | undefined) => {
      if (value === undefined) return;

      // Mark tab as dirty
      setTabs((prev) =>
        prev.map((t) => (t.fileId === fileId ? { ...t, dirty: true } : t)),
      );

      // Save content to filesystem immediately
      setFs((prev) => {
        const node = prev.nodes[fileId];
        if (!node || node.type !== "file") return prev;
        return {
          ...prev,
          nodes: { ...prev.nodes, [fileId]: { ...node, content: value } },
        };
      });
    },
    [],
  );

  // Handle run with compiled code - UPDATED to use local eval
  async function handleRun() {
    if (!activeTabId) return;

    const currentFs = fsRef.current;
    const filePath = getFilePath(activeTabId);
    const fileName = currentFs.nodes[activeTabId]?.name || "unknown";

    setLogs((prev) => [
      ...prev,
      `\n${"=".repeat(50)}`,
      `▶️ RUN: ${fileName}`,
      `⏰ Time: ${new Date().toLocaleTimeString()}`,
      `${"=".repeat(50)}`,
    ]);

    try {
      // Step 1: Save all files before building
      if (editorRef.current) {
        try {
          // Save current editor content
          const editorContent = editorRef.current.editor.getValue();
          setFs((prev) => {
            const node = prev.nodes[activeTabId];
            if (!node || node.type !== "file") return prev;
            return {
              ...prev,
              nodes: {
                ...prev.nodes,
                [activeTabId]: { ...node, content: editorContent },
              },
            };
          });

          // Save all other dirty tabs
          for (const tab of tabs) {
            if (tab.fileId !== activeTabId && tab.dirty) {
              const model = modelsRef.current[tab.fileId];
              if (model && !model.isDisposed()) {
                const content = model.getValue();
                setFs((prev) => {
                  const node = prev.nodes[tab.fileId];
                  if (!node || node.type !== "file") return prev;
                  return {
                    ...prev,
                    nodes: {
                      ...prev.nodes,
                      [tab.fileId]: { ...node, content },
                    },
                  };
                });
              }
            }
          }

          setLogs((prev) => [...prev, `💾 All files saved`]);
        } catch (err) {
          console.error("Error saving before run:", err);
        }
      }

      // Step 2: Wait for React state to update
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 3: Clear old cache for this file
      try {
        const stored = JSON.parse(
          localStorage.getItem("compiled-code") || "{}",
        );
        if (stored[filePath]) {
          delete stored[filePath];
          localStorage.setItem("compiled-code", JSON.stringify(stored));
          console.log("Cleared old cache for:", filePath);
        }
      } catch (err) {
        console.error("Error clearing cache:", err);
      }

      // Step 4: Build the file
      setLogs((prev) => [...prev, `🔨 Building with latest content...`]);
      await buildFile(filePath);

      // Step 5: Wait for build to complete by polling isBuilding
      await new Promise((resolve) => {
        const startTime = Date.now();
        const checkBuild = setInterval(() => {
          // Check if building is done
          if (!isBuilding) {
            clearInterval(checkBuild);
            console.log("Build completed after:", Date.now() - startTime, "ms");
            resolve(null);
          }
          // Timeout after 15 seconds
          if (Date.now() - startTime > 15000) {
            clearInterval(checkBuild);
            console.warn("Build timeout after 15 seconds");
            resolve(null);
          }
        }, 50);
      });

      // Step 6: Small additional delay to ensure localStorage is updated
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Step 7: Get the compiled code
      let codeToRun = "";

      try {
        const stored = JSON.parse(
          localStorage.getItem("compiled-code") || "{}",
        );
        console.log("All compiled code entries:", Object.keys(stored));

        const compiled = stored[filePath];
        console.log("Looking for compiled code at:", filePath);
        console.log("Compiled code found:", compiled ? "YES" : "NO");

        if (compiled && compiled.code && compiled.code.length > 0) {
          const age = ((Date.now() - compiled.timestamp) / 1000).toFixed(1);
          const isRecent = Date.now() - compiled.timestamp < 30000; // 30 seconds

          console.log("Compiled code age:", age, "seconds");
          console.log("Compiled code length:", compiled.code.length);
          console.log(
            "Compiled code preview:",
            compiled.code.substring(0, 200),
          );

          if (isRecent) {
            codeToRun = compiled.code;
            setLogs((prev) => [
              ...prev,
              `✅ Using compiled code (${compiled.code.length} chars, built ${age}s ago)`,
            ]);
          } else {
            console.warn("Compiled code is too old:", age, "seconds");
            setLogs((prev) => [
              ...prev,
              `⚠️ Compiled code is ${age}s old, rebuilding...`,
            ]);

            // Force rebuild
            await buildFile(filePath);
            await new Promise((resolve) => {
              const checkBuild = setInterval(() => {
                if (!isBuilding) {
                  clearInterval(checkBuild);
                  resolve(null);
                }
              }, 50);
              setTimeout(() => {
                clearInterval(checkBuild);
                resolve(null);
              }, 15000);
            });
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Try again
            const freshStored = JSON.parse(
              localStorage.getItem("compiled-code") || "{}",
            );
            const freshCompiled = freshStored[filePath];

            if (
              freshCompiled &&
              freshCompiled.code &&
              freshCompiled.code.length > 0
            ) {
              codeToRun = freshCompiled.code;
              setLogs((prev) => [
                ...prev,
                `✅ Using fresh compiled code (${freshCompiled.code.length} chars)`,
              ]);
            }
          }
        } else {
          console.warn("No compiled code found in localStorage");

          // Try alternative paths (with/without leading slash)
          const altPath = filePath.startsWith("/")
            ? filePath.substring(1)
            : "/" + filePath;
          const altCompiled = stored[altPath];

          if (altCompiled && altCompiled.code && altCompiled.code.length > 0) {
            console.log("Found compiled code at alternate path:", altPath);
            codeToRun = altCompiled.code;
            setLogs((prev) => [
              ...prev,
              `✅ Found compiled code at alternate path`,
            ]);
          } else {
            console.warn("No compiled code at alternate path either:", altPath);
          }
        }
      } catch (err) {
        console.error("Error reading compiled code:", err);
      }

      // Step 8: If no compiled code, use source as fallback
      if (!codeToRun || codeToRun.length === 0) {
        const fsNow = fsRef.current;
        codeToRun = fsNow.nodes[activeTabId]?.content || "";
        setLogs((prev) => [
          ...prev,
          `⚠️ No compiled code available, using source (${codeToRun.length} chars)`,
        ]);
        console.log("Using source code:", codeToRun.substring(0, 200));
      }

      // Step 9: Check if code still contains imports
      if (codeToRun.includes("import ") || codeToRun.includes("export ")) {
        console.error("Code still contains imports/exports!");
        setLogs((prev) => [
          ...prev,
          `⚠️ Code contains imports! Build may have failed.`,
          `📝 Code preview: ${codeToRun.substring(0, 100)}...`,
        ]);

        // Try to run anyway if it's a simple import
        if (codeToRun.trim().startsWith("import ")) {
          setLogs((prev) => [
            ...prev,
            `🔄 Attempting to extract code after imports...`,
          ]);
          // Try to extract code after imports for simple cases
          const lines = codeToRun.split("\n");
          const nonImportLines = lines.filter(
            (line) =>
              !line.trim().startsWith("import ") &&
              !line.trim().startsWith("export "),
          );
          if (nonImportLines.length > 0) {
            codeToRun = nonImportLines.join("\n");
            setLogs((prev) => [
              ...prev,
              `✅ Extracted ${nonImportLines.length} lines of executable code`,
            ]);
          }
        }
      }

      // Step 10: Execute the code
      setLogs((prev) => [...prev, `🔄 Executing...`]);

      try {
        const response = await runCode({
          Code: codeToRun,
        });

        if (response.success) {
          const resultStr =
            typeof response.result === "string"
              ? response.result
              : JSON.stringify(response.result, null, 2);
          setLogs((prev) => [
            ...prev,
            `✅ Execution successful`,
            `📤 Result: ${resultStr}`,
            `${"=".repeat(50)}\n`,
          ]);
        } else {
          setLogs((prev) => [
            ...prev,
            `❌ API Error: ${response.error ?? "Unknown error"}`,
          ]);
          setLogs((prev) => [
            ...prev,
            `🔄 Falling back to local evaluation...`,
          ]);
          const localResult = localEval(codeToRun);
          setLogs((prev) => [...prev, ` Local Result: \n ${localResult}`]);
        }
      } catch (apiError: any) {
        setLogs((prev) => [
          ...prev,
          `⚠️ API unavailable: ${apiError.message}`,
          `🔄 Running locally...`,
        ]);
        const localResult = localEval(codeToRun);
        setLogs((prev) => [...prev, `🔧 Local Result: ${localResult}`]);
      }
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        `🔥 Error: ${err.message || "Unknown error"}`,
        `${"=".repeat(50)}\n`,
      ]);

      try {
        const sourceCode = fsRef.current.nodes[activeTabId]?.content || "";
        const localResult = localEval(sourceCode);
        setLogs((prev) => [...prev, `🔧 Fallback Result: ${localResult}`]);
      } catch (evalError: any) {
        setLogs((prev) => [
          ...prev,
          `❌ Complete failure: ${evalError.message}`,
        ]);
      }
    }
  }

  function closeTab(fileId: FileId, e: React.MouseEvent) {
    e.stopPropagation();

    // If this is the active tab and editor exists, get current content
    if (fileId === activeTabId && editorRef.current) {
      try {
        const content = editorRef.current.editor.getValue();
        setFs((prev) => {
          const node = prev.nodes[fileId];
          if (!node || node.type !== "file") return prev;
          return {
            ...prev,
            nodes: { ...prev.nodes, [fileId]: { ...node, content } },
          };
        });
      } catch (err) {
        console.error("Error saving before close:", err);
      }
    }

    setTabs((prev) => {
      const next = prev.filter((t) => t.fileId !== fileId);
      if (activeTabId === fileId) {
        const idx = prev.findIndex((t) => t.fileId === fileId);
        const fallback = next[idx] ?? next[idx - 1] ?? null;
        setActiveTabId(fallback?.fileId ?? null);
      }
      return next;
    });
  }

  function handleReorderTabs(newTabs: Tab[]) {
    setTabs(newTabs);
  }

  // ── Tree Operations ───────────────────────────────────────────────────
  function toggleExpand(id: FileId) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  function handleMoveNode(nodeId: FileId, newParentId: FileId | null) {
    setFs((prev) => {
      const newFs = moveNode(prev, nodeId, newParentId);
      // If moving to a folder, auto-expand it
      if (newParentId) {
        setExpanded((prev) => new Set(prev).add(newParentId));
      }
      return newFs;
    });
  }

  // ── Context Menu ──────────────────────────────────────────────────────

  function openCtxMenu(e: React.MouseEvent, nodeId: FileId | null) {
    ctxNodeRef.current = nodeId;
    setCtxMenu({ x: e.clientX, y: e.clientY, nodeId });
  }

  function ctxNewFile() {
    const nodeId = ctxNodeRef.current;
    const node = nodeId ? fs.nodes[nodeId] : null;

    const parentId = !node
      ? null
      : node.type === "folder"
        ? node.id
        : node.parentId;

    const depth = parentId ? getDepth(fs, parentId) + 1 : 0;

    if (parentId) {
      setExpanded((prev) => new Set(prev).add(parentId));
    }

    setCreating({ parentId, type: "file", depth });
  }

  function ctxNewFolder() {
    const nodeId = ctxNodeRef.current;
    const node = nodeId ? fs.nodes[nodeId] : null;

    const parentId = !node
      ? null
      : node.type === "folder"
        ? node.id
        : node.parentId;

    const depth = parentId ? getDepth(fs, parentId) + 1 : 0;

    if (parentId) {
      setExpanded((prev) => new Set(prev).add(parentId));
    }

    setCreating({ parentId, type: "folder", depth });
  }

  function ctxRename() {
    const nodeId = ctxNodeRef.current;
    if (nodeId) setEditingId(nodeId);
  }

  function ctxDelete() {
    const nodeId = ctxNodeRef.current;
    if (!nodeId) return;
    setFs((prev) => deleteNode(prev, nodeId));
    setTabs((prev) => prev.filter((t) => t.fileId !== nodeId));
    if (activeTabId === nodeId) setActiveTabId(null);
  }

  function commitCreate(name: string) {
    if (!creating || !name) {
      setCreating(null);
      return;
    }
    const id = uid();
    const node: FileNode = {
      id,
      name,
      type: creating.type,
      parentId: creating.parentId,
      content: creating.type === "file" ? "" : undefined,
    };
    setFs((prev) => {
      const nodes = { ...prev.nodes, [id]: node };
      const rootIds =
        creating.parentId === null ? [...prev.rootIds, id] : prev.rootIds;
      return { nodes, rootIds };
    });
    setCreating(null);
    if (creating.type === "file") {
      setTimeout(() => openFile(id), 50);
    }
  }

  function commitRename(id: FileId, name: string) {
    if (!name) {
      setEditingId(null);
      return;
    }
    setFs((prev) => ({
      ...prev,
      nodes: { ...prev.nodes, [id]: { ...prev.nodes[id], name } },
    }));
    setEditingId(null);
    const { monaco: m } = editorRef.current ?? {};
    if (m && modelsRef.current[id]) {
      try {
        if (!modelsRef.current[id].isDisposed()) {
          m.editor.setModelLanguage(modelsRef.current[id], langFromName(name));
        }
      } catch (e) {
        console.log(e);
        // Model might be disposed, ignore
      }
    }
  }

  // ── Derived State ─────────────────────────────────────────────────────

  const ctxNodeType: "file" | "folder" | "root" = ctxMenu?.nodeId
    ? (fs.nodes[ctxMenu.nodeId]?.type ?? "file")
    : "root";

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div
      dir="ltr"
      className="flex w-full overflow-hidden font-mono"
      style={{
        height: "calc(100vh - 7rem)",
        background: "#1e1e1e",
        color: "#cccccc",
      }}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest(".explorer-tree")) {
          e.preventDefault();
          openCtxMenu(e, null);
        }
      }}
    >
      <ActivityBar
        explorerOpen={explorerOpen}
        onToggleExplorer={() => setExplorerOpen((v) => !v)}
      />

      <AnimatePresence initial={false}>
        {explorerOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col bg-[#252526] border-r border-[#1e1e1e] shrink-0 overflow-hidden"
            style={{ width: 220 }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
              <span className="text-[11px] font-bold tracking-widest text-[#bbbbbb] uppercase">
                Explorer
              </span>
              <div className="flex items-center gap-0.5">
                <ActionBtn
                  title="New File"
                  onClick={() => {
                    ctxNodeRef.current = null;
                    setCreating({ parentId: null, type: "file", depth: 0 });
                  }}
                >
                  <Icon.NewFile />
                </ActionBtn>
                <ActionBtn
                  title="New Folder"
                  onClick={() => {
                    ctxNodeRef.current = null;
                    setCreating({ parentId: null, type: "folder", depth: 0 });
                  }}
                >
                  <Icon.NewFolder />
                </ActionBtn>
                <ActionBtn title="Collapse All" onClick={collapseAll}>
                  <Icon.CollapseAll />
                </ActionBtn>
              </div>
            </div>

            <div className="px-3 py-1 text-[11px] text-[#bbb] uppercase tracking-widest font-semibold">
              Project
            </div>

            <FileTree
              fs={fs}
              expanded={expanded}
              selectedId={selectedId}
              editingId={editingId}
              creating={creating}
              onToggle={toggleExpand}
              onSelect={openFile}
              onContextMenu={(e, id) => {
                e.preventDefault();
                e.stopPropagation();
                openCtxMenu(e, id);
              }}
              onRenameCommit={commitRename}
              onRenameCancel={() => setEditingId(null)}
              onCommitCreate={commitCreate}
              onCancelCreate={() => setCreating(null)}
              onMove={handleMoveNode}
              onCollapseAll={collapseAll}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col flex-1 min-w-0">
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          fs={fs}
          onSelectTab={openFile}
          onCloseTab={closeTab}
          onSave={handleSave}
          onToggleVersions={() => setVersionsOpen((v) => !v)}
          onRun={handleRun}
          onToggleConsole={() => setShowConsole((v) => !v)}
        />

        {/* Build status indicator */}
        {isBuilding && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-600/20 text-yellow-400 text-xs border-b border-yellow-600/30">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-400 border-t-transparent" />
            <span>Building...</span>
          </div>
        )}

        <EditorPanel
          tabs={tabs}
          activeTabId={activeTabId}
          fs={fs}
          showConsole={showConsole}
          logs={logs}
          onClearConsole={() => setLogs([])}
          onEditorDidMount={handleEditorDidMount}
          onEditorChange={handleEditorChange}
        />

        {versionsOpen && (
          <div className="absolute right-0 top-9 bottom-0 w-[340px] border-l border-[#1e1e1e] bg-[#1e1e1e] text-[#cccccc] z-30 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#252526]">
              <div className="text-xs">
                <div className="font-semibold">Versions</div>
                <div className="text-[#858585]">Current: v{remoteCurrentVersion}</div>
              </div>
              <button
                className="text-[#858585] hover:text-[#cccccc] text-xs"
                onClick={() => setVersionsOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {versions.length === 0 ? (
                <div className="p-3 text-xs text-[#858585]">No saved versions yet.</div>
              ) : (
                <div className="divide-y divide-[#252526]">
                  {versions.map((v) => (
                    <button
                      key={v.id}
                      className="w-full text-left px-3 py-2 hover:bg-[#252526] transition-colors"
                      onClick={async () => {
                        try {
                          setIsRemoteBusy(true);
                          const data = await fetchWorkspaceVersionSnapshot(
                            workspaceSlugRef.current,
                            v.version,
                          );
                          const parsed = JSON.parse(data.snapshot);
                          setFs(parsed);
                          setTabs([]);
                          setActiveTabId(null);
                          setSelectedId(null);
                          setExpanded(new Set(Array.isArray(parsed.rootIds) ? parsed.rootIds : []));
                          setRemoteCurrentVersion(v.version);
                          setVersionsOpen(false);
                          setLogs((prev) => [
                            ...prev,
                            `⏪ Checked out workspace version v${v.version}`,
                          ]);
                        } catch (e: any) {
                          setLogs((prev) => [
                            ...prev,
                            `❌ Checkout failed: ${e?.message || "unknown error"}`,
                          ]);
                        } finally {
                          setIsRemoteBusy(false);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold">v{v.version}</div>
                        <div className="text-[11px] text-[#858585]">
                          {new Date(v.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-[11px] text-[#858585] truncate">
                        {v.message || (v.isAutosave ? "autosave" : "save")}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-3 py-2 border-t border-[#252526] text-[11px] text-[#858585]">
              {isRemoteBusy ? "Syncing..." : " "}
            </div>
          </div>
        )}
      </div>

      {ctxMenu && (
        <ContextMenu
          menu={ctxMenu}
          nodeType={ctxNodeType}
          onClose={() => setCtxMenu(null)}
          onNewFile={ctxNewFile}
          onNewFolder={ctxNewFolder}
          onRename={ctxRename}
          onDelete={ctxDelete}
        />
      )}
    </div>
  );
}
