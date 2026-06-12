'use client'

import { Plus } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export type CodeJobWorkspaceOption = {
  id: string
  slug: string
  name: string
  currentVersion: number
  versions: {
    id: string
    version: number
    createdAt: string
    bundleEntries: string[]
  }[]
}

type CodeJobCreateCardProps = {
  workspaces: CodeJobWorkspaceOption[]
  workspaceSlug: string
  version: string
  entryPath: string
  functionName: string
  dataJson: string
  timeoutMs: string
  maxAttempts: string
  priority: string
  isMutating: boolean
  className?: string
  compact?: boolean
  onWorkspaceSlugChange: (value: string) => void
  onVersionChange: (value: string) => void
  onEntryPathChange: (value: string) => void
  onFunctionNameChange: (value: string) => void
  onDataJsonChange: (value: string) => void
  onTimeoutMsChange: (value: string) => void
  onMaxAttemptsChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onSubmit: () => void
}

export function CodeJobCreateCard({
  workspaces,
  workspaceSlug,
  version,
  entryPath,
  functionName,
  dataJson,
  timeoutMs,
  maxAttempts,
  priority,
  isMutating,
  className,
  compact = false,
  onWorkspaceSlugChange,
  onVersionChange,
  onEntryPathChange,
  onFunctionNameChange,
  onDataJsonChange,
  onTimeoutMsChange,
  onMaxAttemptsChange,
  onPriorityChange,
  onSubmit,
}: CodeJobCreateCardProps) {
  const selectedWorkspace =
    workspaces.find((item) => item.slug === workspaceSlug) ?? null
  const selectedVersion =
    selectedWorkspace?.versions.find(
      (item) => String(item.version) === version
    ) ?? null

  const formGridClass = compact ? 'grid gap-2' : 'grid gap-2 sm:grid-cols-2'
  const numericGridClass = compact ? 'grid gap-2' : 'grid gap-2 sm:grid-cols-4'
  const fieldClassName =
    'border-input bg-background h-9 w-full rounded-md border px-3 text-left text-sm outline-none'

  return (
    <Card
      className={cn(
        'border-border/60 bg-card/90 rounded-lg border shadow-sm',
        className
      )}
    >
      <CardHeader className={compact ? 'space-y-1 p-3' : undefined}>
        <CardTitle
          className={
            compact ? 'text-sm font-semibold' : 'text-lg font-semibold'
          }
        >
          ایجاد Job
        </CardTitle>
        <CardDescription className={compact ? 'text-xs' : undefined}>
          اجرای نسخه ذخیره‌شده از باندل پایگاه داده
        </CardDescription>
      </CardHeader>
      <CardContent className={compact ? 'space-y-2 p-3 pt-0' : 'space-y-3'}>
        <div className={formGridClass}>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Workspace</span>
            <select
              dir="ltr"
              className={fieldClassName}
              value={workspaceSlug}
              onChange={(event) => onWorkspaceSlugChange(event.target.value)}
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.slug}>
                  {workspace.name} ({workspace.slug})
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Version</span>
            <select
              dir="ltr"
              className={fieldClassName}
              value={version}
              onChange={(event) => onVersionChange(event.target.value)}
            >
              {selectedWorkspace?.versions.map((item) => (
                <option key={item.id} value={item.version}>
                  v{item.version}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Entry</span>
          <select
            dir="ltr"
            className={fieldClassName}
            value={entryPath}
            onChange={(event) => onEntryPathChange(event.target.value)}
          >
            {selectedVersion?.bundleEntries.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
            {entryPath &&
            !selectedVersion?.bundleEntries.includes(entryPath) ? (
              <option value={entryPath}>{entryPath}</option>
            ) : null}
          </select>
        </label>

        <div className={numericGridClass}>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Function</span>
            <Input
              dir="ltr"
              className="text-left"
              value={functionName}
              onChange={(event) => onFunctionNameChange(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Timeout</span>
            <Input
              dir="ltr"
              className="text-left"
              type="number"
              min={100}
              max={60000}
              value={timeoutMs}
              onChange={(event) => onTimeoutMsChange(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Retry</span>
            <Input
              dir="ltr"
              className="text-left"
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(event) => onMaxAttemptsChange(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Priority</span>
            <Input
              dir="ltr"
              className="text-left"
              type="number"
              min={-100}
              max={100}
              value={priority}
              onChange={(event) => onPriorityChange(event.target.value)}
            />
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Data JSON</span>
          <Textarea
            dir="ltr"
            className={cn(
              'text-left font-mono text-xs',
              compact ? 'min-h-16' : 'min-h-24'
            )}
            value={dataJson}
            onChange={(event) => onDataJsonChange(event.target.value)}
          />
        </label>

        <Button
          type="button"
          className="w-full"
          onClick={onSubmit}
          disabled={
            isMutating ||
            !workspaceSlug ||
            !version ||
            !entryPath ||
            !functionName
          }
        >
          <Plus className="me-2 size-4" />
          ایجاد و اجرا
        </Button>
      </CardContent>
    </Card>
  )
}
