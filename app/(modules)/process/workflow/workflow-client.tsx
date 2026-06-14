'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Braces,
  Check,
  GitBranch,
  GitMerge,
  Play,
  RefreshCw,
  Send,
  Timer,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type WorkflowStatus = {
  workflowId: string
  runId: string
  definitionKey: string
  definitionVersion: number
  status: string
  currentStep?: {
    nodeId: string
    label: string
    kind: string
  }
  currentActivity?: string
  pendingApprovals?: Record<string, string[]>
  approvalDecisions?: Record<string, { approver: string; decision: string }[]>
  path?: string[]
  events?: {
    at: string
    nodeId: string
    nodeLabel: string
    nodeKind: string
    event: string
    details?: unknown
  }[]
  result?: unknown
}

const sampleDefinition = {
  key: 'purchase-request',
  definition: {
    name: 'Purchase Request Circulation',
    description: 'Form circulation with debug, code decision, parallel approval, SLA backup, and join.',
    nodes: [
      { id: 'start', kind: 'trigger', label: 'Form submitted' },
      { id: 'debug-start', kind: 'debug', label: 'Inspect submit payload', config: { message: 'Form entered workflow' } },
      {
        id: 'policy-code',
        kind: 'runCode',
        label: 'Run policy code',
        config: {
          codeName: 'purchase-policy',
          codeVersion: '1.0.0',
          functionName: 'run',
          timeoutMs: 10000,
          code: `export function run(input, ctx) {
  ctx.log("policy input", input.formData);
  const amount = Number(input.formData.amount ?? 0);
  const approved = amount <= 50000000 && input.formData.forceReject !== true;
  return {
    decision: approved ? "approve" : "reject",
    approved,
    reason: approved ? "Auto policy passed" : "Needs rejection by policy",
    amount
  };
}`,
        },
      },
      {
        id: 'manager-approval',
        kind: 'approval',
        label: 'Manager approval',
        config: { approver: 'manager', timeoutMs: 300000, backupApprover: 'director', defaultDecision: 'reject' },
      },
      {
        id: 'parallel-approval',
        kind: 'parallelApproval',
        label: 'Finance and legal approval',
        config: { approvers: ['finance', 'legal'], quorum: 2, timeoutMs: 300000, backupApprover: 'cfo', defaultDecision: 'reject' },
      },
      { id: 'join', kind: 'join', label: 'Join approvals' },
      { id: 'sla-wait', kind: 'sla', label: 'SLA durable wait', config: { waitMs: 1000 } },
      { id: 'debug-end', kind: 'debug', label: 'Inspect final context', config: { message: 'Workflow is about to complete' } },
      { id: 'approved', kind: 'result', label: 'Approved' },
      { id: 'rejected', kind: 'result', label: 'Rejected' },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'debug-start', sourceHandle: 'next' },
      { id: 'e2', source: 'debug-start', target: 'policy-code', sourceHandle: 'next' },
      { id: 'e3', source: 'policy-code', target: 'manager-approval', sourceHandle: 'approve' },
      { id: 'e4', source: 'policy-code', target: 'rejected', sourceHandle: 'reject' },
      { id: 'e5', source: 'manager-approval', target: 'parallel-approval', sourceHandle: 'approve' },
      { id: 'e6', source: 'manager-approval', target: 'rejected', sourceHandle: 'reject' },
      { id: 'e7', source: 'parallel-approval', target: 'join', sourceHandle: 'approve' },
      { id: 'e8', source: 'parallel-approval', target: 'rejected', sourceHandle: 'reject' },
      { id: 'e9', source: 'join', target: 'sla-wait', sourceHandle: 'next' },
      { id: 'e10', source: 'sla-wait', target: 'debug-end', sourceHandle: 'next' },
      { id: 'e11', source: 'debug-end', target: 'approved', sourceHandle: 'next' },
    ],
  },
}

const sampleFormData = {
  title: 'Laptop purchase',
  amount: 42000000,
  department: 'Operations',
  forceReject: false,
}

