# webadmin-ku-store

## Description
Creates, updates, forks, archives, or discards site-scoped Knowledge Units through the AKU library. Use this skill when the admin wants to store, manage, or organize curated findings from administrative work. Call this skill when the admin wants to create a new knowledge unit (KU) for a site, update, fork, archive, or discard an existing KU, or when called by webadmin-ku-design after the admin approves a KU structure, or by webadmin-ku-consolidate after operational evidence is analyzed.

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, required) — which site's AKU to operate on.
  - `action` (string, required; `init` | `update` | `fork` | `archive` | `discard`)
  - `kuId` (string, optional; required for update/fork/archive/discard)
  - `kuType` (string, optional)
  - `title` (string, optional)
  - `summary` (string, optional)
  - `reusableFindings` (array of strings, optional)
  - `documents` (array of objects, optional)

## Output Format
- Plain-text KU operation confirmation with ku-id and status.

## Constraints
- Operates within the site-scoped `data/sites/<siteId>/.aku/` directory.
- Uses AgenticKnowledgeUnits from achillesAgentLib.
- Does not call the LLM.
