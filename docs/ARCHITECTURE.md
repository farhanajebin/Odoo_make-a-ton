# LOOPNEX — System Architecture & Engineering Blueprint

> **"Every recurring transaction. One intelligent ecosystem."**  
> Product Category: Intelligent Subscription Management & Revenue Operations Platform  
> Milestone: **COMMIT 04 / 11 — Subscription Plan & Pricing Engine**

---

## 1. Architectural Philosophy

LOOPNEX is engineered as an enterprise-grade Revenue Operations (RevOps) and Subscription Management engine. Modern SaaS and recurring billing systems require mathematical precision, strict idempotent execution, complete auditability, and zero tolerance for floating-point calculation errors.

### Core Architectural Tenets
1. **Financial Integrity First**: All monetary amounts, tax computations, balances, and discount calculations are stored and processed using exact **Decimal (12, 2)** precision. Floating-point types (`float`, `double`) are banned from all billing and financial paths.
2. **Decoupled Monorepo Architecture**: Clean separation of frontend consumer (`client`), backend API service (`server`), and declarative data layer (`prisma`), coordinated via unified scripts and type contracts.
3. **Graceful Degradation**: The API server starts securely and responds with structured health telemetry even when external dependencies (such as PostgreSQL) are pending configuration.
4. **Design Excellence**: Enterprise SaaS aesthetic built with tailored color tokens, high contrast, clean typography (Inter), micro-animations, and full dark/light theme switching.

---

## 2. Monorepo Structure

```
loopnex/
├── client/                     # Frontend SPA application
│   ├── public/                 # Static assets, favicon, SVGs
│   ├── src/
│   │   ├── assets/             # Brand logos and iconography
│   │   ├── components/         # Modular design system
│   │   │   ├── ui/             # Atomic components (Button, Card, Badge, Modal, Input)
│   │   │   ├── layout/         # Shell components (Navbar, Sidebar, DashboardLayout)
│   │   │   └── dashboard/      # Domain widgets (KpiCards, RevenueChart, Activity, Renewals, QuickActions)
│   │   ├── constants/          # Static definitions & 16-module navigation registry
│   │   ├── hooks/              # Custom React hooks (useHealth, useTheme)
│   │   ├── lib/                # Utility libraries & number/currency formatters
│   │   ├── pages/              # Route views (OverviewPage, UpcomingPage)
│   │   ├── routes/             # Client-side router configuration
│   │   ├── services/           # Axios API services and endpoints
│   │   ├── styles/             # Tailwind CSS tokens & theme variables
│   │   ├── types/              # Client TypeScript type contracts
│   │   ├── App.tsx             # Root application orchestrator
│   │   ├── main.tsx            # React 18 DOM mount point
│   │   └── vite-env.d.ts       # Vite client typings
│   ├── index.html              # HTML entry with SEO metadata and Inter font
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend API & RevOps engine
│   ├── prisma/
│   │   └── schema.prisma       # 21 planned financial models & enums
│   ├── src/
│   │   ├── config/             # Zod environment variable parsing
│   │   ├── controllers/        # Express route controllers (Health)
│   │   ├── middleware/         # CORS, request logging, error handling
│   │   ├── routes/             # Modular REST routers
│   │   ├── services/           # Prisma client singleton & health service
│   │   ├── types/              # Backend TypeScript interfaces
│   │   ├── utils/              # Standard JSON response envelopes
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Server bootstrap and graceful shutdown
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Architectural documentation
│   ├── ARCHITECTURE.md         # System design & component interactions
│   └── DATABASE_DESIGN.md      # Schema ERD & relational model specifications
│
├── .env.example                # Sample environment configurations
├── .gitignore                  # Production exclusion filters
├── package.json                # Root orchestration package
└── README.md                   # Getting started & deployment guide
```

---

## 3. Technology Stack Justification

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Frontend Framework** | React + TypeScript | 18.3.1 / 5.7 | Component modularity, battle-tested ecosystem, strict type safety |
| **Bundler & Tooling** | Vite | 6.1.0 | Sub-second HMR, optimized production bundling with Rollup |
| **Styling** | Tailwind CSS | 3.4.17 | Predictable utility classes, custom LOOPNEX color tokens, dark/light mode |
| **Icons** | Lucide React | 0.475.0 | Crisp, consistent SVG iconography across 16 navigation paths |
| **Data Visualization** | Recharts | 2.15.1 | Declarative SVG-based area charts with smooth gradients & tooltips |
| **Routing** | React Router | 6.29.0 | Client-side routing with nested layout preservation |
| **HTTP Client** | Axios | 1.7.9 | Centralized interceptors, timeout controls, and structured error extraction |
| **Backend Runtime** | Node.js + Express | v24 / 4.21 | Lightweight, high throughput HTTP engine with proven middleware stack |
| **ORM & Data Layer** | Prisma ORM | 6.4.1 | Schema migrations, type-safe queries, Decimal field mapping |
| **Validation** | Zod | 3.24.2 | Strict runtime configuration parsing and request validation |
| **Database** | PostgreSQL | 15+ | ACID transactions, robust index capabilities, decimal arithmetic |

---

## 4. Brand Color Token System

```css
/* Dark Mode Palette (Primary Enterprise Experience) */
--color-deep-navy:      #0B1220;   /* Primary canvas background */
--color-graphite:       #151E2D;   /* Elevated card surface */
--color-surface:        #1C293A;   /* Interactive elements / pills */
--color-surface-border: #27384E;   /* Subtle boundary lines */
--color-electric-teal:  #27D3C2;   /* Primary brand accent / MRR */
--color-soft-cyan:      #72D8E8;   /* Secondary brand accent */
--color-violet-accent:  #8175F5;   /* Intelligence & ML features */
--color-primary-text:   #F3F6FA;   /* High-contrast headings & data */
--color-secondary-text: #9AAABD;   /* Muted labels & subtitles */

/* Light Mode Palette */
--color-light-bg:       #F8FAFC;   /* Crisp slate canvas */
--color-light-card:     #FFFFFF;   /* Clean white cards */
--color-light-border:   #E2E8F0;   /* Border dividers */
--color-light-text:     #0F172A;   /* Slate 900 text */
--color-light-muted:    #64748B;   /* Slate 500 secondary */
```

---

## 5. Milestone Progression Roadmap (11 Commits)

- **COMMIT 01 (Current)**: Foundation Core, Project Architecture, Express Health, Prisma Schema, Initial SaaS Dashboard.
- **COMMIT 02**: Operational Command Center & Real-Time Operational Triage.
- **COMMIT 03**: Customer Entity, Multi-Currency Credit Lines, Hierarchical Accounts.
- **COMMIT 04**: Subscription Plan Studio, Pricing Engine, product-derived pricing, lifecycle controls, and historical plan audits.
- **COMMIT 05**: B2B Quotation Builder (CPQ), Contract Templates & Approval Workflows.
- **COMMIT 06**: Subscription Lifecycle Engine, Upgrades, Downgrades & Proration.
- **COMMIT 07**: Automated Invoice Generation, Dunning Cycles & Tax Engine.
- **COMMIT 08**: Multi-Gateway Payment Processing, ACH & Auto-Reconciliation.
- **COMMIT 09**: Smart Renewal Command Center & Health Score Engine.
- **COMMIT 10**: Revenue Leak Radar & What-If Revenue Simulation Engine.
- **COMMIT 11**: Billing Integrity Guardian, Audit Trails, Production Hardening.
