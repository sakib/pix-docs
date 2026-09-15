---
id: snapshots-and-projections
title: Snapshots and projections
sidebar_position: 4
description: How native agent logs are projected, fingerprinted, and read incrementally, and how checkpoints resume indexing.
---

# Snapshots and projections

This is the mechanism that lets {{product}} present another agent's history as if it
were its own, keep it current, and notice when the ground shifts underneath it.

## The problem

{{product}} does not own the native session files of Claude Code, Codex, or Cursor.
Those agents write their own logs, in their own formats, on their own schedule.
They append to them, rotate them, truncate them, and occasionally rewrite them.

{{product}} needs to show those sessions in a unified catalog without copying
gigabytes, without re-parsing from byte zero on every refresh, and without
silently serving stale data when the underlying file changes.

The answer is a **projection**: a derived snapshot of a native log, carrying
enough fingerprint material to verify it is still valid.

## Anatomy of a projection

One file per session at `{{homeDir}}/log-projections/<sessionId>.jsonl`. The header
line is the interesting part:

```json
{
  "projection": 2,
  "canonicalSize": 2979930,
  "canonicalMtimeMs": 1789305398705.0278,
  "canonicalIdentity": "16777231:109997322",
  "prefixFingerprintBytes": 65536,
  "prefixFingerprintSha256": "59515e11e7f84d3008b430e2039a72ca684b07a659300ad0536da9754ca66f2c",
  "lineCount": 2090,
  "meta": {"meta": true, "sessionId": "86c9e287-…", "agentId": "claude",
           "source": "claude", "projectDir": "/Users/you/repos/meadowkind"},
  "managedWorktreeRequested": false,
  "nativeId": "37d49179-8f1c-4b99-9155-616685b114da",
  "payloadFormatVersion": 1,
  "nativeForkCursors": [],
  "queuedPrompts": []
}
```

### The four-part fingerprint

<Diagram name="projection-fingerprint" caption="Three cheap checks decide between an incremental read and a rebuild." />

Validity is established by four independent facts about the source file:

| Field | Catches |
| --- | --- |
| `canonicalIdentity` | `device:inode`. The file was **replaced**, not appended to. |
| `canonicalSize` | Growth (normal append) or shrinkage (**truncation**). |
| `canonicalMtimeMs` | Modification, at sub-millisecond resolution. |
| `prefixFingerprintSha256` | SHA-256 of the **first 64 KiB**. The history was **rewritten**. |

The prefix fingerprint is the clever one. Checking size and mtime alone cannot
distinguish "the agent appended ten new turns" from "the agent rewrote the whole
file and it happens to be bigger." Hashing a fixed 64 KiB prefix settles it: if
the prefix still hashes the same and the file only grew, the existing projection
is a valid prefix and {{product}} reads **only the new bytes**. If the prefix hash
changed, the projection is discarded and rebuilt.

That is what makes a catalog of nine hundred sessions refresh quickly instead of
re-parsing hundreds of megabytes.

### The other fields

- **`lineCount`** — how far the projection got.
- **`nativeForkCursors`** — positions in the native log where
  [branches](/guides/branching) were taken. This is how forking works on a
  session {{product}} did not create.
- **`queuedPrompts`** — prompts submitted while the agent was busy, held until
  it is ready.
- **`managedWorktreeRequested`** — whether the session asked for a managed
  [worktree](/guides/worktrees).

## Checkpoints

Projections handle *native* logs. For {{product}}'s own session logs, the same
incremental-read problem is solved by the `session_log_checkpoints` table in
`index.db`:

```sql
CREATE TABLE session_log_checkpoints (
  sessionId     TEXT PRIMARY KEY,
  formatVersion INTEGER NOT NULL,
  size          INTEGER NOT NULL,
  mtimeMs       REAL    NOT NULL,
  identity      TEXT    NOT NULL,   -- device:inode
  lastSeq       INTEGER NOT NULL,   -- last event consumed
  terminalError INTEGER NOT NULL,
  blobIds       TEXT    NOT NULL    -- JSON array of referenced blobs
);
```

A real row:

```text
e350e3ae-…|3|54111|1789305537533.03|16777231:110001287|36|0|["07d972468adc763216f20a4e.json", …]
```

Same idea, different key: instead of a byte offset, a **sequence number**.
`lastSeq: 36` means events 1–36 are indexed; the next read starts at 37.

`blobIds` records which blobs this session references, which is what makes
[garbage collection](/under-the-hood/blobs#garbage-collection) safe —
reachability is a table lookup rather than a scan of every log.

`terminalError` marks a log that could not be read at all, so the daemon does
not retry a permanently broken file on every pass.

## Snapshots and durability

Putting it together, the durability story:

1. **Session logs are append-only.** A crash loses the in-flight write.
2. **Blobs are content-addressed.** Identical content is written once; a
   partial write is detectable because the content will not hash to its name.
3. **Projections are verifiable.** Any drift in the source is detected by the
   four-part fingerprint, and the projection is rebuilt.
4. **Checkpoints are resumable.** Indexing resumes from `lastSeq`.
5. **The index is disposable.** `index.db` is derived from the above.

The practical consequence: **`sessions/` and `blobs/` are what you back up.**
Everything else reconstructs.

## Hydration state

The daemon records its own catalog-building progress in `daemon_state`:

```json
{"version": 1, "complete": true,
 "historyAgentIds": ["claude", "codex", "pi"],
 "issue": "nativeHistoryPartial"}
```

`complete: true` with `issue: "nativeHistoryPartial"` is honest reporting:
hydration finished, but some native history could not be read — typically an
agent that is not installed. You are told the catalog is partial rather than
being shown a confident but incomplete list.
