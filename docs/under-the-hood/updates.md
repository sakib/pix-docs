---
id: updates
title: "Updates and release channels"
sidebar_position: 8
description: "Release channels, the update service, Linux staging, data format migrations, and build hardening."
---

# Updates and release channels

## Channels

Builds are published to a named channel, recorded in `data-format.json`:

```json
{"writer": {"version": "0.25.0", "buildId": "gha-34753736364-1",
            "sourceRevision": "b2d719c03bac88a05a93273e15ae0c766ec9fb65",
            "releaseChannel": "prod"}}
```

`prod` is the default and what the download links serve. Every {{product}} directory
records the exact build that wrote it — version, CI build id, and source
revision. When reporting a bug, this is the most useful thing you can include.

## The update service

Updates come from a generic provider rather than a platform app store:

```yaml
provider: generic
publishAutoUpdate: false
url: https://pix-update-service.ritesh-pix.workers.dev/prod/darwin/arm64
useMultipleRangeRequest: false
updaterCacheDirName: '@pixdesktop-updater'
```

The channel is in the path, so switching channels is a matter of which endpoint
the build points at.

The desktop app attaches to the update host and reports its state in the log:

```text
log [{{productLower}}] desktop update host attached (0.25.0/prod, phase up-to-date)
log [{{productLower}}] desktop update host detached
```

`phase` is the one to read: `up-to-date`, or a phase describing where in the
download-and-stage process it is.

## macOS

Builds are **signed and notarized for Apple silicon**. Updates download in the
background and apply on restart.

## Linux

Linux updates go through a dedicated activator
(`pix-linux-update-activator.cjs`) rather than being applied in place. A running
daemon cannot safely overwrite its own files, so the update is staged and
activated on restart.

Packages are published for:

| Family | Format | Architectures |
| --- | --- | --- |
| Ubuntu / Debian | `.deb` | x64, ARM64 |
| Fedora / RHEL | `.rpm` | x64, ARM64 |
| Arch / CachyOS | `.pkg.tar.zst` | x64 |

## iOS

Distributed through [TestFlight](https://testflight.apple.com/join/u29zT3mc),
which handles its own update mechanism.

## Data format migrations

Storage format changes are tracked explicitly in `data-format.json`:

```json
{"dataFormat": 1, "minimumReaderFormat": 1,
 "migrationHistory": [], "inProgressMigration": null}
```

- **`dataFormat`** — the current on-disk format.
- **`minimumReaderFormat`** — the compatibility floor. An older build that
  cannot read this format refuses to try, rather than corrupting it. This is
  what makes downgrades safe.
- **`migrationHistory`** — completed migrations.
- **`inProgressMigration`** — non-null only while one is running. A migration
  interrupted by a crash is therefore *detectable* on the next start, instead
  of leaving the directory silently half-migrated.

## Build hardening

Production builds apply a documented policy, recorded in
`hardening-manifest.json`:

```json
{"policy": {
  "id": "{{productLower}}-distributed-v1",
  "scope": "first-party desktop, daemon, helper, worker, overlay, and renderer JavaScript",
  "transforms": [
    "bundle-first-party-entrypoints-and-renderer-chunks",
    "minify-identifiers-syntax-whitespace",
    "obfuscate-identifiers-and-strings-with-per-build-randomness",
    "compose-upload-and-delete-source-maps-when-configured",
    "remove-workspace-packages-typescript-and-source-maps",
    "electron-asar-integrity-and-runtime-fuses"
  ]},
 "electronVersion": "43.2.0",
 "electronFuses": {
   "EnableCookieEncryption": true,
   "EnableNodeCliInspectArguments": false,
   "EnableEmbeddedAsarIntegrityValidation": true
 }}
```

The Electron fuses are the security-relevant part: ASAR integrity validation
means tampered application code fails to load, and disabled CLI inspect
arguments means the app cannot be trivially attached to with a debugger to read
your session data out of memory.
