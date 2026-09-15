---
id: index-db
title: "The index"
sidebar_position: 6
description: "The SQLite catalog and FTS5 trigram index: schema, triggers, queries, and rebuilding."
---

# The index

`{{homeDir}}/index.db` is a SQLite database holding the session catalog and the
full-text search index. It is **derived state** — rebuildable from the session
logs — which makes it safe to delete when something goes wrong.

It runs in WAL mode, hence the `index.db-shm` and `index.db-wal` files beside
it.

## Tables

```text
sessions                     Catalog: one row per session
session_search_fts           FTS5 virtual table (trigram)
session_log_checkpoints      Incremental-read resume points
session_fork_requests        Durable fork requests
review_marks                 Per-file review state
daemon_state                 Daemon key/value state
```

## `sessions`

```sql
CREATE TABLE sessions (
  sessionId TEXT PRIMARY KEY,
  agentId   TEXT NOT NULL,
  title     TEXT NOT NULL DEFAULT '',
  fullTitle TEXT NOT NULL DEFAULT '',
  firstPrompt TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  archived  INTEGER NOT NULL DEFAULT 0,
  pinned    INTEGER NOT NULL DEFAULT 0,
  done      INTEGER NOT NULL DEFAULT 0,
  todo      INTEGER NOT NULL DEFAULT 0,
  preview   TEXT NOT NULL DEFAULT '',
  turns     INTEGER NOT NULL DEFAULT 0,
  source    TEXT NOT NULL DEFAULT '{{productLower}}',
  nativeId  TEXT,
  pendingAttention TEXT,
  modelId TEXT, thinkingMode TEXT, thinkingLevel TEXT,
  contextMode TEXT, speedMode TEXT,
  projectDir TEXT, workspaceKind TEXT, workspaceRoots TEXT,
  worktree TEXT, contextUsage TEXT, forkedFrom TEXT
);
```

Two indexes serve the catalog views, and one constraint is worth noting:

```sql
CREATE INDEX sessions_recency ON sessions (updatedAt DESC, sessionId);
CREATE INDEX sessions_pinned_recency ON sessions (pinned, updatedAt DESC, sessionId);
CREATE UNIQUE INDEX sessions_native_agent
  ON sessions (agentId, nativeId) WHERE nativeId IS NOT NULL;
```

That partial unique index is the **idempotency guarantee for history import**:
one row per `(agent, native session)`. Re-running an import cannot duplicate a
session, no matter how many times it runs.

## Full-text search

```sql
CREATE VIRTUAL TABLE session_search_fts USING fts5(
  title, fullTitle, firstPrompt, preview, agentId, source,
  projectDir, workspaceRoots, worktree, sessionId, labels,
  tokenize = 'trigram'
);
```

**Trigram tokenization** is why partial and mid-identifier matching works.
Word-based tokenizers are a poor fit for code, where the useful search targets
are `AuthContext`, `commands_by_root`, and path fragments — none of which are
words.

### Denormalisation in the triggers

The FTS table is kept in sync by `AFTER INSERT`, `AFTER UPDATE`, and
`AFTER DELETE` triggers on `sessions`. They do real work: JSON columns are
flattened into searchable text, and state flags are synthesised into a `labels`
string.

Worktrees, flattened out of JSON so every part is searchable:

```sql
CASE WHEN json_valid(new.worktree) THEN TRIM(
  COALESCE(json_extract(new.worktree, '$.parentDir'), '') || ' ' ||
  COALESCE(json_extract(new.worktree, '$.name'),      '') || ' ' ||
  COALESCE(json_extract(new.worktree, '$.branch'),    '') || ' ' ||
  COALESCE(json_extract(new.worktree, '$.path'),      '')
) ELSE '' END
```

State flags, turned into search tokens:

```sql
(CASE WHEN COALESCE(new.workspaceKind,'project') = 'scratch' THEN 'chat scratch ' ELSE '' END) ||
(CASE WHEN new.done = 1     THEN 'done merged ' ELSE '' END) ||
(CASE WHEN new.todo = 1     THEN 'todo '        ELSE '' END) ||
(CASE WHEN new.pinned = 1   THEN 'pinned '      ELSE '' END) ||
(CASE WHEN new.archived = 1 THEN 'archived'     ELSE '' END)
```

This is why typing `todo` finds your unfinished sessions and `merged` is a
synonym for `done` — the vocabulary is generated right here.

## Querying it yourself

The database is plain SQLite. Read from it freely while the daemon runs; do not
write to it.

```bash
# Sessions per agent and origin
sqlite3 {{homeDir}}/index.db \
  "SELECT agentId, source, workspaceKind, COUNT(*) FROM sessions GROUP BY 1,2,3"

# What is still open?
sqlite3 {{homeDir}}/index.db \
  "SELECT title, projectDir FROM sessions WHERE todo = 1 AND archived = 0
   ORDER BY updatedAt DESC"

# Busiest projects
sqlite3 {{homeDir}}/index.db \
  "SELECT projectDir, COUNT(*) n FROM sessions GROUP BY 1 ORDER BY n DESC LIMIT 10"

# Full-text search from the shell
sqlite3 {{homeDir}}/index.db \
  "SELECT sessionId, title FROM session_search_fts WHERE session_search_fts MATCH 'todo auth'"

# Fork lineage
sqlite3 {{homeDir}}/index.db \
  "SELECT s.title, p.title FROM sessions s JOIN sessions p ON s.forkedFrom = p.sessionId"
```

## Rebuilding

If the index is corrupt or the catalog looks wrong, delete it and restart. The
daemon rebuilds from `sessions/`.

```bash
# Quit {{product}} first.
mv {{homeDir}}/index.db{,.bak}
rm -f {{homeDir}}/index.db-shm {{homeDir}}/index.db-wal
```

You lose nothing durable. Rebuilding a large catalog takes a while; the catalog
fills in progressively as it goes.
