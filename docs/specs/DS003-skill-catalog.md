# DS003: Skill Catalog and Responsibilities

## Core Content

WebAdmin consists of 13 skills organized into two categories: code skills (procedural operations) and orchestrators (request routing).

### Code Skills

| Skill | Responsibility |
|-------|---------------|
| `webadmin-context` | Load site-scoped metadata: profiles, owner info, policy, lead IDs, session IDs |
| `webadmin-archive` | Move sessions and leads to archive directories |
| `webadmin-site-config` | Create/update website configuration: owner routes, visitor notice, consent policy, retention |
| `webadmin-ownerInfo` | CRUD operations on owner contact info |
| `webadmin-profiles` | CRUD operations on target visitor profiles and mandatory conditions |
| `webadmin-sessions` | List and read visitor sessions, inspect histories and profile summaries |
| `webadmin-leads` | List, read, review, change status, and archive leads |
| `webadmin-statistics` | Produce daily/weekly/monthly summaries from visits/events.md |
| `webadmin-ku-store` | CRUD operations on Knowledge Units through AKU library |
| `webadmin-ku-search` | Execute AKU keyword search and BM25F ranking |

### Orchestrators

| Skill | Responsibility |
|-------|---------------|
| `webadmin-flow` | Entry-point: interpret requests, maintain site-id, delegate to authorized skills |
| `webadmin-ku-design` | Propose initial KU structure for a website |
| `webadmin-ku-consolidate` | Review operational records and produce consolidated findings as KUs |

### Removed Skills

- `news`: Functionality absorbed into other skills
- `lead-info` + `update-lead`: Merged into `webadmin-leads`
- `session-info`: Merged into `webadmin-sessions`
- `manage-profile`: Renamed to `webadmin-profiles`
- `manage-site-info`: Renamed to `webadmin-site-config`
- `manage-owner-info`: Renamed to `webadmin-ownerInfo`
- `load-admin-context`: Renamed to `webadmin-context`
- `archive`: Renamed to `webadmin-archive`
- `admin-flow`: Renamed to `webadmin-flow`
- `statistics`: Renamed to `webadmin-statistics`

## Decisions & Questions

1. **Why merge lead-info and update-lead?** Both operate on the same lead entity. A single skill reduces context switching.
2. **Why separate orchestrators from code skills?** Orchestrators handle natural language interpretation and routing; code skills handle deterministic data operations.
