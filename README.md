# LOOPNEX

### Intelligent Subscription Management & Revenue Operations Platform
> *"Every recurring transaction. One intelligent ecosystem."*

[![Commit Milestone](https://img.shields.io/badge/Milestone-COMMIT%2001%20%2F%2011-27D3C2?style=for-the-badge)](https://github.com/farhanajebin/Odoo_make-a-ton)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v24-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v6.4-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 1. Project Vision & Problem Statement

### The Problem
Modern subscription and B2B SaaS businesses face severe operational fragmentation:
- **Revenue Leakage**: Upgrades, add-ons, and unmetered usage go unbilled due to disconnected catalogs and invoicing silos.
- **Contract & CPQ Friction**: Sales teams negotiate customized quotes in spreadsheets that cannot automatically convert into recurring billing schedules.
- **Renewal Blindness**: Retention teams discover churn only after a customer cancels, lacking proactive health indicators.
- **Financial Calculation Drift**: Ad-hoc decimal handling causes rounding variances across multi-currency invoices, taxes, and ledgers.

### The LOOPNEX Solution
LOOPNEX unifies the entire recurring revenue lifecycle into a singular intelligent ecosystem:
- **Unified Catalog & CPQ**: One-click conversion from B2B quotation to active recurring subscription.
- **Decimal-Exact Financial Operations**: Strict 12,2 decimal precision across all invoices, taxes, payments, and ledgers.
- **Proactive Intelligence**: Built from the ground up to support our upcoming differentiating modules:
  - 📡 **Revenue Leak Radar** (Unbilled usage & margin leak detection)
  - 🩺 **Subscription Health Score** (Predictive churn telemetry)
  - 🔮 **What-If Revenue Simulator** (Expansion & pricing model testing)
  - 🔄 **Smart Renewal Command Center** (Automated renewal playbooks)
  - 🛡️ **Billing Integrity Guardian** (Audit integrity & ledger verification)

---

## 2. Commit 01 — Foundation Core Scope

This repository represents **COMMIT 01** of an 11-milestone competition engineering roadmap:
- ✅ **Full Monorepo Architecture**: Integrated client, server, and docs.
- ✅ **Express Backend Engine**: Modular TypeScript routing, Zod environment parsing, error boundary, and request tracing.
- ✅ **API Health Telemetry**: Live endpoint (`GET /api/health`) reporting system uptime, environment, and non-sensitive database probe results.
- ✅ **PostgreSQL Database Foundation**: 21 domain entities modeled in Prisma with Decimal monetary precision and CUID keys.
- ✅ **Enterprise SaaS UI/UX Design System**:
  - Full Dark/Light theme switching with persisted preferences.
  - Tailored LOOPNEX color tokens: Deep Navy (`#0B1220`), Graphite (`#151E2D`), Surface (`#1C293A`), Electric Teal (`#27D3C2`), Soft Cyan (`#72D8E8`), Violet (`#8175F5`).
  - 16-destination collapsible navigation sidebar.
  - Live "Business Overview" dashboard with KPI metrics, interactive Recharts revenue area chart, event feed, renewal radar, and rapid operation modals.
  - Seamless toggle between realistic simulation data and unseeded database zero-state.

---

## 3. Commit 04 — Subscription Plan & Pricing Engine

This milestone adds a production-grade subscription plan studio, built for recurring billing and configurable pricing workflows.

### Included in this milestone
- Subscription plan catalog with billing cadence, price, quantity rules, availability dates, and lifecycle status.
- Decimal-safe pricing calculations using backend validation and exact currency math.
- Product-derived and variant-derived pricing modes with optional custom override.
- Lifecycle controls for draft, active, paused, and archived plans.
- REST APIs for plan creation, edits, pricing previews, lifecycle changes, and audit/history access.
- Supporting database schema and migration artifacts for plan and history tracking.

### Implementation status
- ✅ Plan catalog model and plan history model prepared in Prisma schema.
- ✅ Plan pricing utilities enforce decimal-safe calculations and minimum quantity validation.
- ✅ Backend REST endpoints support plan management and pricing preview workflows.
- ✅ Documentation and migration artifacts created for the plan engine.

---

## 4. Technology Stack

### Frontend Client (`/client`)
- **Framework**: React 18 (TypeScript)
- **Tooling**: Vite 6
- **Styling**: Tailwind CSS 3 with custom CSS variable color design system
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios with centralized health polling and error formatting

### Backend API Server (`/server`)
- **Runtime**: Node.js (v24 compatible)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma ORM v6.4
- **Schema Validation**: Zod
- **Security**: CORS, sanitized error handlers, zero credential exposure

### Database
- **Engine**: PostgreSQL
- **Schema**: 21 relational models with exact Decimal fields for all currencies

---

## 4. Project Directory Layout

```
loopnex/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── ui/             # Button, Card, Badge, Modal, Input
│       │   ├── layout/         # Sidebar, Navbar, DashboardLayout
│       │   └── dashboard/      # KpiCards, RevenueChart, Activity, Renewals, QuickActions
│       ├── constants/          # Navigation registry & module metadata
│       ├── hooks/              # useHealth, useTheme
│       ├── lib/                # utils & formatters
│       ├── pages/              # OverviewPage, UpcomingPage
│       ├── routes/             # Client routes
│       ├── services/           # Axios apiClient & fetchHealthStatus
│       ├── styles/             # Tailwind base styles & color tokens
│       ├── types/              # Client TypeScript interfaces
│       ├── App.tsx
│       └── main.tsx
├── server/
│   ├── prisma/
│   │   └── schema.prisma       # Complete 21-entity data model
│   └── src/
│       ├── config/             # Zod environment validation
│       ├── controllers/        # Health controller
│       ├── middleware/         # Logging & error handling
│       ├── routes/             # REST routes
│       ├── services/           # Prisma client singleton & health probe
│       ├── types/              # Backend interfaces
│       ├── utils/              # Standard JSON envelopes
│       ├── app.ts
│       └── server.ts
├── docs/
│   ├── ARCHITECTURE.md         # Detailed architectural documentation
│   └── DATABASE_DESIGN.md      # Database ERD & entity tables
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: (Optional for local testing; server will start in graceful degraded mode if DB is pending)

### Step 1: Clone Repository
```bash
git clone https://github.com/farhanajebin/Odoo_make-a-ton.git
cd Odoo_make-a-ton
```

### Step 2: Install Dependencies
Install all workspace dependencies across client and server with one command:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default parameters in `.env`:
```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loopnex_dev?schema=public

VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=LOOPNEX
VITE_ENABLE_DEMO_MODE=true
```

### Step 4: Generate Prisma Client
```bash
npm run prisma:generate --workspace=server
```

*(If PostgreSQL is running, apply the database schema with: `npm run prisma:migrate --workspace=server`)*

---

## 6. Running the Application

### Option A: Run Both Frontend and Backend Concurrently (Recommended)
```bash
npm run dev
```
- **Frontend SPA**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### Option B: Run Services Individually
```bash
# Terminal 1 — Backend Express Server
npm run dev:server

# Terminal 2 — Frontend React Client
npm run dev:client
```

---

## 7. Verification & Testing Commands

To run all quality assurance checks:

```bash
# Typecheck both frontend and backend
npm run typecheck

# Production build of both workspaces
npm run build
```

---

## 8. API Endpoints

### `GET /api/health`
Checks backend uptime and probes database connectivity without exposing credentials.

**Sample Response (`200 OK`):**
```json
{
  "status": "ok",
  "application": "LOOPNEX Platform",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-10-31T05:27:00.000Z",
  "uptimeSeconds": 142,
  "database": {
    "status": "connected",
    "latencyMs": 4
  },
  "features": {
    "revenueRadar": "planned",
    "subscriptionHealthScore": "planned",
    "whatIfSimulator": "planned",
    "renewalCenter": "planned",
    "billingIntegrityGuardian": "planned"
  }
}
```

---

## 9. Next Milestones Preview

| Milestone | Target | Description |
|---|---|---|
| **Commit 02** | Command Center | Operational triage, real-time alerts & action dispatcher |
| **Commit 03** | Customer Intelligence | Multi-currency credit limits & hierarchical customer trees |
| **Commit 04** | Products & Pricing | Complex tiered billing, volume scales & metered SKUs |
| **Commit 05** | Quotation CPQ | Enterprise quotation builder, PDF generation & digital accept |

---

## 10. License
Internal Competition Development — LOOPNEX Team.
