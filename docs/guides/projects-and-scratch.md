---
id: projects-and-scratch
title: "Projects and scratch"
sidebar_position: 6
description: "Projects scope sessions to a repository; scratch sessions have no repository at all."
---

# Projects and scratch

## Projects

A project is a directory {{product}} watches. Adding one makes it available in the
picker and scopes sessions, search, and per-project defaults to it.

Projects are recorded in `{{homeDir}}/projects.json`:

```json
{
  "projects": [
    {"path": "/Users/you/repos/meadowkind", "addedAt": 1789305399023, "lastUsedAt": 1789443000930}
  ]
}
```

`lastUsedAt` drives recency ordering, so the repos you actually work in rise to
the top without you curating the list.

### Nested projects

A parent directory and a child directory can both be projects. Sessions record
their own `projectDir`, and `workspaceRoots` distinguishes three separate
things:

```json
{"execution": "/Users/you/repos", "project": "/Users/you/repos", "worktree": null}
```

- **`execution`** — where the agent actually runs.
- **`project`** — the project the session belongs to.
- **`worktree`** — the managed worktree, if any.

They are usually the same. They diverge when you use
[worktrees](/guides/worktrees), and keeping them separate is what makes worktree
sessions searchable by both their real branch and their originating project.

### Per-project defaults

`settings-profile.json` holds `preferredAgentByProject` and
`defaultsByProjectAgent`. Use an expensive model in the repo that warrants it
and a cheap one everywhere else, without changing settings each time.

## Scratch sessions

A scratch session has **no repository**. It is a workspace for thinking:
research, prototyping, rubber-ducking, asking a question that has nothing to do
with a codebase.

Scratch sessions are marked `workspaceKind: "scratch"` and carry the `chat` and
`scratch` search labels, so they are easy to include or exclude.

Use them for:

- Research before you know which repo the answer belongs in.
- Design discussion you will later `#`-reference from the implementation
  session.
- Throwaway questions you do not want cluttering a project's history.

They are full sessions — searchable, branchable, referenceable, handoff-capable.
The only difference is the absence of a repository.

### Promoting a scratch session

Design in scratch, then start a project session and `#`-reference the scratch
one. The thinking carries into the repo without the repo history being polluted
by the thinking.
