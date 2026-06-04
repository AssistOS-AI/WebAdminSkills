# webadmin-sessions

## Description
Lists and reads visitor sessions for a specific site. Use this skill when the admin wants to see what visitors said, inspect conversation histories, or review session profile details. Call this skill when the admin asks about visitor conversations, session content, or what people are discussing, or when they want to read a specific session's history or profile summary. Use after `webadmin-context` reveals available session IDs.

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, required) — which site to query.
  - `action` (string, optional; `list` | `read`)
  - `sessionId` (string, optional; required for read action)
  - `historyLimit` (number, optional; default 10)
  - `includeFullHistory` (boolean, optional; default false)

## Output Format
- Plain-text session list or detailed session report with profile and history.

## Constraints
- Reads from `data/sites/<siteId>/sessions/<sessionId>-history.md`.
- Does not call the LLM.
