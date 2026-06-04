# webadmin-ku-search

## Description
Executes keyword search and BM25F ranking across site-scoped Knowledge Units. Use this skill when the admin wants to find previously stored findings, decisions, or analyses by keyword. Call this skill when the admin asks to search past findings, knowledge, or curated insights, wants to look up a specific topic or pattern from stored KUs, or asks "what did we learn about X" or "find insights about Y".

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, required) — which site's AKU to search.
  - `query` (string, required) — search keywords.
  - `recordType` (string, optional; `ku` | `document` | `result` | `file` | `event`)
  - `limit` (number, optional; default 10)
  - `explain` (boolean, optional; default false)

## Output Format
- Plain-text search results or compact ContextPack summary.

## Constraints
- Operates within the site-scoped `data/sites/<siteId>/.aku/` directory.
- Uses AgenticKnowledgeUnits from achillesAgentLib.
- Does not call the LLM.
