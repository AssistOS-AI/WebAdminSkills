# webadmin-ownerInfo

## Description
Reads and updates the owner contact information for a specific site. Use this skill when the admin wants to view or change their contact details (email, phone, calendar link, meeting info) that WebAssist may share with qualified leads. Call this skill when the admin asks about their contact information or how leads can reach them, or wants to update email, phone, calendar link, or other contact fields.

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, required) — which site's owner info to manage.
  - `action` (string, optional; `read` | `update` | `list`)
  - `content` (string, optional; full replacement)
  - `fields` (object, optional; field-level updates: email, phone, calendar, meeting, etc.)

## Output Format
- Plain-text owner contact information or update confirmation.

## Constraints
- Persists under `data/sites/<siteId>/config/owner.md`.
- Does not call the LLM.
