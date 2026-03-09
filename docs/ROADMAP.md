# AutoApply — Product & Technical Roadmap

Detailed step-by-step roadmap for the AutoApply MVP (LinkedIn Jobs). Serves as both implementation guide and project documentation.

---

## References

- **Product scope & data model**: `.cursor/rules/product.mdc`
- **Tech stack**: `.cursor/rules/stack.mdc`
- **Architecture & folder layout**: `.cursor/rules/architecture.mdc`
- **Workflow (tests, commits, branches)**: `.cursor/rules/workflow.mdc`

---

## High-Level Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Reconnaissance & alignment | ✅ Done |
| 1 | Repository & toolchain foundations | ✅ Done |
| 2 | Domain & data models (backend, DB, shared) | ✅ Done |
| 3 | Compatibility algorithm & scoring API | ✅ Done |
| 4 | Application backend (job processing, AI, audit) | ✅ Done |
| 5 | Chromium extension (MV3) — skeleton, messaging, LinkedIn scraping | ⏳ Not started |
| 6 | Autofill, automation & anti-detection mitigations | ⏳ Not started |
| 7 | Testing, observability & hardening | ⏳ Not started |
| 8 | Post-MVP evolution roadmap | ⏳ Not started |

---

## Phase 0 — Reconnaissance & Alignment ✅ Done

### Objectives

- Align on product, architecture, and stack.
- Define MVP completion criteria.
- Lock in workflow conventions (branches, commits, tests).

### Inputs

- `.cursor/rules/product.mdc`, `stack.mdc`, `architecture.mdc`, `workflow.mdc`, `README.md`.

### Outputs

- Short MVP vision summary (this doc or `docs/vision-mvp.md`).
- Definition of Done for MVP (below).

### Steps

1. **Summarise MVP flow in 1–2 paragraphs**
   - Discovery of jobs → compatibility score (0–100, default threshold 60) → apply if score ≥ threshold → autofill → AI answers → submit → record/audit.
2. **Define MVP Definition of Done**
   - **Extension**: Can read job listing and job details from LinkedIn Jobs (with user filters); send job payload + `user_id` to backend; trigger autofill and form submission when score ≥ threshold.
   - **Backend**: REST endpoints for User/UserSkills; receive job, compute compatibility, persist JobApplication; generate and store ApplicationAnswer via AI service. Persistence in SQLite/Postgres with PRD-aligned models.
   - **AI Service**: Can generate at least one coherent text answer for open-ended application questions from resume + job description.
3. **Agree development workflow**
   - Run tests before any meaningful commit; never change tests to make them pass—fix implementation; use `feat/...`, `fix/...` branches; conventional commit messages.

---

## Phase 1 — Repository & Toolchain Foundations ✅ Done

### Objectives

- Monorepo with workspaces for `extension`, `backend`, and `shared`.
- Standardise TypeScript, lint, format, and test setup.

### Outputs

- Root directory structure; toolchain configs (TS, ESLint, Prettier, Vitest/Jest); single root test script.

### Steps

1. **Initialise repository**
   - Root `package.json` with workspaces (`extension`, `backend`, `shared`) and scripts: `lint`, `test`, `build`, `format`.
2. **Choose package manager**
   - Use pnpm or npm workspaces; document in README.
3. **Configure TypeScript**
   - Root `tsconfig.base.json` with `strict: true`, `noImplicitAny: true`, `noUnusedLocals: true`, etc. Each package extends it with its own `tsconfig.json`.
4. **Configure lint & format**
   - ESLint with TS + Node/browser rules; Prettier with consistent config (tabs, quotes, trailing commas).
5. **Configure tests**
   - Vitest or Jest as single runner; root `test` script runs all workspace tests; basic test layout (`backend/src/**/__tests__`, etc.).

---

## Phase 2 — Domain & Data Models (Backend, DB, Shared)

### Objectives

