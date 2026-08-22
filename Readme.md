# HMS Server

Backend REST API for a Hospital Management System — built to streamline hospital operations, patient care, and healthcare workflows. Secure, scalable, and production-ready architecture.

**Stack:** Node.js · Express 5 · TypeScript · Prisma 7 · PostgreSQL · Zod · Better Auth · Nodemailer · JWT

> **Active development** — the `development` branch is the working branch.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Modules](#modules)
- [Available Scripts](#available-scripts)
- [Prisma & Database](#prisma--database)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool           | Version | Check     |
| -------------- | ------- | --------- |
| **Node.js**    | 20+     | `node -v` |
| **PostgreSQL** | 14+     | `psql -V` |

---

## Getting Started

**1. Clone the repo and switch to the development branch**

```bash
git clone https://github.com/jahedulislamdev/HMS-Server.git
cd HMS-Server
git checkout development
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Fill in all values — see [Environment Variables](#environment-variables) below.

**4. Generate the Prisma client**

```bash
npm run generate
```

The generated client is git-ignored. Run this after every fresh clone and after any schema change.

**5. Run database migrations**

```bash
npm run migrate
```

**6. Start the development server**

```bash
npm run dev
```

Server starts on the port defined in `.env` (default: `5000`).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hms_db?schema=public"

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:5000

# Email (Nodemailer)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Client
FRONTEND_URL=http://localhost:3000
```

Generate strong secrets for JWT and Better Auth:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Project Structure

```
HMS-Server/
├── prisma/
│   ├── schema/                        # Prisma schema files (split)
│   └── migrations/                    # Generated SQL migrations
├── src/
│   ├── server.ts                      # Entry point — connects DB, starts HTTP server
│   ├── app.ts                         # Express app: CORS, middleware, routes, error handler
│   ├── config/
│   │   └── env.ts                     # Reads and exports all environment variables
│   ├── app/
│   │   ├── modules/                   # Feature modules
│   │   │   ├── auth/                  # Authentication (register, login, OTP, OAuth)
│   │   │   ├── user/                  # User management
│   │   │   ├── admin/                 # Admin operations
│   │   │   ├── doctor/                # Doctor profile management
│   │   │   └── specialty/             # Medical specialties
│   │   ├── middleware/
│   │   │   ├── checkAuth.ts           # JWT verification + role guard
│   │   │   ├── validateRequest.ts     # Zod schema validation middleware
│   │   │   ├── globalErrorhandler.ts  # Central error → JSON response
│   │   │   └── notFound.ts            # 404 handler for unmatched routes
│   │   ├── helper/
│   │   │   ├── AppError.ts            # Custom error class
│   │   │   ├── ensureCredentialAccount.ts
│   │   │   ├── jwtPayload.ts
│   │   │   └── validateResetPasswordUser.ts
│   │   ├── lib/
│   │   │   ├── prisma.ts              # Shared PrismaClient instance
│   │   │   └── auth.ts                # Better Auth setup
│   │   ├── utils/
│   │   │   ├── jwt.ts                 # sign / verify helpers
│   │   │   ├── email.ts               # Nodemailer email sender
│   │   │   ├── cookie.ts              # Cookie helpers
│   │   │   ├── token.ts               # Token utilities
│   │   │   └── queryBuilder.ts        # Reusable Prisma query builder
│   │   ├── shared/
│   │   │   ├── catchAsync.ts          # Async route handler wrapper
│   │   │   └── sendResponse.ts        # Standard JSON response envelope
│   │   ├── templates/
│   │   │   ├── otp.ejs                # OTP email template
│   │   │   └── googleRedirect.ejs     # Google OAuth redirect page
│   │   ├── routes/
│   │   │   └── index.ts               # Mounts all module routes
│   │   └── interface/
│   │       ├── index.d.ts             # Global type declarations
│   │       └── query.Interface.ts     # Shared query types
│   └── generated/prisma/              # Auto-generated Prisma client (git-ignored)
├── prisma.config.ts                   # Prisma config — schema path, migrations, DATABASE_URL
├── .env.example
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

Each module follows a consistent 5-file structure:

```
modules/<name>/
├── <name>.route.ts       # Route definitions + auth guards
├── <name>.controller.ts  # Request/response handling
├── <name>.service.ts     # Business logic + Prisma calls
├── <name>.validation.ts  # Zod validation schemas
└── <name>.interface.ts   # TypeScript types
```

---

## Data Models

The following models are defined in the Prisma schema:

| Model               | Description                                |
| ------------------- | ------------------------------------------ |
| `User`              | Core user record with role and status      |
| `Admin`             | Admin profile linked to a User             |
| `Doctor`            | Doctor profile linked to a User            |
| `Patient`           | Patient profile linked to a User           |
| `Specialty`         | Medical specialties (e.g. Cardiology, ENT) |
| `DoctorSpeciality`  | Many-to-many: Doctor ↔ Specialty           |
| `Schedule`          | Time slot definitions                      |
| `DoctorSchedules`   | Doctor's available schedules               |
| `Appointment`       | Booking between a patient and a doctor     |
| `PatientHealthData` | Health records attached to a patient       |
| `MedicalReport`     | Reports generated from appointments        |
| `Prescription`      | Prescriptions issued by doctors            |
| `Payment`           | Payment records tied to appointments       |
| `Review`            | Patient reviews of doctors                 |
| `Account`           | OAuth account linkage (Better Auth)        |
| `Session`           | Active session tracking (Better Auth)      |
| `Verification`      | OTP / email verification tokens            |

---

## Modules

### Auth (`/api/v1/auth`)

Handles registration, login, logout, OTP verification, password reset, and Google OAuth via Better Auth. Uses EJS templates for OTP emails and the Google redirect page.

### User (`/api/v1/user`)

User account management — profile updates, status changes, and role-based access.

### Admin (`/api/v1/admin`)

Admin operations — user management, blocking/unblocking accounts, and platform oversight.

### Doctor (`/api/v1/doctor`)

Doctor profile creation and management, including specialty assignment and schedule setup.

### Specialty (`/api/v1/specialty`)

CRUD for medical specialties used to categorise doctors.

---

## Available Scripts

```bash
npm run dev        # Start dev server with auto-reload (tsx watch)
npm run build      # Compile TypeScript → dist/
npm run start      # Run compiled server (node dist/server.js)
npm run lint       # Run ESLint
npm run migrate    # Create and apply a new Prisma migration
npm run generate   # Regenerate the Prisma client
npm run push       # Push schema to DB without a migration (prototyping)
npm run pull       # Pull current DB schema into Prisma schema files
```

---

## Prisma & Database

This project uses **Prisma 7** with a split schema — files live under `prisma/schema/` and are configured via `prisma.config.ts` at the repo root. `DATABASE_URL` is loaded from `.env` through `src/config/env.ts`.

Always import the shared client — never instantiate your own:

```ts
import prisma from "../../lib/prisma";
```

**Useful commands:**

```bash
npm run generate     # Must run after schema changes or fresh clone
npm run migrate      # Apply pending migrations
npx prisma studio    # Open DB browser GUI at http://localhost:5555
```

---

## Troubleshooting

**`Cannot find module '.../generated/prisma/client'`**
Run `npm run generate`. The client is git-ignored and must be built locally.

**`ECONNREFUSED` / can't reach database**
Check PostgreSQL is running and `DATABASE_URL` is correct:

```bash
pg_isready -h localhost -p 5432
```

**`P1010: User was denied access`**
The credentials in `DATABASE_URL` don't match an existing Postgres role:

```bash
psql -c '\du'
```

**TypeScript errors after pulling new commits**
Schema or types may have changed. Run:

```bash
npm run generate && npm run build
```
