---
id: remote-access
title: "Remote access"
sidebar_position: 12
description: "One daemon, many clients: LAN discovery over mDNS and remote access over Tailscale."
---

# Remote access

{{product}} splits into a **daemon** that runs agents and **clients** that display
them. Because of that split, the machine doing the work and the device you are
holding do not have to be the same.

## The model

The daemon runs on the machine with your code, your agents, and your
credentials — your Mac or a Linux box. It binds to `127.0.0.1:8790` and speaks
a WebSocket protocol.

Clients are views onto it: the desktop app, the iPhone app, the iPad app, and a
browser. Several can be attached at once, all live. The daemon log shows exactly
this:

```text
log [{{productLower}}] client connected: desktop v0.25.0
log [{{productLower}}] client connected: desktop v0.25.0
```

Nothing is running on the phone. It is a window onto the daemon.

## On your LAN

The daemon advertises itself over **mDNS** as `_{{productLower}}._tcp` on port 8790:

```text
log [{{productLower}}] mDNS: advertising _{{productLower}}._tcp on :8790
```

Open {{product}} on your iPad on the same network and your machine is discoverable
without you typing an IP address.

Pairing is authenticated. `{{homeDir}}/token` holds the daemon's token and
`{{homeDir}}/device-verifier.key` the device verifier, so a client on your network
still has to be authorised — being on the LAN is not sufficient.

## From anywhere, over Tailscale

For access outside your network, {{product}} is designed to run over
[Tailscale](https://tailscale.com). Your devices join your tailnet, and the
client reaches the daemon over that private network.

This is the right design for the threat model. There is no {{product}} relay in the
middle, no port forwarded to the public internet, and no inbound firewall rule.
Traffic is end-to-end encrypted by Tailscale between two devices you own.

**Setup:**

1. Install Tailscale on the daemon machine and on the client device.
2. Sign both into the same tailnet.
3. In the {{product}} client, connect to the daemon machine's tailnet address.

## What this is good for

<Screenshot src="ipad-layout.png" caption="The iPad layout: a desktop-class client for a daemon running elsewhere." />

**Long-running work.** Start a large refactor, close the laptop, check progress
from your phone. The daemon keeps running; the agent does not care that no
window is open.

**Answering the agent.** An agent blocked on a question is an agent doing
nothing. `pendingAttention` surfaces on mobile, so a session blocked on a yes/no
does not stay blocked until you get home.

**Review away from the desk.** Read a diff, check what a session actually did,
mark it done — from the couch.

**Kicking off work you are not going to watch.** Start it from the phone in the
morning; review it at your desk.

## Related

<CardGrid cols={3}>
  <Card title="Privacy" icon="lock" href="/under-the-hood/privacy">What leaves the machine, and what does not.</Card>
  <Card title="Architecture" icon="gear" href="/under-the-hood/architecture">Daemon and clients.</Card>
  <Card title="Parallel work" icon="parallel" href="/guides/parallel-work">Long work you check on remotely.</Card>
</CardGrid>
