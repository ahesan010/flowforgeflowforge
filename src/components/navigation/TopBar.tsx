import React, { useState } from 'react';
import { Workflow, ExecutionRun } from '../../types';
import {
  GitMerge,
  Play,
  Terminal,
  FolderOpen,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronDown,
  Plus,
} from 'lucide-react';

interface TopBarProps {
  currentWorkflow: Workflow;
  allWorkflows: Workflow[];
  isExecuting: boolean;
  recentRunsCount: number;
  onSelectWorkflow: (id: string) => void;
  onExecute: () => void;
  onOpenLogs: () => void;
  onToggleActive: () => void;
  onExportWorkflow: () => void;
  onImportWorkflow: (json: string) => void;
  onNewWorkflow: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentWorkflow,
  allWorkflows,
  isExecuting,
  recentRunsCount,
  onSelectWorkflow,
  onExecute,
  onOpenLogs,
  onToggleActive,
  onExportWorkflow,
  onImportWorkflow,
  onNewWorkflow,
}) => {
  const [showWorkflowMenu, setShowWorkflowMenu] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onImportWorkflow(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-30 select-none">
      {/* Brand & Workflow Switcher */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-sm text-slate-100 tracking-tight leading-tight flex items-center gap-1.5">
              <span>FlowForge</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">
                DAG ENGINE
              </span>
            </h1>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 shrink-0 hidden sm:block" />

        {/* Workflow Title & Selector Dropdown */}
        <div className="relative min-w-0">
          <button
            onClick={() => setShowWorkflowMenu(!showWorkflowMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors text-xs font-bold text-slate-200"
          >
            <span className="truncate max-w-[180px] sm:max-w-[280px]">
              {currentWorkflow.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {showWorkflowMenu && (
            <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400">
                Switch Active Workflow
              </div>
              <div className="space-y-1 my-1">
                {allWorkflows.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      onSelectWorkflow(w.id);
                      setShowWorkflowMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors font-medium ${
                      w.id === currentWorkflow.id
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">{w.name}</div>
                    <div className="text-[10px] opacity-75 font-mono">
                      {w.nodes.length} nodes • v{w.version}
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-1 mt-1">
                <button
                  onClick={() => {
                    onNewWorkflow();
                    setShowWorkflowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1.5 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Blank Canvas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Active Toggle */}
        <button
          onClick={onToggleActive}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            currentWorkflow.active
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              currentWorkflow.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span>{currentWorkflow.active ? 'Active (Live)' : 'Draft Mode'}</span>
        </button>

        {/* Import & Export JSON buttons */}
        <button
          onClick={onExportWorkflow}
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs transition-colors"
          title="Export Workflow JSON Schema"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <label className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>Import</span>
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Telemetry Logs Drawer Button */}
        <button
          onClick={onOpenLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Logs</span>
          {recentRunsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
              {recentRunsCount}
            </span>
          )}
        </button>

        {/* Run Workflow CTA */}
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isExecuting ? 'Running DAG...' : 'Test Run Pipeline'}</span>
        </button>
      </div>
    </header>
  );
};
