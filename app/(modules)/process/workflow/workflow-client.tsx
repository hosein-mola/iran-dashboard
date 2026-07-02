'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import Link from 'next/link'
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Activity,
  Braces,
  Check,
  Circle,
  Code2,
  Diamond,
  GitBranch,
  GitMerge,
  Hourglass,
  ListChecks,
  Maximize2,
  Minimize2,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Timer,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { nanoid } from 'nanoid'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

type WorkflowNodeKind =
  | 'trigger'
  | 'debug'
  | 'runCode'
  | 'approval'
  | 'parallelApproval'
  | 'join'
  | 'sla'
  | 'result'

type WorkflowNodeData = {
  kind: WorkflowNodeKind
  label: string
  description?: string
  approver?: string
  approvers?: string
  quorum?: number
  timeoutMs?: number
  backupApprover?: string
  defaultDecision?: 'approve' | 'reject'
  waitMs?: number
  result?: 'approved' | 'rejected'
  code?: string
}

type WorkflowDefinition = {
  key: string
  definition: {
    name: string
    description: string
    nodes: {
      id: string
      kind: WorkflowNodeKind
      label: string
      config?: Record<string, unknown>
    }[]
    edges: {
      id: string
      source: string
      target: string
      sourceHandle: string
    }[]
  }
}

type PaletteItem = {
  kind: WorkflowNodeKind
  label: string
  description: string
  icon: LucideIcon
  tone: string
}

const palette: PaletteItem[] = [
  {
    kind: 'trigger',
    label: 'Form submitted',
    description: 'Starting point for a submitted form.',
    icon: Circle,
    tone: 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  },
  {
    kind: 'approval',
    label: 'Single approval',
    description: 'One approver can approve or reject.',
    icon: UserCheck,
    tone: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  },
  {
    kind: 'parallelApproval',
    label: 'Parallel approval',
    description: 'Several approvers with quorum.',
    icon: Users,
    tone: 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-200',
  },
  {
    kind: 'runCode',
    label: 'Policy decision',
    description: 'Code returns approve or reject.',
    icon: Code2,
    tone: 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-200',
  },
  {
    kind: 'join',
    label: 'Join',
    description: 'Merge accepted paths.',
    icon: GitMerge,
    tone: 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200',
  },
  {
    kind: 'sla',
    label: 'SLA wait',
    description: 'Durable wait before continuing.',
    icon: Hourglass,
    tone: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  },
  {
    kind: 'debug',
    label: 'Debug log',
    description: 'Add an inspection event.',
    icon: ListChecks,
    tone: 'border-slate-500 bg-slate-500/10 text-slate-700 dark:text-slate-200',
  },
  {
    kind: 'result',
    label: 'Result',
    description: 'Approved or rejected terminal state.',
    icon: Diamond,
    tone: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-200',
  },
]

const sampleCode = `export function run(input, ctx) {
  const amount = Number(input.formData.amount ?? 0);
  const approved = amount <= 50000000 && input.formData.forceReject !== true;

  return {
    decision: approved ? "approve" : "reject",
    approved,
    reason: approved ? "Auto policy passed" : "Needs rejection by policy",
    amount
  };
}`

