---
id: editions
title: "Editions"
sidebar_position: 1
description: "What is free for individuals and what the enterprise edition adds. Planned items are marked."
---

# Editions

{{product}} is **free for individuals**, with a paid edition for organisations that
need central administration, identity integration, and auditability.

:::info Status of this section
Everything in the Free column below **ships today**. Items marked *Planned* are
in development and are described here so teams can evaluate direction. This
documentation will not describe an unshipped capability as though it exists —
if it says Planned, it is not available yet.
:::

## What's free

**Everything local, with no limits.** This is not a trial or a crippled tier:

- Every supported agent — Claude Code, Codex, Cursor, Pi
- Unlimited sessions, unlimited history, unlimited projects
- The desktop apps for macOS and Linux
- The iPhone and iPad apps
- The browser client
- [Handoffs](/guides/handoffs) between agents
- [Branching](/guides/branching) from any turn
- [Native history import](/under-the-hood/native-history-import)
- Full-text [search](/guides/search-and-catalog) across the whole catalog
- Managed [worktrees](/guides/worktrees) and parallel sessions
- All [surfaces](/guides/surfaces) — terminal, repository, browser, simulator
- [LAN and Tailscale](/guides/remote-access) remote access
- [Usage and context reporting](/guides/usage-and-context)

You bring your own agent subscriptions. {{product}} adds no per-token cost, because
it is not in the path of your model traffic.

## Free vs. Enterprise

| | Free | Enterprise |
| --- | :---: | :---: |
| All agents, unlimited sessions | ✅ | ✅ |
| Desktop, mobile, browser clients | ✅ | ✅ |
| Handoffs, branching, worktrees | ✅ | ✅ |
| History import and search | ✅ | ✅ |
| LAN and Tailscale access | ✅ | ✅ |
| [Shared team server](/enterprise/shared-server) | — | *Planned* |
| [SSO and SCIM](/enterprise/identity-and-access) | — | *Planned* |
| [Role-based access control](/enterprise/identity-and-access) | — | *Planned* |
| [Org-wide audit export](/enterprise/audit-and-usage) | — | *Planned* |
| [Aggregated usage and cost reporting](/enterprise/audit-and-usage) | — | *Planned* |
| [Policy controls](/enterprise/policy) | — | *Planned* |
| Retention policy | — | *Planned* |
| Priority support and SLA | — | *Planned* |

## Why the line is drawn here

The free edition is complete for one developer on one machine. Nothing about
individual use is held back, because a tool that developers do not adopt
individually never gets adopted by their company either.

What organisations need is different in kind, not in degree: an administrator
who can see across people, an identity system that governs access, an auditable
record, and enforceable policy. Those things only make sense with a
multi-user server, and that is what the enterprise edition is.

## Data handling is identical

Both editions keep code and conversations on infrastructure **you** control. The
enterprise edition adds a server you run; it does not add a {{product}}-operated
cloud. See [Privacy](/under-the-hood/privacy).

## Getting in touch

For enterprise evaluation, pilot access, or security review material, reach out
via [{{siteUrl}}]({{siteUrl}}).
