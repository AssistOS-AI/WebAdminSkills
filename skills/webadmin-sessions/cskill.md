# webadmin-sessions

## Description
Lists and reads visitor sessions for the active site-id, inspects conversation histories and profile summaries, and archives selected sessions.

## Input Format
- `promptText` contains a JSON object with:
  - `action` (string, optional; `list` | `read`)
  - `sessionId` (string, optional; required for read)
  - `historyLimit` (number, optional; default 10)
  - `includeFullHistory` (boolean, optional; default false)

## Output Format
- Plain-text session list or detailed session report with profile and history.

## Constraints
- Reads from `sessions/<sessionId>-history.md`.
- Does not call the LLM.
