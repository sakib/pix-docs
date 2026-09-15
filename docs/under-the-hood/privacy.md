---
id: privacy
title: "Privacy and data residency"
sidebar_position: 9
description: "Where data lives, what leaves the machine, and what a security review should know."
---

# Privacy and data residency

The short version: **your code and your conversations never go to a {{product}}
server, because there isn't one.**

## Where your data lives

In `{{homeDir}}`, on your own disk. That is the complete list. Session logs,
tool outputs, file contents the agent read, your prompts, and the index over
all of it — all local.

There is no {{product}} cloud, no sync service, and no account required to use the
product. The daemon binds to `127.0.0.1` and stays there unless you explicitly
enable LAN or remote access.

## What does leave your machine

Three things, all of which you control:

### 1. Agent traffic

When an agent calls its model, that request goes to **that agent's provider** —
Anthropic for Claude Code, OpenAI for Codex, and so on — under **your** account
and **their** data policy. {{product}} does not proxy, intercept, or copy it. Your
relationship with those providers is unchanged by using {{product}}.

This is worth being precise about with a security team: {{product}} does not add a
data processor. It drives CLIs you have already approved.

### 2. Telemetry, if enabled

Consent is versioned and recorded with a timestamp in
`{{homeDir}}/telemetry.json`:

```json
{"consentVersion": 1, "enabled": true,
 "distinctId": "3e701ba1-…", "productDistinctId": "6be8b5ad-…",
 "enabledAt": 1789305363985, "captureEpoch": "0526125e-…"}
```

Turn it off by setting `enabled` to `false`, or through the application
settings. Identifiers are random UUIDs generated on your machine, not derived
from your identity. The `consentVersion` field means that if what is collected
ever changes, you are asked again rather than silently opted in.

### 3. Update checks

The app asks the update service whether a newer build exists. See
[Updates](/under-the-hood/updates).

## Remote access is opt-in and private

LAN discovery uses mDNS on your local network. Remote access is designed around
[Tailscale](https://tailscale.com), meaning traffic goes directly between two
devices you own over an encrypted private network.

There is no {{product}}-operated relay in the middle. Nothing is exposed to the
public internet, and no inbound firewall rule is required.

Pairing is authenticated by `{{homeDir}}/token` and
`{{homeDir}}/device-verifier.key`. Being on the network is not sufficient.

## Mobile clients hold no copy

The iPhone and iPad apps are **viewports**. Session data is rendered from the
daemon, not replicated to the device. A lost phone does not leak a local copy of
your source code, and revoking that device's pairing cuts its access.

## What is sensitive in `{{homeDir}}`

Be aware of what is genuinely there:

| Path | Contains |
| --- | --- |
| `sessions/` | Full transcripts — your prompts, agent reasoning, tool calls |
| `blobs/` | **File contents and command output in plain text** |
| `index.db` | Titles, first prompts, previews, project paths |
| `token`, `device-verifier.key` | Credentials that permit client access |

`blobs/` is the one people underestimate. Every file an agent read is sitting
there in plaintext. If an agent read a `.env`, its contents are in a blob.

**Practical guidance:**

- Treat `{{homeDir}}` with the same care as the repositories it reflects.
- Rely on **full-disk encryption** (FileVault, LUKS). This is the right control
  for data at rest here.
- Do not sync `{{homeDir}}` to consumer cloud storage — it would copy every
  transcript and every file your agents read into a third party.
- Never commit it, and never include it in a bug report tarball without
  reviewing the contents.
- `token` and `device-verifier.key` are `0600`. Leave them that way.

## Deleting data

Session logs are plain files. Archiving hides a session; deleting its log
removes it. Rebuild the index afterwards so the catalog matches
([how](/under-the-hood/index-db#rebuilding)).

Blobs are shared across sessions by content address, so deleting a session's log
does not delete blobs that other sessions still reference — reachability is
tracked in `session_log_checkpoints.blobIds`.

## For security review

Points that typically matter to a security team evaluating {{product}}:

- **No vendor cloud.** No {{product}}-operated service receives code or prompts.
- **No new data processor.** Agent traffic goes to providers you already use.
- **Localhost by default.** Network exposure is opt-in.
- **Authenticated pairing.** Token plus device verifier.
- **Signed and notarized** macOS builds.
- **Electron hardening.** ASAR integrity validation on, CLI inspect arguments
  off, cookie encryption on.
- **Auditable by design.** Every session is a readable JSONL file; every shell
  command an agent ran can be extracted with a
  [three-line script](/under-the-hood/session-log-format#reading-one-yourself).

Team-wide controls — SSO, RBAC, retention policy, and org-level audit export —
are the subject of the [enterprise edition](/enterprise/editions).
