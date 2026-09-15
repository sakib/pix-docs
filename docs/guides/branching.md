---
id: branching
title: "Branching and forking"
sidebar_position: 3
description: "Fork a new session from any completed turn while leaving the original intact."
---

# Branching and forking

Branching creates a new session from a completed turn of an existing one. The
new session inherits everything up to that turn and diverges from there. The
original is untouched.

## Why

- **The wrong turn.** Turn 14 sent the agent down a bad path. Branch from 13
  and prompt better. The original remains as a record of what did not work.
- **Alternatives.** Try three approaches from identical context, in parallel,
  each in its own [worktree](/guides/worktrees). Compare the diffs.
- **Context hygiene.** Branch from where the current task started and drop
  everything before it.
- **A safe baseline.** Fork before asking for something risky. The fork is the
  experiment.

## How

Pick a completed turn and branch from it.

<Screenshot src="branch-menu.png" caption="Fork from a completed turn." />

{{product}} creates a new `sessionId`, records the parent in `forkedFrom`, and seeds
the new log with the conversation up to that turn.

Two implementation details worth knowing:

- Fork requests go through a durable `session_fork_requests` table, so a fork
  in flight during a daemon restart is not lost.
- Imported sessions track `nativeForkCursors` in their
  [projection](/under-the-hood/snapshots-and-projections), which is how you can
  branch a session {{product}} did not create.

## Turns, not messages

You branch from a completed turn: your prompt, the agent's reasoning, its tool
calls, and its response, as one unit. Forking mid-turn would leave tool calls
without results, which no agent can resume. This is why `turnStarted` and
`turnEnded` are explicit events in the log.

Give branches distinct titles. Three sessions named "fix the auth bug" is not a
catalog.

## Related

<CardGrid cols={3}>
  <Card title="Handoffs" icon="handoff" href="/guides/handoffs">Change the agent, keep the session.</Card>
  <Card title="Worktrees" icon="parallel" href="/guides/worktrees">Give each branch its own checkout.</Card>
  <Card title="Parallel work" icon="sessions" href="/guides/parallel-work">Run them all at once.</Card>
</CardGrid>
