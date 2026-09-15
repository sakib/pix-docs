---
id: sessions
title: Sessions
sidebar_position: 1
---

# Sessions

A session is the fundamental unit in {{product}}. It is one conversation with one
agent, in one workspace, recorded as an append-only log you can search, branch,
hand off, and return to years later.

## What a session holds

| Property | Meaning |
| --- | --- |
| `sessionId` | A UUID. The filename of its log and its permanent identity. |
| `agentId` | Which agent owns it — `claude`, `codex`, `cursor`, `pi`. |
| `title` / `fullTitle` | Generated from the work, editable. |
| `firstPrompt` | What you opened with. Often the most useful search target. |
| `projectDir` | The project it belongs to. |
| `workspaceKind` | `project` or `scratch`. |
| `worktree` | The managed worktree, if it has one. |
| `turns` | How many exchanges it contains. |
| `source` | `{{productLower}}` if started here, or the agent name if imported. |
| `contextUsage` | How full the context window is. |
| `forkedFrom` | The session it was branched from, if any. |

## Session states

Four independent flags, which combine freely — a session can be pinned *and*
todo:

- **Pinned** — held at the top of the catalog.
- **Todo** — unfinished, deliberately flagged.
- **Done** — resolved. Matches `done` or `merged` in search.
- **Archived** — hidden from the default view, still fully searchable.

These are columns in the index and tokens in the search grammar, so they are
genuinely queryable rather than decorative.

## Live, idle, and finished

{{product}} distinguishes between a session that is **running right now**, one that is
**idle but resumable**, and one that is **finished**. Browsing history does not
spin up an agent runtime — you can read a two-year-old session instantly
without paying to start a model. A runtime is only started when you actually
send something.

This matters more than it sounds. It is why the catalog is fast, and why
opening a session to check what it did is a free action.

## Pending attention

When an agent needs you — a question, a permission prompt, an error it cannot
resolve — the session is flagged as needing attention (`pendingAttention` in
the index). With a dozen sessions running, this is what tells you which one is
blocked on you rather than on itself.

## The log

Every session is a JSONL file at `{{homeDir}}/sessions/<sessionId>.jsonl`. The
first line is metadata; every line after is a sequenced event:

```json
{"meta":true,"sessionId":"86c9e287-…","agentId":"claude","createdAt":1789305378885,
 "workspaceKind":"project","source":"claude","nativeId":"37d49179-…",
 "projectDir":"/Users/you/repos/meadowkind"}
{"seq":1,"ts":1789305378900,"event":{"kind":"userMessage","text":"…"},"payloadRefs":[]}
{"seq":2,"ts":1789305379102,"event":{"kind":"turnStarted"},"payloadRefs":[]}
```

Because it is append-only and sequenced, the log is replayable, resumable, and
safe to tail. The format is documented in full in
[Session log format](/under-the-hood/session-log-format).

## What you can do with one

- [Hand it to another agent](/guides/handoffs)
- [Branch from any turn in it](/guides/branching)
- [Reference it from another session](/guides/references)
- [Find it later](/guides/search-and-catalog)