const sampleFormData = {
  title: 'Laptop purchase',
  amount: 42000000,
  department: 'Operations',
  forceReject: false,
}

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: 'start',
    type: 'workflowNode',
    position: { x: 40, y: 160 },
    data: {
      kind: 'trigger',
      label: 'Form submitted',
      description: 'Request enters circulation.',
    },
  },
  {
    id: 'policy-code',
    type: 'workflowNode',
    position: { x: 330, y: 160 },
    data: {
      kind: 'runCode',
      label: 'Run policy code',
      description: 'Auto approve small requests.',
      code: sampleCode,
    },
  },
  {
    id: 'manager-approval',
    type: 'workflowNode',
    position: { x: 650, y: 60 },
    data: {
      kind: 'approval',
      label: 'Manager approval',
      approver: 'manager',
      timeoutMs: 300000,
      backupApprover: 'director',
      defaultDecision: 'reject',
    },
  },
  {
    id: 'parallel-approval',
    type: 'workflowNode',
    position: { x: 960, y: 60 },
    data: {
      kind: 'parallelApproval',
      label: 'Finance and legal approval',
      approvers: 'finance, legal',
      quorum: 2,
      timeoutMs: 300000,
      backupApprover: 'cfo',
      defaultDecision: 'reject',
    },
  },
  {
    id: 'join',
    type: 'workflowNode',
    position: { x: 1270, y: 60 },
    data: {
      kind: 'join',
      label: 'Join approvals',
    },
  },
  {
    id: 'sla-wait',
    type: 'workflowNode',
    position: { x: 1540, y: 60 },
    data: {
      kind: 'sla',
      label: 'SLA durable wait',
      waitMs: 1000,
    },
  },
  {
    id: 'approved',
    type: 'workflowNode',
    position: { x: 1840, y: 60 },
    data: {
      kind: 'result',
      label: 'Approved',
      result: 'approved',
    },
  },
  {
    id: 'rejected',
    type: 'workflowNode',
    position: { x: 960, y: 320 },
    data: {
      kind: 'result',
      label: 'Rejected',
      result: 'rejected',
    },
  },
]

const initialEdges: Edge[] = [
  edge('start', 'policy-code', 'next'),
  edge('policy-code', 'manager-approval', 'approve'),
  edge('policy-code', 'rejected', 'reject'),
  edge('manager-approval', 'parallel-approval', 'approve'),
  edge('manager-approval', 'rejected', 'reject'),
  edge('parallel-approval', 'join', 'approve'),
  edge('parallel-approval', 'rejected', 'reject'),
  edge('join', 'sla-wait', 'next'),
  edge('sla-wait', 'approved', 'next'),
]

function edge(source: string, target: string, sourceHandle: string): Edge {
  return {
    id: `${source}-${sourceHandle}-${target}`,
    source,
    target,
    sourceHandle,
    type: 'smoothstep',
    animated: sourceHandle !== 'reject',
    label: sourceHandle,
    style: {
      stroke: sourceHandle === 'reject' ? '#e11d48' : '#0f766e',
      strokeWidth: 2,
    },
    labelStyle: { fontWeight: 700 },
  }
}

function defaultData(kind: WorkflowNodeKind, count: number): WorkflowNodeData {
  const item = palette.find((entry) => entry.kind === kind)
  const label = item?.label ?? `Step ${count}`

  if (kind === 'approval') {
    return {
      kind,
      label,
      approver: 'manager',
      timeoutMs: 300000,
      backupApprover: 'director',
      defaultDecision: 'reject',
    }
  }

  if (kind === 'parallelApproval') {
    return {
      kind,
      label,
      approvers: 'finance, legal',
      quorum: 2,
      timeoutMs: 300000,
      backupApprover: 'cfo',
      defaultDecision: 'reject',
    }
  }

  if (kind === 'runCode') {
    return { kind, label, description: 'Branch by code result.', code: sampleCode }
  }

  if (kind === 'sla') return { kind, label, waitMs: 1000 }
  if (kind === 'debug') return { kind, label, description: 'Inspect workflow context.' }
  if (kind === 'result') return { kind, label, result: 'approved' }
  return { kind, label }
}

function buildDefinition(
  definitionKey: string,
  definitionName: string,
  definitionDescription: string,
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): WorkflowDefinition {
  return {
    key: definitionKey,
    definition: {
      name: definitionName,
      description: definitionDescription,
      nodes: nodes.map((node) => ({
        id: node.id,
        kind: node.data.kind,
        label: node.data.label,
        config: nodeConfig(node.data),
      })),
      edges: edges.map((item) => ({
        id: item.id,
        source: item.source,
        target: item.target,
        sourceHandle: String(item.sourceHandle ?? 'next'),
      })),
    },
  }
}

