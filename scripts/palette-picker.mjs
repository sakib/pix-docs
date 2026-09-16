#!/usr/bin/env node
/**
 * Swatch picker for palette review. A ~40 MB Node process, not a dev server.
 *
 *   node scripts/palette-picker.mjs        # http://localhost:3334/
 *
 * Shows every variant as coloured swatches. Clicking one rewrites the mirror's
 * docs.json (via scripts/palette.mjs) and redirects to the running `mint dev`
 * on :3333, which hot-reloads the new theme.
 */
import {createServer} from 'node:http';
import {readFileSync, readdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const design = join(here, '..', '..', 'pix-docs-mintlify', 'design');
const SITE = 'http://localhost:3333/';
const PORT = 3334;

const load = () => {
  const v = {};
  for (const f of readdirSync(design).filter((f) => /^variants-(themes|east)\.json$/.test(f))) {
    Object.assign(v, JSON.parse(readFileSync(join(design, f), 'utf8')));
  }
  return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)));
};

const sw = (c, label) => `<span class="sw" style="background:${c}" title="${label} ${c}"></span>`;

const page = (current) => {
  const variants = load();
  const rows = Object.entries(variants).map(([name, v]) => {
    const bgL = v.background?.color?.light ?? '#ffffff';
    const bgD = v.background?.color?.dark ?? '#0b0b0b';
    const active = name === current ? ' active' : '';
    return `<a class="row${active}" href="/switch?name=${encodeURIComponent(name)}">
      <span class="swatches">
        <span class="pair" style="background:${bgL}">${sw(v.colors.primary, 'accent light')}</span>
        <span class="pair" style="background:${bgD}">${sw(v.colors.light, 'accent dark')}</span>
      </span>
      <span class="name">${name}<small>${v.theme}${v.fonts?.family ? ' · ' + v.fonts.family : ''}</small></span>
      <span class="hex">${v.colors.primary} · ${v.colors.light}<small>${bgL} · ${bgD}</small></span>
    </a>`;
  }).join('\n');
  return `<!doctype html><meta charset="utf-8"><title>Pix palette picker</title>
<style>
  body{font:15px/1.45 -apple-system,Inter,sans-serif;background:#f4f4f2;color:#1c1c1a;margin:0;padding:2.5rem 1.5rem}
  @media(prefers-color-scheme:dark){body{background:#111;color:#e8e6e1}.row{background:#1a1a1a;border-color:#2a2a2a}}
  main{max-width:860px;margin:0 auto}
  h1{font-size:1.4rem;margin:0 0 .25rem}p{margin:0 0 1.5rem;opacity:.7}
  .row{display:grid;grid-template-columns:150px 1fr 220px;gap:1rem;align-items:center;padding:.7rem .9rem;margin-bottom:.5rem;border:1px solid #e2e2df;border-radius:10px;background:#fff;color:inherit;text-decoration:none}
  .row:hover{border-color:#888}.row.active{outline:2px solid #1c1c1a;outline-offset:-2px}
  .swatches{display:flex;gap:.4rem}.pair{display:inline-flex;align-items:center;justify-content:center;width:68px;height:44px;border-radius:7px;border:1px solid rgba(0,0,0,.12)}
  .sw{display:inline-block;width:26px;height:26px;border-radius:6px;border:1px solid rgba(0,0,0,.15)}
  .name{font-weight:600}.name small,.hex small{display:block;font-weight:400;opacity:.6;font-size:.8em}
  .hex{font-family:ui-monospace,Menlo,monospace;font-size:.85rem;text-align:right}
  .foot{margin-top:1.5rem;font-size:.85rem;opacity:.7}.foot a{color:inherit}
</style>
<main>
  <h1>Palette picker</h1>
  <p>Click a row to re-theme <a href="${SITE}">localhost:3333</a>. Left swatch: light-mode accent on the light background. Right: dark-mode accent on the dark background.${current ? ` Showing <b>${current}</b>.` : ''}</p>
  ${rows}
  <p class="foot"><a href="/reset">Reset to committed docs.json</a> · <a href="${SITE}">Open the site</a></p>
</main>`;
};

let current = null;
createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === '/switch') {
      const name = url.searchParams.get('name');
      execFileSync('node', [join(here, 'palette.mjs'), name], {stdio: 'ignore'});
      current = name;
      res.writeHead(302, {Location: SITE}); return res.end();
    }
    if (url.pathname === '/reset') {
      execFileSync('node', [join(here, 'palette.mjs'), '--reset'], {stdio: 'ignore'});
      current = null;
      res.writeHead(302, {Location: '/'}); return res.end();
    }
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(page(current));
  } catch (e) {
    res.writeHead(500, {'Content-Type': 'text/plain'}); res.end(String(e));
  }
}).listen(PORT, () => console.log(`palette picker: http://localhost:${PORT}/`));
