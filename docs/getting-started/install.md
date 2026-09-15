---
id: install
title: "Install"
sidebar_position: 1
description: "Install {{product}} on macOS, Linux, iPhone, and iPad, and confirm the daemon is running."
---

# Install {{product}}

{{product}} ships as a native desktop application for macOS and Linux, and as a
mobile app for iPhone and iPad. All of them talk to the same daemon, so you can
install more than one and see the same sessions on each.

## macOS

Download the [Mac build]({{siteUrl}}) and drag it to `/Applications`.

The production release is **signed and notarized for Apple silicon**, so it
opens without a Gatekeeper override. On first launch {{product}} starts its daemon in
the background and begins importing the native history of any agents it finds.

:::tip First launch takes a moment
The initial history import scans the native session directories of every agent
on your machine. On a well-used developer laptop that can be several hundred
sessions. The catalog fills in progressively; you do not need to wait for it.
:::

## Linux

{{product}} publishes packages for the three major families, on both x64 and ARM64:

| Distribution family | Package | Architectures |
| --- | --- | --- |
| Ubuntu / Debian | `.deb` | x64, ARM64 |
| Fedora / RHEL | `.rpm` | x64, ARM64 |
| Arch / CachyOS | `.pkg.tar.zst` | x64 |

Pick the matching package from the [download page]({{siteUrl}}) and install it
with your package manager:

```bash
# Debian / Ubuntu
sudo dpkg -i {{productLower}}_*.deb

# Fedora / RHEL
sudo rpm -i {{productLower}}-*.rpm

# Arch / CachyOS
sudo pacman -U {{productLower}}-*.pkg.tar.zst
```

Linux updates are staged by a dedicated activator rather than applied in place,
because a running daemon cannot safely overwrite itself. See
[Updates and release channels](/under-the-hood/updates).

## iPhone and iPad

{{product}} for iOS is currently distributed through
[TestFlight](https://testflight.apple.com/join/u29zT3mc). The iPhone build is a
focused experience for checking in on running work and steering it; the iPad
build is a desktop-class layout that you can genuinely work in.

The mobile apps are **clients, not daemons** — they do not run agents
themselves. They connect to the daemon on your Mac or Linux machine over your
LAN or over Tailscale. Set that up in [Remote access](/guides/remote-access).

## Verifying the install

Once the desktop app has launched at least once, the daemon's home directory
exists:

```bash
ls {{homeDir}}
```

You should see `index.db`, `sessions/`, `blobs/`, and a handful of JSON
configuration files. That directory is the entirety of {{product}}'s state, and it is
documented in full in the [`{{homeDir}}` reference](/under-the-hood/pix-directory).

To confirm the daemon is actually up:

```bash
cat {{homeDir}}/logs/daemon.log | head -5
```

A healthy start looks like this:

```text
2026-09-13T13:16:03.892Z log [{{productLower}}] daemon log opened (pid 95826)
2026-09-13T13:16:04.274Z log [{{productLower}}] daemon v0.25.0 · protocol v0 · ws://127.0.0.1:8790 · 6 agent(s)
2026-09-13T13:16:13.271Z log [{{productLower}}] mDNS: advertising _{{productLower}}._tcp on :8790
2026-09-13T13:16:14.477Z log [{{productLower}}] client connected: desktop v0.25.0
```

## Next

[Run your first session →](/getting-started/first-session)