function nodeConfig(data: WorkflowNodeData) {
  if (data.kind === 'approval') {
    return cleanConfig({
      approver: data.approver,
      timeoutMs: data.timeoutMs,
      backupApprover: data.backupApprover,
      defaultDecision: data.defaultDecision,
    })
  }

  if (data.kind === 'parallelApproval') {
    return cleanConfig({
      approvers: splitCsv(data.approvers),
      quorum: data.quorum,
      timeoutMs: data.timeoutMs,
      backupApprover: data.backupApprover,
      defaultDecision: data.defaultDecision,
    })
  }

  if (data.kind === 'runCode') {
    return {
      codeName: `${slug(data.label)}-policy`,
      codeVersion: '1.0.0',
      functionName: 'run',
      timeoutMs: data.timeoutMs ?? 10000,
      code: data.code ?? sampleCode,
    }
  }

  if (data.kind === 'sla') return cleanConfig({ waitMs: data.waitMs ?? 1000 })
  if (data.kind === 'debug') return cleanConfig({ message: data.description })
  return undefined
}

function cleanConfig(config: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== ''
    })
  )
}

function splitCsv(value?: string) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function slug(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'workflow'
  )
}

function WorkflowNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  const item = palette.find((entry) => entry.kind === data.kind) ?? palette[0]
  const Icon = item.icon
  const canBranch =
    data.kind === 'approval' ||
    data.kind === 'parallelApproval' ||
    data.kind === 'runCode'
  const hasOutput = data.kind !== 'result'

  return (
    <div
      className={`w-[230px] rounded-lg border bg-card p-3 shadow-sm transition ${
        selected ? 'ring-ring ring-2' : ''
      } ${item.tone}`}
    >
      <Handle type="target" position={Position.Left} className="!size-3 !border-2" />
      <div className="flex items-start gap-2">
        <div className="rounded-md bg-background/80 p-1.5">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{data.label}</div>
          <div className="mt-1 text-[11px] uppercase tracking-normal opacity-75">
            {data.kind}
          </div>
        </div>
      </div>
      {data.description ? (
        <p className="mt-2 line-clamp-2 text-xs opacity-80">{data.description}</p>
      ) : null}
      {data.kind === 'approval' && data.approver ? (
        <Badge className="mt-2" variant="secondary">
          {data.approver}
        </Badge>
      ) : null}
      {data.kind === 'parallelApproval' && data.approvers ? (
        <Badge className="mt-2" variant="secondary">
          {splitCsv(data.approvers).length} approvers
        </Badge>
      ) : null}
      {hasOutput && !canBranch ? (
        <Handle
          id="next"
          type="source"
          position={Position.Right}
          className="!size-3 !border-2 !bg-teal-600"
        />
      ) : null}
      {canBranch ? (
        <>
          <Handle
            id="approve"
            type="source"
            position={Position.Right}
            style={{ top: '35%' }}
            className="!size-3 !border-2 !bg-emerald-600"
          />
          <Handle
            id="reject"
            type="source"
            position={Position.Right}
            style={{ top: '70%' }}
            className="!size-3 !border-2 !bg-rose-600"
          />
        </>
      ) : null}
    </div>
  )
}

export default function WorkflowClient() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilder />
    </ReactFlowProvider>
  )
}

