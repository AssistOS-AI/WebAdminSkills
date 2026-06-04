# webadmin-context

## Description
Lists all available sites with their session IDs, lead counts, profile counts, and owner info snippet.

## Input Format
- No input parameters.

## Output Format
- Plain-text summary per site:
  - `site_id`
  - `sessions` (list of session IDs)
  - `leads` (count)
  - `profiles` (count)
  - `owner` (first line of owner config)

## Constraints
- Reads data from the global datastore root.
- Does not call the LLM.
