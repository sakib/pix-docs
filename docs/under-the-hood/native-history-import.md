---
id: native-history-import
title: Native history import
sidebar_position: 7
---

# Native history import

The first thing {{product}} does on a new machine is find the work you have already
done. Sessions you ran in Claude Code months before installing {{product}} appear in
the catalog, searchable, branchable, and available for handoff.

## What happens on first launch

The daemon locates each installed agent's native session storage, reads it, and
projects it into {{product}}'s own format. On a well-used machine this is
substantial:

```text
log [{{productLower}}] claude: history import checked 607 session(s), added 607
```

Six hundred sessions of prior work, catalogued, from an install that took
seconds.

## How imported sessions are marked

An imported session's metadata records where it came from:

```json
{"meta": true, "sessionId": "86c9e287-…", "agentId": "claude",
 "source": "claude", "nativeId": "37d49179-8f1c-4b99-9155-616685b114da",
 "projectDir": "/Users/you/repos/meadowkind"}
```

- **`source`** — `"claude"` here, meaning imported. A session started in {{product}}
  has `source: "{{productLower}}"`.
- **`nativeId`** — the agent's own identifier for the session.
- **`sessionId`** — {{product}}'s identifier. Distinct from `nativeId`, because a
  {{product}} session may span more than one native session after a
  [handoff](/guides/handoffs).

Both are indexed, so you can search either.

## Idempotency

Import runs repeatedly — at startup and periodically. It must never duplicate.
That guarantee is enforced in the schema:

```sql
CREATE UNIQUE INDEX sessions_native_agent
  ON sessions (agentId, nativeId) WHERE nativeId IS NOT NULL;
```

One row per `(agent, native session)`, enforced by the database rather than by
application logic. Import can run a thousand times and the catalog stays
correct.

## Staying current

Import is not one-time. Sessions you run in an agent's own CLI, outside {{product}},
still appear — the daemon picks them up on its next pass.

That is deliberate. {{product}} does not require you to abandon your terminal. Use
the CLI when the CLI is right, and the work still lands in the catalog.

Keeping that current efficiently is the job of
[projections](/under-the-hood/snapshots-and-projections): the four-part
fingerprint lets the daemon read only what is new rather than re-parsing
everything on each pass.

## Bounding the import

`settings-profile.json` has `nativeHistoryRetentionDaysByAgent`, which limits
how far back import reaches, per agent. On a machine with years of history you
may not want all of it.

```json
{"nativeHistoryRetentionDaysByAgent": {"claude": 180}}
```

`historyImportByAgent` in the same file holds per-agent import configuration.

## Partial imports are reported

When an agent's history cannot be fully read, the daemon says so rather than
quietly presenting an incomplete catalog. From `daemon_state`:

```json
{"version": 1, "complete": true,
 "historyAgentIds": ["claude", "codex", "pi"],
 "issue": "nativeHistoryPartial"}
```

The usual cause is an agent that is not installed:

```text
warn [{{productLower}}] codex history import failed: Codex CLI was not found on PATH or at
     ~/.local/bin/codex. Existing ~/.codex credentials can be reused after installation.
```

Note again what that says — the **credentials are already there**. Install the
CLI and that agent's history joins the catalog on the next pass.

## What you can do with imported sessions

Everything you can do with a native one:

- **Search** them — including by project path, which is often the fastest way
  back to old work.
- **[Reference](/guides/references)** them with `#` from a new session.
- **[Branch](/guides/branching)** from any completed turn. Projections track
  `nativeForkCursors` precisely so this works on sessions {{product}} did not
  create.
- **[Hand off](/guides/handoffs)** — continue an old Claude Code session in a
  different agent entirely.
