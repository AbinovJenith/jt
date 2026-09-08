# Jothi Traders – Technical Document

---

## 1. Project Overview

Jothi Traders is a B2B trading platform built as a full-stack monorepo. It manages products, suppliers, customers, RFQs, quotations, orders, invoices, payments, and shipments.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL 16 (hosted on Neon) |
| ORM | Prisma 5 |
| Auth | NextAuth (frontend) + JWT with refresh tokens (backend) |
| State Management | React Query (@tanstack/react-query) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| UI Primitives | Radix UI |
| File Storage | Cloudflare R2 (S3-compatible) |
| Package Manager | pnpm 9.15.4 |
| Monorepo Tooling | Turborepo |

---

## 3. Repository Structure

```
jt/                             ← Monorepo root
├── apps/
│   ├── api/                    ← NestJS backend
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── common/         ← Guards, decorators, filters, interceptors
│   │   │   └── modules/        ← Feature modules
│   │   │       ├── auth/
│   │   │       ├── users/
│   │   │       ├── categories/
│   │   │       ├── products/
│   │   │       ├── suppliers/
│   │   │       ├── customers/
│   │   │       ├── inventory/
│   │   │       ├── rfq/
│   │   │       ├── quotations/
│   │   │       ├── orders/
│   │   │       ├── purchase-orders/
│   │   │       ├── invoices/
│   │   │       ├── payments/
│   │   │       ├── shipments/
│   │   │       ├── dashboard/
│   │   │       ├── reports/
│   │   │       ├── audit/
│   │   │       ├── portal/
│   │   │       ├── attributes/
│   │   │       └── upload/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh
│   │   └── nest-cli.json
│   └── web/                    ← Next.js frontend
│       ├── app/
│       │   ├── (dashboard)/    ← All authenticated pages
│       │   │   ├── dashboard/
│       │   │   ├── products/
│       │   │   ├── categories/
│       │   │   ├── suppliers/
│       │   │   ├── customers/
│       │   │   ├── inventory/
│       │   │   ├── rfq/
│       │   │   ├── quotations/
│       │   │   ├── orders/
│       │   │   ├── purchase-orders/
│       │   │   ├── invoices/
│       │   │   ├── reports/
│       │   │   └── audit/
│       │   ├── login/
│       │   └── register/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── packages/
│   └── shared/
├── turbo.json
├── pnpm-workspace.yaml
├── netlify.toml
└── .env.example
```

---

## 4. Deployment Architecture

```
User Browser
     │
     ▼
Netlify (Frontend)               https://jothi-traders.netlify.app
     │  Next.js 15 App
     │
     ▼
Render (Backend API)             https://jt-qy6a.onrender.com
     │  NestJS + Docker
     │
     ▼
Neon (Database)                  PostgreSQL 16 (ap-southeast-1)
     │  Project: crimson-sky-30669771
     │
     └── Cloudflare R2 (File Storage)
```

---

## 5. Environment Variables

### Backend (Render)

| Variable | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...@ep-polished-wave-b3c4uleq-pooler...` | Neon pooled connection for app queries |
| `DIRECT_URL` | `postgresql://...@ep-polished-wave-b3c4uleq...` | Neon direct connection for migrations |
| `NODE_ENV` | `production` | Runtime environment |
| `API_PORT` | `4000` | Port the API listens on |
| `API_PREFIX` | `api/v1` | URL prefix for all routes |
| `JWT_SECRET` | `0bc6cfee...` | Secret for signing access tokens |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_SECRET` | `5364b1ef...` | Secret for signing refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `CORS_ORIGIN` | `https://jothi-traders.netlify.app` | Allowed frontend origin |
| `STORAGE_PROVIDER` | `r2` | File storage provider |
| `R2_ACCOUNT_ID` | *(Cloudflare account ID)* | Cloudflare account |
| `R2_ACCESS_KEY_ID` | *(R2 key)* | R2 access key |
| `R2_SECRET_ACCESS_KEY` | *(R2 secret)* | R2 secret |
| `R2_BUCKET_NAME` | `jothi-traders` | R2 bucket name |
| `R2_PUBLIC_URL` | *(R2 public URL)* | Public URL for uploaded files |

### Frontend (Netlify)

