# DS004: Orchestration Flow

## Core Content

The `webadmin-flow` orchestrator is the entry point for all WebAdmin requests. It follows a strict single-skill delegation model.

### Flow

1. **Interpret**: Parse the administrator's natural language request.
2. **Scope**: Ensure a `site-id` is selected. If not, prompt for selection.
3. **Context Load**: Invoke `webadmin-context` to load current site metadata.
4. **Delegate**: Select exactly one authorized skill based on request intent.
5. **Execute**: Run the selected skill with validated parameters.
6. **Format**: Return results in the same language as the request.

### Authorized Skills

The orchestrator may delegate to any skill in the WebAdmin catalog (DS003). No external skills are authorized.

### Invariants

1. Exactly one skill is executed per request.
2. No manual skill selection by the administrator.
3. Site-id is maintained across the conversation.
4. Results are formatted in the request language.
5. Archive operations require explicit confirmation before execution.

## Decisions & Questions

1. **Why single-skill execution?** Prevents unintended side effects and simplifies error handling.
2. **Why explicit archive confirmation?** Archive operations move files and are not easily reversible.
