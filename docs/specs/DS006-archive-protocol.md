# DS006: Archive Protocol

## Core Content

The `webadmin-archive` skill moves session and lead files to archive directories. This operation requires explicit confirmation before execution.

### Archive Structure

```
archive/
├── sessions/    # Archived session history files
└── leads/       # Archived lead files
```

### Protocol

1. **Identify**: Determine which sessions and leads to archive.
2. **Confirm**: Present the list to the administrator and request explicit confirmation.
3. **Execute**: Move files from active directories to archive directories.
4. **Report**: Return a summary of archived, skipped, and already-archived files.

### EXDEV Handling

If a cross-device link error (`EXDEV`) occurs during rename:
1. Copy the file to the archive destination.
2. Unlink (delete) the original file.
3. Report the fallback operation in the summary.

### Invariants

1. Explicit confirmation is required before any file movement.
2. Missing files are skipped with a note in the summary.
3. Already-archived files are detected and skipped.
4. Archive operations are idempotent: running twice on the same files produces no errors.

## Decisions & Questions

1. **Why explicit confirmation?** Archive operations move files and are not trivially reversible.
2. **Why handle EXDEV?** In containerized or volume-mounted environments, source and archive directories may be on different filesystems.