- Implement entities: User, UserSkills, JobApplication, ApplicationAnswer.
- Align types between backend and extension via `shared`.

### Outputs

- Database schema (Prisma/Drizzle/SQL); shared TypeScript types.

### Steps

1. **Define shared domain types**
   - In `shared/src/types/`: User, UserSkill, JobApplication, ApplicationAnswer; aux types (CompatibilityScore, RoleType, LocationPreference, etc.).
2. **Create shared constants**
   - `shared/src/constants/compatibility.ts`: criterion weights (experience 40%, tech 30%, role 15%, location 10%, additional 5%); `DEFAULT_COMPATIBILITY_THRESHOLD = 60`.
3. **Define DB schema**
   - Choose Prisma or Drizzle; define tables: `users`, `user_skills`, `job_applications`, `application_answers` with PRD-aligned fields (ids, timestamps, FKs).
4. **Implement repository layer**
   - In `backend/src/db/`: userRepository, jobApplicationRepository, applicationAnswerRepository. Follow route → handler → service → db layering.

---

## Phase 3 — Compatibility Algorithm & Scoring API

### Objectives

- Implement PRD algorithm (weights and rules).
- Expose REST endpoint: job + user → score 0–100; persist JobApplication when applicable.

### Outputs

- Scoring module in `backend/src/scoring/`; REST endpoint (e.g. `POST /compatibility/score`).

### Steps

1. **Define scoring contract**
   - Input: `userId` or full User + UserSkills; job data (required techs, role, location, additional requirements). Output: `score` (0–100), optional `breakdown` by criterion.
2. **Create request/response schemas (Zod)**
   - In `backend/src/api/schemas/compatibility.ts`: request and response schemas.
3. **Implement scoring module**
   - In `backend/src/scoring/compatibilityService.ts`:
     - **Experience**: reject if `required_years - user_years >= 2`; else proportional score.
     - **Technology**: intersection of job_technologies × user_technologies.
     - **Role**: similarity (e.g. map roles to categories: Backend/Full Stack/Software Engineer).
     - **Location**: remote/country/city with distinct weights.
     - **Additional**: language, work authorization, certifications.
   - Compose final score using weights from `shared/constants`.
4. **Persist JobApplication**
   - When score is computed and apply decision exists: create row in `job_applications` with `compatibility_score`, initial `status` (e.g. PENDING_DECISION).
5. **Unit and integration tests**
   - Edge cases: user far below required experience; no tech overlap; location mismatch vs remote. Ensure weight changes don’t break invariants.

---

## Phase 4 — Application Backend (Job Processing, AI, Audit) ✅ Done

### Objectives

- Endpoints for filters, discovery/apply cycles, and audit.
- Isolated AI service integration.

### Outputs

- Job module in `backend/src/jobs/`; AI module in `backend/src/ai/`; REST endpoints for application orchestration.

### Steps

1. **User management endpoints**
   - `GET/POST/PATCH /users`; `GET/POST /users/:id/skills`.
2. **Job filters endpoint**
   - `GET/POST /users/:id/job-filters` (role, techs, location, experience range).
3. **AI module**
   - In `backend/src/ai/aiClient.ts`: configurable LLM provider (API key via env); `generateAnswer(context)` with resume, profile, job description, question → text.
4. **Apply-job orchestration**
   - In `backend/src/jobs/applyJobService.ts`: receive job + user; call scoring; if score ≥ threshold, call AI for open questions, create/update JobApplication (e.g. READY_FOR_EXTENSION); if below, optionally record as SKIPPED_LOW_SCORE.
5. **Audit and history**
   - Ensure audit fields: `applied_at`, `status`, `failure_reason`, etc. Endpoint: `GET /users/:id/applications` with filters (date, status).

---

## Phase 5 — Chromium Extension (MV3): Skeleton, Messaging, LinkedIn Scraping

### Objectives

- Extension skeleton with Manifest V3.
- Content scripts for LinkedIn Jobs.
- Secure communication with backend.

