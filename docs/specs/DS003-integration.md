# DS003 - webAdmin Integration and Loading

The **webAdmin** package is a skills-only bundle consumed by host runtimes through Achilles `MainAgent`.

## Packaging Model
- No standalone CLI/runtime wrapper is part of webAdmin.
- Integration happens through skill discovery from `webAdmin/skills/`.
- Hosts are responsible for creating and managing `MainAgent` instances.

## Achilles Integration
- `MainAgent` must discover webAdmin skills from `webAdmin/skills/`.
- Orchestration entry skill is `admin-flow` (`oskill`).
- Operational tools are cskills (`update-lead`, `lead-info`, `session-info`, `statistics`, `news`, `manage-profile`, `manage-site-info`, `manage-owner-info`, `archive`).
- Preparation skill is `load-admin-context` and is used only during `admin-flow` preparation.

## Datastore Integration
- Shared datastore helpers are located at `dataStore.mjs`.
- Shared constants are located at `datastore.mjs`.
- Skills must consume shared helpers/constants; direct runtime wrappers are not used.
- Data directory resolution is `<process.cwd()>/data` by default, with no env or agent-root fallback.
- `configureDataStore` creates the resolved data directory before constructing `MarkdownDataStore`.
- Tests and controlled hosts may pass an explicit `dataDir` override; runtime skill loading must otherwise use `<process.cwd()>/data`.

## Orchestration Flow
1. Host executes `admin-flow` for owner requests.
2. `admin-flow` preparation executes `load-admin-context` and receives plain text context.
3. `admin-flow` picks exactly one business cskill for each owner request.
4. Final owner response is plain text with preserved factual values.

## Communication Language
- Input/output with owners may be in any language.
- Stored file content remains in English.
