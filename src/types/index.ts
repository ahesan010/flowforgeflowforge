export type NodeCategory = 'trigger' | 'logic' | 'action';

export type NodeType =
  // Triggers
  | 'webhook_trigger'
  | 'schedule_trigger'
  | 'user_event_trigger'
  // Logic & Transformations
  | 'condition_filter'
  | 'code_transform'
  | 'delay_timer'
  | 'branch_switch'
  // Actions & Integrations
  | 'http_request'
  | 'send_email'
  | 'slack_notify'
  | 'db_upsert'
  | 'generate_pdf';

export interface NodeMeta {
  type: NodeType;
  label: string;
  category: NodeCategory;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  defaultConfig: Record<string, any>;
}

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'failed' | 'skipped';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  status: NodeExecutionStatus;
  lastExecution?: {
    durationMs: number;
    timestamp: string;
    output?: any;
    error?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string; // source node id
  target: string; // target node id
  sourceHandle?: 'output' | 'true' | 'false';
  conditionLabel?: string;
  animated?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  webhookSecret?: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  status: NodeExecutionStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  inputPayload: any;
  outputPayload: any;
  logs: string[];
  errorMessage?: string;
}

export interface ExecutionRun {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerType: NodeType;
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  triggerPayload: any;
  steps: ExecutionStep[];
}
