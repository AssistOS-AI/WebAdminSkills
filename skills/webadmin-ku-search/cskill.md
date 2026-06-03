# webadmin-ku-search

## Description
Executes AKU keyword search and BM25F ranking for the active site-id and returns a compact ContextPack.

## Input Format
- `promptText` contains a JSON object with:
  - `query` (string, required)
  - `recordType` (string, optional; `ku` | `document` | `result` | `file` | `event`)
  - `limit` (number, optional; default 10)
  - `explain` (boolean, optional; default false)

## Output Format
- Plain-text search results or compact ContextPack summary.

## Constraints
- Operates within the site-scoped `.aku/` directory.
- Uses AgenticKnowledgeUnits from achillesAgentLib.
- Does not call the LLM.
