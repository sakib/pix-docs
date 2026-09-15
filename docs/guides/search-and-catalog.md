---
id: search-and-catalog
title: "Search and the catalog"
sidebar_position: 5
description: "Trigram full-text search across titles, prompts, paths, branches, and session states."
---

# Search and the catalog

The catalog is every session you have ever run, on every agent, including the
ones you ran before you installed {{product}}. Search is what makes that useful
rather than merely large.

## What is searchable

{{product}} maintains a full-text index over eleven fields per session:

| Field | What it holds |
| --- | --- |
| `title`, `fullTitle` | The session's name |
| `firstPrompt` | What you opened with |
| `preview` | A summary of the work |
| `agentId` | `claude`, `codex`, `cursor`, `pi` |
| `source` | `{{productLower}}`, or the agent it was imported from |
| `projectDir` | Project path |
| `workspaceRoots` | Execution, project, and worktree roots |
| `worktree` | Worktree parent dir, name, branch, and path |
| `sessionId` | The UUID |
| `labels` | Derived state tokens (see below) |

## Trigram matching

The index uses a **trigram** tokenizer rather than word-based tokenization.
This matters for code, where the useful search targets are rarely whole words:

- `uthCont` matches `AuthContext`.
- `_by_root` matches `commands_by_root`.
- `eadowk` matches the `meadowkind` project path.

You do not have to remember how an identifier was capitalised or where its word
boundaries fell. Partial and mid-identifier matches work.

## State tokens

Session state is folded into the searchable `labels` field, so states are query
terms:

| Type this | To find |
| --- | --- |
| `todo` | Sessions flagged as unfinished |
| `done` or `merged` | Resolved sessions |
| `pinned` | Pinned sessions |
| `archived` | Archived sessions |
| `chat` or `scratch` | Scratch sessions with no repository |

Combine them with content terms. `todo auth` finds unfinished sessions about
auth.

## Searching by structure

Because paths and worktrees are indexed, you can search structurally:

- A project path finds everything done in that repo — *including sessions run
  in the agent's own CLI before {{product}} existed on your machine*.
- A branch name finds the sessions that worked on that branch.
- An agent name filters to one agent's work.

## Organising the catalog

**Projects** group sessions by repository. **States** (pinned, todo, done,
archived) carry your own triage. The two are independent, so "everything still
open in this repo" is a normal thing to ask for.

A working habit: mark **done** aggressively when a session is finished. The
default view stays honest, and `todo` stays a real list rather than an
aspiration.

## Related

<CardGrid cols={3}>
  <Card title="The index" icon="gear" href="/under-the-hood/index-db">Schema, FTS5 triggers, and rebuilding.</Card>
  <Card title="Sessions" icon="sessions" href="/guides/sessions">The four states behind the labels.</Card>
  <Card title="Projects and scratch" icon="book" href="/guides/projects-and-scratch">Organising the catalog.</Card>
</CardGrid>
