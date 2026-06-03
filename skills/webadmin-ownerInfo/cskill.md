# webadmin-ownerInfo

## Description
Creates, reads, updates, removes, and lists owner contact information for the active site-id.

## Input Format
- `promptText` contains a JSON object with:
  - `action` (string, optional; `read` | `update` | `list`)
  - `content` (string, optional; full replacement)
  - `fields` (object, optional; field-level updates: email, phone, calendar, meeting, etc.)

## Output Format
- Plain-text owner contact information or update confirmation.

## Constraints
- Persists under `config/owner.md`.
- Does not call the LLM.
