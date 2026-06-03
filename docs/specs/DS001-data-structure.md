# DS001: Data Structure and Paths

## Core Content

All WebAdmin operational data is stored under a site-scoped directory:

```
.ploinky/agents/webassist/data/sites/<site-id>/
├── sessions/          # Session history files ({sessionId}-history.md)
├── leads/             # Lead files ({sessionId}-lead.md)
├── profiles/          # Target visitor profile templates
├── info/              # Website information files
├── config/            # Owner contact (owner.md) and policy (policy.md)
├── visits/            # Append-only events log (events.md)
├── archive/           # Archived sessions and leads
│   ├── sessions/
│   └── leads/
└── .aku/              # Agentic Knowledge Units memory
```

### Invariants

1. Every operation is scoped to a selected `site-id`.
2. Session files use the naming convention `{sessionId}-history.md`.
3. Lead files use the naming convention `{sessionId}-lead.md`.
4. The `visits/events.md` file is append-only and serves as the source for statistics.
5. The `.aku/` directory is managed exclusively by the AKU library.

### Datastore Types

Defined in `src/constants/datastore.mjs`:

| Constant | Value |
|----------|-------|
| `SESSIONS` | `sessions` |
| `PROFILES` | `profiles` |
| `LEADS` | `leads` |
| `VISITS` | `visits` |
| `INFO` | `info` |
| `CONFIG` | `config` |
| `ARCHIVE` | `archive` |

## Decisions & Questions

1. **Why site-scoped paths?** Multiple websites may share the same WebAssist agent. Site-scoping prevents data collision and enables per-site AKU memories.
2. **Why append-only events.md?** Append-only logs simplify statistics generation and provide an audit trail without requiring database infrastructure.