### Outputs

- `extension/manifest.json` (MV3); structure: `background/`, `content/`, `popup/`, `shared/`; LinkedIn DOM abstraction layer.

### Steps

1. **Manifest V3**
   - `background.service_worker`; minimal permissions (tabs, activeTab, scripting, host for `https://www.linkedin.com/*`); content scripts for LinkedIn Jobs URLs.
2. **Background / service worker**
   - In `extension/src/background/`: message listener from content scripts; HTTP client to backend (configurable URL); simple auth (e.g. user token in `chrome.storage`).
3. **Content scripts (LinkedIn Jobs)**
   - In `extension/src/content/linkedin-jobs/`: listing script (collect job links matching filters); job page script (description, requirements, location, technologies).
4. **DOM abstraction layer**
   - In `extension/src/content/linkedin-jobs/selectors.ts`: centralise all element selectors; functions like `getJobCards()`, `getJobDescription()`; fallbacks and retry with backoff when elements are missing.
5. **Extension ↔ backend messaging**
   - Content → background: “job found” or “application form open”; background → backend: job payload for scoring; background → content: score/decision to proceed or not.

---

## Phase 6 — Autofill, Automation & Anti-Detection

### Objectives

- Automate application form filling.
- AI-generated answers for open questions.
- Mitigate automation detection risks.

### Outputs

- Autofill module in extension; random delays and rate limits.

### Steps

1. **Map LinkedIn application form fields**
   - Fixed fields (name, email, phone, location, links); variable (multiple choice, open text).
2. **Implement autofill layer**
   - In `extension/src/content/linkedin-jobs/autofill.ts`: fill text fields from user data (from backend); set dropdowns; insert AI answers into text areas.
3. **Missing data handling**
   - If required field cannot be filled: record field; send to backend for logging; either halt application or mark as incomplete for manual follow-up.
4. **Anti-detection**
   - Random delays between actions; human-like focus order and small delays; rate limit applications per time window (enforced in background).
5. **User controls**
   - In extension popup: start/stop automation; set score threshold; show recent application count.

---

## Phase 7 — Testing, Observability & Hardening

### Objectives

- Unit, integration, and E2E coverage for critical paths.
- Structured logging for debugging.
- Basic security (keys, sensitive data).

### Outputs

- Test suites; single root `test` command; structured logs in backend and extension.

### Steps

1. **Unit tests**
   - Backend: scoring service, AI client (mocked), repositories (in-memory DB). Shared: pure helpers for types/constants.
2. **Integration tests**
   - Backend: full scoring request → JobApplication write; AI request → ApplicationAnswer creation.
3. **E2E tests**
   - Playwright/Puppeteer: open LinkedIn Jobs (test/dummy env); extension discovers job, score ≥ 60, autofill and submit attempt; low-score path does not apply.
4. **Observability**
   - Backend: structured (JSON) logs for AI failures, DB errors, scoring exceptions. Extension: moderate logging for diagnostics.
5. **Security**
   - API keys only in backend (env vars); no secrets in versioned code; extension ↔ backend over HTTPS.

---

## Phase 8 — Post-MVP Evolution

### Objectives

- Prioritise next steps beyond MVP.
- Backlog for future features.

### Possible directions

- **More job boards**: Indeed, Glassdoor, etc.
- **Full web dashboard**: view application stats; edit AI answers before submit.
- **Compatibility improvements**: embeddings/similarity; feedback from accepted/rejected applications.
- **Infra**: SQLite → PostgreSQL for production; CI/CD for deploy.

---

## Summary

- **Eight phases** from domain and tooling through extension automation, tests, and post-MVP.
- **Each phase** has objectives, outputs, and ordered steps for implementation and documentation.
- **Architecture** respects extension/backend/shared boundaries and PRD models.
- **Workflow** (tests first, modular commits, conventional commits) is embedded in every phase.
