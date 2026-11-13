import { useState, useEffect } from 'react';
import { Workflow, WorkflowNode, WorkflowEdge, ExecutionRun, NodeType } from './types';
import { SAMPLE_WORKFLOWS } from './data/sampleWorkflows';
import { NODE_DEFINITIONS } from './constants/nodeDefinitions';
import { executeWorkflow } from './engine/dagOrchestrator';
import confetti from 'canvas-confetti';

// Component imports
import { TopBar } from './components/navigation/TopBar';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { NodeInspector } from './components/inspector/NodeInspector';
import { ExecutionDrawer } from './components/execution/ExecutionDrawer';
import { NodeLibraryModal } from './components/sidebar/NodeLibraryModal';

export function App() {
  // 1. Workflows State (Offline-first localStorage)
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('flowforge_workflows');
    return saved ? JSON.parse(saved) : SAMPLE_WORKFLOWS;
  });

  const [currentWorkflowId, setCurrentWorkflowId] = useState<string>(() => {
    return workflows[0]?.id || SAMPLE_WORKFLOWS[0].id;
  });

  // 2. Execution History State
  const [runs, setRuns] = useState<ExecutionRun[]>(() => {
    const saved = localStorage.getItem('flowforge_runs');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeRun, setActiveRun] = useState<ExecutionRun | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // 3. Selection & Modals State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  const currentWorkflow =
    workflows.find((w) => w.id === currentWorkflowId) || workflows[0] || SAMPLE_WORKFLOWS[0];

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('flowforge_workflows', JSON.stringify(workflows));
  }, [workflows]);

  useEffect(() => {
    localStorage.setItem('flowforge_runs', JSON.stringify(runs));
  }, [runs]);

  // Update current workflow helper
  const updateCurrentWorkflow = (updater: (prev: Workflow) => Workflow) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === currentWorkflow.id ? updater(w) : w))
    );
  };

  // Node position update (drag & drop)
  const handleUpdateNodePosition = (id: string, pos: { x: number; y: number }) => {
    updateCurrentWorkflow((w) => ({
      ...w,
      nodes: w.nodes.map((n) => (n.id === id ? { ...n, position: pos } : n)),
    }));
  };

  // Node config update
  const handleUpdateNodeConfig = (nodeId: string, updates: Partial<WorkflowNode>) => {
    updateCurrentWorkflow((w) => ({
      ...w,
      nodes: w.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    }));
  };

  // Delete Node & connected edges
  const handleDeleteNode = (nodeId: string) => {
    updateCurrentWorkflow((w) => ({
      ...w,
      nodes: w.nodes.filter((n) => n.id !== nodeId),
      edges: w.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Add New Node from Library
  const handleAddNode = (type: NodeType) => {
    const meta = NODE_DEFINITIONS[type];
    const newNodeId = `node-${Date.now().toString().slice(-4)}`;

    // Stagger position
    const currentCount = currentWorkflow.nodes.length;
    const newPos = {
      x: 100 + (currentCount % 4) * 320,
      y: 120 + Math.floor(currentCount / 4) * 160,
    };

    const newNode: WorkflowNode = {
      id: newNodeId,
      type,
      label: meta.label,
      position: newPos,
      config: { ...meta.defaultConfig },
      status: 'idle',
    };

    updateCurrentWorkflow((w) => {
      // Connect to previous node if available
      const lastNode = w.nodes[w.nodes.length - 1];
      const newEdges = [...w.edges];
      if (lastNode && meta.category !== 'trigger') {
        newEdges.push({
          id: `e-${lastNode.id}-${newNodeId}`,
          source: lastNode.id,
          target: newNodeId,
          animated: true,
        });
      }

      return {
        ...w,
        nodes: [...w.nodes, newNode],
        edges: newEdges,
        updatedAt: new Date().toISOString(),
      };
    });

    setSelectedNodeId(newNodeId);
  };

  // Execute Workflow Pipeline
  const handleExecute = async () => {
    if (isExecuting) return;
    setIsExecuting(true);

    // Reset node statuses
    updateCurrentWorkflow((w) => ({
      ...w,
      nodes: w.nodes.map((n) => ({ ...n, status: 'idle' })),
    }));

    // Find trigger payload
    const triggerNode = currentWorkflow.nodes.find(
      (n) => n.type === 'webhook_trigger' || n.type === 'schedule_trigger' || n.type === 'user_event_trigger'
    );

    let initialPayload = {
      event: 'trigger.manual_run',
      amount: 19500,
      customer: {
        name: 'Devika Singhania',
        email: 'devika.s@enterprise-hub.com',
        company: 'Vanguard Capital',
        tier: 'enterprise',
      },
      timestamp: new Date().toISOString(),
    };

    if (triggerNode?.config?.samplePayload) {
      try {
        initialPayload = JSON.parse(triggerNode.config.samplePayload);
      } catch (e) {
        // fallback
      }
    }

    try {
      const resultRun = await executeWorkflow(
        currentWorkflow,
        initialPayload,
        (step, activeNodeId) => {
          updateCurrentWorkflow((w) => ({
            ...w,
            nodes: w.nodes.map((n) => {
              if (n.id === activeNodeId) {
                return {
                  ...n,
                  status: step.status,
                  lastExecution: {
                    durationMs: step.durationMs,
                    timestamp: step.completedAt || new Date().toISOString(),
                    output: step.outputPayload,
                    error: step.errorMessage,
                  },
                };
              }
              return n;
            }),
          }));
        }
      );

      setRuns((prev) => [resultRun, ...prev.slice(0, 20)]);
      setActiveRun(resultRun);

      if (resultRun.status === 'success') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(`Pipeline Execution Halted: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Export & Import Workflows
  const handleExportWorkflow = () => {
    const jsonStr = JSON.stringify(currentWorkflow, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentWorkflow.name.toLowerCase().replace(/\s+/g, '_')}_flowforge.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportWorkflow = (jsonString: string) => {
    try {
      const parsed: Workflow = JSON.parse(jsonString);
      if (!parsed.nodes || !parsed.edges) {
        throw new Error('Invalid schema: Missing nodes or edges');
      }
      const imported: Workflow = {
        ...parsed,
        id: `wf-imported-${Date.now().toString().slice(-4)}`,
        name: `${parsed.name} (Imported)`,
      };
      setWorkflows((prev) => [imported, ...prev]);
      setCurrentWorkflowId(imported.id);
      alert('Workflow imported and mounted to canvas successfully!');
    } catch (e) {
      alert('Failed to parse Workflow JSON file.');
    }
  };

  const handleNewBlankWorkflow = () => {
    const newWf: Workflow = {
      id: `wf-${Date.now().toString().slice(-6)}`,
      name: 'Untitled Event Pipeline',
      description: 'Custom event-driven workflow graph',
      active: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [
        {
          id: 'trigger-1',
          type: 'webhook_trigger',
          label: 'Incoming Webhook Event',
          position: { x: 120, y: 180 },
          config: { ...NODE_DEFINITIONS.webhook_trigger.defaultConfig },
          status: 'idle',
        },
      ],
      edges: [],
    };
    setWorkflows((prev) => [newWf, ...prev]);
    setCurrentWorkflowId(newWf.id);
    setSelectedNodeId('trigger-1');
  };

  const selectedNode = currentWorkflow.nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <TopBar
        currentWorkflow={currentWorkflow}
        allWorkflows={workflows}
        isExecuting={isExecuting}
        recentRunsCount={runs.length}
        onSelectWorkflow={setCurrentWorkflowId}
        onExecute={handleExecute}
        onOpenLogs={() => setShowLogsDrawer(true)}
        onToggleActive={() =>
          updateCurrentWorkflow((w) => ({ ...w, active: !w.active }))
        }
        onExportWorkflow={handleExportWorkflow}
        onImportWorkflow={handleImportWorkflow}
        onNewWorkflow={handleNewBlankWorkflow}
      />

      {/* Main Workspace: Canvas + Inspector / Execution Drawers */}
      <div className="flex-1 flex overflow-hidden relative">
        <WorkflowCanvas
          nodes={currentWorkflow.nodes}
          edges={currentWorkflow.edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNodePosition={handleUpdateNodePosition}
          onDeleteNode={handleDeleteNode}
          onOpenLibrary={() => setShowLibraryModal(true)}
        />

        {/* Node Inspector Drawer */}
        {selectedNode && !showLogsDrawer && (
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdateConfig={handleUpdateNodeConfig}
            onDeleteNode={handleDeleteNode}
          />
        )}

        {/* Execution Logs Drawer */}
        {showLogsDrawer && (
          <ExecutionDrawer
            runs={runs}
            activeRun={activeRun || runs[0] || null}
            onClose={() => setShowLogsDrawer(false)}
            onSelectRun={setActiveRun}
          />
        )}
      </div>

      {/* Add Node Modal Catalog */}
      {showLibraryModal && (
        <NodeLibraryModal
          onClose={() => setShowLibraryModal(false)}
          onSelectNodeType={handleAddNode}
        />
      )}
    </div>
  );
}

export default App;
