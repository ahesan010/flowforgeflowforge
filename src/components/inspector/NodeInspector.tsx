import React from 'react';
import { WorkflowNode, NodeMeta } from '../../types';
import { NODE_DEFINITIONS } from '../../constants/nodeDefinitions';
import {
  X,
  Trash2,
  Copy,
  Code2,
  Sparkles,
  Info,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface NodeInspectorProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdateConfig: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onClose,
  onUpdateConfig,
  onDeleteNode,
}) => {
  if (!node) return null;

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

  const handleConfigChange = (key: string, value: any) => {
    onUpdateConfig(node.id, {
      config: {
        ...node.config,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-96 border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl h-full flex flex-col z-40 text-xs shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${meta.bgColor}`}>
            <Sliders className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 leading-tight">
              Node Inspector
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {meta.category} • ID: {node.id}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label Config */}
        <div>
          <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
            Display Label
          </label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => onUpdateConfig(node.id, { label: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Node Description Card */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>{meta.description}</span>
        </div>

        {/* Dynamic Fields Based on Node Type */}
        {/* 1. Webhook Trigger */}
        {node.type === 'webhook_trigger' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Endpoint Route Path
              </label>
              <input
                type="text"
                value={node.config.path || ''}
                onChange={(e) => handleConfigChange('path', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                HTTP Method
              </label>
              <select
                value={node.config.httpMethod || 'POST'}
                onChange={(e) => handleConfigChange('httpMethod', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-bold text-slate-200"
              >
                <option value="POST">POST (Standard Webhook)</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Test Ingestion Payload (JSON)
              </label>
              <textarea
                rows={7}
                value={node.config.samplePayload || ''}
                onChange={(e) => handleConfigChange('samplePayload', e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* 2. Condition Filter */}
        {node.type === 'condition_filter' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Field Key to Inspect
              </label>
              <input
                type="text"
                value={node.config.field || ''}
                onChange={(e) => handleConfigChange('field', e.target.value)}
                placeholder="e.g. amount, customer.tier"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Comparison Operator
              </label>
              <select
                value={node.config.operator || 'greater_than'}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-bold text-slate-200"
              >
                <option value="greater_than">Greater than (&gt;)</option>
                <option value="less_than">Less than (&lt;)</option>
                <option value="equals">Equals (==)</option>
                <option value="contains">String Contains</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Threshold Target Value
              </label>
              <input
                type="text"
                value={node.config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                placeholder="e.g. 10000 or enterprise"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200"
              />
            </div>
          </div>
        )}

        {/* 3. Code Transform */}
        {node.type === 'code_transform' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                JavaScript Transform Function
              </label>
              <span className="text-[10px] text-purple-400 font-mono">ES6 Safe Sandbox</span>
            </div>
            <textarea
              rows={9}
              value={node.config.code || ''}
              onChange={(e) => handleConfigChange('code', e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed"
            />
          </div>
        )}

        {/* 4. Delay Timer */}
        {node.type === 'delay_timer' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Delay Duration (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={node.config.durationSeconds || 3}
                onChange={(e) => handleConfigChange('durationSeconds', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-bold text-slate-200"
              />
            </div>
          </div>
        )}

        {/* 5. HTTP Request */}
        {node.type === 'http_request' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                HTTP Method & URL
              </label>
              <div className="flex gap-2">
                <select
                  value={node.config.method || 'POST'}
                  onChange={(e) => handleConfigChange('method', e.target.value)}
                  className="w-24 px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-bold text-cyan-400"
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
                <input
                  type="text"
                  value={node.config.url || ''}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. Slack Alert */}
        {node.type === 'slack_notify' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Slack Channel
              </label>
              <input
                type="text"
                value={node.config.channel || ''}
                onChange={(e) => handleConfigChange('channel', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Markdown Message Template
              </label>
              <textarea
                rows={4}
                value={node.config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Use <code>{'{{trigger.param}}'}</code> to inject incoming variables.
              </span>
            </div>
          </div>
        )}

        {/* 7. Send Email */}
        {node.type === 'send_email' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Recipient Email
              </label>
              <input
                type="text"
                value={node.config.to || ''}
                onChange={(e) => handleConfigChange('to', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-pink-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                value={node.config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-medium text-slate-200"
              />
            </div>
          </div>
        )}

        {/* Variable Helper Box */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Available Template Tags
          </span>
          <div className="flex flex-wrap gap-1 pt-1 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {'{{trigger.amount}}'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {'{{trigger.customer.name}}'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {'{{trigger.fullName}}'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {'{{trigger.formattedAmount}}'}
            </span>
          </div>
        </div>
      </div>

      {/* Inspector Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <button
          onClick={() => {
            if (window.confirm(`Delete node "${node.label}"?`)) {
              onDeleteNode(node.id);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors font-bold text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
