# webadmin-site-config

## Description
Creates or updates website configuration: owner contact routes, visitor notice, consent policy, and retention rules.

## Input Format
- `promptText` contains a JSON object with:
  - `target` (string, required; `owner` | `policy`)
  - `content` (string, optional; full replacement content)
  - `fields` (object, optional; field-level updates)

## Output Format
- Plain-text confirmation of created or updated configuration.
- Read mode returns current configuration content.

## Constraints
- Persists under `config/owner.md` and `config/policy.md`.
- Does not call the LLM.
