# webadmin-leads

## Description
Lists, reads, and updates lead status for a specific site. Use this skill when the admin wants to review qualified visitors, check lead details, or change lead lifecycle status. Call this skill when the admin asks about leads, qualified visitors, or opportunities, or when they want to see lead details including contact info, match explanation, and summary, or change a lead's status.

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, required) — which site to query.
  - `action` (string, optional; `list` | `read` | `updateStatus`)
  - `leadId` (string, optional; required for read/updateStatus)
  - `newStatus` (string, optional; `new` | `approved` | `not-relevant` | `contacted` | `closed`)

## Output Format
- Plain-text lead list, detailed lead report, or status update confirmation.

## Constraints
- Reads from `data/sites/<siteId>/leads/<sessionId>-lead.md`.
- Valid statuses: new, approved, not-relevant, contacted, closed.
- Does not call the LLM.
