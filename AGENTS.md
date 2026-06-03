# WebAdmin Agent Guide

## Scope

WebAdmin provides site-scoped administrative operations on WebAssist data: configuration, review, archive, reporting, and AKU management. Invoked through Achilles Copilot, not a standalone app.

## Mandatory Reading Order

1. Read the nearest parent `AGENTS.md` for workspace-wide rules.
2. Read `docs/index.html` for the local documentation entry point.
3. Read `docs/specs/matrix.md` and the relevant local DS files before changing behavior.
4. Read `../AGENTS.md` for coding style, module structure, and test-organization rules when that file exists; otherwise inherit the parent repository coding-style authority.

## Current Skill Catalog

- skills/webadmin-flow (orchestrator)
- skills/webadmin-context
- skills/webadmin-archive
- skills/webadmin-site-config
- skills/webadmin-ownerInfo
- skills/webadmin-profiles
- skills/webadmin-sessions
- skills/webadmin-leads
- skills/webadmin-statistics
- skills/webadmin-ku-design (orchestrator)
- skills/webadmin-ku-store
- skills/webadmin-ku-consolidate (orchestrator)
- skills/webadmin-ku-search

## Repository Rules

- The DS specifications are the source of truth for local contracts and invariants.
- When source code changes behavior, interfaces, architecture, workflows, security boundaries, or runtime configuration, update both the HTML documentation and the DS specifications.
- Keep DS numbering gap-free within any newly initialized GAMP spec set. Preserve existing local numbering conventions unless a migration updates all links in the same change.
- All documentation, specifications, and code comments must be written in English.
- Do not add imported-skill DS files or skill pages to a downstream host project's docs tree.
- Never add AI/coding-agent attribution to commits, release notes, changelogs, generated metadata, comments, or documentation.
- Update `AGENTS.md` and `CLAUDE.md` together so coding agents receive the same local context.

## Runtime Defaults

Uses `node:20-bullseye`, `lite-sandbox: true`. The package is skills-only (no standalone runtime entrypoint).

## Key Paths

- `manifest.json`
- `src/constants/datastore.mjs`
- `src/runtime/dataStore.mjs`
- `docs/specs/matrix.md`
- `skills/`
- `tests/`

## Validation

Run the narrowest relevant check after edits, then broaden when touching shared behavior:

- `node tests/runAll.mjs`