| Variable | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://jt-qy6a.onrender.com/api/v1` | Backend API URL used by browser |
| `NEXTAUTH_SECRET` | `07b2e443...` | NextAuth JWT signing secret |
| `NEXTAUTH_URL` | `https://jothi-traders.netlify.app` | Frontend base URL for auth redirects |
| `SECRETS_SCAN_OMIT_KEYS` | `NEXTAUTH_SECRET` | Tells Netlify to ignore this key in build scan |

---

## 6. API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns access + refresh tokens |
| POST | `/api/auth/logout` | Invalidate refresh token |
| POST | `/api/auth/refresh` | Rotate refresh token |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/categories` | List / create categories |
| GET/PUT | `/api/categories/:id` | Get / update category |
| GET/POST | `/api/products` | List / create products |
| GET/PUT | `/api/products/:id` | Get / update product |
| GET/POST | `/api/suppliers` | List / create suppliers |
| POST | `/api/suppliers/:id/products` | Link supplier to product variant with price |
| GET/POST | `/api/customers` | List / create customers |
| GET/POST | `/api/rfq` | List / create RFQs |
| GET/POST | `/api/quotations` | List / create quotations |
| GET/POST | `/api/orders` | List / create orders |
| GET/POST | `/api/purchase-orders` | List / create purchase orders |
| GET/POST | `/api/invoices` | List / create invoices |
| GET/POST | `/api/payments` | List / create payments |
| GET/POST | `/api/shipments` | List / create shipments |
| GET | `/api/dashboard` | Dashboard summary stats |
| GET | `/api/dashboard/revenue-chart` | Revenue chart data |
| GET | `/api/reports/sales` | Sales report |
| GET | `/api/reports/inventory` | Inventory report |
| GET | `/api/reports/suppliers` | Supplier report |
| GET | `/api/reports/customers` | Customer report |
| GET | `/api/audit` | Audit logs |
| POST | `/api/upload/presign` | Generate presigned URL for R2 upload |
| DELETE | `/api/upload` | Delete file from R2 |
| GET | `/api/docs` | Swagger UI (auto-generated) |

---

## 7. Authentication Flow

```
Login Request
     │
     ▼
POST /api/auth/login
     │  Validates email + bcrypt password
     ▼
Returns:
  - accessToken  (JWT, 15 min)
  - refreshToken (JWT, 7 days, stored in DB)
     │
     ▼
Frontend stores in NextAuth session
     │
     ▼
Every API request:
  Authorization: Bearer <accessToken>
     │
     ▼
JWT Guard validates token → extracts user role
     │
     ▼
