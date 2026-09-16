# Pix documentation

Public user guides and internals reference for Pix (https://pixcode.sh), built
with Docusaurus and published to GitHub Pages.

## Run it

```bash
npm install
just docs        # dev server with hot reload
just build       # production build into build/
just serve       # serve the production build
```

## Product name

The name is a variable. `brand.ts` is the only place it is written. Prose uses
`{{product}}`, `{{productLower}}`, `{{homeDir}}`, and `{{siteUrl}}` tokens, which
`plugins/remark-brand.js` substitutes at build time. Navbar, footer, and the
landing page import `brand.ts` directly.

```bash
just rename Sangam ~/.sangam https://sangam.sh
just build
```

Frontmatter (`title`, `description`, `sidebar_label`) is substituted separately
by the `parseFrontMatter` hook in `docusaurus.config.ts`, because frontmatter is
parsed before remark runs.

## Adding a page

1. Create `docs/<section>/<slug>.md` with `id`, `title`, and `sidebar_position`.
2. Add the id to the right sidebar in `sidebars.ts`. Each navbar tab has its own
   sidebar; never link across them.
3. `<Card>`, `<CardGrid>`, `<Diagram>`, and `<Screenshot>` are available in any
   page without an import (`src/theme/MDXComponents.tsx`).

## Screenshots

Pages reference screenshots by filename and show a labelled placeholder until
the file exists. The list is in `static/img/screenshots/NEEDED.md`.

## Mintlify mirror

`just mintlify` regenerates https://github.com/thejalalorganization/pix-docs-mintlify
from these docs. That repo is a build artifact; edit here, not there.

The `mint` CLI refuses Node 25. Preview with an LTS Node, e.g.
`PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" mint dev` inside
`pix-docs-mintlify`.

## Decisions

See `DECISIONS.md`.

Tokens also do not work inside JSX props (`<Diagram caption="...">`), for the
same reason: they are expressions, not Markdown text. Write the name in body
prose instead.
