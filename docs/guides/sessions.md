---
id: sessions
title: "Sessions"
sidebar_position: 1
description: "What a session holds, its four states, live versus idle, and the append-only log behind it."
---

# Sessions

A session is one conversation with one agent in one workspace, recorded as an
append-only log you can search, branch, hand off, and reopen years later.

## At a glance

| Property | Meaning |
| --- | --- |
| `sessionId` | UUID. The log filename and the permanent identity. |
| `agentId` | `claude`, `codex`, `cursor`, or `pi`. |
| `title`, `firstPrompt` | Generated from the work and what you opened with. Both searchable. |
| `projectDir`, `workspaceKind` | The project, and `project` or `scratch`. |
| `worktree` | The managed worktree, if any. |
| `source` | `{{productLower}}` if started here; the agent name if imported. |
| `contextUsage` | How full the context window is. |
| `forkedFrom` | The parent session, if this is a branch. |

## States

Four independent flags. A session can be pinned *and* todo.

- **Pinned** stays at the top of the catalog.
- **Todo** is flagged as unfinished.
- **Done** is resolved. Search matches `done` or `merged`.
- **Archived** leaves the default view but stays searchable.

Each is a column in the index and a token in search, so `todo` in the search box
is a real filter.

## Live, idle, finished

Opening a session to read it does not start an agent. A runtime is launched only
when you send something. That is why the catalog stays fast and why reading a
two-year-old session is free.

When an agent is blocked on you (a question, a permission prompt, an error) the
session is flagged with `pendingAttention`. With many sessions running, that
flag is what tells you which one needs a human.

## The log

Every session is `{{homeDir}}/sessions/<sessionId>.jsonl`. Line one is metadata;
every later line is a sequenced event.

```json
{"meta":true,"sessionId":"86c9e287-…","agentId":"claude","createdAt":1789305378885,
 "workspaceKind":"project","source":"claude","projectDir":"/Users/you/repos/meadowkind"}
{"seq":1,"ts":1789305378900,"event":{"kind":"userMessage","text":"…"},"payloadRefs":[]}
{"seq":2,"ts":1789305379102,"event":{"kind":"turnStarted"},"payloadRefs":[]}
```

Append-only and sequenced means replayable, resumable, and safe to tail. Full
format in [Session log format](/under-the-hood/session-log-format).

## Related

<CardGrid cols={3}>
  <Card title="Handoffs" icon="handoff" href="/guides/handoffs">Continue with a different agent.</Card>
  <Card title="Branching" icon="branch" href="/guides/branching">Fork from any completed turn.</Card>
  <Card title="Search" icon="search" href="/guides/search-and-catalog">Find it again.</Card>
</CardGrid>
