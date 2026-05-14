# DS014 - Skill: load-admin-context

## Goal
Prepare deterministic runtime context for `admin-flow` planning as plain text.

## Input Contract
No input parameters are required or consumed. Any provided `promptText` is ignored.

## Output Contract
Returns plain text starting with `context loaded:` followed by key-value markdown fields:
- `reference_date`
- `known_lead_ids`
- `known_session_ids`
- `known_profile_templates`
- `owner_info_snapshot`
- `website_info_snapshot`

## Execution Rules
- Must not call any LLM.
- Must read context only from datastore-backed files.
- Must not emit executable preparation statements.
- Must be safe to run before every owner request.

## Data Dependencies
- `leads/`
- `sessions/`
- `profilesInfo/`
- `config/owner.md`
- `info/`
