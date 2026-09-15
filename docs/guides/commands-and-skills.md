---
id: commands-and-skills
title: Slash commands and skills
sidebar_position: 10
description: Slash commands, skills, and MCP tools discovered per agent and per project root.
---

# Slash commands and skills

Agents have their own slash commands, skills, and project-specific extensions.
{{product}} surfaces them rather than making you drop back to a terminal to use them.

## Per-project discovery

Commands are discovered **per agent, per project root**, and cached in
`{{homeDir}}/commands-by-root.json` keyed by `"<agent> <root>"`:

```json
{
  "codex /": {
    "items": [{"name": "compact", "description": "Compact the conversation context"}],
    "fetchedAt": 1789439778951
  },
  "cursor /": {
    "items": [
      {"name": "create-skill", "description": "Create an Agent Skill package"},
      {"name": "create-hook", "description": "Create Cursor hooks and update lifecycle configuration"}
    ],
    "fetchedAt": 1789439778951
  }
}
```

The keying matters. A repository with its own `.claude/` skills exposes a
different command set than an empty directory does, and {{product}} caches each
separately. Open a session in that repo and its project-specific commands are
there; open a scratch session and they are not, correctly.

## Using them

Type `/` in the composer. {{product}} offers the commands the **current agent in the
current project** supports, with their descriptions.

Because discovery is per agent, switching agents changes the command list — as
it should, since the commands genuinely differ.

## Skills

Skills are packaged instruction sets an agent loads for a particular kind of
task. {{product}} passes them through: if a skill is installed for an agent, it shows
up alongside that agent's built-in commands.

Project skills committed to a repository work for everyone on the team who opens
that repo in {{product}}, with no per-machine setup. This is a good way to
standardise a workflow — a review checklist, a deploy runbook, a
project-specific convention — without writing a document nobody reads.

## Refresh and failure

Each cache entry carries a `fetchedAt` timestamp and refreshes in the
background. When discovery fails, {{product}} logs it and keeps the previous answer
rather than showing you an empty list:

```text
warn [{{productLower}}] claude /Users/you/repos/meadowkind commands-by-root.json refresh
     failed: claude: supportedCommands timed out
```

A stale command list is more useful than no command list, and the timestamp
means you can tell which you are looking at.

## MCP tools

MCP servers configured for an agent are available in {{product}} sessions, and their
tool calls appear in the transcript like any other — with arguments and results
visible. An MCP server that fails to connect is reported as a connection
failure, not silently dropped, so you can tell the difference between "the tool
does not exist" and "the tool is broken right now".
