---
id: surfaces
title: "Surfaces"
sidebar_position: 11
description: "Terminal, repository, browser, and simulator views beside the conversation."
---

# Surfaces

A transcript is what the agent says it did. Surfaces show what it actually did.
Four of them sit beside the conversation.

## Terminal

Every command the agent runs, with its output, as it runs.

<Screenshot src="terminal-surface.png" caption="The terminal surface beside a running turn." />

Each command is a `toolCallStarted` / `toolCallEnded` pair in the log with
arguments, status, and full output, kept even when large via
[blobs](/under-the-hood/blobs). Failures are recorded with `status: "error"`
and the error text.

## Repository

Files, branches, and worktrees for the session's project. Compare a
[worktree](/guides/worktrees) against the main checkout to see the real diff.
Per-file review state is tracked in `review_marks`, so on a large change you can
tell what you have already looked at.

## Browser

An inspectable browser inside the session. The agent navigates, clicks, fills,
and screenshots; you watch the same page it sees. For web work this closes the
edit-reload-look loop without copying screenshots back and forth.

## Simulator

A live iOS simulator inside the session.

<Screenshot src="simulator-surface.png" caption="A live iOS simulator inside the session." />

The agent edits Swift, the app rebuilds, and the result is right there. If a
layout is broken, both of you can see it.

:::info More surface types are planned
The simulator is being generalised into a configurable preview surface, including
a documentation renderer and a static site loader. See the [roadmap](/roadmap).
:::

## Why this matters

The hard part of agent-assisted development is not getting code written. It is
knowing whether the code is right. Every surface shortens the distance between
"the agent says it works" and "I can see that it works." It is the same reason
sub-agents appear as [linked sessions](/guides/parallel-work#sub-agents-are-visible)
rather than hidden processes.

## Related

<CardGrid cols={3}>
  <Card title="Worktrees" icon="parallel" href="/guides/worktrees">Review the diff, not the summary.</Card>
  <Card title="Session log format" icon="gear" href="/under-the-hood/session-log-format">How tool calls are recorded.</Card>
  <Card title="Roadmap" icon="play" href="/roadmap">Configurable preview surfaces.</Card>
</CardGrid>
