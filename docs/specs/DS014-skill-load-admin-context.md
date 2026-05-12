# DS014 - Skill: load-admin-context

## Goal
Prepare deterministic runtime context for `admin-flow` planning.

## Input Contract
`promptText` is a JSON object with optional fields:
- `message` (string)
- `referenceDate` (string)
- `dataDir` (string)
- `agentRoot` (string)

## Output Contract
Returns plain text containing valid LightSOPLang assignments:
- `@context_user_message`
- `@context_reference_date`
- `@context_known_lead_ids`
- `@context_known_session_ids`
- `@context_known_profile_templates`
- `@context_owner_info_snapshot`
- `@context_website_info_snapshot`

## Execution Rules
- Must not call any LLM.
- Must read context only from datastore-backed files.
- Must be safe to run before every owner request.

## Data Dependencies
- `leads/`
- `sessions/`
- `profilesInfo/`
- `config/owner.md`
- `info/`
