# webadmin-context

## Description
Loads metadata for the selected site-id: profile names, owner info, policy, lead IDs, session IDs, and visit statistics.

## Input Format
- No input parameters.

## Output Format
- Plain-text key-value markdown fields:
  - `site_id`
  - `reference_date`
  - `known_lead_ids`
  - `known_session_ids`
  - `known_profile_templates`
  - `owner_info_snapshot`
  - `policy_snapshot`
  - `website_info_files`

## Constraints
- Reads data from the configured site-scoped datastore only.
- Does not call the LLM.
