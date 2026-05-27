'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { nanoid } from 'nanoid'
import { CircuitBoard, Link2, Plus, RefreshCcw } from 'lucide-react'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

type WorkflowStorage = {
  nodes: Node[]
  edges: Edge[]
  counter: number
}

const LOCAL_STORAGE_KEY = 'process-workflow-graph'

const nodeColors: Record<string, string> = {
  start: '#0ea5e9',
  qa: '#22c55e',
  safety: '#f59e0b',
  engineering: '#8b5cf6',
  compliance: '#f43f5e',
  finance: '#10b981',
  director: '#6366f1',
  archive: '#f97316',
}

const decorateNode = (node: Node, fallback?: string): Node => {
  const baseColor = nodeColors[node.id] ?? fallback ?? '#22c55e'
  return {
    ...node,
    style: {
      border: `1px solid ${baseColor}`,
      background: `${baseColor}1a`,
      boxShadow: `0 0 0 1px ${baseColor}33, 0 10px 30px -12px ${baseColor}aa`,
      borderRadius: 12,
      padding: 10,
      color: 'var(--foreground)',
    },
  }
}

const baseSampleNodes: Node[] = [
  decorateNode({
    id: 'start',
    data: { label: 'ارسال فرم سد' },
    position: { x: 0, y: 0 },
    type: 'input',
  }),
  decorateNode({
    id: 'qa',
    data: { label: 'کنترل داده' },
    position: { x: 0, y: 0 },
    type: 'default',
  }),
  decorateNode({
    id: 'safety',
    data: { label: 'ایمنی و ریسک' },
    position: { x: 0, y: 0 },
    type: 'default',
  }),
  decorateNode({
    id: 'engineering',
    data: { label: 'بازبینی مهندسی' },
    position: { x: 0, y: 0 },
    type: 'default',
  }),
  decorateNode({
    id: 'compliance',
    data: { label: 'حقوقی / انطباق' },
    position: { x: 0, y: 0 },
    type: 'default',
  }),
  decorateNode({
    id: 'finance',
    data: { label: 'تایید مالی' },
    position: { x: 0, y: 0 },
    type: 'default',
  }),
  decorateNode({
    id: 'director',
    data: { label: 'مدیر پروژه' },
    position: { x: 0, y: 0 },
    type: 'default',
  }),
  decorateNode({
    id: 'archive',
    data: { label: 'بایگانی و ابلاغ' },
    position: { x: 0, y: 0 },
    type: 'output',
  }),
]

const baseSampleEdges: Edge[] = [
  { id: 'start-qa', source: 'start', target: 'qa', animated: true, type: 'step' },
  { id: 'qa-safety', source: 'qa', target: 'safety', animated: true, type: 'step' },
  { id: 'qa-engineering', source: 'qa', target: 'engineering', animated: true, type: 'step' },
  { id: 'safety-compliance', source: 'safety', target: 'compliance', animated: true, type: 'step' },
  { id: 'engineering-compliance', source: 'engineering', target: 'compliance', animated: true, type: 'step' },
  { id: 'compliance-finance', source: 'compliance', target: 'finance', animated: true, type: 'step' },
  { id: 'finance-director', source: 'finance', target: 'director', animated: true, type: 'step' },
  { id: 'director-archive', source: 'director', target: 'archive', animated: true, type: 'step' },
]

const gridPositions: Record<string, { col: number; row: number }> = {
  start: { col: 2, row: 1 },
  qa: { col: 2, row: 2 },
  safety: { col: 1, row: 3 },
  engineering: { col: 3, row: 3 },
  compliance: { col: 2, row: 4 },
  finance: { col: 2, row: 5 },
  director: { col: 2, row: 6 },
  archive: { col: 2, row: 7 },
}

const layoutGrid = (nodes: Node[], gapX = 190, gapY = 150): Node[] =>
  nodes.map((node, idx) => {
    const fallbackCol = idx + 1
    const coords = gridPositions[node.id] ?? { col: fallbackCol, row: 3 }
    return decorateNode(
      {
        ...node,
        position: { x: 60 + (coords.col - 1) * gapX, y: 100 + (coords.row - 1) * gapY },
      },
      node.style?.borderColor
    )
  })

const initialNodes: Node[] = layoutGrid(baseSampleNodes)
const initialEdges: Edge[] = baseSampleEdges

const normalizeNodes = (raw: unknown): Node[] => {
  if (!Array.isArray(raw)) return initialNodes
  return raw
    .map((item) => {
      const node = item as Record<string, any>
      const position =
        node.position ||
        (typeof node.x === 'number' && typeof node.y === 'number'
          ? { x: node.x, y: node.y }
          : undefined)
      if (!position) return null
      return decorateNode(
        {
          id: node.id ?? nanoid(6),
          data: node.data ?? { label: node.title ?? 'مرحله' },
          position,
          type: node.type ?? 'default',
        },
        node.style?.borderColor
      )
    })
    .filter(Boolean) as Node[]
}

