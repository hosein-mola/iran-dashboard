'use client'

import dynamic from 'next/dynamic'

// Monaco should only load on the client.
const CodeEditor = dynamic(() => import('@/components/code-editor'), { ssr: false })

export default function CodeEditorClient() {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden">
      <CodeEditor workspaceSlug="process" />
    </div>
  )
}
