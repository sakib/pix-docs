---
id: models
title: Models and thinking
sidebar_position: 9
---

# Models and thinking

Model controls in {{product}} are per-agent and reflect what the agent actually
supports. {{product}} queries each agent for its capability set and caches the answer
in `{{homeDir}}/models.json`.

## What a model entry describes

Each model reports far more than a name:

```json
{
  "id": "opus",
  "label": "Opus 5",
  "resolvedId": "claude-opus-5",
  "thinkingLevels": ["low", "medium", "high", "xhigh", "max"],
  "defaultThinkingLevel": "high",
  "speedModes": [
    {"id": "standard", "label": "Standard", "accelerated": false},
    {"id": "fast", "label": "Fast", "description": "Faster responses with increased usage", "accelerated": true}
  ],
  "defaultSpeedMode": "standard"
}
```

The distinction between `id` and `resolvedId` is worth understanding. `id` is
the alias you select (`opus`, `sonnet`, `default`); `resolvedId` is the concrete
model it currently maps to (`claude-opus-5`). Aliases move as new models ship.
Sessions record what you selected, and `resolvedId` tells you what that actually
meant at the time.

## Thinking levels

<Screenshot src="model-controls.png" caption="Model controls for Claude: thinking level and, on Opus, speed mode." />

Where an agent supports them, {{product}} exposes the full range — `low`, `medium`,
`high`, `xhigh`, `max` — with the agent's own default pre-selected.

Higher levels mean more reasoning before acting: better on genuinely hard
problems, slower and more expensive on easy ones. A rough guide:

| Level | Good for |
| --- | --- |
| `low` | Mechanical edits, renames, formatting |
| `medium` | Ordinary feature work |
| `high` | Debugging, design decisions, unfamiliar code |
| `xhigh` / `max` | Subtle bugs, architecture, anything you have already failed at once |

Note that `high` is frequently the agent's *own* default rather than `medium` —
these agents are tuned for real engineering work.

## Speed modes

Some models offer a speed mode. Where they do, the model entry says so
explicitly, including the trade-off:

> **Fast** — "Faster responses with increased usage"

That is the honest framing: speed costs usage. {{product}} surfaces the description
from the agent rather than inventing its own.

Crucially, a fast mode is **not** a smaller model. On Claude Opus, fast mode is
still Opus, with faster output.

## Models that have no controls

Haiku 4.5 reports `defaultThinkingLevel: null` and no speed modes. {{product}} shows
no thinking selector for it. This is not a limitation being hidden; it is
[capability
honesty](/getting-started/connecting-agents#capability-honesty) — a control that
appears is a control that works.

## Setting defaults

Per agent, and per project-and-agent, in `settings-profile.json`:

```json
{
  "defaultsByAgent": {
    "claude": {"modelId": "opus", "thinkingLevel": null, "speedMode": null}
  },
  "defaultsByProjectAgent": {}
}
```

`null` means "use the agent's own default", which is usually the right choice —
it tracks upstream changes instead of pinning you to a stale opinion.

## Changing model mid-session

You can. The session keeps its identity and its history; subsequent turns use
the new setting. Starting cheap and escalating when a problem turns out to be
hard is a normal, good workflow.

Changing the *agent* mid-session is a [handoff](/guides/handoffs).
