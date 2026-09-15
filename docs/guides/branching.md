---
id: branching
title: "Branching and forking"
sidebar_position: 3
description: "Fork a new session from any completed turn while leaving the original intact."
---

# Branching and forking

Branching creates a new session from a **completed turn** of an existing one.
The new session inherits the conversation up to that point and diverges from
there. The original is untouched.

If you have ever wanted to un-send a prompt that took the agent down the wrong
path, this is that.

## Why branch

**The wrong turn.** Turn 14 sent the agent into a bad approach. Branch from
turn 13 and give it a better prompt. The original stays as a record of what did
not work.

**Genuine alternatives.** Try three approaches to the same problem from
identical context, in parallel, and compare. Give each its own
[worktree](/guides/worktrees) and they cannot interfere with each other.

**Context hygiene.** A session that has been running a long time is carrying a
lot of context that is no longer relevant. Branch from the point where the
current task started and the new session begins lean.

**Preserving a good state.** Before asking an agent to do something risky, fork
first. The fork is the experiment; the original is the known-good baseline.

## How it works

<Screenshot src="branch-menu.png" caption="Fork from a completed turn." />

Pick any completed turn and branch from it. {{product}} creates a new session with a
new `sessionId`, records the parent in the `forkedFrom` column, and seeds the
new log with the conversation prefix up to that turn.

Two details in the implementation worth knowing:

- Fork requests go through a `session_fork_requests` table that maps a request
  to its target session. The request is durable, so a fork that was in flight
  when the daemon restarted is not lost.
- For imported sessions, projections track `nativeForkCursors` — the positions
  in the underlying native log where forks were taken. This is how branching
  works on a session that {{product}} did not originally create.

## Branch points are turns, not messages

You branch from a **completed turn**, not from an arbitrary message. A turn is
the whole unit: your prompt, the agent's reasoning, its tool calls, and its
response. This is deliberate — forking from the middle of a turn would produce
a session whose tool calls have no results, which no agent can resume cleanly.

This is why {{product}} records `turnStarted` and `turnEnded` as explicit events.

## Finding your branches

Forked sessions record their parent, so you can see where a branch came from.
Give branches distinct titles when you make them — three sessions all called
"fix the auth bug" is not a useful catalog.

## Related

- [Handoffs](/guides/handoffs) — change the agent, keep the session
- [Worktrees](/guides/worktrees) — give each branch its own checkout
- [Parallel work](/guides/parallel-work) — run them all at once
