---
id: usage-and-context
title: "Usage and context"
sidebar_position: 13
description: "Token spend, context occupancy, and classified errors reported per session."
---

# Usage and context

{{product}} reports token consumption and how full the context window is, per
session, as the work happens.

## Context occupancy

Every session carries a `contextUsage` record. A context window that is filling
up is the single best predictor that a session is about to get worse: the agent
starts forgetting earlier decisions, re-reading files it has already read, and
compacting away the reasoning you cared about.

Seeing it before it happens lets you act:

- **[Branch](/guides/branching)** from the point where the current task started.
  The new session carries the relevant context and drops the rest.
- **Compact**, where the agent supports it — `/compact` on Codex, for
  example. {{product}} records compaction on the tool call
  (`contextCompaction` and `contextCompactionData` on `toolCallStarted`), so
  you can see where in a session it happened and what was lost.
- **Finish and start fresh.** Mark it done, open a new session, `#`-reference
  the old one. You get the conclusions without the full transcript.

## Token usage

Token consumption is reported per session and visible while a turn runs. Because
sessions are per-agent and per-model, this is also how you learn where your
spend actually goes — which is rarely where people assume.

Common discoveries:

- A handful of long sessions cost more than dozens of short ones, because
  context is re-sent on every turn.
- High thinking levels on mechanical work are pure waste.
- A cheap exploratory pass followed by a [handoff](/guides/handoffs) to an
  expensive model costs far less than doing the whole thing expensively.

## Errors are recorded with their cause

When a turn fails, {{product}} records a structured `agentError` with a category and
whether it is retryable:

```json
{"kind": "agentError",
 "message": "claude: server_error\nAPI Error: Your computer went to sleep mid-response.",
 "issue": {"category": "service", "sourceCode": "server_error", "retryable": true}}
```

The distinction matters. A `service` error that is `retryable` means try again.
A usage limit means wait or switch models. {{product}} tells you which, instead of
showing one generic failure message for every cause.

## For teams

Per-session usage aggregates into org-wide reporting in the enterprise edition —
spend by team, by project, by agent, by model. See [Audit and
usage](/enterprise/audit-and-usage).

## Related

<CardGrid cols={3}>
  <Card title="Branching" icon="branch" href="/guides/branching">Start lean from where the task began.</Card>
  <Card title="Models" icon="usage" href="/guides/models">Thinking levels and what they cost.</Card>
  <Card title="Audit and usage" icon="building" href="/enterprise/audit-and-usage">Org-wide reporting (planned).</Card>
</CardGrid>
