---
id: pix-directory
title: Directory reference
sidebar_label: Directory reference
sidebar_position: 2
---

# The `{{homeDir}}` directory

Everything {{product}} knows lives here. No cloud, no external database. This is a
complete reference.

```text
{{homeDir}}/
├── .daemon.lock              # Running daemon pid + nonce
├── daemon-id                 # Stable installation identity
├── data-format.json          # Format version + which build wrote it
├── token                     # Daemon auth token            (0600)
├── device-verifier.key       # Device pairing verifier      (0600)
├── index.db                  # SQLite catalog + FTS5 index
├── index.db-shm              # SQLite shared memory (WAL)
├── index.db-wal              # SQLite write-ahead log
├── models.json               # Cached per-agent model capabilities
├── commands-by-root.json     # Cached commands per agent per project root
├── projects.json             # Registered projects
├── settings-profile.json     # Your preferences and defaults
├── telemetry.json            # Telemetry consent state
├── sessions/                 # Append-only session logs (source of truth)
│   └── <uuid>.jsonl
├── log-projections/          # Derived snapshots of native agent logs
│   └── <uuid>.jsonl
├── blobs/                    # Content-addressed large payloads
│   ├── <24-hex>.json
│   └── <24-hex>.txt
├── chats/                    # Chat-workspace storage
├── logs/
│   └── daemon.log
├── utility/                  # Cached utility computations
│   └── diff-summary/
└── utility-traces/           # Traces for utility runs
    └── diff-summary/
```

## Authoritative vs. derived

<Diagram name="session-storage" caption="Left: what you back up. Right: what the daemon rebuilds from it." />

The single most useful thing to understand here:

| Authoritative — losing it loses data | Derived — rebuildable |
| --- | --- |
| `sessions/` | `index.db*` |
| `blobs/` | `log-projections/` |
| `projects.json` | `models.json` |
| `settings-profile.json` | `commands-by-root.json` |
| `token`, `device-verifier.key` | `utility/`, `utility-traces/` |

Back up the left column. The right column reconstructs itself.

## The files in detail

### `data-format.json`

Format version plus full provenance of the writing build:

```json
{
  "version": 1,
  "dataFormat": 1,
  "minimumReaderFormat": 1,
  "writer": {
    "version": "0.25.0",
    "buildId": "gha-34753736364-1",
    "sourceRevision": "b2d719c03bac88a05a93273e15ae0c766ec9fb65",
    "releaseChannel": "prod"
  },
  "migrationHistory": [],
  "inProgressMigration": null,
  "updatedAt": "2026-09-15T02:36:14.484Z"
}
```

`minimumReaderFormat` is the compatibility floor: an older {{product}} that cannot
read this format refuses rather than corrupting it. `inProgressMigration` is
non-null only while a migration is running, so an interrupted migration is
detectable on restart instead of silently half-applied.

### `sessions/<uuid>.jsonl`

One append-only log per session. The source of truth. See [Session log
format](/under-the-hood/session-log-format).

### `log-projections/<uuid>.jsonl`

Derived snapshots of native agent logs, with fingerprints for change detection.
See [Snapshots and projections](/under-the-hood/snapshots-and-projections).

### `blobs/`

Large tool outputs, content-addressed by SHA-256. See
[Blobs](/under-the-hood/blobs).

### `index.db`

SQLite catalog and trigram FTS5 index. See [The index](/under-the-hood/index-db).

### `models.json` and `commands-by-root.json`

Capability caches, each entry stamped with `fetchedAt`. Safe to delete; they
refresh. See [Models](/guides/models) and [Slash commands and
skills](/guides/commands-and-skills).

### `settings-profile.json`

```json
{
  "revision": 1,
  "newSessionsUseWorktrees": false,
  "preferredAgent": null,
  "preferredAgentByProject": {},
  "defaultsByAgent": {"claude": {"modelId": "opus"}},
  "defaultsByProjectAgent": {},
  "busySendByAgent": {},
  "historyImportByAgent": {},
  "nativeHistoryRetentionDaysByAgent": {}
}
```

`nativeHistoryRetentionDaysByAgent` is worth knowing about: it bounds how far
back native history import reaches, per agent.

### `telemetry.json`

```json
{"consentVersion": 1, "enabled": true, "distinctId": "…", "enabledAt": 1789305363985}
```

Consent is versioned and recorded with a timestamp. Setting `enabled` to
`false` turns telemetry off. See [Privacy](/under-the-hood/privacy).

### `token` and `device-verifier.key`

Daemon authentication and device pairing. Mode `0600`. These are the credentials
that let a client connect; treat them as secrets and do not sync them.

### `logs/daemon.log`

Plain text, timestamped, prefixed by component (`[{{productLower}}]`,
`[{{productLower}}:history:daemon]`). The first place to look when something is
wrong. See [Troubleshooting](/troubleshooting).

## Safe operations

```bash
# Inspect the catalog without touching the daemon
sqlite3 {{homeDir}}/index.db "SELECT agentId, COUNT(*) FROM sessions GROUP BY 1"

# How much history is here?
du -sh {{homeDir}}/sessions {{homeDir}}/blobs

# Read a session log directly
head -1 {{homeDir}}/sessions/<uuid>.jsonl | python3 -m json.tool
```

:::warning Do not edit files under a running daemon
The daemon holds `index.db` open in WAL mode and appends to session logs.
Editing either underneath it risks corruption. Quit {{product}} first.
:::
