# load-admin-context

## Description
Loads and normalizes the admin runtime context from datastore files, then returns SOP assignment lines for orchestrator preparation.

## Input Format
- No input parameters.
- Ignore any provided `promptText`.

## Output Format
- Plain-text string only.
- Success returns valid LightSOPLang `assign` lines:
  - `@context_user_message`
  - `@context_reference_date`
  - `@context_known_lead_ids`
  - `@context_known_session_ids`
  - `@context_known_profile_templates`
  - `@context_owner_info_snapshot`
  - `@context_website_info_snapshot`

## Constraints
- Reads data from configured datastore directories only.
- Does not call the LLM.
