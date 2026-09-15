---
id: identity-and-access
title: Identity and access
sidebar_position: 3
description: SSO, SCIM, roles, and device management for organisations. Planned.
---

# Identity and access

:::caution Planned
Not available today. Documented for evaluation and planning.
:::

## Today

Access to a daemon is controlled by two files in `{{homeDir}}`:

- **`token`** — the daemon's authentication token
- **`device-verifier.key`** — the device pairing verifier

Both are `0600`. A client must present valid credentials; being on the same
network is not sufficient. This is appropriate for a single developer with a
handful of their own devices.

It does not extend to an organisation, for reasons any SRE will recognise: no
identity, no revocation story beyond rotating a shared secret, no roles, and no
audit trail of who did what.

## Planned: single sign-on

Integration with the identity provider you already run — Okta, Entra ID, Google
Workspace, or any standard SAML or OIDC provider.

The properties that matter:

- **Joiners** get access by being in the right group. No separate provisioning
  step to forget.
- **Leavers** lose access when deprovisioned upstream. This is the important
  one. An offboarded engineer must not retain access to a system that holds
  transcripts of your source code.
- **MFA** is inherited from your IdP rather than reimplemented.

## Planned: SCIM provisioning

Automatic user and group synchronisation from your directory, so group
membership drives {{product}} access without manual reconciliation.

## Planned: role-based access control

An initial role model, subject to feedback:

| Role | Can |
| --- | --- |
| **Member** | Create and run sessions; see what their access permits |
| **Reviewer** | Read across the team's sessions; cannot modify |
| **Project admin** | Manage projects, agents, and policy for their projects |
| **Org admin** | Manage users, roles, org-wide policy, and audit export |

Alongside roles, per-project access, so a repository with restricted access is
not made readable through its agent transcripts. This matters more than it
first appears: a session transcript contains the code the agent read. Access to
the transcript is effectively access to the code.

## Planned: device management

An administrative view of paired devices with the ability to revoke
individually — so a lost laptop or phone can be cut off without rotating
credentials for the whole team.

## What we would like to hear

If you are evaluating {{product}} for an organisation, the most useful input right
now is your **actual** requirements: which IdP, whether SCIM is mandatory, what
your auditors ask for, and what your offboarding runbook demands. Get in touch
via [{{siteUrl}}]({{siteUrl}}).
