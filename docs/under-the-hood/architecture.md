---
id: architecture
title: Architecture
sidebar_position: 1
description: "Daemon, clients, agent runtimes, workers, and the storage layering under {{homeDir}}."
---

# Architecture

{{product}} is a **daemon** plus **clients**. Nearly everything else follows from
that split.

<Diagram name="architecture" caption="Clients are views. The daemon owns state and work, all of it in one directory on disk. Agents are child processes." />

## The daemon

A headless Node process that owns all the state and all the work. It is what
actually drives agents, writes session logs, maintains the index, and imports
native history.

At startup it announces itself:

```text
log [{{productLower}}] daemon log opened (pid 95826)
log [{{productLower}}] daemon v0.25.0 · protocol v0 · ws://127.0.0.1:8790 · 6 agent(s)
log [{{productLower}}] mDNS: advertising _{{productLower}}._tcp on :8790
```

Four facts in that line: its version, the wire protocol version, its bind
address, and how many agent integrations it knows about.

**Single instance.** `{{homeDir}}/.daemon.lock` holds the running pid and a nonce:

```json
{"version": 1, "pid": 44053, "nonce": "adc2bfc3-41ba-4541-a41c-ebc7c68741d1"}
```

The nonce distinguishes a genuinely live daemon from a stale lock left by a pid
that has since been recycled. `{{homeDir}}/daemon-id` holds a stable identity for
the installation that survives restarts.

**Localhost by default.** It binds `127.0.0.1`. LAN and remote access are
explicit opt-ins. See [Remote access](/guides/remote-access).

## Clients

The desktop app (Electron 43), the iOS app, and the browser client are views.
They connect over WebSocket and render what the daemon reports; they hold no
authoritative state. Several attach at once, and all see the same live sessions.

This is why closing a window does not stop work, and why your phone can show a
session running on your Mac.

## Agent runtimes

The daemon launches agent CLIs as child processes and speaks their native
protocols. For Claude Code that is the Agent SDK binary in streaming JSON mode:

```text
claude --output-format stream-json --verbose --input-format stream-json …
```

{{product}} normalises each agent's stream into one canonical event vocabulary —
`userMessage`, `turnStarted`, `textChunk`, `toolCallStarted`, `toolCallEnded`,
`questionAsked`, `questionAnswered`, `backgroundTaskStarted`,
`backgroundTaskEnded`, `turnEnded`, `agentError`. That normalisation is what
makes [handoffs](/guides/handoffs) possible: once every agent's output is the
same shape, moving a conversation between them is tractable.

Runtimes are supervised. When the daemon detects it has been stalled, it resets
them rather than leaving them wedged:

```text
warn [{{productLower}}] event loop resumed 310300ms after its expected deadline;
     resetting agent runtimes
```

## Helpers and workers

The daemon offloads work that should not block it:

| Component | Job |
| --- | --- |
| `pix-log-line-worker` | Parsing session log lines |
| `pix-session-search-worker` | Indexing and search |
| `pix-claude-image-worker` | Image handling |
| `*-auth-helper` | Per-agent authentication (codex, cursor, pi, opencode) |
| `codex-install-helper` | Installing a missing agent |
| `pix-linux-update-activator` | Staging Linux updates |

Search and log parsing run off the main thread, which is why a catalog of
thousands of sessions stays responsive.

## Storage

Everything is in `{{homeDir}}`:

- **Session logs** — append-only JSONL, one file per session. The source of
  truth.
- **Blobs** — content-addressed large payloads, spilled out of the logs.
- **Projections** — derived snapshots of native agent logs.
- **`index.db`** — SQLite with FTS5. Derived and rebuildable.
- **JSON config** — projects, models, commands, settings, telemetry.

The layering is deliberate: logs are authoritative, everything else is derived.
Delete `index.db` and you lose a reindex, not history. Full detail in the
[`{{homeDir}}` reference](/under-the-hood/pix-directory).

## Distribution hardening

Production builds apply a documented hardening policy — bundled and minified
first-party code, identifier and string obfuscation with per-build randomness,
source maps stripped, and Electron ASAR integrity with runtime fuses:

```json
{"RunAsNode": true, "EnableCookieEncryption": true,
 "EnableNodeCliInspectArguments": false, "EnableEmbeddedAsarIntegrityValidation": true}
```

Each build records its `buildId` and `sourceRevision`, and those are written
into `data-format.json` — so any {{product}} directory can tell you exactly which
build wrote it.
