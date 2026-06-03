# DS005: AKU Integration

## Core Content

Each website has its own Agentic Knowledge Units (AKU) memory root under `data/sites/<site-id>/.aku/`. AKU stores curated knowledge derived from administrative work.

### KU Types

| KU Type | Purpose |
|---------|---------|
| `site-positioning` | How the site positions itself in the market |
| `target-profile-strategy` | Strategy for targeting visitor profiles |
| `visitor-question-patterns` | Common questions asked by visitors |
| `lead-quality-analysis` | Analysis of lead quality over time |
| `conversion-and-engagement-analysis` | Conversion rates and engagement patterns |
| `privacy-consent-and-retention-decisions` | Privacy and retention policy decisions |
| `website-improvement-decisions` | Decisions about website improvements |

### Operations

- **Create**: `webadmin-ku-store` creates new KUs through the AKU library.
- **Update**: Existing KUs can be updated with new findings.
- **Fork**: A KU can be forked to explore alternative analyses.
- **Archive**: KUs can be archived when no longer current.
- **Discard**: KUs can be discarded if invalid.
- **Search**: `webadmin-ku-search` executes keyword search with BM25F ranking.

### Invariants

1. AKU memory root is always scoped to a site-id.
2. KU types are predefined; new types require specification updates.
3. Search returns a compact ContextPack, not raw KU content.
4. `webadmin-ku-design` proposes initial structure; administrator accepts/modifies.
5. `webadmin-ku-consolidate` produces KUs from operational records.

## Decisions & Questions

1. **Why BM25F ranking?** Provides relevance scoring across multiple KU fields.
2. **Why separate design from store?** Design is a planning phase; store is execution. Separation allows review before commitment.
