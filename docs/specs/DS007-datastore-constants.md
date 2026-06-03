# DS007: Datastore Constants and Sections

## Core Content

This specification defines the constants exported by `src/constants/datastore.mjs`. These constants are the authoritative source for file naming, section headers, and valid values.

### Session Sections

| Constant | Value |
|----------|-------|
| `TARGET_PROFILES` | `Target Profiles` |
| `PROFILE_DETAILS` | `Profile Details` |
| `CONTACT_INFORMATION` | `Contact Information` |
| `CONSENT` | `Consent` |
| `HISTORY` | `History` |

### Lead Sections

| Constant | Value |
|----------|-------|
| `LEAD_INFO` | `Lead Info` |
| `MATCH_EXPLANATION` | `Match Explanation` |
| `CONTACT_INFO` | `Contact Info` |
| `CONSENT` | `Consent` |
| `CONTACT_ROUTE` | `Contact Route` |
| `SUMMARY` | `Summary` |

### Lead Fields

| Constant | Value |
|----------|-------|
| `STATUS` | `Status` |
| `PROFILE` | `Profile` |
| `SESSION_ID` | `Session ID` |
| `CONSENT_GRANTED` | `Consent Granted` |
| `CREATED_AT` | `Created At` |
| `UPDATED_AT` | `Updated At` |

### Profile Sections

| Constant | Value |
|----------|-------|
| `CHARACTERISTICS` | `Characteristics` |
| `INTERESTS` | `Interests` |
| `QUALIFYING_CRITERIA` | `Qualifying criteria` |
| `MANDATORY_CONDITIONS` | `Mandatory conditions` |

### Config Files

| Constant | Value |
|----------|-------|
| `OWNER` | `owner` |
| `POLICY` | `policy` |

### Archive Folders

| Constant | Value |
|----------|-------|
| `SESSIONS` | `sessions` |
| `LEADS` | `leads` |

### Session File Suffix

| Constant | Value |
|----------|-------|
| `HISTORY` | `history` |

### Invariants

1. Section headers are case-sensitive and must match exactly.
2. File naming conventions use `{id}-{suffix}.md` format.
3. Lead statuses are defined in DS002, not here.
4. Datastore types are defined in DS001, not here.

## Decisions & Questions

1. **Why centralize constants?** Prevents duplication and ensures consistency across all skills.
2. **Why separate sections from fields?** Sections are Markdown headers; fields are key-value pairs within sections.
