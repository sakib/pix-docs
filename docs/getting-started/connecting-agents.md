---
id: connecting-agents
title: Connecting agents
sidebar_position: 3
---

# Connecting agents

{{product}} does not ship agents and does not proxy them. It drives the agent
binaries installed on your machine, using the credentials those agents already
hold. If Claude Code works in your terminal, it works in {{product}}, with the same
account and the same billing.

## Supported agents

| Agent | Status | Credentials |
| --- | --- | --- |
| **Claude Code** | Available | Your existing Claude Code auth |
| **Codex** | Available | `~/.codex` credentials |
| **Cursor** | Available | Cursor API key |
| **Pi** | Available | Pi auth |
| **OpenCode** | Coming soon | — |
| **Copilot** | Coming soon | — |

The daemon reports how many it knows about at startup:

```text
daemon v0.25.0 · protocol v0 · ws://127.0.0.1:8790 · 6 agent(s)
```

## How detection works

At startup and periodically after, the daemon asks each agent three questions:

1. **Are you installed?** Located on `PATH`, or at a well-known path such as
   `~/.local/bin/codex`.
2. **What models do you support?** Cached to `{{homeDir}}/models.json`.
3. **What commands do you support, in this project?** Cached to
   `{{homeDir}}/commands-by-root.json`, keyed by `<agent> <project root>` — because
   a repo with its own skills and slash commands exposes different commands
   than an empty directory does.

Each answer is stored with a `fetchedAt` timestamp so {{product}} can refresh without
blocking you on a cold start.

## When an agent is missing

{{product}} tells you plainly and keeps going. From a real daemon log:

```text
warn [{{productLower}}] codex models.json refresh failed: Codex CLI was not found on PATH
     or at ~/.local/bin/codex. Existing ~/.codex credentials can be reused after
     installation.
warn [{{productLower}}] cursor models.json refresh failed: cursor: API key is required
```

Note what the first message is telling you: your **credentials are already
there**, and installing the CLI is enough to light the agent up. {{product}} never
asks you to re-authenticate something you have already authenticated.

## Capability honesty

Agents do not support the same things, and {{product}} refuses to pretend otherwise.
The interface renders the controls the selected agent actually supports:

- Claude exposes thinking levels (`low` through `max`) and, on Opus, a speed
  mode. Those controls appear.
- An agent with no thinking control does not get a greyed-out thinking
  selector. It gets no selector.

This is why the composer changes shape when you switch agents mid-session, and
it is deliberate. A control that is visible is a control that works.

## Defaults

{{product}} remembers your preferences per agent and per project in
`{{homeDir}}/settings-profile.json`:

```json
{
  "newSessionsUseWorktrees": false,
  "preferredAgent": null,
  "preferredAgentByProject": {},
  "defaultsByAgent": {
    "claude": {"modelId": "opus", "thinkingLevel": null, "speedMode": null}
  },
  "defaultsByProjectAgent": {}
}
```

The `ByProject` variants win over the global ones, so you can default to a
cheap model everywhere and an expensive one in the repository that deserves it.

## Next

- [Handoffs — moving a session between agents →](/guides/handoffs)
- [Models and thinking →](/guides/models)
