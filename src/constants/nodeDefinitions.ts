import { NodeMeta, NodeType } from '../types';

export const NODE_DEFINITIONS: Record<NodeType, NodeMeta> = {
  // Triggers
  webhook_trigger: {
    type: 'webhook_trigger',
    label: 'Webhook Trigger',
    category: 'trigger',
    description: 'Listens for incoming HTTP POST/GET JSON payloads from external systems.',
    icon: 'Webhook',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    defaultConfig: {
      path: '/api/v1/webhook/incoming-event',
      httpMethod: 'POST',
      authRequired: true,
      samplePayload: JSON.stringify(
        {
          event: 'payment.completed',
          amount: 14999,
          currency: 'INR',
          customer: {
            name: 'Aarav Sharma',
            email: 'aarav.sharma@example.com',
            tier: 'enterprise',
          },
        },
        null,
        2
      ),
    },
  },
  schedule_trigger: {
    type: 'schedule_trigger',
    label: 'Cron Scheduler',
    category: 'trigger',
    description: 'Triggers the pipeline on a scheduled recurring cron pattern.',
    icon: 'Clock',
    color: 'teal',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    defaultConfig: {
      cronExpression: '0 9 * * 1-5', // Every weekday at 9 AM
      timezone: 'Asia/Kolkata',
      description: 'Weekdays at 9:00 AM IST',
    },
  },
  user_event_trigger: {
    type: 'user_event_trigger',
    label: 'Application Event',
    category: 'trigger',
    description: 'Triggered when a specific app state event occurs (e.g. user signup, subscription churn).',
    icon: 'Zap',
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    defaultConfig: {
      eventName: 'user.signup',
      source: 'auth-service',
      filterRole: 'admin',
    },
  },

  // Logic & Transformations
  condition_filter: {
    type: 'condition_filter',
    label: 'Condition Filter',
    category: 'logic',
    description: 'Evaluates boolean criteria (e.g. amount > 5000) and routes traffic conditionally.',
    icon: 'GitBranch',
    color: 'indigo',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    defaultConfig: {
      field: 'amount',
      operator: 'greater_than',
      value: '5000',
    },
  },
  code_transform: {
    type: 'code_transform',
    label: 'Code Transform (JS)',
    category: 'logic',
    description: 'Execute custom JavaScript transformation to map, filter, or reformat payloads.',
    icon: 'Code2',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    defaultConfig: {
      code: `// input is available as 'input'
return {
  fullName: input.customer?.name?.toUpperCase() || 'VALUED CUSTOMER',
  formattedAmount: '₹' + (input.amount || 0).toLocaleString('en-IN'),
  processedAt: new Date().toISOString(),
  highPriority: (input.amount || 0) >= 10000
};`,
    },
  },
  delay_timer: {
    type: 'delay_timer',
    label: 'Delay Timer',
    category: 'logic',
    description: 'Pauses workflow execution for a designated duration (e.g. 5 seconds, 1 hour).',
    icon: 'Hourglass',
    color: 'sky',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    defaultConfig: {
      durationSeconds: 3,
      unit: 'seconds',
    },
  },
  branch_switch: {
    type: 'branch_switch',
    label: 'Branch Switch',
    category: 'logic',
    description: 'Multi-way conditional switch routing based on payload key values.',
    icon: 'Split',
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    defaultConfig: {
      switchKey: 'customer.tier',
      branches: ['enterprise', 'pro', 'free'],
    },
  },

  // Actions & Integrations
  http_request: {
    type: 'http_request',
    label: 'HTTP Request (REST)',
    category: 'action',
    description: 'Calls any third-party REST API with custom HTTP headers, methods, and JSON body.',
    icon: 'Globe',
    color: 'cyan',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    defaultConfig: {
      method: 'POST',
      url: 'https://api.crm-hub.internal/v2/contacts',
      headers: '{\n  "Authorization": "Bearer env.API_KEY",\n  "Content-Type": "application/json"\n}',
      body: '{\n  "email": "{{trigger.customer.email}}",\n  "status": "active"\n}',
    },
  },
  send_email: {
    type: 'send_email',
    label: 'Send Email (SMTP/Resend)',
    category: 'action',
    description: 'Dispatches branded HTML transactional or alert emails with template tags.',
    icon: 'Mail',
    color: 'pink',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    defaultConfig: {
      to: '{{trigger.customer.email}}',
      subject: 'Confirmation: Your Payment of {{trigger.formattedAmount}} Received',
      body: `<h3>Dear {{trigger.fullName}},</h3>\n<p>Thank you for your business. Your recent transaction has been confirmed and provisioned successfully.</p>\n<p>Best regards,<br/><strong>FlowForge Cloud Services</strong></p>`,
    },
  },
  slack_notify: {
    type: 'slack_notify',
    label: 'Slack / Discord Alert',
    category: 'action',
    description: 'Sends real-time webhook markdown alerts to Slack or Discord channels.',
    icon: 'MessageSquare',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    defaultConfig: {
      channel: '#growth-alerts',
      message: '🚨 *New Enterprise Conversion*: {{trigger.fullName}} just paid {{trigger.formattedAmount}}!',
      botName: 'FlowForge Sentinel',
    },
  },
  db_upsert: {
    type: 'db_upsert',
    label: 'Database Sync (Postgres)',
    category: 'action',
    description: 'Inserts or updates records into PostgreSQL / MongoDB database tables.',
    icon: 'Database',
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    defaultConfig: {
      table: 'financial_ledger',
      conflictTarget: 'transaction_id',
      columns: '{\n  "status": "SETTLED",\n  "verified_at": "NOW()"\n}',
    },
  },
  generate_pdf: {
    type: 'generate_pdf',
    label: 'Generate PDF Document',
    category: 'action',
    description: 'Renders dynamic PDF invoices, certificates, or compliance reports.',
    icon: 'FileText',
    color: 'violet',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    defaultConfig: {
      template: 'commercial_tax_invoice_v2',
      watermark: 'PAID',
    },
  },
};
