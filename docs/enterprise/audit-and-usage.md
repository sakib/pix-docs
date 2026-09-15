---
id: audit-and-usage
title: "Audit and usage"
sidebar_position: 4
description: "Org-wide usage, cost, and audit export built on the session logs that already exist."
---

# Audit and usage

:::caution Planned
Org-wide reporting is in development. The **underlying record already exists**
and is fully readable today — see "What you can do now" below.
:::

## The foundation already exists

This is the part worth understanding before anything is built: {{product}}'s session
logs are already a complete audit record. Every session is an append-only JSONL
file capturing:

- Every prompt, with a timestamp
- Every tool call — name, arguments, status, and full output
- Every question an agent asked and how it was answered
- Every error, classified by category and retryability
- Which agent and which model, with the alias **and** the concrete model it
  resolved to
- Which project, which worktree, which branch

There is no separate audit subsystem to enable, because the primary storage
format is already an audit log. Enterprise reporting is aggregation over records
that are being written right now.

## What you can do now

On a single machine, without any enterprise feature:

```bash
# Every shell command an agent ran in a session, in order
python3 -c "
import json, sys
for line in open(sys.argv[1]):
    ev = json.loads(line).get('event', {})
    if ev.get('kind') == 'toolCallStarted' and ev.get('name') == 'Bash':
        print(ev['argLine'])
" {{homeDir}}/sessions/<uuid>.jsonl

# Sessions per agent and origin
sqlite3 {{homeDir}}/index.db \
  "SELECT agentId, source, COUNT(*) FROM sessions GROUP BY 1,2"

# Which projects have seen agent activity
sqlite3 {{homeDir}}/index.db \
  "SELECT projectDir, COUNT(*) n, MAX(updatedAt) FROM sessions
   GROUP BY 1 ORDER BY n DESC"

# Everything touching a given repository
sqlite3 {{homeDir}}/index.db \
  "SELECT createdAt, agentId, title FROM sessions
   WHERE projectDir LIKE '%/payments%' ORDER BY createdAt"
```

For many teams this is already enough to answer "what have agents done to this
codebase," which is usually the first question a security reviewer asks.

## Planned: organisation-wide reporting

**Usage and cost.** Token consumption aggregated by person, team, project,
agent, and model. Enough resolution to answer where spend actually goes rather
than just what the total was.

Most teams discover two things: a small number of long sessions dominate cost
because context is re-sent every turn, and high thinking levels get used on
mechanical work where they add nothing. Both are actionable once visible.

**Activity reporting.** Which repositories are seeing agent work, which agents
and models are in use, and adoption over time.

**Audit export.** Session records exported in a structured format for your SIEM
or compliance tooling, with filtering by time range, project, and user.

**Retention policy.** Org-wide rules for how long session data is kept, applied
automatically. The per-agent primitive already exists locally as
`nativeHistoryRetentionDaysByAgent`; the enterprise version makes it a policy
rather than a preference.

## Planned: compliance support

Intended to help with the questions that come up in review:

- *Who used AI assistance on this repository, and when?*
- *What did the agent actually change?*
- *Which models processed our source code?*
- *Is agent-assisted work on restricted repositories controlled?*

The honest note here: {{product}} can answer these because it records them. It is
not a compliance product and does not certify anything. It gives your compliance
process real evidence to work from.

## Related

- [Usage and context](/guides/usage-and-context) — per-session reporting today
- [Policy controls](/enterprise/policy) — preventing rather than reporting
- [Privacy](/under-the-hood/privacy) — where the data lives
