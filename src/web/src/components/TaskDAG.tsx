// ============================================================
// Task DAG Visualizer — React Flow DAG for task dependencies
// ============================================================

import { useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store/useStore';
import { api } from '../hooks/api';
import { CheckCircle2, Circle, Loader2, XCircle, SkipForward, Clock } from 'lucide-react';

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  completed: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: '#22c55e', icon: CheckCircle2 },
  running: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: '#3b82f6', icon: Loader2 },
  pending: { color: '#6b7280', bg: 'rgba(107,114,128,0.05)', border: '#374151', icon: Clock },
  failed: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: '#ef4444', icon: XCircle },
  skipped: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', icon: SkipForward },
};

function TaskNode({ data }: NodeProps) {
  const cfg = statusConfig[data.status as string] || statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <div
      className="rounded-lg px-3 py-2 min-w-[140px] text-xs transition-all"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: '#e1e1ef',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
        <span className="font-medium truncate">{data.label as string}</span>
      </div>
      {(data.status as string) === 'running' && (
        <div className="mt-1.5 h-1 rounded-full bg-[#2a2a3e] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${data.progress as number}%`, background: cfg.color }}
          />
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { taskNode: TaskNode };

export default function TaskDAG() {
  const taskBoard = useStore((s) => s.taskBoard);
  const setTaskBoard = useStore((s) => s.setTaskBoard);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    api.getTasks().then(setTaskBoard).catch(console.error);
  }, []);

  useEffect(() => {
    if (!taskBoard) return;

    const flowNodes: Node[] = taskBoard.nodes.map((node, idx) => ({
      id: node.id,
      type: 'taskNode',
      position: { x: 0, y: idx * 100 },
      data: {
        label: node.label,
        status: node.status,
        progress: node.progress,
        description: node.description,
      },
    }));

    const flowEdges: Edge[] = taskBoard.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#2a2a3e', strokeWidth: 2 },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [taskBoard, setNodes, setEdges]);

  return (
    <div className="bg-cortex-card rounded-xl border border-cortex-border h-[350px]">
      <div className="px-3 py-2 border-b border-cortex-border">
        <h3 className="text-sm font-semibold text-cortex-muted uppercase tracking-wider">
          Task DAG — Execution Plan
        </h3>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={true}
        nodesConnectable={false}
        className="bg-[#0a0a0f]"
        colorMode="dark"
      >
        <Background color="#1a1a2e" gap={20} />
        <Controls className="!bg-cortex-card !border-cortex-border" />
        <MiniMap
          style={{ background: '#12121a' }}
          nodeColor={(n) => {
            const cfg = statusConfig[(n.data as any)?.status] || statusConfig.pending;
            return cfg.color;
          }}
          maskColor="rgba(10,10,15,0.7)"
        />
      </ReactFlow>
    </div>
  );
}