# webadmin-ku-store

## Description
Creates, updates, forks, archives, or discards site-scoped Knowledge Units through the AKU library.

## Input Format
- `promptText` contains a JSON object with:
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
- Operates within the site-scoped `.aku/` directory.
- Uses AgenticKnowledgeUnits from achillesAgentLib.
- Does not call the LLM.
