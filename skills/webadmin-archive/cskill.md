# webadmin-archive

## Description
Archives selected sessions and leads for the active site-id by moving them from active folders to `archive/sessions/` and `archive/leads/`.

## Input Format
- `promptText` contains a JSON object with:
  - `sessionIds` (array of strings, optional)
  - `leadIds` (array of strings, optional)
  - `target` (string, optional; `sessions` | `leads` | `all`; default `all`)

## Output Format
- Plain-text archive report listing archived files and already-archived files.
- Missing files are silently skipped.

## Constraints
- Moves files from `sessions/` and `leads/` into `archive/sessions/` and `archive/leads/`.
- Never deletes files permanently.
- Does not call the LLM.
