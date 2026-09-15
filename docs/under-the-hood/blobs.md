---
id: blobs
title: Blobs
sidebar_position: 5
---

# Blobs

Agents produce enormous tool outputs. A `find` across a monorepo, a full test
run, a large file read — any of these can be megabytes. Inlining that into a
JSONL line makes the log unparseable in practice: readers must allocate the
whole line to read the `seq` field at the front of it.

{{product}} spills large payloads into a content-addressed store and leaves a
reference behind.

## The store

`{{homeDir}}/blobs/` is flat. Filenames are the first 24 hex characters of the
content's SHA-256, plus an extension for the encoding:

```text
blobs/
├── 4303b05af3a4843d664043d7.txt    # utf8 payload
├── ee48d959e414c13dd87b9483.json   # json payload
└── 923a5dc8ab419876f0d4679c.txt
```

A typical installation accumulates thousands — this machine has 4,191 JSON and
1,127 text blobs from about 900 sessions.

## References

The event line carries a `payloadRefs` array in place of the payload:

```json
{"seq": 812, "ts": 1788901905123,
 "event": {"kind": "toolCallEnded", "callId": "toolu_…", "status": "success"},
 "payloadRefs": [
   {"eventKind": "toolCallEnded", "field": "output", "encoding": "utf8",
    "blobId": "4303b05af3a4843d664043d7.txt", "bytes": 5563, "jsonChars": 5744,
    "sha256": "4303b05af3a4843d664043d7ee6cb8c58de82154ee4da3de9d378114a397deae"},
   {"eventKind": "toolCallEnded", "field": "raw", "encoding": "json",
    "blobId": "ee48d959e414c13dd87b9483.json", "bytes": 33285, "jsonChars": 33255}
 ]}
```

Each reference is self-describing:

| Field | Purpose |
| --- | --- |
| `eventKind`, `field` | Where this payload belongs when rehydrated |
| `encoding` | `utf8` or `json` |
| `blobId` | Filename in `blobs/` |
| `bytes`, `jsonChars` | Size on disk, and size once embedded in JSON |
| `sha256` | Full digest — the blobId is its 24-character prefix |

A single event commonly spills more than one field. The example above splits a
tool result into the human-readable `output` and the structured `raw`, so the
UI can render the first without parsing the second.

## Why content addressing

**Deduplication.** Agents re-read the same files constantly. Ten reads of the
same unchanged file produce one blob.

**Integrity.** The name is the hash. Corruption is detectable by rehashing, and
a partially written blob will not match its own filename.

**Immutability.** Blobs are never modified. Different content is a different
blob, so there is no update path to get wrong.

**Sharing across sessions.** Two sessions that read the same file share the
blob. Storage grows with distinct content, not with session count.

## Garbage collection

Reachability is tracked in the `blobIds` column of `session_log_checkpoints`, as
a JSON array per session. Because every session records the blobs it references,
finding unreachable blobs is a set difference between the directory listing and
the union of those arrays — no scan of every log line required.

The `sessionPayloadBlobs` control record in the session log marks that a session
has spilled payloads, giving readers a fast signal without parsing every event.

## Inspecting blobs

```bash
# How big is the store?
du -sh {{homeDir}}/blobs
ls {{homeDir}}/blobs | wc -l

# Read one
cat {{homeDir}}/blobs/4303b05af3a4843d664043d7.txt

# Verify integrity — the output should start with the filename
shasum -a 256 {{homeDir}}/blobs/4303b05af3a4843d664043d7.txt

# Which blobs does a session reference?
sqlite3 {{homeDir}}/index.db \
  "SELECT blobIds FROM session_log_checkpoints WHERE sessionId = '<uuid>'"
```

:::warning Blobs contain your tool output
Every file an agent read and every command output it saw is here in plain text.
Treat `{{homeDir}}/blobs` with the same care as the repositories it came from. See
[Privacy](/under-the-hood/privacy).
:::
