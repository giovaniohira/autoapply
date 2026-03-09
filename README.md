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

## References

- **Product scope & data model**: `.cursor/rules/product.mdc`
- **Tech stack**: `.cursor/rules/stack.mdc`
- **Architecture & folder layout**: `.cursor/rules/architecture.mdc`

## MVP

- **Browser**: Chromium (Vivaldi priority)
- **Job board**: LinkedIn Jobs
- **Flow**: Discover → Score (≥60) → Autofill → AI answers → Submit → Record
