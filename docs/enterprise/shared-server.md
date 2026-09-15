---
id: shared-server
title: "Shared team server"
sidebar_position: 2
description: "A self-hosted team daemon with shared history and central compute. Planned."
---

# Shared team server

:::caution Planned
This capability is in development and is **not available today**. It is
documented here so teams can evaluate direction and plan deployments.
:::

## The idea

Today, the [daemon](/under-the-hood/architecture) runs on your own machine and
your clients connect to it. A shared server extends the same architecture to a
team: one daemon on infrastructure the organisation controls, with many
authenticated users connecting to it.

Because clients are already thin views over a WebSocket protocol, and because
all state already lives in one directory, this is an extension of the existing
design rather than a different product.

## What it would enable

**Shared session history.** A team catalog. The session where someone debugged
the deployment pipeline last month is findable by everyone, not lost on one
laptop.

**Central compute.** Agents run on a well-provisioned machine near the code,
not on a laptop that closes at 5pm. Long refactors and large test runs stop
being a function of whose machine started them.

**Consistent environments.** One place where agent versions, MCP servers, and
project skills are configured — so an agent behaves the same for everyone.

**Onboarding.** A new engineer gets the team's accumulated agent history on day
one. "How do we do X here" has searchable answers.

**Continuity.** Work survives laptops being lost, replaced, or reimaged.

## Deployment shape

The intended model is **self-hosted**: the server runs on your infrastructure,
in your network, under your control. Session data stays in your environment, on
storage you own, subject to your existing controls.

This follows directly from the [privacy
position](/under-the-hood/privacy) — {{product}} does not want custody of your source
code, and a hosted multi-tenant service would require exactly that.

## Design questions being worked through

Stated openly, because they affect how teams would deploy it:

- **Workspace model.** Does the server hold checkouts, or do users mount their
  own? This determines how [worktrees](/guides/worktrees) behave for a team.
- **Credential model.** Whose agent subscription pays for a given session —
  the individual's, or the organisation's?
- **Isolation.** How strongly are concurrent users separated on a shared
  machine?
- **Visibility defaults.** Is a session private until shared, or visible to the
  team by default? Both have real arguments.

If your organisation has requirements here, this is a good moment to say so —
these decisions are still open.

## Related

- [Identity and access](/enterprise/identity-and-access)
- [Audit and usage](/enterprise/audit-and-usage)
- [Policy controls](/enterprise/policy)
