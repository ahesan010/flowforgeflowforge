import React from 'react';
import { WorkflowNode, NodeMeta } from '../../types';
import { NODE_DEFINITIONS } from '../../constants/nodeDefinitions';
import {
  Webhook,
  Clock,
  Zap,
  GitBranch,
  Code2,
  Hourglass,
  Split,
  Globe,
  Mail,
  MessageSquare,
  Database,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  Trash2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Webhook,
  Clock,
  Zap,
  GitBranch,
  Code2,
  Hourglass,
  Split,
  Globe,
  Mail,
  MessageSquare,
  Database,
  FileText,
};

interface CanvasNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onStartDrag: (e: React.MouseEvent) => void;
}

export const CanvasNode: React.FC<CanvasNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onStartDrag,
}) => {
  const meta: NodeMeta = NODE_DEFINITIONS[node.type] || {
    type: node.type,
    label: node.label,
    category: 'action',
    description: '',
    icon: 'Zap',
    color: 'indigo',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    defaultConfig: {},
  };

  const IconComponent = ICON_MAP[meta.icon] || Zap;

  const isTrigger = meta.category === 'trigger';

  // Summarize config for preview
  const getConfigSummary = () => {
    switch (node.type) {
      case 'webhook_trigger':
        return `${node.config.httpMethod || 'POST'} ${node.config.path || '/webhook'}`;
      case 'schedule_trigger':
        return node.config.description || node.config.cronExpression || 'Scheduled Cron';
      case 'user_event_trigger':
        return `Event: ${node.config.eventName || 'custom.event'}`;
      case 'condition_filter':
        return `if (${node.config.field || 'val'} ${node.config.operator || '=='} ${node.config.value || ''})`;
      case 'code_transform':
        return 'Custom JS Pipeline Normalizer';
      case 'delay_timer':
        return `Wait ${node.config.durationSeconds || 2}s`;
      case 'http_request':
        return `${node.config.method || 'POST'} ${node.config.url?.slice(0, 24) || 'Endpoint'}...`;
      case 'send_email':
        return `To: ${node.config.to || 'recipient'}`;
      case 'slack_notify':
        return `Channel: ${node.config.channel || '#alerts'}`;
      case 'db_upsert':
        return `Table: ${node.config.table || 'records'}`;
      default:
        return 'Configured action';
    }
  };

  return (
    <div
      style={{
        transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`absolute w-72 select-none cursor-move rounded-2xl border transition-all duration-150 ${
        isSelected
          ? 'ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/20 z-20 bg-slate-900 border-indigo-500'
          : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 shadow-lg hover:border-slate-700 z-10'
      } ${
        node.status === 'running'
          ? 'ring-2 ring-amber-500 shadow-amber-500/30 animate-pulse'
          : node.status === 'success'
          ? 'border-emerald-500/60'
          : node.status === 'failed'
          ? 'border-rose-500/70 ring-1 ring-rose-500'
          : ''
      }`}
    >
      {/* Node Header */}
      <div
        onMouseDown={onStartDrag}
        className="px-3.5 py-2.5 rounded-t-2xl border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-xl ${meta.bgColor} text-white`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-tight">
              {meta.category}
            </span>
            <span className="text-xs font-bold text-slate-200 truncate block">
              {node.label}
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          {node.status === 'running' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>RUN</span>
            </span>
          )}
          {node.status === 'success' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>OK</span>
            </span>
          )}
          {node.status === 'failed' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <XCircle className="w-3 h-3" />
              <span>FAIL</span>
            </span>
          )}
          {node.status === 'skipped' && (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              SKIP
            </span>
          )}
        </div>
      </div>

      {/* Node Body Details */}
      <div className="p-3 text-xs space-y-2">
        <div className="text-[11px] font-mono text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded-xl border border-slate-800/80 truncate">
          {getConfigSummary()}
        </div>

        {node.lastExecution && (
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Executed in {node.lastExecution.durationMs}ms</span>
            <span className="text-slate-400">
              {new Date(node.lastExecution.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Node Connector Handles */}
      {/* Input Handle (Left) - Non-trigger nodes only */}
      {!isTrigger && (
        <div
          title="Input Handle"
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 border-2 border-indigo-400 shadow-sm flex items-center justify-center hover:scale-125 transition-transform"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        </div>
      )}

      {/* Output Handle (Right) */}
      <div
        title="Output Handle"
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 border-2 border-emerald-400 shadow-sm flex items-center justify-center hover:scale-125 transition-transform"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </div>
    </div>
  );
};
