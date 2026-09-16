#!/usr/bin/env node
/**
 * Generates the Mintlify site from the Docusaurus docs.
 *
 * The Docusaurus tree under docs/ is the single source of truth. This script
 * rewrites every page into Mintlify MDX (frontmatter, admonitions, cards,
 * diagrams, screenshots), substitutes brand tokens with literal values, writes
 * docs.json with the same three-tab navigation, and copies assets.
 *
 * Usage: node scripts/mintlify.mjs [../pix-docs-mintlify]
 */
import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync, copyFileSync} from 'node:fs';
import {join, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(root, '..', 'pix-docs-mintlify');

// --- brand -----------------------------------------------------------------
const brandSrc = readFileSync(join(root, 'brand.ts'), 'utf8');
const brand = Object.fromEntries([...brandSrc.matchAll(/^\s*(\w+):\s*'([^']*)'/gm)].map((m) => [m[1], m[2]]));
const sub = (s) => s.replace(/\{\{(\w+)\}\}/g, (m, k) => brand[k] ?? m);

// --- icon map: our inline icon names -> Font Awesome names Mintlify uses -----
const icon = {
  sessions: 'rectangle-list', handoff: 'right-left', branch: 'code-branch', parallel: 'layer-group',
  surfaces: 'table-cells-large', remote: 'mobile-screen', search: 'magnifying-glass', usage: 'chart-simple',
  lock: 'lock', book: 'book-open', gear: 'gear', building: 'building', play: 'play',
};

// --- sidebars -> navigation -------------------------------------------------
// Tokenise each sidebar body. A quoted string is a page only if docs/<id>.md
// exists, which keeps `type: 'category'` and className values out of the nav.
const sidebarSrc = readFileSync(join(root, 'sidebars.ts'), 'utf8');
const isDoc = (id) => existsSync(join(root, 'docs', `${id}.md`));
const tabs = [];
for (const m of sidebarSrc.matchAll(/^\s{2}(\w+): \[([\s\S]*?)^\s{2}\],/gm)) {
  const name = {docs: 'Docs', internals: 'Internals', enterprise: 'Enterprise'}[m[1]];
  const groups = [];
  let cur = null;
  let loose = [];
  const flushLoose = () => {
    if (!loose.length) return;
    groups.push({group: groups.length ? ({troubleshooting: 'Help', roadmap: 'Roadmap'}[loose[0]] ?? 'More') : 'Overview', pages: loose});
    loose = [];
  };
  for (const t of m[2].matchAll(/label: '([^']+)'|'([\w/-]+)'|\],/g)) {
    if (t[1]) { flushLoose(); cur = {group: t[1], pages: []}; groups.push(cur); }
    else if (t[2]) { if (!isDoc(t[2])) continue; const page = t[2] === 'intro' ? 'index' : t[2]; (cur ? cur.pages : loose).push(page); }
    else if (cur) { cur = null; }
  }
  flushLoose();
  tabs.push({tab: name, groups});
}

// --- page conversion -------------------------------------------------------
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : []; });

const admonition = (body) => body.replace(/^:::(tip|info|note|caution|warning|danger)(?:[ \t]+([^\n]*))?\n([\s\S]*?)^:::[ \t]*$/gm, (_, kind, title, inner) => {
  const tag = {tip: 'Tip', info: 'Info', note: 'Note', caution: 'Warning', warning: 'Warning', danger: 'Warning'}[kind];
  const text = inner.trim();
  return title ? `<${tag}>\n**${title.trim()}** ${text}\n</${tag}>` : `<${tag}>\n${text}\n</${tag}>`;
});

const convert = (src, pagePath) => {
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = Object.fromEntries([...fm[1].matchAll(/^(\w+):\s*"?(.*?)"?\s*$/gm)].map((m) => [m[1], m[2]]));
  let body = src.slice(fm[0].length);
  // Drop the H1: Mintlify renders the frontmatter title.
  body = body.replace(/^# .*\n+/m, '');
  body = sub(body);
  body = admonition(body);
  body = body.replace(/<CardGrid cols=\{(\d)\}>/g, '<CardGroup cols={$1}>').replace(/<\/CardGrid>/g, '</CardGroup>');
  body = body.replace(/<Card title="([^"]*)" icon="(\w+)" href="([^"]*)">/g, (_, t, i, h) => `<Card title="${t}" icon="${icon[i] ?? i}" href="${h}">`);
  body = body.replace(/<Diagram name="([^"]+)"(?: caption="([^"]*)")? \/>/g, (_, n, c) =>
    `<Frame${c ? ` caption="${sub(c)}"` : ''}>\n  <img className="block dark:hidden" src="/images/diagrams/${n}-light.svg" alt="${sub(c ?? n)}" />\n  <img className="hidden dark:block" src="/images/diagrams/${n}-dark.svg" alt="${sub(c ?? n)}" />\n</Frame>`);
  // Screenshots do not exist yet; keep an HTML comment so the slot is findable.
  body = body.replace(/<Screenshot src="([^"]+)" caption="([^"]*)" \/>/g, (_, s, c) => `{/* screenshot: ${s} — ${sub(c)} */}`);
  body = body.replace(/\]\(\/intro\)/g, '](/)').replace(/\]\(\/intro#/g, '](/#');
  const title = sub(meta.title ?? '');
  const description = sub(meta.description ?? '');
  const sidebarTitle = meta.sidebar_label ? sub(meta.sidebar_label) : null;
  const front = ['---', `title: "${title}"`, description && `description: "${description}"`, sidebarTitle && sidebarTitle !== title && `sidebarTitle: "${sidebarTitle}"`, '---'].filter(Boolean).join('\n');
  return `${front}\n\n${body.trim()}\n`;
};

