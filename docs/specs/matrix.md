# WebAdmin Specification Matrix

## Overview

This matrix tracks all DS specifications for the WebAdmin skill set. Each DS file defines contracts, invariants, and behavioral expectations for a specific domain.

## Specifications

| DS File | Title | Status |
|---------|-------|--------|
| [DS001](DS001-data-structure.md) | Data Structure and Paths | Active |
| [DS002](DS002-lead-lifecycle.md) | Lead Lifecycle and Statuses | Active |
| [DS003](DS003-skill-catalog.md) | Skill Catalog and Responsibilities | Active |
| [DS004](DS004-orchestration.md) | Orchestration Flow | Active |
| [DS005](DS005-aku-integration.md) | AKU Integration | Active |
| [DS006](DS006-archive-protocol.md) | Archive Protocol | Active |
| [DS007](DS007-datastore-constants.md) | Datastore Constants and Sections | Active |

## Relationships

- DS001 defines the physical layout that all skills read from and write to.
- DS002 governs lead state transitions used by webadmin-leads.
- DS003 maps each skill to its domain responsibility.
- DS004 describes how webadmin-flow delegates to individual skills.
- DS005 covers AKU memory root, KU types, and search/ranking.
- DS006 specifies archive confirmation, file movement, and EXDEV handling.
- DS007 defines the constants exported by `src/constants/datastore.mjs`.
