import React, { useCallback, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { type FileSystem, type FileId } from "./types";
import { langFromName } from "./helpers";
import Console from "./Console";

interface EditorPanelProps {
  tabs: { fileId: FileId; dirty: boolean }[];
  activeTabId: FileId | null;
  fs: FileSystem;
  showConsole: boolean;
  logs: string[];
  onClearConsole: () => void;
  onEditorDidMount: (
    editor: monaco.editor.IStandaloneCodeEditor,
    m: typeof monaco,
  ) => void;
  onEditorChange: (fileId: string, value: string | undefined) => void;
}

export default function EditorPanel({
  tabs,
  activeTabId,
  fs,
  showConsole,
  logs,
  onClearConsole,
  onEditorDidMount,
  onEditorChange,
}: EditorPanelProps) {
  // In EditorPanel.tsx or wherever Monaco is mounted
  useEffect(() => {
    // This ensures the DOM node exists before mounting editor
    const container = document.getElementById("editor-container");
    if (!container) {
      console.warn("Editor container not found");
      return;
    }

    // Mount editor logic here...
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (activeTabId) {
        onEditorChange(activeTabId, value);
      }
    },
    [activeTabId, onEditorChange],
  );

  // Get the language for the active file
  const getLanguage = () => {
    if (!activeTabId) return "typescript";
    const node = fs.nodes[activeTabId];
    return node ? langFromName(node.name) : "typescript";
  };

  // Get the content for the active file
  const getValue = () => {
    if (!activeTabId) return "";
    const node = fs.nodes[activeTabId];
    return node?.type === "file" ? (node.content ?? "") : "";
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      {tabs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-[#3c3c3c] select-none gap-3">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect
              x="8"
              y="6"
              width="26"
              height="36"
              rx="3"
              stroke="#3c3c3c"
              strokeWidth="2"
            />
            <path
              d="M26 6v10h10"
              stroke="#3c3c3c"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[13px]">Open a file from the explorer</span>
        </div>
      ) : (
        <Editor
          onMount={onEditorDidMount}
          onChange={handleChange}
          value={getValue()}
          language={getLanguage()}
          theme="vscode-dark"
          className="h-full font-jetbrains"
        />
      )}

      <Console show={showConsole} logs={logs} onClear={onClearConsole} />
    </div>
  );
}
