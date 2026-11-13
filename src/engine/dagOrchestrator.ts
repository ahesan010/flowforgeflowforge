import { Workflow, WorkflowNode, WorkflowEdge, ExecutionRun, ExecutionStep, NodeType } from '../types';

/**
 * Resolves template expressions like `{{trigger.customer.name}}` against execution context
 */
export function resolveTemplateVariables(templateStr: string, context: Record<string, any>): string {
  if (typeof templateStr !== 'string') return templateStr;

  return templateStr.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
    const parts = path.split('.');
    let current: any = context;
    for (const part of parts) {
      if (current === undefined || current === null) return '';
      current = current[part];
    }
    return current !== undefined && current !== null ? String(current) : '';
  });
}

/**
 * Validates DAG and performs topological sorting
 */
export function getTopologicalOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): { order: WorkflowNode[]; hasCycle: boolean } {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adjList[n.id] = [];
  });

  edges.forEach((e) => {
    if (adjList[e.source]) adjList[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  const queue: string[] = [];
  nodes.forEach((n) => {
    if (inDegree[n.id] === 0) {
      queue.push(n.id);
    }
  });

  const sortedNodeIds: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    sortedNodeIds.push(curr);

    for (const neighbor of adjList[curr] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  const hasCycle = sortedNodeIds.length !== nodes.length;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const order = sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);

  return { order, hasCycle };
}

/**
 * Executes a single workflow step simulation with real delays and state tracking
 */
export async function executeWorkflow(
  workflow: Workflow,
  initialTriggerPayload: any,
  onStepProgress?: (step: ExecutionStep, activeNodeId: string) => void
): Promise<ExecutionRun> {
  const runId = `RUN-${Date.now().toString().slice(-6)}`;
  const startedAt = new Date().toISOString();
  const startTime = performance.now();

  const { order, hasCycle } = getTopologicalOrder(workflow.nodes, workflow.edges);

  if (hasCycle) {
    throw new Error('Cyclic dependency detected! Workflows must be a valid Directed Acyclic Graph (DAG).');
  }

  // Execution context storing output of each executed node: { [nodeId]: output, trigger: initialTriggerPayload }
  const executionContext: Record<string, any> = {
    trigger: initialTriggerPayload,
  };

  const steps: ExecutionStep[] = [];
  let isFailed = false;

  for (const node of order) {
    const stepStart = performance.now();
    const stepStartedAt = new Date().toISOString();

    // Check incoming edges
    const incomingEdges = workflow.edges.filter((e) => e.target === node.id);
    let shouldSkip = false;

    if (incomingEdges.length > 0) {
      // Check if all parent nodes succeeded or if condition filter failed
      for (const edge of incomingEdges) {
        const parentStep = steps.find((s) => s.nodeId === edge.source);
        if (!parentStep || parentStep.status === 'failed' || parentStep.status === 'skipped') {
          shouldSkip = true;
          break;
        }
        // If parent was a condition filter and evaluated to false
        if (edge.sourceHandle === 'false' || parentStep.outputPayload?.__conditionMet === false) {
          shouldSkip = true;
          break;
        }
      }
    }

    if (shouldSkip) {
      const skippedStep: ExecutionStep = {
        nodeId: node.id,
        nodeName: node.label,
        nodeType: node.type,
        status: 'skipped',
        startedAt: stepStartedAt,
        completedAt: new Date().toISOString(),
        durationMs: 0,
        inputPayload: null,
        outputPayload: null,
        logs: ['Condition branch evaluate false — step bypassed.'],
      };
      steps.push(skippedStep);
      onStepProgress?.(skippedStep, node.id);
      continue;
    }

    // Step Execution Logic
    const step: ExecutionStep = {
      nodeId: node.id,
      nodeName: node.label,
      nodeType: node.type,
      status: 'running',
      startedAt: stepStartedAt,
      completedAt: '',
      durationMs: 0,
      inputPayload: executionContext,
      outputPayload: null,
      logs: [`Initiating execution of [${node.label}]...`],
    };

    onStepProgress?.(step, node.id);

    try {
      let output: any = null;

      // Realistic async pause (200ms - 800ms) for UI animation and real async behavior
      await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 350) + 250));

      switch (node.type) {
        case 'webhook_trigger':
        case 'schedule_trigger':
        case 'user_event_trigger':
          output = initialTriggerPayload;
          step.logs.push(`Payload received: ${JSON.stringify(output).slice(0, 80)}...`);
          break;

        case 'condition_filter': {
          const field = node.config.field || 'amount';
          const op = node.config.operator || 'greater_than';
          const targetVal = node.config.value;

          const currentVal = executionContext.trigger?.[field] ?? executionContext[field];
          let met = false;

          if (op === 'greater_than') met = Number(currentVal) > Number(targetVal);
          else if (op === 'equals') met = String(currentVal).toLowerCase() === String(targetVal).toLowerCase();
          else if (op === 'contains') met = String(currentVal).includes(String(targetVal));
          else met = Boolean(currentVal);

          output = {
            __conditionMet: met,
            field,
            evaluatedValue: currentVal,
            operator: op,
            threshold: targetVal,
          };
          step.logs.push(`Evaluated condition [${field} ${op} ${targetVal}]: Result = ${met}`);
          break;
        }

        case 'code_transform': {
          const userCode = node.config.code || 'return input;';
          // Safe evaluation with input context
          const transformFn = new Function('input', 'context', userCode);
          output = transformFn(executionContext.trigger, executionContext);
          // Merge transformed fields into context
          Object.assign(executionContext.trigger, output);
          step.logs.push('JavaScript transform executed successfully with mutated payload.');
          break;
        }

        case 'delay_timer': {
          const secs = Math.min(Number(node.config.durationSeconds) || 2, 5); // limit to 5s in demo
          step.logs.push(`Holding execution thread for ${secs}s...`);
          await new Promise((r) => setTimeout(r, secs * 800));
          output = { pausedForSeconds: secs, resumedAt: new Date().toISOString() };
          break;
        }

        case 'http_request': {
          const resolvedUrl = resolveTemplateVariables(node.config.url || '', executionContext);
          step.logs.push(`Dispatched HTTP ${node.config.method || 'POST'} to ${resolvedUrl}`);
          output = {
            statusCode: 200,
            statusText: 'OK',
            responseBody: {
              success: true,
              recordId: `REC-${Date.now().toString().slice(-4)}`,
              message: 'Endpoint processed payload successfully',
            },
          };
          break;
        }

        case 'send_email': {
          const recipient = resolveTemplateVariables(node.config.to || '', executionContext);
          const subject = resolveTemplateVariables(node.config.subject || '', executionContext);
          step.logs.push(`Email queued for delivery to <${recipient}>: "${subject}"`);
          output = { messageId: `msg_${Date.now()}`, recipient, status: 'QUEUED_DELIVERED' };
          break;
        }

        case 'slack_notify': {
          const msg = resolveTemplateVariables(node.config.message || '', executionContext);
          step.logs.push(`Webhook pushed to Slack ${node.config.channel || '#alerts'}: "${msg.slice(0, 60)}..."`);
          output = { channel: node.config.channel, delivered: true, timestamp: Date.now() };
          break;
        }

        case 'db_upsert': {
          step.logs.push(`Executing UPSERT statement on table '${node.config.table || 'records'}'...`);
          output = { affectedRows: 1, state: 'COMMITTED', txId: `TX-${Date.now().toString().slice(-6)}` };
          break;
        }

        default:
          output = { status: 'executed', timestamp: new Date().toISOString() };
      }

      step.status = 'success';
      step.completedAt = new Date().toISOString();
      step.durationMs = Math.round(performance.now() - stepStart);
      step.outputPayload = output;

      // Update node in execution context
      executionContext[node.id] = output;
      steps.push(step);
      onStepProgress?.(step, node.id);
    } catch (err: any) {
      isFailed = true;
      step.status = 'failed';
      step.errorMessage = err.message || 'Execution error in step';
      step.completedAt = new Date().toISOString();
      step.durationMs = Math.round(performance.now() - stepStart);
      step.logs.push(`FATAL ERROR: ${step.errorMessage}`);
      steps.push(step);
      onStepProgress?.(step, node.id);
      break;
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  return {
    id: runId,
    workflowId: workflow.id,
    workflowName: workflow.name,
    triggerType: workflow.nodes[0]?.type || 'webhook_trigger',
    status: isFailed ? 'failed' : 'success',
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs,
    triggerPayload: initialTriggerPayload,
    steps,
  };
}
