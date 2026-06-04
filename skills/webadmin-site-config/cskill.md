# webadmin-site-config

## Description
Reads and updates site configuration files (owner contact rules and visitor policy) for a specific site. Use this skill when the admin wants to view or modify owner contact routes, visitor notice, retention rules, or contact routing policy. Call this skill when the admin asks about site configuration, policy settings, or owner contact rules, or wants to update retention periods, visitor notice text, or contact routing.

## Input Format
- `promptText` contains a JSON object with:
  - `siteId` (string, required) — which site to configure.
  - `target` (string, required; `owner` | `policy`)
  - `content` (string, optional; full replacement content)
  - `fields` (object, optional; field-level updates)

## Output Format
- Plain-text confirmation of created or updated configuration.
- Read mode returns current configuration content.

## Constraints
- Persists under `data/sites/<siteId>/config/owner.md` and `data/sites/<siteId>/config/policy.md`.
- Does not call the LLM.
