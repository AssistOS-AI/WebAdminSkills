# webadmin-profiles

## Description
Creates, updates, lists, removes, and reviews target visitor profiles for a specific site. Use this skill when the admin wants to manage the profile templates that WebAssist uses to match visitors and create leads. Call this skill when the admin asks about visitor profiles, target profiles, or profile templates, or wants to create a new profile type, update an existing one, remove a profile, or see what profiles are configured for a site.

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, required) — which site to manage profiles for.
  - `profileName` (string, optional; required for display/create/update/remove)
  - `action` (string, optional; `list` | `display` | `create` | `update` | `remove`)
  - `characteristics` (array of strings, optional)
  - `interests` (array of strings, optional)
  - `qualifyingCriteria` (array of strings, optional)
  - `mandatoryConditions` (array of strings, optional)

## Output Format
- Plain-text profile list, display, or update confirmation.

## Constraints
- Persists under `data/sites/<siteId>/profiles/<name>.md` using numbered markdown sections.
- Does not call the LLM.
