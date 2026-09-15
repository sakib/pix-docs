#!/usr/bin/env node
/**
 * Generates static/llms.txt: one line per page with title, description and URL,
 * grouped by navbar tab. Reads sidebars.ts for order and each doc's frontmatter
 * for text. Run before `npm run build` (wired into `just build`).
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {glob} from 'node:fs/promises';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandSrc = readFileSync(join(root, 'brand.ts'), 'utf8');
const brand = Object.fromEntries(
  [...brandSrc.matchAll(/^\s*(\w+):\s*'([^']*)'/gm)].map((m) => [m[1], m[2]]),
);
const siteUrl = `https://${brand.githubOrg}.github.io/${brand.githubRepo}`;
const sub = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => brand[k] ?? _);

// Doc id -> {title, description, slug}
const docs = new Map();
for await (const file of glob('docs/**/*.md', {cwd: root})) {
  const src = readFileSync(join(root, file), 'utf8');
  const fm = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  const get = (k) => fm[1].match(new RegExp(`^${k}:\\s*"?([^"\\n]*)"?$`, 'm'))?.[1]?.trim();
  const rel = file.replace(/^docs\//, '').replace(/\.md$/, '');
  const id = get('id') ? rel.replace(/[^/]+$/, get('id')) : rel;
  const slug = get('slug') ?? `/${id}`;
  // First body paragraph as fallback description.
  const body = src.slice(fm[0].length).replace(/^#.*$/m, '').replace(/<[^>]+>/g, '').trim();
  const firstPara = body.split(/\n\s*\n/).find((p) => p && !p.startsWith(':::') && !p.startsWith('```')) ?? '';
  docs.set(id, {
    title: sub(get('title') ?? id),
    description: sub(get('description') ?? firstPara.replace(/\s+/g, ' ').slice(0, 200)),
    url: `${siteUrl}${slug}`,
  });
}

// Sidebars: pull ids in order, per top-level key.
const sidebarSrc = readFileSync(join(root, 'sidebars.ts'), 'utf8');
const sections = [];
for (const m of sidebarSrc.matchAll(/^\s{2}(\w+): \[([\s\S]*?)^\s{2}\],/gm)) {
  const ids = [...m[2].matchAll(/'([\w/-]+)'/g)].map((x) => x[1]).filter((id) => docs.has(id));
  sections.push({name: m[1], ids});
}
const label = {docs: 'Docs', internals: 'Internals', enterprise: 'Enterprise'};

let out = `# ${brand.product}\n\n> ${brand.tagline} Documentation for ${brand.product}: user guides, internals reference, and enterprise edition.\n\n`;
for (const s of sections) {
  out += `## ${label[s.name] ?? s.name}\n\n`;
  for (const id of s.ids) {
    const d = docs.get(id);
    out += `- [${d.title}](${d.url})${d.description ? `: ${d.description}` : ''}\n`;
  }
  out += '\n';
}
writeFileSync(join(root, 'static/llms.txt'), out);
console.log(`static/llms.txt: ${[...sections].reduce((n, s) => n + s.ids.length, 0)} pages in ${sections.length} sections`);
