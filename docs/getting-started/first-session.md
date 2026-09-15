---
id: first-session
title: "Your first session"
sidebar_position: 2
description: "Add a project, pick an agent, send a prompt, use the surfaces, and find the session again."
---

# Your first session

This walks through starting a session, steering it, and finding it again
afterwards. It assumes you have [installed {{product}}](/getting-started/install)
and have at least one agent CLI on your machine.

## 1. Add a project

A **project** is a directory {{product}} watches. Everything you do is scoped to one,
with the exception of [scratch sessions](/guides/projects-and-scratch).

Open the project picker and add a repository. {{product}} records it in
`{{homeDir}}/projects.json` along with when you added it and when you last used it,
which is what drives the recency ordering in the picker:

```json
{
  "projects": [
    {
      "path": "/Users/you/repos/meadowkind",
      "addedAt": 1789305399023,
      "lastUsedAt": 1789443000930
    }
  ]
}
```

## 2. Pick an agent and a model

<Screenshot src="composer-agent-picker.png" caption="The composer with the agent selector open. Unavailable agents are shown as such." />

New sessions open with an agent selector. The list reflects what {{product}} found
on your machine — an agent you have not installed or authenticated appears
unavailable rather than failing at the first prompt. See
[Connecting agents](/getting-started/connecting-agents).

Once an agent is chosen, the model controls appear. These are **per-agent**,
because agents genuinely differ: Claude exposes thinking levels and, on some
models, a speed mode; other agents expose neither. {{product}} reads the real
capability set from the agent itself and caches it in `{{homeDir}}/models.json`.

For a first run, the defaults are fine. [Models and thinking](/guides/models)
covers the controls in depth.

## 3. Send a prompt

Type and send. A few things are worth noticing as the turn runs:

- **Tool calls are visible.** Every command the agent runs appears as it
  happens, with its arguments and its output. Nothing is hidden behind a
  spinner.
- **The turn is structured.** {{product}} records `turnStarted`, the text and tool
  calls within it, and `turnEnded`. That structure is what makes
  [branching](/guides/branching) possible later.
- **Questions surface as UI.** When an agent asks a clarifying question, it
  becomes a real prompt in the interface rather than a line of text you might
  scroll past.

## 4. Use the surfaces

While the turn runs, the panels beside the conversation are live:

- **Terminal** — the commands and their output.
- **Repository** — files, branches, and worktrees.
- **Browser** — for web work, an inspectable page.
- **Simulator** — for iOS work, a live simulator.

These are covered in [Surfaces](/guides/surfaces).

## 5. Attach context

Two characters do most of the work:

- `@` pulls in a **file or folder**.
- `#` pulls in **another session**.

The second one is the interesting one. If you solved a related problem last
week, `#` that session into this one and the agent gets that work as context.
See [References and mentions](/guides/references).

You can also attach images, video, and arbitrary files.

## 6. Mark it and move on

When the turn finishes, give the session a state so it stays findable:

| State | Meaning |
| --- | --- |
| **Pinned** | Keep at the top of the catalog. |
| **Todo** | Unfinished; you intend to come back. |
| **Done** | Resolved. Also searchable as `merged`. |
| **Archived** | Out of the default view, still searchable. |

These are real columns in the index and real search tokens, so `todo` in the
search box finds exactly the sessions you flagged. See
[Search and the catalog](/guides/search-and-catalog).

## 7. Find it again

The catalog is searchable across titles, first prompts, previews, agent,
project directory, worktree, and state labels. The index uses a **trigram**
tokenizer, which means partial words and mid-identifier matches work —
searching `uthCont` will find `AuthContext`.

## Next

- [Connect more agents →](/getting-started/connecting-agents)
- [Understand sessions properly →](/guides/sessions)
