---
id: policy
title: Policy controls
sidebar_position: 5
---

# Policy controls

:::caution Planned
Centrally enforced policy is in development. Local preferences exist today.
:::

## Today: local preferences

`{{homeDir}}/settings-profile.json` holds per-machine preferences — default
agent, default model, worktree behaviour, history retention, per-project
overrides.

These are *preferences*, not *policy*. Any user can change them. That is
correct for an individual and insufficient for an organisation.

## Planned: enforced policy

Administrator-set rules, distributed by the [shared
server](/enterprise/shared-server), that users cannot override.

### Agent and model policy

Which agents may be used, and which models within them. Reasons teams ask for
this:

- A provider has not been through procurement or security review.
- Certain repositories may only be worked on with approved models.
- Cost control — restricting the most expensive models to projects that
  warrant them.

### MCP server allowlists

MCP servers are powerful and are a genuine supply-chain surface: an MCP server
can read your code and reach the network. An allowlist of approved servers,
enforced centrally, is a straightforward control for a real risk.

### Repository policy

Which projects agents may operate on. Some repositories should not have an
agent pointed at them — key material, customer data, systems under regulatory
constraint.

Note the interaction with [access
control](/enterprise/identity-and-access): a session transcript contains the
code the agent read, so transcript access is effectively code access. Repository
policy and transcript access have to be governed together.

### Worktree enforcement

Requiring managed [worktrees](/guides/worktrees) for agent work, so agents never
operate directly on a primary checkout. A cheap control that removes a whole
class of accident.

### Hook enforcement

Agents support hooks that run on tool use. Centrally enforced hooks would let an
organisation apply guardrails uniformly — blocking a command pattern, requiring
a check before commits — rather than relying on each engineer configuring them.

### Telemetry policy

Org-wide telemetry setting, so an organisation that does not permit telemetry
can disable it centrally rather than trusting every machine to be configured
correctly.

### Retention policy

How long session data is kept, enforced rather than requested.

## Design principle: honest enforcement

One commitment about how this will work. {{product}}'s existing [capability
honesty](/getting-started/connecting-agents#capability-honesty) principle —
never show a control that does not work — extends to policy: **a control
disallowed by policy will be visibly disallowed, with the reason, not silently
broken.**

An engineer who cannot use a model should be told that policy prevents it, not
left debugging a mysterious failure. Silent enforcement generates support
tickets and erodes trust in the tool.

## Tell us your requirements

Policy is the area where organisational requirements vary the most, and where
guessing produces the wrong thing. If you have specific controls your security
team requires, get in touch via [{{siteUrl}}]({{siteUrl}}) — those requirements
will shape what gets built.
