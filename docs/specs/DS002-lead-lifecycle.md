# DS002: Lead Lifecycle and Statuses

## Core Content

Leads progress through a defined lifecycle with five statuses. All transitions are controlled by the `webadmin-leads` skill.

### Statuses

| Status | Meaning |
|--------|---------|
| `new` | Created by WebAssist, awaiting administrative review |
| `approved` | Accepted as relevant for follow-up |
| `not-relevant` | Rejected after administrative review |
| `contacted` | Contact has been initiated by an administrator |
| `closed` | Follow-up concluded |

### Valid Transitions

From `new`: `approved`, `not-relevant`
From `approved`: `contacted`
From `contacted`: `closed`
From `not-relevant`: (terminal)
From `closed`: (terminal)

### Invariants

1. Invalid status values are rejected immediately.
2. The `LEAD_STATUSES` enum in `src/constants/datastore.mjs` is the authoritative source.
3. Each lead file contains: Status, Profile, Session ID, Consent Granted, Created At, Updated At.
4. The `Updated At` field is refreshed on every status change.

## Decisions & Questions

1. **Why not allow re-opening closed leads?** Closed is terminal to maintain audit integrity. A new lead can be created if needed.
2. **Why separate `approved` from `contacted`?** Approval is a decision; contacting is an action. They may occur at different times.
