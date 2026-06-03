# webadmin-profiles

## Description
Creates, updates, lists, removes, and reviews target visitor profiles and their mandatory conditions for the active site-id.

## Input Format
- `promptText` contains a JSON object with:
  - `profileName` (string, optional; required for display/create/update/remove)
  - `action` (string, optional; `list` | `display` | `create` | `update` | `remove`)
  - `characteristics` (array of strings, optional)
  - `interests` (array of strings, optional)
  - `qualifyingCriteria` (array of strings, optional)
  - `mandatoryConditions` (array of strings, optional)

## Output Format
- Plain-text profile list, display, or update confirmation.

## Constraints
- Persists under `profiles/<name>.md` using numbered markdown sections.
- Matches existing profiles case-insensitively.
- Does not call the LLM.
