#!/usr/bin/env node
/**
 * Switch the running Mintlify mirror to a named palette variant. `mint dev`
 * hot-reloads docs.json, so one server serves every variant in turn.
 *
 *   node scripts/palette.mjs                 # list variants
 *   node scripts/palette.mjs N-classic-black-beige
 *   node scripts/palette.mjs --reset         # restore docs.json, remove the picker
 *
 * While a variant is applied, a `palette-picker.js` is written into the mirror
 * root. Mintlify auto-loads any .js in the content root, and this one replaces
 * the banner with a strip of coloured squares, one per variant, that re-theme
 * the site on click. It is gitignored and deleted by --reset, so it never
 * ships. It also refuses to run anywhere but localhost.
 */
import {readFileSync, writeFileSync, readdirSync, rmSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execSync} from 'node:child_process';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'pix-docs-mintlify');
const design = join(site, 'design');
const docsJson = join(site, 'docs.json');
const pickerJs = join(site, 'palette-picker.js');
const SWITCH = 'http://localhost:3334/switch?name=';

const variants = {};
for (const f of readdirSync(design).filter((f) => /^variants-(themes|east)\.json$/.test(f))) {
  Object.assign(variants, JSON.parse(readFileSync(join(design, f), 'utf8')));
}
const ordered = Object.entries(variants).sort(([a], [b]) => a.localeCompare(b));

const arg = process.argv[2];

if (!arg) {
  console.log('Variants (node scripts/palette.mjs <name>):\n');
  for (const [name, v] of ordered) {
    const bg = v.background?.color ? ` bg ${v.background.color.light}/${v.background.color.dark}` : '';
    console.log(`  ${name.padEnd(24)} ${v.theme.padEnd(7)} accent ${v.colors.primary}/${v.colors.light}${bg}`);
  }
  process.exit(0);
}

if (arg === '--reset') {
  execSync('git checkout -q docs.json', {cwd: site});
  rmSync(pickerJs, {force: true});
  console.log('docs.json restored; palette-picker.js removed');
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
// Plain-text banner. The picker script finds this text and replaces it with
// the swatch strip; if the script fails to load, the name still shows.
cfg.banner = {content: `Palette: ${arg}`, dismissible: false};
writeFileSync(docsJson, JSON.stringify(cfg, null, 2) + '\n');

// The picker script. Data is embedded so it needs no fetch.
const data = ordered.map(([name, vv]) => ({
  name,
  accent: vv.colors.primary,
  accentDark: vv.colors.light,
  bg: vv.background?.color?.light ?? '#ffffff',
  bgDark: vv.background?.color?.dark ?? '#0b0b0b',
}));
writeFileSync(pickerJs, `// Palette review strip. Written by scripts/palette.mjs; removed by --reset. Never shipped.
(function () {
  window.__paletteStrip = 'executed on ' + location.hostname;
  if (!/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)) return;
  var current = ${JSON.stringify(arg)};
  var variants = ${JSON.stringify(data)};
  var SWITCH = ${JSON.stringify(SWITCH)};
  function dark() { return document.documentElement.classList.contains('dark'); }
  function build() {
    var strip = document.createElement('span');
    strip.className = 'palette-strip';
    strip.style.cssText = 'display:inline-flex;align-items:center;gap:5px;vertical-align:middle;';
    variants.forEach(function (v) {
      var a = document.createElement('a');
      a.href = SWITCH + encodeURIComponent(v.name);
      a.title = v.name;
      var isDark = dark();
      a.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;border:1px solid rgba(128,128,128,.45);background:' + (isDark ? v.bgDark : v.bg) + ';' + (v.name === current ? 'outline:2px solid currentColor;outline-offset:1px;' : '');
      var dot = document.createElement('span');
      dot.style.cssText = 'display:block;width:11px;height:11px;border-radius:3px;background:' + (isDark ? v.accentDark : v.accent) + ';';
      a.appendChild(dot);
      strip.appendChild(a);
    });
    var label = document.createElement('span');
    label.textContent = current;
    label.style.cssText = 'margin-left:8px;opacity:.75;font-size:.85em;';
    strip.appendChild(label);
    return strip;
  }
  function mount() {
    window.__paletteMounts = (window.__paletteMounts || 0) + 1;
    // The banner is rendered more than once (desktop and mobile layouts), so
    // collect every matching text node first, then replace them all.
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node, hosts = [];
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.indexOf('Palette: ' + current) !== -1) hosts.push(node.parentElement);
    }
    hosts.forEach(function (host) {
      if (host.querySelector('.palette-strip')) return;
      host.textContent = '';
      host.appendChild(build());
    });
  }
  mount();
  new MutationObserver(mount).observe(document.body, {childList: true, subtree: true});
})();
`);

console.log(`docs.json -> ${arg}; palette-picker.js written. The dev server hot-reloads; refresh the browser.`);
