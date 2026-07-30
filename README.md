# LumenZenith Realty (OPC) Private Limited — Real Estate Portal

A high-performance, secure, and production-optimized real estate platform built for corporate channel partner and property advisory operations based in Bengaluru, Karnataka. This application serves as the digital front-face for handling inbound client consultations (`consult@`), B2B developer relationship pipelines (`partnerships@`), and internal back-office document management (`desk@`, `support@`).

The enterprise system is architected to balance human-centric client onboarding with ironclad data privacy parameters under the Indian Digital Personal Data Protection (DPDP) Act.

## 🚀 Key Features

- **Multi-Channel Lead Segmentation:** Custom form funnels routing incoming inquiries into segmented internal organizational channels.
- **Enterprise E-Mail Security Built-In:** Structurally aligned with verified primary global security records including SPF (`include:_://google.com`), DKIM (1024/2048-bit cryptographically signed keys), and DMARC (`p=none` diagnostic surveillance).
- **Serverless Form Processing:** Completely secure data pipeline tracking customer profiles without rendering vulnerability footprint on the client side.
- **Karnataka RERA Compliant Architecture:** Layout structures explicitly mapped out to honor regulatory transparency criteria for RERA-registered projects across Karnataka.

## 🔐 Admin Panel (RBAC)

A private, role-gated admin area for managing leads. It is **not linked anywhere in the public site** and is protected both by middleware (cookie gate) and server-side role checks.

- **URL:** `/admin` (login page at `/admin/login`)
- **Roles:**
  - `viewer` — read-only access to the leads table (filter, sort, paginate, arrange columns).
  - `editor` — everything a viewer can do, plus edit and delete leads.
- **Leads table:** server-side pagination (latest leads first), text search, status filter, column sorting, show/hide columns, and drag-and-drop column reordering. Each admin's column order and visibility are saved to `localStorage`, so they persist across refreshes and logins on the same browser.

### Seeding admin accounts

There is no public registration. Two admin accounts are created by calling the one-time seed endpoint (idempotent — safe to call again, it no-ops once admins exist):

```bash
curl -X POST https://<your-app-url>/api/admin/seed
```

Default seeded credentials (⚠️ **change these in production** via the seed endpoint env vars or by resetting the passwords):

| Role     | Email                     | Password       |
| -------- | ------------------------- | -------------- |
| `editor` | `admin@realestate.com`    | `Admin@12345`  |
| `viewer` | `viewer@realestate.com`   | `Viewer@12345` |

You can override the defaults by setting `ADMIN_EDITOR_EMAIL`, `ADMIN_EDITOR_PASSWORD`, `ADMIN_VIEWER_EMAIL`, and `ADMIN_VIEWER_PASSWORD` before calling the seed endpoint.

## 🛠️ Tech Stack & Infrastructure

- **Frontend Core:** Next.js 15 (React Framework using the optimized App Router paradigm)
- **Programming Language:** TypeScript (Structuring 94%+ of the typed logic)
- **Styling Architecture:** Tailwind CSS paired with `shadcn/ui` accessible atomic design wrappers
- **Database Engine:** Supabase Serverless PostgreSQL Instance
- **Data Protection:** Native Postgres Row-Level Security (RLS) preventing client-side programmatic exploitation
- **Cloud Delivery Network:** Vercel Automated Edge Networks

## 📂 Project Structure

```text
real-estate/
├── app/                  # Next.js App Router core routing, API channels, and pages
├── components/           # Reusable UI modules generated via v0 / shadcn
├── lib/                  # Deep utility integrations (Database context, encryption engines)
├── public/               # Static media parameters, legal document assets
├── .gitignore            # Clean staging parameters skipping build files and node modules
├── components.json       # Shadcn UI configuration map
├── tsconfig.json         # Master strict TypeScript compilation rules
└── package.json          # Node dependency definitions
```

## ⚙️ Getting Started & Local Development

Follow these steps to safely initialize, audit, and execute this repository locally on your device:

### 1. Prerequisite Security Configurations (Windows Environment)
If running your terminal commands via Windows PowerShell, ensure local script security blocks are lifted before package initialization:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### 2. Project Installation
Clone the repository and inject all necessary development node modules:
```bash
npm install
```

### 3. Initialize Local Development Environment
Boot up the local optimization server to see your application UI render dynamically:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser window to trace layout changes in real-time.

## 🔒 Data Privacy & Production Security Guidelines

- **Zero API Key Leakage:** Do not hardcode database URLs or security parameters into any trackable components. All database pointers must inhabit a restricted `.env.local` file (safeguarded via `.gitignore`).
- **Server Actions Execution:** All database mutations (Lead insertions) must utilize Next.js Server Actions or server-side API endpoints (`"use server"`) to mask PostgreSQL connection matrices from browser inspections.
- **Row-Level Security (RLS):** Ensure the underlying Supabase tables are fortified with RLS rules blocking direct public modification attempts.

## 📜 Business Alignment & Classifications
The underlying corporate structure matches the official Ministry of Corporate Affairs (MCA) and Karnataka Real Estate Regulatory Authority (KRERA) guidelines:
- **NIC Code 68200:** Real estate activities on a fee or contract basis (Primary Agency/Brokerage)
- **NIC Code 68100:** Real estate activities with own or leased property
- **NIC Code 73100:** Advertising & Digital Property Marketing Consultation
