---
id: handoffs
title: "Handoffs"
sidebar_position: 2
description: "Continue any session with a different agent. What carries over, what does not, and when to branch instead."
---

# Handoffs

A handoff continues an existing session with a different agent. The
conversation, decisions, and work so far carry over. Only the agent changes.

<Diagram name="handoff-vs-branch" caption="A handoff keeps the session and changes the agent. A branch keeps the context and starts a new session." />

Every agent stores history in its own private format, which is why this is hard
to get anywhere else. {{product}} normalises all of them into one event log first,
so moving a conversation between agents is tractable.

## Why

- **Cost.** Explore in a cheap model. Hand to an expensive one only when the
  problem turns out to be real.
- **Capability.** Some agents are better at long refactors, others at quick
  edits, others have tools the rest lack.
- **Availability.** An agent is rate-limited or down. Hand off and keep going.
- **Review.** A second agent with different training has different blind
  spots. Have it check the first one's work.

## How

Open the session and change the agent.

<Screenshot src="handoff.png" caption="Changing the agent on an existing session." />

{{product}} replays the conversation into the new agent as resume context. The
session keeps its `sessionId`, its log, and its place in the catalog, and the
handoff itself is recorded in the log.

## What carries

**Carries:** the conversation, decisions, files touched, working directory and
worktree, `@` and `#` attachments.

**Does not carry:** agent-specific controls with no equivalent on the other
side. Hand off from an agent with thinking levels to one without, and the
thinking control disappears. See
[capability honesty](/getting-started/connecting-agents#capability-honesty).

The receiving agent gets the conversation as context, not as memory of having
done the work. "Continue the refactor described above" is a better first prompt
than "keep going."

## Handoff or branch?

| | Handoff | [Branch](/guides/branching) |
| --- | --- | --- |
| Session | Same | New |
| Agent | Changes | Usually the same |
| Use it to change | *Who* | *What* |
| Original | Continues | Untouched |

They compose. Branch from turn 12, then hand the branch to a different agent,
and you have two agents on identical context.

## Related

<CardGrid cols={3}>
  <Card title="Branching" icon="branch" href="/guides/branching">Same context, new direction.</Card>
  <Card title="Models" icon="usage" href="/guides/models">Change the model without changing the agent.</Card>
  <Card title="Session log format" icon="gear" href="/under-the-hood/session-log-format">The normalised event vocabulary that makes this work.</Card>
</CardGrid>
