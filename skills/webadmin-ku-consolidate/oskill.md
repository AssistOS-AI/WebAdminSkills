# webadmin-ku-consolidate

## Description
Reviews operational records selected by the administrator and produces consolidated findings, decisions, patterns, or analyses for storage as Knowledge Units. Use this skill when the admin wants to extract insights from sessions, leads, or statistics and store them as reusable knowledge. Call this skill when the admin wants to analyze visitor sessions, leads, or statistics to find patterns, wants to consolidate operational evidence into curated knowledge units, or asks for insights, trends, or analyses from WebAssist data.

## Help
Input: natural admin request to consolidate selected operational evidence into KUs.

## Session Type
loop

## Instructions
Review selected operational records (sessions, leads, visits, profiles) and produce consolidated knowledge:
- Identify patterns, decisions, or analyses worth preserving.
- Create or update KUs through webadmin-ku-store.
- Store reusable findings, documents, and results.

## Allowed-Skills
- webadmin-ku-store
- webadmin-sessions
- webadmin-leads
- webadmin-statistics
