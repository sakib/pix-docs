---
id: surfaces
title: "Surfaces"
sidebar_position: 11
description: "Terminal, repository, browser, and simulator views beside the conversation."
---

# Surfaces

A transcript tells you what the agent says it did. Surfaces show you what it
actually did. {{product}} puts four of them alongside the conversation.

## Terminal

<Screenshot src="terminal-surface.png" caption="The terminal surface beside a running turn." />

Every command the agent runs, with its output, as it happens. Not a summary and
not a spinner.

This is the first place to look when an agent claims success and you are not
convinced. The `toolCallStarted` / `toolCallEnded` event pair records the
command, its arguments, its status, and its full output — and the output is
preserved in the log even when it is large, via
[blobs](/under-the-hood/blobs).

Tool calls that fail are recorded with `status: "error"` and the error text.
Failures are part of the record, not swallowed.

## Repository

Files, branches, and worktrees for the session's project. Browse what the agent
is working on, and compare a [worktree](/guides/worktrees) against the main
checkout to see the real diff.

File-level review state is tracked per session in `review_marks`, recording
which paths you have viewed and when — so on a large change you can tell what
you have already reviewed.

## Browser

An inspectable browser inside the session. For web work, the agent can navigate,
click, fill, and screenshot, and you watch it happen.

The practical use is the tight loop: the agent changes a component, reloads,
sees the result, and iterates — without you copying screenshots back and forth.
When something looks wrong, you are looking at the same page it is.

## Simulator

<Screenshot src="simulator-surface.png" caption="A live iOS simulator inside the session." />

A live iOS simulator in the session. Watch the app change as the agent edits it.

For mobile work this closes the gap that makes agents frustrating: the agent
writes Swift, the app rebuilds, and the result is right there. If a layout is
broken, both of you can see that it is broken.

:::info More surface types are planned
The simulator is being generalised into a configurable preview surface —
including a documentation renderer and a static site loader alongside the app
simulator. See the [roadmap](/roadmap).
:::

## Why this is the point

The hard part of agent-assisted development is not getting code written. It is
knowing whether the code is right. Every surface exists to shorten the distance
between "the agent says it works" and "I can see that it works."

This is also why sub-agents appear as [linked
sessions](/guides/parallel-work#sub-agents-are-visible) rather than hidden
sub-processes. Work you cannot inspect is work you cannot review.
