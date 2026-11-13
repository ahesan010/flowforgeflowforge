import React, { useState, useRef } from 'react';
import { WorkflowNode, WorkflowEdge } from '../../types';
import { CanvasNode } from './CanvasNode';
import { ZoomIn, ZoomOut, Maximize2, Plus } from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNodePosition: (id: string, pos: { x: number; y: number }) => void;
  onDeleteNode: (id: string) => void;
  onOpenLibrary: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onDeleteNode,
  onOpenLibrary,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDownNode = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNode({
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: node.position.x,
      initY: node.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      const dx = (e.clientX - draggingNode.startX) / zoom;
      const dy = (e.clientY - draggingNode.startY) / zoom;
      onUpdateNodePosition(draggingNode.id, {
        x: Math.round(draggingNode.initX + dx),
        y: Math.round(draggingNode.initY + dy),
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  // Calculate SVG curve between nodes
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => onSelectNode(null)}
      className="relative flex-1 h-full bg-slate-950 overflow-hidden select-none cursor-default"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Zoom & Canvas Controls */}
      <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-2xl">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 px-1 font-bold">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 40, y: 40 });
          }}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Node Floating FAB */}
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={onOpenLibrary}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Node / Step</span>
        </button>
      </div>

      {/* SVG Container for Bézier Edges */}
      <svg
        className="absolute inset-0 pointer-events-none w-full h-full z-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {edges.map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);
          if (!sourceNode || !targetNode) return null;

          // Connect from right of source to left of target
          const x1 = sourceNode.position.x + 288;
          const y1 = sourceNode.position.y + 44;
          const x2 = targetNode.position.x;
          const y2 = targetNode.position.y + 44;

          const dx = Math.abs(x2 - x1) * 0.5;
          const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          const isExecuting = targetNode.status === 'running' || sourceNode.status === 'running';

          return (
            <g key={edge.id}>
              {/* Outer Glow Line on Execution */}
              {isExecuting && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="6"
                  opacity="0.4"
                  filter="url(#glow)"
                />
              )}

              {/* Main Connecting Path */}
              <path
                d={pathD}
                fill="none"
                stroke={isExecuting ? '#a5b4fc' : '#334155'}
                strokeWidth="2.5"
                strokeDasharray={edge.animated ? '6,6' : undefined}
                className={edge.animated ? 'animate-[dash_1s_linear_infinite]' : ''}
              />

              {/* Label Pill on Edge */}
              {edge.conditionLabel && (
                <foreignObject
                  x={midX - 50}
                  y={midY - 14}
                  width="100"
                  height="28"
                  className="overflow-visible pointer-events-none"
                >
                  <div className="flex items-center justify-center">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300 shadow-md">
                      {edge.conditionLabel}
                    </span>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>

      {/* Render Node Cards */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {nodes.map((node) => (
          <CanvasNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onSelect={() => onSelectNode(node.id)}
            onDelete={() => onDeleteNode(node.id)}
            onStartDrag={(e) => handleMouseDownNode(e, node)}
          />
        ))}
      </div>
    </div>
  );
};
