# webadmin-leads

## Description
Lists and reads leads for the active site-id, reviews matching rationales, changes lead statuses, and archives selected leads.

## Input Format
- `promptText` contains a JSON object with:
  - `action` (string, optional; `list` | `read` | `updateStatus` | `archive`)
  - `leadId` (string, optional; required for read/updateStatus/archive)
  - `newStatus` (string, optional; `new` | `approved` | `not-relevant` | `contacted` | `closed`)

## Output Format
- Plain-text lead list, detailed lead report, or status update confirmation.

## Constraints
- Reads from `leads/<sessionId>-lead.md`.
- Valid statuses: new, approved, not-relevant, contacted, closed.
- Does not call the LLM.
