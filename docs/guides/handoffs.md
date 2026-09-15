---
id: handoffs
title: Handoffs
sidebar_position: 2
description: Continue any session with a different agent. What carries over, what does not, and when to branch instead.
---

# Handoffs

A handoff continues an existing session with a **different agent**. The
conversation, the decisions, and the work so far carry over; what changes is who
is doing the work from here.

<Diagram name="handoff-vs-branch" caption="A handoff keeps the session and changes the agent. A branch keeps the context and starts a new session." />

This is the feature that is genuinely hard to get elsewhere, because every agent
stores history in its own private format. {{product}} can do it because it normalises
all of them into one event log first.

## Why hand off

**Cost.** Explore in something cheap. When the problem turns out to be real,
hand it to something expensive. You pay premium rates only for the part that
needed them.

**Capability.** Some agents are better at long refactors, others at quick
edits, others have tools or integrations the rest do not.

**Availability.** An agent is rate-limited, degraded, or down. Hand the session
to one that is not, and keep working.

**Verification.** Have a second agent, with different training and different
failure modes, review what the first one did. It will not share the first
agent's blind spots.

## How to hand off

<Screenshot src="handoff.png" caption="Changing the agent on an existing session." />

Open a session and change the agent. {{product}} replays the conversation into the
new agent as resume context and continues from there.

The session keeps its identity — same `sessionId`, same log file, same place in
the catalog. The handoff is recorded in the log, so the history of *who did
what* is preserved rather than flattened.

## What carries and what does not

**Carries:** the conversation, the decisions, the files touched, the working
directory and worktree, your `@` and `#` attachments.

**Does not carry:** anything agent-specific that has no equivalent on the other
side. If you hand a session from an agent with thinking levels to one without,
the thinking control disappears. This is [capability
honesty](/getting-started/connecting-agents#capability-honesty) at work — {{product}}
will not fabricate a control the new agent does not have.

**Worth knowing:** the receiving agent gets the conversation as *context*, not
as its own memory of having done the work. A good handoff prompt acknowledges
that — "continue the refactor described above" beats "keep going."

## Handoff or branch?

They are different operations and it is worth being precise:

| | Handoff | [Branch](/guides/branching) |
| --- | --- | --- |
| Session identity | Same session | New session |
| Agent | Changes | Usually the same |
| Purpose | Different agent, same thread | Same thread, different direction |
| Original | Continues | Left untouched |

Use a handoff to change *who*. Use a branch to change *what*.

You can of course do both: branch from turn 12, then hand the branch to a
different agent — which gives you a controlled A/B of two agents on identical
context.
