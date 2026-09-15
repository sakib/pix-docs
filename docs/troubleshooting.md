---
id: troubleshooting
title: Troubleshooting
sidebar_position: 91
description: Daemon log, missing agents, stale caches, missing sessions, locks, ports, and reporting bugs.
---

# Troubleshooting

## Start with the daemon log

Almost every question is answered here:

```bash
tail -50 {{homeDir}}/logs/daemon.log
```

Lines are timestamped and prefixed by component — `[{{productLower}}]` for the
daemon, `[{{productLower}}:history:daemon]` for history operations.

A healthy startup:

```text
log [{{productLower}}] daemon log opened (pid 95826)
log [{{productLower}}] daemon v0.25.0 · protocol v0 · ws://127.0.0.1:8790 · 6 agent(s)
log [{{productLower}}] mDNS: advertising _{{productLower}}._tcp on :8790
log [{{productLower}}] client connected: desktop v0.25.0
```

## An agent is missing

**Symptom.** An agent is unavailable or absent from the picker.

**Check:**

```bash
grep "refresh failed" {{homeDir}}/logs/daemon.log | tail -10
```

Typical causes, which the log states plainly:

```text
warn [{{productLower}}] codex models.json refresh failed: Codex CLI was not found on PATH
     or at ~/.local/bin/codex. Existing ~/.codex credentials can be reused after installation.
warn [{{productLower}}] cursor models.json refresh failed: cursor: API key is required
```

- **Not on PATH** — install the CLI. Note that existing credentials are reused;
  you do not re-authenticate.
- **API key required** — authenticate the agent's own CLI first. {{product}} uses
  its credentials, it does not manage them.
- **{{product}} launched from the Dock has a different PATH than your shell.** This
  is the classic macOS one. An agent that works in your terminal but not in
  {{product}} is usually this. Install to a standard location, or launch {{product}}
  from the terminal to confirm.

## Model or command lists are stale

Capability caches (`models.json`, `commands-by-root.json`) carry `fetchedAt`
timestamps and refresh in the background. When refresh fails, {{product}} keeps the
previous answer rather than showing an empty list:

```text
warn [{{productLower}}] claude models.json refresh failed: refresh timed out (30s)
```

Both files are derived and safe to delete with the daemon stopped:

```bash
# Quit {{product}} first
rm {{homeDir}}/models.json {{homeDir}}/commands-by-root.json
```

## Sessions are missing from the catalog

**Check hydration state:**

```bash
sqlite3 {{homeDir}}/index.db \
  "SELECT value FROM daemon_state WHERE key = 'sessionCatalogHydration'"
```

```json
{"version": 1, "complete": true, "historyAgentIds": ["claude","codex","pi"],
 "issue": "nativeHistoryPartial"}
```

`issue: "nativeHistoryPartial"` means some native history could not be read —
usually an agent that is not installed. Install it and the history appears on
the next pass.

**Check whether import ran:**

```bash
grep "history import" {{homeDir}}/logs/daemon.log
```

```text
log [{{productLower}}] claude: history import checked 607 session(s), added 607
```

**Check retention.** `nativeHistoryRetentionDaysByAgent` in
`settings-profile.json` bounds how far back import reaches.

## The catalog looks wrong

`index.db` is derived state. Rebuild it:

```bash
# Quit {{product}} first
mv {{homeDir}}/index.db{,.bak}
rm -f {{homeDir}}/index.db-shm {{homeDir}}/index.db-wal
```

Restart. The daemon rebuilds from `sessions/`. Nothing durable is lost; a large
catalog takes a while and fills in progressively.

## The daemon will not start

**Check the lock:**

```bash
cat {{homeDir}}/.daemon.lock
ps -p $(python3 -c "import json;print(json.load(open(__import__('os').path.expanduser('{{homeDir}}/.daemon.lock')))['pid'])")
```

```json
{"version": 1, "pid": 44053, "nonce": "adc2bfc3-…"}
```

If no process holds that pid, the lock is stale. Quit {{product}} fully and remove
it:

```bash
rm {{homeDir}}/.daemon.lock
```

**Check the port.** The daemon binds `127.0.0.1:8790`:

```bash
lsof -i :8790
```

## A session became unresponsive

The daemon supervises runtimes and resets them when it detects a stall:

```text
warn [{{productLower}}] event loop resumed 310300ms after its expected deadline;
     resetting agent runtimes
```

This is usually laptop sleep. Interrupted responses are recorded honestly:

```text
"API Error: Your computer went to sleep mid-response. The response above may be incomplete."
```

The session is intact — logs are written as work happens. Send another prompt to
continue. If the last turn was garbled, [branch](/guides/branching) from the
turn before it.

## A mobile or browser client cannot connect

1. **Same network?** mDNS discovery (`_{{productLower}}._tcp` on 8790) is
   LAN-only. For anything else, use [Tailscale](/guides/remote-access).
2. **Is the daemon up?** Check for the mDNS advertisement in the log.
3. **mDNS blocked?** Many corporate and guest networks block multicast. Use
   Tailscale.
4. **Pairing.** Clients authenticate with the daemon's `token` and
   `device-verifier.key`. Re-pair if credentials have been rotated.

## Disk usage is growing

```bash
du -sh {{homeDir}}/sessions {{homeDir}}/blobs {{homeDir}}/log-projections
ls {{homeDir}}/blobs | wc -l
```

[Blobs](/under-the-hood/blobs) are usually the bulk — tool outputs and file
contents, content-addressed and deduplicated. `log-projections/` is derived and
rebuildable. `sessions/` and `blobs/` are your actual history.

## Reporting a bug

Include the build provenance, which every {{product}} directory records:

```bash
cat {{homeDir}}/data-format.json
```

```json
{"writer": {"version": "0.25.0", "buildId": "gha-34753736364-1",
            "sourceRevision": "b2d719c03…", "releaseChannel": "prod"}}
```

Version, CI build id, and exact source revision. Include relevant
`logs/daemon.log` lines too.

:::warning Review before sharing logs
Daemon logs contain project paths and session titles. Session logs and blobs
contain **your source code and command output**. Review anything before sending
it. See [Privacy](/under-the-hood/privacy).
:::
