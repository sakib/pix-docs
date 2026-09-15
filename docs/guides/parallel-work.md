---
id: parallel-work
title: "Parallel work"
sidebar_position: 8
description: "Run many sessions at once, keep background tasks alive, and see sub-agent work as linked sessions."
---

# Parallel work

{{product}} runs many sessions at once. The daemon owns the agent runtimes, so work
continues whether or not a window is open.

## Running several sessions

Start as many as you need. The catalog shows which are working, idle, or blocked
on you. Three habits make it work in practice:

1. **One [worktree](/guides/worktrees) per session.** Without it, parallel
   agents overwrite each other's files.
2. **Watch `pendingAttention`.** It is the flag that says a session needs a
   human rather than more time.
3. **Split by subsystem, not by file.** Two sessions editing the same module in
   different worktrees still conflict at merge time.

## Background tasks

A session can start work that outlives the turn: a test suite, a build, a long
script. {{product}} records `backgroundTaskStarted` and `backgroundTaskEnded` with an
id, status, duration, and summary, and keeps the task running after you close
the window.

Failure is recorded, not hidden. When a parent agent process exits and orphans a
task, the log says so:

```json
{"kind": "backgroundTaskEnded", "taskId": "bo72zfsnt", "status": "stopped",
 "terminalOrigin": "agent", "durationMs": 66,
 "error": "Claude background task output is unavailable (ENOENT)"}
```

## Sub-agents are visible

When an agent delegates to a sub-agent, {{product}} shows the delegate as a linked
session you can open, read, and search. Delegated work lands in your repository
too, and "the agent handled it internally" is not an audit trail.

## What the daemon survives

- **A closed window.** Clients are views; the daemon holds the work.
- **Laptop sleep.** Recorded on the turn it interrupted:
  `"API Error: Your computer went to sleep mid-response."`
- **Stalls.** Detected and recovered:
  `event loop resumed 310300ms after its expected deadline; resetting agent runtimes`.

Logs are written as work happens, so a crash costs the in-flight turn, not the
session.

## Related

<CardGrid cols={3}>
  <Card title="Worktrees" icon="parallel" href="/guides/worktrees">Isolation for parallel agents.</Card>
  <Card title="Usage and context" icon="usage" href="/guides/usage-and-context">See which session is about to run out of room.</Card>
  <Card title="Remote access" icon="remote" href="/guides/remote-access">Check on long work from your phone.</Card>
</CardGrid>
