# webadmin-statistics

## Description
Produces daily, weekly, and monthly visitor metrics reports for a specific site or across all sites. Use this skill when the admin wants to see visitor counts, session totals, lead conversion rates, or leads by profile. Call this skill when the admin asks about visitor statistics, conversion rates, or engagement metrics, or wants a daily, weekly, or monthly summary. Omit `siteId` for a cross-site report across all available sites.

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, optional) — omit for cross-site report, or use a specific site id.
  - `interval` (string, required; `day` | `week` | `month`)

## Output Format
- Plain-text metrics report with visit totals, session totals, lead totals, conversion rate, leads by profile, and per-site breakdown for cross-site reports.

## Constraints
- Reads from `data/sites/<siteId>/visits/events.md` for visit and event data.
- Does not call the LLM.