export default function WorkflowClient() {
  const [submitter, setSubmitter] = useState('requester')
  const [definitionText, setDefinitionText] = useState(() =>
    JSON.stringify(sampleDefinition, null, 2)
  )
  const [formText, setFormText] = useState(() =>
    JSON.stringify(sampleFormData, null, 2)
  )
  const [workflowId, setWorkflowId] = useState('')
  const [status, setStatus] = useState<WorkflowStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const pendingApprovals = useMemo(() => {
    return Object.entries(status?.pendingApprovals ?? {}).flatMap(
      ([nodeId, approvers]) =>
        approvers.map((approver) => ({
          nodeId,
          approver,
          nodeLabel:
            status?.events?.find((event) => event.nodeId === nodeId)?.nodeLabel ??
            nodeId,
        }))
    )
  }, [status])

  useEffect(() => {
    if (!workflowId) return
    const timer = window.setInterval(() => {
      void refreshStatus(workflowId, false)
    }, 2500)
    return () => window.clearInterval(timer)
  }, [workflowId])

  async function submitWorkflow() {
    setLoading(true)
    setMessage('')
    try {
      const definition = JSON.parse(definitionText) as unknown
      const formData = JSON.parse(formText) as Record<string, unknown>
      const response = await fetch('/api/process/workflow/forms/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...(definition as object),
          formData,
          submitter,
          correlationId: `dashboard-${Date.now()}`,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Workflow submit failed')
      setWorkflowId(payload.workflowId)
      setMessage(`Started ${payload.workflowId}`)
      await refreshStatus(payload.workflowId, false)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Invalid workflow request')
    } finally {
      setLoading(false)
    }
  }

  async function refreshStatus(id = workflowId, showMessage = true) {
    if (!id) return
    const response = await fetch(
      `/api/process/workflow/instances/${encodeURIComponent(id)}/status`,
      { cache: 'no-store' }
    )
    const payload = await response.json()
    if (!response.ok) {
      if (showMessage) setMessage(payload.error ?? 'Status request failed')
      return
    }
    setStatus(payload)
    if (showMessage) setMessage('Status refreshed')
  }

  async function sendApproval(
    nodeId: string,
    approver: string,
    decision: 'approve' | 'reject'
  ) {
    if (!workflowId) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(
        `/api/process/workflow/instances/${encodeURIComponent(workflowId)}/signals/approval`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            nodeId,
            approver,
            decision,
            comment: `${decision} from dashboard`,
          }),
        }
      )
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Approval signal failed')
      setMessage(`${approver} ${decision} signal sent`)
      await refreshStatus(workflowId, false)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Approval signal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      <header className="border-border/60 bg-card rounded-lg border p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Temporal workflow</p>
            <h1 className="text-2xl font-bold">Form circulation</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/process/workflow/swagger">
                <Braces className="size-4" />
                Swagger
              </Link>
            </Button>
            <Button onClick={() => refreshStatus()} disabled={!workflowId || loading}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button onClick={submitWorkflow} disabled={loading}>
              <Play className="size-4" />
              Save and run
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="size-5" />
                Definition and form
              </CardTitle>
              <CardDescription>
                Save creates a new definition version, then starts a Temporal instance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 sm:max-w-sm">
                <Label htmlFor="submitter">Submitter</Label>
                <Input
                  id="submitter"
                  value={submitter}
                  onChange={(event) => setSubmitter(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="definition">Workflow definition JSON</Label>
                <Textarea
                  id="definition"
                  className="min-h-[360px] font-mono text-xs"
                  value={definitionText}
                  onChange={(event) => setDefinitionText(event.target.value)}
                  spellCheck={false}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="form-data">Form data JSON</Label>
                <Textarea
                  id="form-data"
                  className="min-h-36 font-mono text-xs"
                  value={formText}
                  onChange={(event) => setFormText(event.target.value)}
                  spellCheck={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="size-5" />
                Live instance
              </CardTitle>
              <CardDescription>Current step, activity, approval queue, and result.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message ? (
                <div className="border-border bg-muted/40 rounded-md border px-3 py-2 text-sm">
                  {message}
                </div>
              ) : null}
              <div className="grid gap-3 text-sm">
                <InfoRow label="Workflow ID" value={workflowId || 'Not started'} />
                <InfoRow label="Status" value={status?.status ?? 'Idle'} />
                <InfoRow label="Step" value={status?.currentStep?.label ?? '-'} />
                <InfoRow label="Activity" value={status?.currentActivity ?? '-'} />
                <InfoRow
                  label="Definition"
                  value={
                    status
                      ? `${status.definitionKey} v${status.definitionVersion}`
                      : '-'
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Send className="size-4" />
                  Pending approvals
                </div>
                {pendingApprovals.length ? (
                  <div className="space-y-2">
                    {pendingApprovals.map((approval) => (
                      <div
                        key={`${approval.nodeId}-${approval.approver}`}
                        className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border p-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{approval.approver}</p>
                          <p className="text-muted-foreground text-xs">
                            {approval.nodeLabel}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              sendApproval(
                                approval.nodeId,
                                approval.approver,
                                'approve'
                              )
                            }
                          >
                            <Check className="size-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              sendApproval(
                                approval.nodeId,
                                approval.approver,
                                'reject'
                              )
                            }
                          >
                            <X className="size-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No pending approvers.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitMerge className="size-5" />
                Path and debug log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(status?.path ?? []).map((item, index) => (
                  <Badge key={`${item}-${index}`} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
              <div className="max-h-[420px] space-y-2 overflow-auto">
                {(status?.events ?? []).slice().reverse().map((event, index) => (
                  <div
                    key={`${event.at}-${event.event}-${index}`}
                    className="border-border rounded-md border p-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{event.event}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Timer className="size-3" />
                        {new Date(event.at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {event.nodeLabel} ({event.nodeKind})
                    </p>
                    {event.details ? (
                      <pre className="bg-muted/40 mt-2 overflow-auto rounded p-2">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ))}
              </div>
              {status?.result ? (
                <pre className="bg-muted/40 max-h-48 overflow-auto rounded-md p-3 text-xs">
                  {JSON.stringify(status.result, null, 2)}
                </pre>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border grid gap-1 rounded-md border p-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="break-all font-medium">{value}</span>
    </div>
  )
}
