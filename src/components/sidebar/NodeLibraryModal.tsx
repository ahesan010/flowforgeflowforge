import React, { useState } from 'react';
import { NodeType, NodeMeta } from '../../types';
import { NODE_DEFINITIONS } from '../../constants/nodeDefinitions';
import {
  X,
  Search,
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
  Plus,
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

interface NodeLibraryModalProps {
  onClose: () => void;
  onSelectNodeType: (type: NodeType) => void;
}

export const NodeLibraryModal: React.FC<NodeLibraryModalProps> = ({
  onClose,
  onSelectNodeType,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'trigger' | 'logic' | 'action'>('all');

  const allNodes = Object.values(NODE_DEFINITIONS);

  const filtered = allNodes.filter((n) => {
    if (activeTab !== 'all' && n.category !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="font-black text-base text-slate-100">Node Component Library</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a trigger, transform step, or third-party integration action to provision
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 font-bold">
            {(
              [
                { id: 'all', label: 'All Nodes' },
                { id: 'trigger', label: '⚡ Triggers' },
                { id: 'logic', label: '🔀 Logic' },
                { id: 'action', label: '🚀 Actions' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
                  activeTab === t.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs flex-1">
          {filtered.map((nodeMeta) => {
            const Icon = ICON_MAP[nodeMeta.icon] || Zap;
            return (
              <div
                key={nodeMeta.type}
                onClick={() => {
                  onSelectNodeType(nodeMeta.type);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${nodeMeta.bgColor}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-200 block text-xs group-hover:text-indigo-400 transition-colors">
                          {nodeMeta.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {nodeMeta.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg opacity-0 group-hover:opacity-100 bg-indigo-600 text-white transition-opacity">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {nodeMeta.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
