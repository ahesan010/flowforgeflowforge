import React, { useState } from 'react';
import { ExecutionRun, ExecutionStep } from '../../types';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Terminal,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ExecutionDrawerProps {
  runs: ExecutionRun[];
  activeRun: ExecutionRun | null;
  onClose: () => void;
  onSelectRun: (run: ExecutionRun) => void;
}

export const ExecutionDrawer: React.FC<ExecutionDrawerProps> = ({
  runs,
  activeRun,
  onClose,
  onSelectRun,
}) => {
  const [selectedStep, setSelectedStep] = useState<ExecutionStep | null>(
    activeRun && activeRun.steps.length > 0 ? activeRun.steps[0] : null
  );

  return (
    <div className="w-[520px] border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl h-full flex flex-col z-40 text-xs shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 leading-tight">
              Execution Logs & Telemetry
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Live DAG Trace & Payload Inspector
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

      {/* Main Content: Runs List & Step Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Recent Runs (180px) */}
        <div className="w-48 border-r border-slate-800/80 overflow-y-auto p-2 space-y-1.5 bg-slate-950/40">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block">
            Recent Runs ({runs.length})
          </span>

          {runs.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-[11px]">
              No executions logged yet. Click "Run" to test.
            </div>
          ) : (
            runs.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  onSelectRun(r);
                  setSelectedStep(r.steps[0] || null);
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                  activeRun?.id === r.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800/60 bg-slate-900 hover:bg-slate-850 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[11px] text-indigo-300">
                    {r.id}
                  </span>
                  {r.status === 'success' ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{r.durationMs}ms</span>
                  <span>{new Date(r.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Column: Execution Step Flow & Payload Inspector */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {activeRun ? (
            <>
              {/* Active Run Banner */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-xs">
                      {activeRun.workflowName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        activeRun.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {activeRun.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Total Duration: {activeRun.durationMs}ms • {activeRun.steps.length} steps executed
                  </span>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Topological Execution Path
                </span>
                <div className="space-y-1.5">
                  {activeRun.steps.map((st, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedStep(st)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedStep?.nodeId === st.nodeId
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-800 bg-slate-950/50 hover:bg-slate-950 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-lg bg-slate-800 font-mono text-[10px] flex items-center justify-center text-slate-300 font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold block truncate text-xs">
                            {st.nodeName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {st.durationMs}ms
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {st.status === 'success' && (
                          <span className="text-[10px] font-bold text-emerald-400">✓ OK</span>
                        )}
                        {st.status === 'failed' && (
                          <span className="text-[10px] font-bold text-rose-400">✗ FAIL</span>
                        )}
                        {st.status === 'skipped' && (
                          <span className="text-[10px] font-bold text-slate-400">SKIP</span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Step Payload & Logs Viewer */}
              {selectedStep && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step Detail: {selectedStep.nodeName}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">
                      {selectedStep.durationMs}ms
                    </span>
                  </div>

                  {/* Logs Console */}
                  <div className="p-3 bg-black/80 rounded-xl border border-slate-800/80 font-mono text-[10px] text-slate-300 space-y-1">
                    {selectedStep.logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-emerald-500 select-none">&gt;</span>
                        <span className="break-all">{log}</span>
                      </div>
                    ))}
                    {selectedStep.errorMessage && (
                      <div className="text-rose-400 font-bold pt-1">
                        ERROR: {selectedStep.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Output Payload JSON */}
                  {selectedStep.outputPayload && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Output Result Payload
                      </span>
                      <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                        {JSON.stringify(selectedStep.outputPayload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Select an execution run on the left to view logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
