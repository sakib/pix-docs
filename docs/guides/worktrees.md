---
id: worktrees
title: Worktrees
sidebar_position: 7
---

# Worktrees

A git worktree is a second checkout of the same repository, on its own branch,
in its own directory. {{product}} can manage them for you, which is what makes
running several agents at once safe.

## The problem

Two agents in one directory will destroy each other's work. Agent A edits
`auth.py` while agent B is refactoring it; both are convinced they succeeded;
the file is now neither refactor. No amount of careful prompting fixes this,
because it is a filesystem problem, not a prompting problem.

## The solution

Give each session its own worktree. Same repository, same history, separate
working directories. The agents cannot see each other's uncommitted changes and
cannot clobber each other's files.

## Turning it on

`settings-profile.json` holds the default:

```json
{"newSessionsUseWorktrees": false}
```

Set it globally, or choose per session when you create one. If you routinely run
more than one agent at a time, turning it on by default is the right call.

## What {{product}} tracks

Worktree sessions record the worktree structurally:

```json
{"parentDir": "…", "name": "…", "branch": "…", "path": "…"}
```

All four fields are indexed, so a session is findable by its branch name, its
worktree name, or its original project path.

`workspaceRoots` keeps `execution`, `project`, and `worktree` distinct — the
agent runs in the worktree, but the session still belongs to the project.

## Reviewing the work

<Screenshot src="worktree-diff.png" caption="A worktree compared against the main checkout." />

{{product}} can compare a worktree against the main checkout, so you review what the
session actually changed rather than reading its summary of what it changed.

File-level review is tracked in a `review_marks` table keyed by session and
path, recording when you viewed each file. On a large diff, this is what tells
you what you have already looked at.

:::tip Review the diff, not the summary
An agent's account of its own changes is a summary written by the thing being
reviewed. The diff is the evidence. {{product}} puts it one click away for exactly
this reason.
:::

## Merging back

The worktree is a real branch — merge it however your team merges anything.
Mark the session **done** when you do; `done` also matches `merged` in search,
so "what has landed" is a query.

## Worktrees and branching

They compose well. [Branch](/guides/branching) a session three ways, give each
branch its own worktree, run all three at once, compare the diffs, keep the best
one. That is a real experiment rather than three attempts overwriting each
other.
