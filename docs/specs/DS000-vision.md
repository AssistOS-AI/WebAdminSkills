# DS000 - webAdmin Vision

## Objective
The **webAdmin** agent is a backend management interface for site owners. It provides tools to analyze and process the data collected by the **webAssist** agent.

## Core Pillars
1. **Lead Lifecycle Management**: Transition leads from "new" to other statuses.
2. **Visitor Analysis**: Provide detailed profiling information for each lead.
3. **Usage Metrics**: Generate performance statistics (sessions vs. leads) over time.
4. **Real-time Awareness**: Display the latest leads obtained by the system.

## Runtime Integration
- **Packaging Model**: `webAdmin` is a skills-only bundle.
- **Agent Core**: Hosts compose `MainAgent` and discover skills from `webAdmin/skills/`.
- **Skill Runtime**: Operational skills are implemented as cskills and executed through `MainAgent`.
- **Orchestration**: Owner requests are routed through `skills/admin-flow/oskill.md`.
- **Preparation**: `admin-flow` runs `load-admin-context` before business planning.
- **Safety Boundary**: `admin-flow` enforces admin-only scope and refuses out-of-domain/jailbreak-style instructions.

## AchillesAgentLib Loading Contract
- `webAdmin` must import Achilles directly with:
  - `import { MainAgent } from "achillesAgentLib";`
- The runtime must not use custom filesystem loaders for Achilles resolution.
- Module resolution is delegated to Node.js package resolution via local `node_modules`.