function WorkflowBuilder() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [nodes, setNodes, onNodesChange] =
    useNodesState<WorkflowNodeData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { fitView, project } = useReactFlow()
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodes[0]?.id ?? '')
  const [definitionKey, setDefinitionKey] = useState('purchase-request')
  const [definitionName, setDefinitionName] = useState('Purchase Request Circulation')
  const [definitionDescription, setDefinitionDescription] = useState(
    'Form circulation with policy code, approval, rejection, SLA wait, and final result.'
  )
  const [submitter, setSubmitter] = useState('requester')
  const [formText, setFormText] = useState(() =>
    JSON.stringify(sampleFormData, null, 2)
  )
  const [workflowId, setWorkflowId] = useState('')
  const [status, setStatus] = useState<WorkflowStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showJson, setShowJson] = useState(false)
  const [isVisualFullscreen, setIsVisualFullscreen] = useState(false)

  const nodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), [])
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)
  const definition = useMemo(
    () =>
      buildDefinition(
        definitionKey,
        definitionName,
        definitionDescription,
        nodes,
        edges
      ),
    [definitionDescription, definitionKey, definitionName, edges, nodes]
  )
  const definitionText = useMemo(() => JSON.stringify(definition, null, 2), [definition])
  const pendingApprovals = useMemo(() => {
    return Object.entries(status?.pendingApprovals ?? {}).flatMap(
      ([nodeId, approvers]) =>
        approvers.map((approver) => ({
          nodeId,
          approver,
          nodeLabel:
            status?.events?.find((event) => event.nodeId === nodeId)?.nodeLabel ??
            nodes.find((node) => node.id === nodeId)?.data.label ??
            nodeId,
      }))
    )
  }, [nodes, status])

  const refreshStatus = useCallback(
    async (id = workflowId, showMessage = true) => {
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
    },
    [workflowId]
  )

  useEffect(() => {
    if (!workflowId) return
    const timer = window.setInterval(() => {
      void refreshStatus(workflowId, false)
    }, 2500)
    return () => window.clearInterval(timer)
  }, [refreshStatus, workflowId])

  useEffect(() => {
    if (!isVisualFullscreen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsVisualFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    const timer = window.setTimeout(() => {
      fitView({ padding: 0.2 })
    }, 200)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(timer)
    }
  }, [fitView, isVisualFullscreen])

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceHandle = String(connection.sourceHandle ?? 'next')
      setEdges((items) =>
        addEdge(
          {
            ...connection,
            id: `${connection.source}-${sourceHandle}-${connection.target}-${nanoid(4)}`,
            sourceHandle,
            type: 'smoothstep',
            animated: sourceHandle !== 'reject',
            label: sourceHandle,
            style: {
              stroke: sourceHandle === 'reject' ? '#e11d48' : '#0f766e',
              strokeWidth: 2,
            },
            labelStyle: { fontWeight: 700 },
          },
          items
        )
      )
    },
    [setEdges]
  )

  const onDragStart = (
    event: DragEvent<HTMLButtonElement>,
    kind: WorkflowNodeKind
  ) => {
    event.dataTransfer.setData('application/reactflow', kind)
    event.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const kind = event.dataTransfer.getData(
        'application/reactflow'
      ) as WorkflowNodeKind
      if (!kind || !wrapperRef.current) return
      const bounds = wrapperRef.current.getBoundingClientRect()
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })
      const id = `${kind}-${nanoid(5)}`
      const newNode: Node<WorkflowNodeData> = {
        id,
        type: 'workflowNode',
        position,
        data: defaultData(kind, nodes.length + 1),
      }
      setNodes((items) => items.concat(newNode))
      setSelectedNodeId(id)
    },
    [nodes.length, project, setNodes]
  )

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  function updateSelectedNode(patch: Partial<WorkflowNodeData>) {
    if (!selectedNode) return
    setNodes((items) =>
      items.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, ...patch } }
          : node
      )
    )
  }

  function addNode(kind: WorkflowNodeKind) {
    const id = `${kind}-${nanoid(5)}`
    const newNode: Node<WorkflowNodeData> = {
      id,
      type: 'workflowNode',
      position: { x: 140 + nodes.length * 40, y: 180 + nodes.length * 16 },
      data: defaultData(kind, nodes.length + 1),
    }
    setNodes((items) => items.concat(newNode))
    setSelectedNodeId(id)
  }

  function deleteSelectedNode() {
    if (!selectedNode) return
    setNodes((items) => items.filter((node) => node.id !== selectedNode.id))
    setEdges((items) =>
      items.filter(
        (item) => item.source !== selectedNode.id && item.target !== selectedNode.id
      )
    )
    setSelectedNodeId('')
  }

  function resetBuilder() {
    setNodes(initialNodes)
    setEdges(initialEdges)
    setSelectedNodeId(initialNodes[0]?.id ?? '')
    setStatus(null)
    setWorkflowId('')
    setMessage('Builder reset')
  }

  async function submitWorkflow() {
    setLoading(true)
    setMessage('')
    try {
      const formData = JSON.parse(formText) as Record<string, unknown>
      const response = await fetch('/api/process/workflow/forms/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...definition,
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
            <p className="text-muted-foreground text-sm">Temporal workflow builder</p>
            <h1 className="text-2xl font-bold">Form circulation and approval</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/process/workflow/swagger">
                <Braces className="size-4" />
                Swagger
              </Link>
            </Button>
            <Button variant="outline" onClick={resetBuilder}>
              <RotateCcw className="size-4" />
              Reset
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

      <section className="grid min-h-[760px] gap-4 xl:grid-cols-[260px_minmax(0,1fr)_390px]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="size-5" />
              Steps
            </CardTitle>
            <CardDescription>Drag a step into the canvas or click to add it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {palette.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.kind}
                  className={`w-full rounded-lg border p-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm ${item.tone}`}
                  draggable
                  onDragStart={(event) => onDragStart(event, item.kind)}
                  onClick={() => addNode(item.kind)}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs opacity-80">{item.description}</span>
                </button>
              )
            })}
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="definition-key">Definition key</Label>
              <Input
                id="definition-key"
                value={definitionKey}
                onChange={(event) => setDefinitionKey(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="definition-name">Name</Label>
              <Input
                id="definition-name"
                value={definitionName}
                onChange={(event) => setDefinitionName(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`min-w-0 rounded-lg ${
            isVisualFullscreen
              ? 'bg-background fixed inset-3 z-50 flex flex-col border shadow-2xl md:inset-6'
              : ''
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GitBranch className="size-5" />
                  Visual definition
                </CardTitle>
                <CardDescription>
                  Connect green approve/next handles to the accepted path and red reject
                  handles to rejection.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{nodes.length} nodes</Badge>
                <Badge variant="outline">{edges.length} edges</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setIsVisualFullscreen((value) => !value)}
                >
                  {isVisualFullscreen ? (
                    <Minimize2 className="size-4" />
                  ) : (
                    <Maximize2 className="size-4" />
                  )}
                  {isVisualFullscreen ? 'Exit full screen' : 'Full screen'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent
            className={isVisualFullscreen ? 'min-h-0 flex-1' : 'h-[660px] min-h-0'}
          >
            <div
              ref={wrapperRef}
              className="border-border bg-muted/20 h-full overflow-hidden rounded-lg border"
              onDrop={onDrop}
              onDragOver={onDragOver}
              dir="ltr"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                onPaneClick={() => setSelectedNodeId('')}
                fitView
                defaultEdgeOptions={{ type: 'smoothstep' }}
                proOptions={{ hideAttribution: true }}
              >
                <MiniMap pannable zoomable />
                <Controls />
                <Background gap={18} size={1} />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Tabs defaultValue="properties" className="min-w-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="run">Run</TabsTrigger>
              <TabsTrigger value="json" onClick={() => setShowJson(true)}>
                JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Selected step</CardTitle>
                  <CardDescription>
                    Edit labels, approvers, timeouts, and result behavior.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedNode ? (
                    <>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Input value={selectedNode.data.kind} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="node-label">Label</Label>
                        <Input
                          id="node-label"
                          value={selectedNode.data.label}
                          onChange={(event) =>
                            updateSelectedNode({ label: event.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="node-description">Description / message</Label>
                        <Textarea
                          id="node-description"
                          className="min-h-20"
                          value={selectedNode.data.description ?? ''}
                          onChange={(event) =>
                            updateSelectedNode({ description: event.target.value })
                          }
                        />
                      </div>

                      {selectedNode.data.kind === 'approval' ? (
                        <ApprovalFields
                          data={selectedNode.data}
                          onChange={updateSelectedNode}
                        />
                      ) : null}

                      {selectedNode.data.kind === 'parallelApproval' ? (
                        <ParallelApprovalFields
                          data={selectedNode.data}
                          onChange={updateSelectedNode}
                        />
                      ) : null}

                      {selectedNode.data.kind === 'runCode' ? (
                        <CodeFields data={selectedNode.data} onChange={updateSelectedNode} />
                      ) : null}

                      {selectedNode.data.kind === 'sla' ? (
                        <NumberField
                          id="wait-ms"
                          label="Wait milliseconds"
                          value={selectedNode.data.waitMs ?? 1000}
                          onChange={(value) => updateSelectedNode({ waitMs: value })}
                        />
                      ) : null}

                      {selectedNode.data.kind === 'result' ? (
                        <div className="space-y-2">
                          <Label>Result</Label>
                          <Select
                            value={selectedNode.data.result ?? 'approved'}
                            onValueChange={(value) =>
                              updateSelectedNode({
                                result: value as WorkflowNodeData['result'],
                                label:
                                  value === 'approved'
                                    ? 'Approved'
                                    : value === 'rejected'
                                      ? 'Rejected'
                                      : selectedNode.data.label,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={deleteSelectedNode}
                      >
                        <Trash2 className="size-4" />
                        Delete step
                      </Button>
                    </>
                  ) : (
                    <div className="border-border bg-muted/30 rounded-md border p-3 text-sm text-muted-foreground">
                      Select a step on the canvas to edit it.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="run">
              <RunPanel
                submitter={submitter}
                setSubmitter={setSubmitter}
                formText={formText}
                setFormText={setFormText}
                workflowId={workflowId}
                status={status}
                message={message}
                loading={loading}
                pendingApprovals={pendingApprovals}
                onSubmit={submitWorkflow}
                onRefresh={() => refreshStatus()}
                onApprove={sendApproval}
              />
            </TabsContent>

            <TabsContent value="json">
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Save className="size-5" />
                    Generated definition
                  </CardTitle>
                  <CardDescription>
                    This is the payload sent to the workflow API.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="definition-description">Description</Label>
                    <Textarea
                      id="definition-description"
                      className="min-h-20"
                      value={definitionDescription}
                      onChange={(event) =>
                        setDefinitionDescription(event.target.value)
                      }
                    />
                  </div>
                  <Textarea
                    className="min-h-[460px] font-mono text-xs"
                    value={showJson ? definitionText : ''}
                    readOnly
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}

function ApprovalFields({
  data,
  onChange,
}: {
  data: WorkflowNodeData
  onChange: (patch: Partial<WorkflowNodeData>) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="approver">Approver</Label>
        <Input
          id="approver"
          value={data.approver ?? ''}
          onChange={(event) => onChange({ approver: event.target.value })}
        />
      </div>
      <CommonApprovalFields data={data} onChange={onChange} />
    </>
  )
}

function ParallelApprovalFields({
  data,
  onChange,
}: {
  data: WorkflowNodeData
  onChange: (patch: Partial<WorkflowNodeData>) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="approvers">Approvers</Label>
        <Input
          id="approvers"
          value={data.approvers ?? ''}
          onChange={(event) => onChange({ approvers: event.target.value })}
        />
      </div>
      <NumberField
        id="quorum"
        label="Quorum"
        value={data.quorum ?? 1}
        onChange={(value) => onChange({ quorum: value })}
      />
      <CommonApprovalFields data={data} onChange={onChange} />
    </>
  )
}

function CommonApprovalFields({
  data,
  onChange,
}: {
  data: WorkflowNodeData
  onChange: (patch: Partial<WorkflowNodeData>) => void
}) {
  return (
    <>
      <NumberField
        id="timeout-ms"
        label="Timeout milliseconds"
        value={data.timeoutMs ?? 300000}
        onChange={(value) => onChange({ timeoutMs: value })}
      />
      <div className="space-y-2">
        <Label htmlFor="backup-approver">Backup approver</Label>
        <Input
          id="backup-approver"
          value={data.backupApprover ?? ''}
          onChange={(event) => onChange({ backupApprover: event.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Timeout decision</Label>
        <Select
          value={data.defaultDecision ?? 'reject'}
          onValueChange={(value) =>
            onChange({ defaultDecision: value as 'approve' | 'reject' })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approve">Approve</SelectItem>
            <SelectItem value="reject">Reject</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

function CodeFields({
  data,
  onChange,
}: {
  data: WorkflowNodeData
  onChange: (patch: Partial<WorkflowNodeData>) => void
}) {
  return (
    <>
      <NumberField
        id="code-timeout-ms"
        label="Timeout milliseconds"
        value={data.timeoutMs ?? 10000}
        onChange={(value) => onChange({ timeoutMs: value })}
      />
      <div className="space-y-2">
        <Label htmlFor="policy-code">Policy code</Label>
        <Textarea
          id="policy-code"
          className="min-h-[220px] font-mono text-xs"
          value={data.code ?? sampleCode}
          onChange={(event) => onChange({ code: event.target.value })}
          spellCheck={false}
        />
      </div>
    </>
  )
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

function RunPanel({
  submitter,
  setSubmitter,
  formText,
  setFormText,
  workflowId,
  status,
  message,
  loading,
  pendingApprovals,
  onSubmit,
  onRefresh,
  onApprove,
}: {
  submitter: string
  setSubmitter: (value: string) => void
  formText: string
  setFormText: (value: string) => void
  workflowId: string
  status: WorkflowStatus | null
  message: string
  loading: boolean
  pendingApprovals: { nodeId: string; approver: string; nodeLabel: string }[]
  onSubmit: () => void
  onRefresh: () => void
  onApprove: (
    nodeId: string,
    approver: string,
    decision: 'approve' | 'reject'
  ) => void
}) {
  return (
    <div className="space-y-4">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="size-5" />
            Run workflow
          </CardTitle>
          <CardDescription>Start an instance and approve or reject pending work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <div className="border-border bg-muted/40 rounded-md border px-3 py-2 text-sm">
              {message}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="submitter">Submitter</Label>
            <Input
              id="submitter"
              value={submitter}
              onChange={(event) => setSubmitter(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-data">Form data JSON</Label>
            <Textarea
              id="form-data"
              className="min-h-44 font-mono text-xs"
              value={formText}
              onChange={(event) => setFormText(event.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={onSubmit} disabled={loading}>
              <Play className="size-4" />
              Save and run
            </Button>
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={!workflowId || loading}
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>
          <div className="grid gap-2 text-sm">
            <InfoRow label="Workflow ID" value={workflowId || 'Not started'} />
            <InfoRow label="Status" value={status?.status ?? 'Idle'} />
            <InfoRow label="Step" value={status?.currentStep?.label ?? '-'} />
            <InfoRow label="Activity" value={status?.currentActivity ?? '-'} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="size-5" />
            Pending approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pendingApprovals.length ? (
            pendingApprovals.map((approval) => (
              <div
                key={`${approval.nodeId}-${approval.approver}`}
                className="border-border rounded-md border p-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{approval.approver}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {approval.nodeLabel}
                    </p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      onApprove(approval.nodeId, approval.approver, 'approve')
                    }
                  >
                    <Check className="size-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      onApprove(approval.nodeId, approval.approver, 'reject')
                    }
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No pending approvers.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitMerge className="size-5" />
            Path and events
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
          <div className="max-h-[260px] space-y-2 overflow-auto">
            {(status?.events ?? [])
              .slice()
              .reverse()
              .map((event, index) => (
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
                </div>
              ))}
          </div>
          {status?.result ? (
            <pre className="bg-muted/40 max-h-40 overflow-auto rounded-md p-3 text-xs">
              {JSON.stringify(status.result, null, 2)}
            </pre>
          ) : null}
        </CardContent>
      </Card>
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
