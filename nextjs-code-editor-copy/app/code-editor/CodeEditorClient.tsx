"use client";

import dynamic from "next/dynamic";

// Monaco should only load on the client.
const CodeEditor = dynamic(() => import("../../components/code-editor"), {
  ssr: false,
});

export default function CodeEditorClient() {
  return (
    <div className="h-[calc(100vh-0px)] min-h-[600px] w-full">
      <CodeEditor />
    </div>
  );
}

