# AutoApply

Browser extension that automates job applications (MVP: LinkedIn Jobs). Discovers jobs, scores compatibility, autofills forms, and uses AI for open-ended questions.

## Project structure

| Path | Purpose |
|------|--------|
| `extension/` | Chromium MV3 extension: content scripts (LinkedIn), background, popup |
| `backend/` | REST API, compatibility scoring, job processing, persistence, AI orchestration |
| `shared/` | Shared TypeScript types and constants |
| `docs/` | PRD, ADRs |
| `.cursor/rules/` | Product, stack, architecture, workflow, testing |

## Tooling & workflows

- **Package manager**: npm workspaces (root `package.json` with `backend`, `extension`, `shared`).
- **TypeScript**: `tsconfig.base.json` at the root, extended by each workspace.
- **Lint/format**: ESLint (`npm run lint`) and Prettier (`npm run format` / `npm run format:fix`).
- **Tests**: Vitest (`npm test`) runs tests across all workspaces. New or changed behaviour must be covered by tests created or updated in the same branch/PR.

## References

- **Product scope & data model**: `.cursor/rules/product.mdc`
- **Tech stack**: `.cursor/rules/stack.mdc`
- **Architecture & folder layout**: `.cursor/rules/architecture.mdc`

## MVP

- **Browser**: Chromium (Vivaldi priority)
- **Job board**: LinkedIn Jobs
- **Flow**: Discover → Score (≥60) → Autofill → AI answers → Submit → Record
