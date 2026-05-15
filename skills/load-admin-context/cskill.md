# load-admin-context

## Description
Loads and normalizes the admin runtime context from datastore files, then returns it as plain key-value markdown text for orchestrator preparation.

## Help
Input: none.

## Input Format
- No input parameters.

## Output Format
- Plain-text string only.
- Success starts with `context loaded:`.
- The loaded context is returned as key-value markdown fields:
  - `reference_date`
  - `known_lead_ids`
  - `known_session_ids`
  - `known_profile_templates`
  - `owner_info_snapshot`
  - `website_info_snapshot`

## Constraints
- Reads data from configured datastore directories only.
