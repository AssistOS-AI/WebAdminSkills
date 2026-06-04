# webadmin-archive

## Description
Moves session and lead files from active folders to archive subdirectories for a specific site. Use this skill when the admin wants to clean up old sessions or leads without deleting them permanently. Call this skill when the admin wants to archive old visitor sessions or leads, or requests cleanup of active datasets. Always ask for explicit confirmation before executing (confirmation rule in orchestrator).

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, required) — which site to archive from.
  - `sessionIds` (array of strings, optional)
  - `leadIds` (array of strings, optional)
  - `target` (string, optional; `sessions` | `leads` | `all`; default `all`)

## Output Format
- Plain-text archive report listing archived files, already-archived files, and skipped files.

## Constraints
- Moves files from `data/sites/<siteId>/sessions/` and `data/sites/<siteId>/leads/` into `data/sites/<siteId>/archive/sessions/` and `data/sites/<siteId>/archive/leads/`.
- Never deletes files permanently.
- Does not call the LLM.
