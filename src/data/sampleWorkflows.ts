import { Workflow } from '../types';

export const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-stripe-vip',
    name: 'High-Value Payment & Enterprise CRM Dispatcher',
    description: 'Catches incoming Stripe webhooks, evaluates transaction tier, enriches payload, alerts Slack, and fires CRM contacts API.',
    active: true,
    version: 3,
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: '2026-11-13T18:30:00Z',
    webhookSecret: 'whsec_live_9942a0b1',
    nodes: [
      {
        id: 'node-1',
        type: 'webhook_trigger',
        label: 'Stripe Webhook (payment.success)',
        position: { x: 100, y: 180 },
        config: {
          path: '/api/v1/stripe/events',
          httpMethod: 'POST',
          samplePayload: JSON.stringify(
            {
              event: 'payment.completed',
              amount: 25000,
              currency: 'INR',
              customer: {
                name: 'Vikramaditya Singhania',
                email: 'vikram.singh@corporation.com',
                company: 'Singhania Logistics Ltd',
                tier: 'enterprise',
              },
            },
            null,
            2
          ),
        },
        status: 'idle',
      },
      {
        id: 'node-2',
        type: 'code_transform',
        label: 'Payload Normalizer & VAT Calculator',
        position: { x: 420, y: 180 },
        config: {
          code: `// Normalize fields & compute taxes
return {
  fullName: input.customer?.name || 'Customer',
  company: input.customer?.company || 'Individual',
  formattedAmount: '₹' + (input.amount || 0).toLocaleString('en-IN'),
  gstAmount: '₹' + ((input.amount || 0) * 0.18).toLocaleString('en-IN'),
  isEnterpriseTier: (input.amount || 0) >= 15000,
  processedTimestamp: new Date().toISOString()
};`,
        },
        status: 'idle',
      },
      {
        id: 'node-3',
        type: 'condition_filter',
        label: 'Filter: High-Value Threshold',
        position: { x: 740, y: 180 },
        config: {
          field: 'amount',
          operator: 'greater_than',
          value: '10000',
        },
        status: 'idle',
      },
      {
        id: 'node-4',
        type: 'slack_notify',
        label: 'Slack #enterprise-deals Alert',
        position: { x: 1060, y: 100 },
        config: {
          channel: '#enterprise-deals',
          message: '🚀 *Mega Payment*: {{trigger.fullName}} ({{trigger.company}}) just cleared {{trigger.formattedAmount}}!',
        },
        status: 'idle',
      },
      {
        id: 'node-5',
        type: 'send_email',
        label: 'VIP Tax Invoice & Welcome Kit',
        position: { x: 1060, y: 260 },
        config: {
          to: '{{trigger.customer.email}}',
          subject: 'Official Confirmation: Your {{trigger.formattedAmount}} Payment Processed',
        },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
      { id: 'e3-4', source: 'node-3', target: 'node-4', conditionLabel: 'Amount > 10K', animated: true },
      { id: 'e3-5', source: 'node-3', target: 'node-5', conditionLabel: 'Send VIP Receipt', animated: true },
    ],
  },
  {
    id: 'wf-lead-enrich',
    name: 'Inbound Lead Enrichment & CRM Sync',
    description: 'Captures web contact forms, scores prospective clients, and dispatches CRM webhook and onboarding email.',
    active: true,
    version: 1,
    createdAt: '2026-11-12T14:20:00Z',
    updatedAt: '2026-11-13T12:00:00Z',
    nodes: [
      {
        id: 'lead-1',
        type: 'webhook_trigger',
        label: 'Web Form Submissions',
        position: { x: 100, y: 180 },
        config: {
          path: '/api/v1/forms/lead-capture',
          samplePayload: JSON.stringify(
            {
              leadName: 'Rohan Mehta',
              leadEmail: 'rohan.mehta@fintech-ventures.io',
              teamSize: 45,
              budgetRange: '$5,000 - $15,000',
            },
            null,
            2
          ),
        },
        status: 'idle',
      },
      {
        id: 'lead-2',
        type: 'delay_timer',
        label: 'Clearbit Enrichment Delay',
        position: { x: 420, y: 180 },
        config: { durationSeconds: 2 },
        status: 'idle',
      },
      {
        id: 'lead-3',
        type: 'http_request',
        label: 'HubSpot / Salesforce Sync',
        position: { x: 740, y: 180 },
        config: {
          url: 'https://api.hubspot.com/crm/v3/objects/contacts',
          method: 'POST',
        },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'e-lead-1', source: 'lead-1', target: 'lead-2', animated: true },
      { id: 'e-lead-2', source: 'lead-2', target: 'lead-3', animated: true },
    ],
  },
];
