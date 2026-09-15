---
id: references
title: References and mentions
sidebar_position: 4
---

# References and mentions

Two characters supply context to an agent: `@` for files, `#` for sessions.

## `@` — files and folders

Type `@` and pick a file or a directory. The agent gets the contents as part of
your message, rather than having to search for it.

Use it when you already know where the relevant code is. It is faster than
letting the agent hunt, and it costs fewer tokens than an exploratory search.
Attaching a **folder** gives the agent the shape of a subsystem without you
naming every file in it.

File mentions are recorded structurally in the event log (`fileMentions` on the
`userMessage` event), not just pasted into the text — so it is always
recoverable which files were attached to which message.

## `#` — sessions

<Screenshot src="session-reference.png" caption="The # picker lists sessions to pull in as context." />

Type `#` and pick another session. That session's work becomes context for this
one.

This is the feature people underestimate. Some things it makes easy:

**"We solved this before."** Reference the session where you did. The agent
gets the actual reasoning and the actual fix, not your recollection of it.

**Carrying a decision forward.** A long architecture discussion happened in one
session. Reference it from the implementation session instead of
re-summarising it.

**Cross-project transfer.** Reference the session where you set up CI in one
repo while doing the same in another.

**Reviewing another agent's work.** Start a session with a different agent and
reference the one you want reviewed. Different model, different blind spots,
same evidence.

Like file mentions, session references are recorded structurally, on the
`sessionReferences` field of the `userMessage` event.

## Attachments

Images, video, and arbitrary files can be attached directly. Screenshots are
the common case — a screenshot of a broken layout with "fix this" is often a
better prompt than a paragraph describing it.

## Choosing between them

| You want the agent to see… | Use |
| --- | --- |
| Code you can point at | `@` |
| Reasoning from previous work | `#` |
| A subsystem's shape | `@` on the folder |
| A bug you can see but not describe | Attach a screenshot |
| What another agent just did | `#` that session |

## Related

- [Branching](/guides/branching) — when you want to *continue* a session rather
  than reference it
- [Search](/guides/search-and-catalog) — finding the session to reference