const normalizeEdges = (raw: unknown): Edge[] => {
  if (!Array.isArray(raw)) return initialEdges
  return raw
    .map((item) => {
      const edge = item as Record<string, any>
      const source = edge.source ?? edge.from
      const target = edge.target ?? edge.to
      if (!source || !target) return null
      return {
        id: edge.id ?? nanoid(8),
        source,
        target,
        animated: edge.animated ?? true,
        type: edge.type ?? 'step' /* 90deg corners */,
        label: edge.label,
      } satisfies Edge
    })
    .filter(Boolean) as Edge[]
}

export function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [counter, setCounter] = useState(initialNodes.length + 1)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!stored) {
      setIsReady(true)
      return
    }
    try {
      const parsed = JSON.parse(stored) as WorkflowStorage
      const normalizedNodes = normalizeNodes(parsed.nodes)
      const normalizedEdges = normalizeEdges(parsed.edges)
      if (normalizedNodes.length) setNodes(normalizedNodes)
      if (normalizedEdges) setEdges(normalizedEdges)
      if (parsed.counter) setCounter(parsed.counter)
    } catch (error) {
      console.warn('Cannot parse stored workflow', error)
    }
    setIsReady(true)
  }, [setEdges, setNodes])

  useEffect(() => {
    if (!isReady) return
    const payload: WorkflowStorage = { nodes, edges, counter }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
  }, [nodes, edges, counter, isReady])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true, type: 'step' }, eds))
    },
    [setEdges]
  )

  const handleAddNode = () => {
    const newNode: Node = {
      id: nanoid(6),
      position: { x: 80 + (counter % 4) * 190, y: 180 + Math.floor(counter / 4) * 150 },
      data: { label: `مرحله ${counter}` },
      type: 'default',
    }
    setNodes((prev) => layoutGrid([...prev, decorateNode(newNode)]))
    // auto connect from last node if exists
    setEdges((prevEdges) => {
      const lastId = nodes[nodes.length - 1]?.id
      if (!lastId) return prevEdges
      return addEdge(
        { id: nanoid(8), source: lastId, target: newNode.id, animated: true, type: 'step' },
        prevEdges
      )
    })
    setCounter((p) => p + 1)
  }

  const handleReset = () => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    setCounter(initialNodes.length + 1)
  }

  const handleAutoLayout = () => {
    setNodes((prev) => layoutGrid(prev))
  }

  const samplePath = useMemo(
    () =>
      ['start', 'qa', 'compliance', 'finance', 'director', 'archive'].map(
        (id) => nodes.find((n) => n.id === id)?.data?.label ?? id
      ),
    [nodes]
  )

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">ویرایشگر نقشه راه</p>
          <h3 className="text-lg font-semibold">بلوبپرینت گردش کار</h3>
          <p className="text-xs text-muted-foreground">
            گره‌ها را بکشید و با درگ بین نقاط اتصال، خطوط جریان را بسازید. پیش‌نویس روی مرورگر
            ذخیره می‌شود.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RefreshCcw className="mr-2 size-4" />
            بازنشانی
          </Button>
          <Button size="sm" variant="secondary" onClick={handleAutoLayout}>
            <CircuitBoard className="mr-2 size-4" />
            چیدمان مرتب
          </Button>
          <Button size="sm" onClick={handleAddNode}>
            <Plus className="mr-2 size-4" />
            افزودن مرحله
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border/60 bg-background/60" dir="ltr">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_40%)]" />
        <div className="relative h-[640px] w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            defaultEdgeOptions={{ animated: true, type: 'step' }}
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap />
            <Controls showInteractive={false} />
            <Background gap={18} size={1} />
          </ReactFlow>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 rounded-lg border border-border/50 bg-background/70 px-4 py-3 shadow-sm lg:grid-cols-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            <Link2 className="mr-1 size-3" />
            اتصال
          </Badge>
          <span className="text-sm text-muted-foreground">
            روی یک گره توقف کنید تا نقاط اتصال را ببینید، سپس درگ کرده و به گره مقصد رها کنید.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            <CircuitBoard className="mr-1 size-3" />
            نمونه مسیر
          </Badge>
          <span className="text-sm text-muted-foreground">
            {samplePath.join(' → ')} — شاخه ایمنی/مهندسی پس از کنترل داده به انطباق می‌رسد.
          </span>
        </div>
      </div>
    </div>
  )
}
