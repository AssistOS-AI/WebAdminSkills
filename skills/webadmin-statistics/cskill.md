# webadmin-statistics

## Description
Produces daily, weekly, and monthly summaries of visits, chats, origin distributions, matches, leads, and administrative outcomes for the active site-id.

## Input Format
- `promptText` contains a JSON object with:
  - `interval` (string, required; `day` | `week` | `month`)

## Output Format
- Plain-text metrics report with visit totals, session totals, lead totals, conversion rate, and leads by profile.

## Constraints
- Reads from `visits/events.md` for visit and event data.
- Does not call the LLM.
