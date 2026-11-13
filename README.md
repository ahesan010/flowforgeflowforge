# ⚡ FlowForge — Distributed Event-Driven Workflow Automation & DAG Orchestration Engine

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> **A high-throughput, visual event orchestration engine designed as a modern open-source alternative to Zapier, n8n, and Temporal.**

---

## 🌟 Overview & Systems Engineering Highlights

Modern backend applications rely heavily on asynchronous event pipelines, webhook processing, and third-party integrations. Building point-to-point integrations creates spaghetti code and unmanageable dependencies.

**FlowForge** solves this with an enterprise-grade Directed Acyclic Graph (DAG) execution engine paired with a low-latency, fluid node canvas. Users visually compose multi-step automation pipelines that execute asynchronously with live step telemetry, variable interpolation, and conditional branching.

---

## ✨ Key Features & Technical Capabilities

* 🌐 **Visual DAG Node Canvas:** Fluid zoomable and pannable workspace with animated particle Bézier connections and drag-and-drop node placement.
* 🧮 **Kahn's Topological Sorting Algorithm:** Automatic cycle detection preventing infinite execution loops and determining exact parallel/serial execution sequences.
* ⚡ **Event Ingestion & Triggers:** Webhook listeners with payload verification, recurring cron schedules, and custom application event stream hooks.
* 🔀 **Conditional Branching & Logic Filters:** Dynamic traffic routing based on payload evaluations (`amount > 10000`, regex matching, equality checks).
* 🧪 **JavaScript Code Transform Sandbox:** Execute custom ES6 transformation logic in an isolated evaluation context to normalize or enrich payloads.
* 🔗 **Dynamic Variable Interpolation:** Seamless nested template tags (e.g. `{{trigger.customer.email}}`, `{{trigger.formattedAmount}}`) dynamically injected into HTTP headers, emails, and Slack alerts.
* 📡 **Live Telemetry & Step Tracer:** Step-by-step execution timeline detailing duration in milliseconds, input payloads, output mutations, and console logs.
* 💾 **Offline-First Persistence & JSON Portability:** Export and import complete workflow graphs as reproducible JSON blueprints.

---

## 🏗️ Architecture & Folder Structure

```text
flowforge/
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CanvasNode.tsx          # Interactive node card with connection handles
│   │   │   └── WorkflowCanvas.tsx      # SVG Bézier edge renderer with zoom/pan
│   │   ├── execution/
│   │   │   └── ExecutionDrawer.tsx     # Step-by-step payload inspector & logs console
│   │   ├── inspector/
│   │   │   └── NodeInspector.tsx       # Slide-over parameter & code configuration drawer
│   │   ├── navigation/
│   │   │   └── TopBar.tsx              # Workflow switcher, test run CTA, JSON export
│   │   └── sidebar/
│   │       └── NodeLibraryModal.tsx    # Catalog of triggers, logic, and actions
│   │
│   ├── constants/
│   │   └── nodeDefinitions.ts          # Metadata, color schemes, and default configs
│   ├── data/
│   │   └── sampleWorkflows.ts          # Production blueprints (Stripe VIP, CRM Enrichment)
│   ├── engine/
│   │   └── dagOrchestrator.ts          # Topological sort, cycle detector, and runner
│   ├── types/
│   │   └── index.ts                    # TypeScript definitions for nodes, edges, traces
│   │
│   ├── App.tsx                         # Central state orchestrator
│   ├── index.css                       # Tailwind v4 configuration
│   └── main.tsx                        # Entrypoint
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 💼 Resume Bullet Points & Interview Talking Points

If you feature **FlowForge** on your software engineering resume, here are recruiter-optimized bullet points:

* **Engine Architecture:** *"Engineered a visual event-driven workflow automation platform utilizing Kahn's topological sorting algorithm for DAG execution and cycle detection."*
* **Real-Time Telemetry:** *"Developed an asynchronous pipeline runner supporting real-time step telemetry, template variable interpolation (`{{key.path}}`), and microsecond execution tracing."*
* **Frontend Performance:** *"Built a hardware-accelerated SVG canvas with dynamic Bézier curve rendering, animated stroke dash arrays, and 60fps pan/zoom controls."*

---

## 🚀 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Launch development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 License
MIT License. Feel free to use, customize, and monetize!
