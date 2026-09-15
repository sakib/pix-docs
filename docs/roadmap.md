---
id: roadmap
title: "Roadmap"
sidebar_position: 90
description: "Collaborative sessions, configurable preview surfaces, optional runtimes, and more. Direction, not dates."
---

# Roadmap

What is being built next, and why. Nothing here is available today.

:::info How to read this
This page describes direction, not commitments, and there are no dates. It is
published because the most useful feedback comes from people who can see where
something is going. If one of these matters to you, say so — it moves.
:::

## Collaborative sessions

**Multiple people in one live session.**

Today a session has one driver. The daemon already serves many simultaneous
clients over a WebSocket protocol, which means the hard architectural work for
multiplayer is largely done — what is missing is presence, shared cursors, and
a turn-taking model.

Where this gets genuinely interesting:

- **Pairing on a hard bug.** Two engineers, one agent, one shared context. No
  screen share, no "can you paste that error again."
- **Teaching.** A senior engineer watches a junior work with an agent and steps
  in at the right moment — in the session, not over their shoulder.
- **Hackathons and workshops.** A room full of people, a shared workspace, an
  agent that everyone can see. This is the case that makes it obvious: the
  current alternative is forty laptops in forty broken states.
- **Interviews and assessments.** A shared, observable, recorded environment —
  and unlike a whiteboard, the transcript is a real artifact afterwards.
- **Incident response.** Several responders, one investigating agent, one
  timeline everyone can read. Familiar territory for anyone who has run an
  incident channel.

The recording property is what makes this more than a screen share. A
collaborative session is still a session: searchable, branchable, referenceable,
and permanently readable.

## Configurable preview surfaces

**Generalising the simulator into a preview system.**

Today {{product}} can show a live iOS simulator and an inspectable browser. Those
are two instances of one idea: *a live view of the thing you are building,
updating as the agent works.*

Planned surface types:

- **Documentation renderer.** Writing docs — including a Docusaurus site like
  this one — with live rendered output beside the source.
- **Static site loader.** Point a surface at a build output directory and
  watch it rebuild.
- **Android emulator**, alongside the iOS simulator.
- **API surface.** A request console for backend work, so the agent's changes
  can be exercised without leaving the session.
- **Data surface.** A query console against a development database.
- **Custom surfaces.** A configuration format so a team can define a surface
  for a target {{product}} has never heard of.

The principle is the one behind every existing surface: shorten the distance
between *the agent says it works* and *I can see that it works*.

## Optional runtimes

**Choosing where an agent executes.**

Today agents run as child processes of the daemon, on the daemon's machine, with
the daemon's filesystem access. Planned alternatives:

- **Container runtime.** Agents in a container with an explicit mount set and
  network policy. The natural answer to "what stops an agent touching something
  it should not."
- **Remote runtime.** Execution on a machine other than the one running the
  daemon — a big build box, a machine near the data.
- **Ephemeral runtime.** A fresh, disposable environment per session, torn down
  afterwards.
- **Per-project runtime configuration.** The repository declares how its agents
  should run, so a sensitive project is sandboxed for everyone automatically.

This pairs directly with [policy controls](/enterprise/policy): "agents on this
repository run containerised, with no network" becomes an enforceable rule.

## Richer session graph

Sessions already relate to each other — [forks](/guides/branching) record their
parent, [references](/guides/references) link sessions, sub-agents appear as
linked sessions. Planned: making that graph navigable.

- Visualise a session's lineage — what it forked from, what forked from it.
- Follow reference edges in both directions.
- See a project's work as a graph rather than a flat list.

## Better handoff intelligence

[Handoffs](/guides/handoffs) work by replaying conversation as resume context.
Planned improvements:

- **Handoff summaries** — an explicit statement of state at the boundary,
  rather than relying on the receiving agent to infer it from transcript.
- **Suggested handoffs** — noticing a session is struggling and proposing a
  different agent.
- **Comparison runs** — the same prompt to two agents from identical context,
  with results side by side. A real evaluation rather than an anecdote.

## Catalog intelligence

The catalog knows a great deal that is currently only reachable by searching for
it:

- **Related sessions.** "Three earlier sessions touched this file."
- **Recurring problems.** The same failure appearing across sessions.
- **Stale todos.** Sessions flagged todo that have not moved in a month.

## Team features

See the [enterprise section](/enterprise/editions) for the shared server, SSO
and RBAC, audit export, and policy controls.

## What would help most

The roadmap is shaped by what people actually hit. Useful things to tell us:

- Which of these would change how you work, and which are noise.
- What you currently do **outside** {{product}} because it cannot be done inside.
- For teams: what your security review demanded before adoption.

Reach out via [{{siteUrl}}]({{siteUrl}}).
