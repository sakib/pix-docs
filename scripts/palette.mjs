#!/usr/bin/env node
/**
 * Switch the running Mintlify mirror to a named palette variant. `mint dev`
 * hot-reloads docs.json, so one server serves every variant in turn.
 *
 *   node scripts/palette.mjs                 # list variants
 *   node scripts/palette.mjs N-classic-black-beige
 *   node scripts/palette.mjs --reset         # restore the committed docs.json
 *
 * Every variant gets a banner naming itself and its hex values, so a browser
 * tab always says which palette it is showing.
 */
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execSync} from 'node:child_process';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'pix-docs-mintlify');
const design = join(site, 'design');
const docsJson = join(site, 'docs.json');

const variants = {};
for (const f of readdirSync(design).filter((f) => /^variants-.*\.json$/.test(f))) {
  Object.assign(variants, JSON.parse(readFileSync(join(design, f), 'utf8')));
}

const arg = process.argv[2];

if (!arg) {
  console.log('Variants (node scripts/palette.mjs <name>):\n');
  for (const [name, v] of Object.entries(variants)) {
    const bg = v.background?.color ? ` bg ${v.background.color.light}/${v.background.color.dark}` : '';
    console.log(`  ${name.padEnd(24)} ${v.theme.padEnd(7)} accent ${v.colors.primary}/${v.colors.light}${bg}`);
  }
  process.exit(0);
}

if (arg === '--reset') {
  execSync('git checkout -q docs.json', {cwd: site});
  console.log('docs.json restored to the committed version');
  process.exit(0);
}

const v = variants[arg];
if (!v) {
  console.error(`unknown variant "${arg}". Run without arguments to list them.`);
  process.exit(1);
}

// Always start from the committed file so variants do not stack.
const base = JSON.parse(execSync('git show HEAD:docs.json', {cwd: site, encoding: 'utf8'}));
const cfg = {...base, ...v, appearance: {default: 'system'}};
if (!v.fonts) cfg.fonts = base.fonts;
const bg = v.background?.color ? ` · bg ${v.background.color.light} / ${v.background.color.dark}` : '';
cfg.banner = {
  content: `**Palette ${arg}** · theme ${v.theme} · accent ${v.colors.primary} (light) / ${v.colors.light} (dark)${bg}`,
  dismissible: false,
};
writeFileSync(docsJson, JSON.stringify(cfg, null, 2) + '\n');
console.log(`docs.json -> ${arg}. The dev server hot-reloads; refresh the browser.`);