Roles Guard checks UserRole (ADMIN / STAFF / SUPPLIER / CUSTOMER)
```

**Token refresh:** When access token expires, frontend automatically calls `POST /api/auth/refresh` with the refresh token. A new access token and rotated refresh token are returned.

---

## 8. Database Schema

### Users & Auth
- **users** — All platform users (ADMIN, STAFF, SUPPLIER, CUSTOMER roles)
- **refresh_tokens** — Active refresh tokens per user

### Product Catalogue
- **categories** — Hierarchical (self-referencing `parentId`)
- **attribute_groups** — Groups of attributes per category
- **attribute_definitions** — Attribute definitions (TEXT, NUMBER, SELECT, etc.)
- **products** — Product master records
- **product_variants** — Each variant has a unique Product Code (SKU) and Quantity
- **product_attribute_values** — Attribute values per variant
- **product_images** — Product images stored in R2
- **product_documents** — Datasheets, certificates, etc.

### Suppliers & Pricing
- **suppliers** — Supplier company records
- **supplier_products** — Links supplier → variant with price, MOQ, lead time

### Customers
- **customers** — Customer company records with credit limit/terms

### Inventory
- **warehouses** — Warehouse locations
- **inventory_items** — Stock levels per variant per warehouse (qtyOnHand, qtyReserved)

### RFQ → Quotation → Order Workflow
- **rfqs** — Request for Quotation from customer
- **rfq_items** — Line items in an RFQ
- **quotations** — Quotation raised against an RFQ
- **quotation_items** — Priced line items in a quotation
- **orders** — Confirmed order (from quotation or direct)
- **order_items** — Line items in an order

### Procurement
- **purchase_orders** — PO raised to supplier for an order
- **purchase_order_items** — Line items in a PO

### Finance
- **invoices** — Invoice per order
- **payments** — Payments against an invoice

### Logistics
- **shipments** — Shipment tracking per order

### System
- **audit_logs** — All CRUD actions logged with old/new data
- **sequence_counters** — Auto-incrementing number generators for RFQ, QUO, ORD, PO, INV numbers

---

## 9. Docker & Deployment

### Dockerfile (apps/api/Dockerfile)

The API is containerized using a multi-stage build:

**Stage 1 — Builder:**
1. Install pnpm via corepack
2. Copy package.json files and install dependencies
3. Copy source code
4. Run `prisma generate` to build Prisma client
5. Run `nest build` to compile TypeScript to `dist/src/`

**Stage 2 — Runner:**
1. Fresh Alpine image with OpenSSL installed
2. Copy only built artifacts (dist, node_modules, prisma)
3. Copy `entrypoint.sh`
4. Run as non-root user `jothi`

### entrypoint.sh

```sh
#!/bin/sh
set -e
prisma migrate deploy --schema=apps/api/prisma/schema.prisma
exec node apps/api/dist/src/main
```

Runs database migrations on every container start, then starts the API.

---

## 10. How to Redeploy

### Backend (Render)
- **Auto-deploy:** Every push to `main` branch triggers a new Docker build and deploy on Render
- **Manual redeploy:** Render dashboard → your service → Manual Deploy → Deploy latest commit
- **Environment variable changes:** Render → service → Environment → edit → Save (auto-redeploys)

### Frontend (Netlify)
- **Auto-deploy:** Every push to `main` branch triggers a new Netlify build
- **Manual redeploy:** Netlify dashboard → Deploys → Trigger deploy
- **Environment variable changes:** Netlify → Site configuration → Environment variables → add/edit → Save → manually redeploy

---

## 11. Database Operations

### Run Migrations (production)
Migrations run automatically via `entrypoint.sh` on every deploy.

To run manually from local machine:
```bash
DIRECT_URL="postgresql://..." ./apps/api/node_modules/.bin/prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

### Run Seed (production)
To seed the admin user and initial data:
```bash
DATABASE_URL="postgresql://..." ./apps/api/node_modules/.bin/tsx apps/api/prisma/seed.ts
```

### Prisma Studio (local DB browser)
```bash
pnpm db:studio
```

### Create a new migration (local dev)
```bash
pnpm db:migrate
# Enter a migration name when prompted
```

### Generate Prisma client after schema changes
```bash
pnpm db:generate
```

---

## 12. Local Development Setup

### Prerequisites
- Node.js 20+
- pnpm 9.15.4+
- Docker Desktop (for local PostgreSQL)
- PostgreSQL 16

### Steps
```bash
# 1. Clone the repo
git clone https://github.com/AbinovJenith/jt.git
cd jt

# 2. Install dependencies
pnpm install

# 3. Copy env file and fill in values
cp .env.example .env

# 4. Start PostgreSQL
docker compose up postgres -d

# 5. Run migrations
pnpm db:migrate

# 6. Generate Prisma client
pnpm db:generate

# 7. Seed database
./apps/api/node_modules/.bin/tsx apps/api/prisma/seed.ts

# 8. Start dev servers
pnpm dev
```

### Local URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/api/docs |

### Default Login
- Email: `admin@jothitraders.com`
- Password: `Admin@123`

---

## 13. Git Repository

- **Remote:** https://github.com/AbinovJenith/jt
- **Branch:** `main`
- **Git author:** AbinovJenith `<abinovjenith@gmail.com>`

To push changes:
```bash
git add .
git commit -m "your message"
git push ownorigin main
```

---

## 14. Key Files Reference

| File | Purpose |
|---|---|
| `apps/api/prisma/schema.prisma` | Database schema — all tables and relations |
| `apps/api/prisma/seed.ts` | Seeds admin user and warehouse |
| `apps/api/src/main.ts` | NestJS entry point, port config |
| `apps/api/src/app.module.ts` | Root module, registers all feature modules |
| `apps/api/Dockerfile` | Multi-stage Docker build |
| `apps/api/entrypoint.sh` | Migration + app start script |
| `apps/web/lib/api.ts` | Axios instance with auth interceptor |
| `apps/web/middleware.ts` | NextAuth session protection middleware |
| `netlify.toml` | Netlify build configuration |
| `turbo.json` | Turborepo pipeline configuration |
| `.env.example` | Template for environment variables |
