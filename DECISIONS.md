# Decisions

Product and documentation decisions made with Sakib on 2026-09-14/15 while
setting up this site. Recorded here so they survive any single chat session.

## Naming

- The product ships as **Pix** for now. Every user-visible occurrence resolves
  from `brand.ts`; renaming is `just rename <Name> [dir] [url]` plus a build.
- Existing candidates and why they were passed over: OneCode (generic), Polymer
  (Google's Polymer library), Isotope (Isotope.js layout library), Tessera
  (a16z-funded competitor in this exact space), Atrium/Ferry/Nave/Hearth (all
  taken on .sh/.dev/.ai).
- Compound English options with a free `.sh`: Wheelhouse, Plenum, Longhouse,
  Switchyard (.app).
- Two-syllable Vedic options requested: **Sangam** (confluence; recommended),
  Setu (bridge; collides with an Indian fintech), Sutra (thread; widely used),
  Kosha (treasury/sheath; fits the content-addressed store).

## Pricing

Everything local is free with no limits: all agents, all clients, unlimited
sessions and history, worktrees, remote access. Enterprise adds a shared
self-hosted server, SSO/SCIM, RBAC, org-wide audit and usage reporting, policy
controls, retention, and support. None of the enterprise features ship today and
the docs say so explicitly.

## Docs

- Framework: Docusaurus 3.10 on GitHub Pages, repo `thejalalorganization/pix-docs`.
- Three navbar tabs map one-to-one to three sidebars: Docs, Internals, Enterprise.
- Priority guides: handoffs and branching, multi-device and remote, worktrees and
  parallel work, surfaces. All written.
- Internals are written from the on-disk contents of `~/.pix` (v0.25.0), not from
  source, which is not available to us.
- Quality bar: docs.envzero.com. Gaps closed in Docusaurus rather than moving to
  Mintlify.

## Design

Evolve the marketing site's classic-Mac identity (Oxanium, hard 1px rules, no
shadows) with an amber accent and real imagery. Landing page redesign for
pixcode.sh is a separate follow-up.

## Planned features to document as roadmap

Collaborative sessions (shared IDE / Coderpad-style, aimed at hackathons and
teaching), optional runtimes (container, remote, ephemeral), configurable preview
surfaces (docs renderer and static site loader alongside the app simulator).

## Open items

- Product screenshots: see `static/img/screenshots/NEEDED.md`. Cannot be
  captured from the docs toolchain; need captures from the app.
- Custom domain for the docs once the name is settled.

## Queued (2026-09-16)

1. **"Modern SaaS" variant of the docs site.** A second visual treatment of
   pix-docs in the Linear/Vercel idiom: dark-first, Inter, gradients, large
   screenshots, logo wall, pricing table. To be built as a theme switch or a
   branch after the information-architecture rework below, so both variants
   share content.
2. **Information-architecture rework** modelled on docs.envzero.com. Plan in
   progress; see the session notes and the plan file when approved.