// --- write -----------------------------------------------------------------
for (const d of ['getting-started', 'guides', 'under-the-hood', 'enterprise', 'images/diagrams', 'images/screenshots']) mkdirSync(join(out, d), {recursive: true});
for (const f of ['quickstart.mdx']) if (existsSync(join(out, f))) rmSync(join(out, f));
let n = 0;
for (const file of walk(join(root, 'docs'))) {
  const rel = relative(join(root, 'docs'), file).replace(/\.md$/, '');
  const target = rel === 'intro' ? 'index' : rel;
  writeFileSync(join(out, `${target}.mdx`), convert(readFileSync(file, 'utf8'), target)); n++;
}

// Diagrams: static-colour variants, since <img> cannot resolve CSS variables.
for (const f of readdirSync(join(root, 'static/img/diagrams'))) {
  const svg = readFileSync(join(root, 'static/img/diagrams', f), 'utf8');
  const fix = (ink, accent) => svg.replace(/currentColor/g, ink).replace(/var\(--ifm-color-primary\)/g, accent).replace(/var\(--ifm-font-family-monospace\)/g, 'ui-monospace, Menlo, monospace').replace(/var\(--ifm-heading-font-family\)/g, 'Oxanium, ui-monospace, monospace');
  writeFileSync(join(out, 'images/diagrams', f.replace('.svg', '-light.svg')), fix('#1c1c1a', '#a8410b'));
  writeFileSync(join(out, 'images/diagrams', f.replace('.svg', '-dark.svg')), fix('#e8e6e1', '#f0a868'));
}
copyFileSync(join(root, 'static/img/screenshots/NEEDED.md'), join(out, 'images/screenshots/NEEDED.md'));
copyFileSync(join(root, 'static/img/logo.svg'), join(out, 'favicon.svg'));
writeFileSync(join(out, 'logo/light.svg'), logoSvg('#1c1c1a'));
writeFileSync(join(out, 'logo/dark.svg'), logoSvg('#e8e6e1'));

function logoSvg(ink) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 32" width="140" height="32"><rect width="32" height="32" fill="#a8410b"/><g fill="#f7f7f4"><rect x="6" y="6" width="8" height="8"/><rect x="18" y="6" width="8" height="8"/><rect x="6" y="18" width="8" height="8"/><rect x="18" y="18" width="8" height="8"/></g><text x="42" y="23" font-family="Oxanium, ui-monospace, Menlo, monospace" font-size="22" font-weight="700" fill="${ink}">${brand.product}</text></svg>`;
}

// --- docs.json --------------------------------------------------------------
const docsJson = {
  $schema: 'https://mintlify.com/docs.json',
  theme: 'mint',
  name: brand.product,
  description: brand.tagline,
  colors: {primary: '#a8410b', light: '#f0a868', dark: '#8e370a'},
  favicon: '/favicon.svg',
  logo: {light: '/logo/light.svg', dark: '/logo/dark.svg', href: brand.siteUrl},
  fonts: {heading: {family: 'Oxanium', weight: 700}},
  appearance: {default: 'system'},
  navigation: {
    tabs,
    global: {anchors: [{anchor: 'Download', href: brand.siteUrl, icon: 'download'}, {anchor: 'GitHub', href: `https://github.com/${brand.githubOrg}/${brand.githubRepo}`, icon: 'github'}]},
  },
  navbar: {links: [{label: 'GitHub', href: `https://github.com/${brand.githubOrg}/${brand.githubRepo}`}], primary: {type: 'button', label: 'Download', href: brand.siteUrl}},
  contextual: {options: ['copy', 'view', 'chatgpt', 'claude', 'mcp', 'cursor']},
  footer: {socials: {github: `https://github.com/${brand.githubOrg}`}},
  seo: {indexing: 'all'},
};
writeFileSync(join(out, 'docs.json'), JSON.stringify(docsJson, null, 2) + '\n');
console.log(`${n} pages -> ${relative(process.cwd(), out)} (${tabs.map((t) => `${t.tab}: ${t.groups.reduce((a, g) => a + g.pages.length, 0)}`).join(', ')})`);
