---
id: intro
title: Introduction
sidebar_label: Introduction
sidebar_position: 1
slug: /intro
---

# What is {{product}}?

**{{tagline}}**

<Screenshot src="catalog.png" caption="The catalog: every session from every agent, with pinned and todo states." />

{{product}} is a desktop and mobile workspace that sits above the coding agents you
already use — Claude Code, Codex, Cursor, Pi — and gives them one shared home.
Instead of a terminal tab per agent, a scrollback you cannot search, and history
scattered across four different dotfile formats, you get a single catalog of
every session you have ever run, on every agent, with the ability to move work
between them mid-flight.

## The problem it solves

Coding agents are single-session tools. Each one runs in one terminal, doing one
task, writing history in its own private format. That is fine until you are
doing real work, at which point you discover:

- You have six terminal tabs open and no idea which agent is still working.
- The session that solved this exact problem last Tuesday is in a scrollback
  buffer that is gone.
- You want to start something in a fast, cheap agent and finish it in a
  careful, expensive one — and there is no way to hand the context over.
- You left your laptop and the agent is still running, and you cannot see it.
- Your team has no idea what any of these agents actually did to the codebase.

{{product}} is the layer that fixes all five.

## What it gives you

**One catalog, every agent.** {{product}} imports the native history of the agents
already installed on your machine and folds it into a single searchable
timeline. Sessions you ran in Claude Code before you ever installed {{product}} show
up in the catalog. See [Native history import](/under-the-hood/native-history-import).

**Handoffs.** Any session can be continued by a different agent. Start in Haiku
for the cheap exploratory pass, hand to Opus when the problem turns out to be
hard. See [Handoffs](/guides/handoffs).

**Branching.** Fork from any completed turn. The fork inherits everything up to
that point and diverges from there, leaving the original intact. See
[Branching](/guides/branching).

**Real parallelism.** Run many sessions at once, each in its own git worktree so
they cannot collide. Background tasks keep running when you close the window.
See [Parallel work](/guides/parallel-work).

**Every device.** The daemon runs on your machine; clients connect to it. That
means a Mac app, a Linux app, an iPhone app, an iPad layout, and a browser — all
looking at the same live sessions. Over your LAN, or over Tailscale from
anywhere. See [Remote access](/guides/remote-access).

**Surfaces, not just chat.** A terminal view, a live iOS simulator, an
inspectable browser, and a repository browser sit alongside the conversation, so
you can see what the agent did rather than taking its word for it. See
[Surfaces](/guides/surfaces).

**Capability honesty.** Every agent supports a different subset of features.
{{product}} shows you the controls the current agent actually supports and hides the
ones it does not, rather than presenting a uniform interface that silently
fails. This is a deliberate design principle, and it is why the UI changes shape
when you switch agents.

## What it is not

{{product}} is not an agent. It does not have a model, it does not write code, and it
does not compete with Claude Code or Codex. It drives the agent binaries already
installed and authenticated on your machine, using your existing credentials.

{{product}} is also not a cloud service. There is no {{product}} server holding your
conversations. Everything lives in `{{homeDir}}` on your own disk, and the daemon
binds to localhost. See [Privacy](/under-the-hood/privacy).

## Where to go next

- **New here?** [Install {{product}}](/getting-started/install), then run
  [your first session](/getting-started/first-session).
- **Want the full feature tour?** Start with [Sessions](/guides/sessions).
- **Want to know how it works?** [Architecture](/under-the-hood/architecture)
  and the [`{{homeDir}}` reference](/under-the-hood/pix-directory).
- **Evaluating for a team?** [Editions](/enterprise/editions).
