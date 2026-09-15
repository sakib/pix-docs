---
id: parallel-work
title: "Parallel work"
sidebar_position: 8
description: "Run many sessions at once, keep background tasks alive, and see sub-agent work as linked sessions."
---

# Parallel work

{{product}} is built to run many sessions at once. The daemon is the process that
makes that safe: it owns the agent runtimes, so work continues whether or not a
window is open.

## Running multiple sessions

Start as many as you like. Each gets its own runtime; the catalog shows which
are working, which are idle, and which are blocked on you.

The discipline that makes this work in practice:

1. **Give each session its own [worktree](/guides/worktrees).** Without this,
   parallel agents corrupt each other's work.
2. **Watch `pendingAttention`.** With eight sessions running, this is what
   tells you which one needs a human.
3. **Keep tasks genuinely independent.** Two sessions editing the same module
   in different worktrees still produce a merge conflict later. Split by
   subsystem, not by file.

## Background tasks

A session can start work that outlives the turn — a test suite, a build, a long
script. {{product}} tracks these as first-class background tasks, recording
`backgroundTaskStarted` and `backgroundTaskEnded` events with a task id,
status, duration, and summary.

They keep running when you close the window, because the daemon owns them.

Real logs show the failure modes being tracked honestly too:

```json
{"kind": "backgroundTaskEnded", "taskId": "bo72zfsnt", "status": "stopped",
 "terminalOrigin": "agent", "durationMs": 66,
 "error": "Claude background task output is unavailable (ENOENT)"}
```

When a background task is orphaned — its parent agent process exited — {{product}}
records that rather than leaving a task spinning forever in the UI.

## Sub-agents are visible

When an agent delegates to a sub-agent, {{product}} surfaces that as a **linked
session** rather than hiding it inside a collapsed tool call. You can open it,
read what the sub-agent actually did, and search it later.

This matters for review. Delegated work is still work that lands in your
repository, and "the agent handled it internally" is not an audit trail.

## Monitoring

Live sessions report progress, elapsed time, and usage as they run. Combined
with [context and usage reporting](/guides/usage-and-context), you can see which
of your parallel sessions is about to run out of context before it does.

## What the daemon survives

The daemon is resilient about conditions that would kill a terminal session:

- **Closing the window.** Clients are views; the daemon holds the work.
- **Laptop sleep.** Recorded honestly when it interrupts a response:
  `"API Error: Your computer went to sleep mid-response."`
- **Event loop stalls.** The daemon detects them and resets agent runtimes:
  `warn [{{productLower}}] event loop resumed 310300ms after its expected deadline;
  resetting agent runtimes`.

Sessions are logged as they go, so a crash costs you the in-flight turn, not the
session.
