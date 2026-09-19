#!/usr/bin/env node
/**
 * Palette review for the Mintlify mirror.
 *
 *   node scripts/palette.mjs                 # list variants
 *   node scripts/palette.mjs N-classic-black-beige   # write it to docs.json
 *   node scripts/palette.mjs --reset         # restore docs.json, remove the picker
 *
 * Writes `palette-picker.js` into the mirror root; Mintlify auto-loads any .js
 * in the content root. It renders a strip of coloured squares in place of the
 * banner.
 *
 * Switching is client-side. Mintlify themes on five CSS custom properties
 * (--primary, --primary-light, --primary-dark, --background-light,
 * --background-dark), so clicking a swatch just rewrites those in an injected
 * <style>. That is instant and leaves the DOM alone. Going through the dev
 * server instead cost 8 seconds per switch and blanked the strip every time
 * Mintlify re-rendered the banner.
 *
 * The script is stateless: the current variant is read from the banner text,
 * never baked in, so a stale copy still mounts against a new banner.
 *
 * Caveat: a variant that changes Mintlify's `theme` (maple, almond, linden,
 * palm) only changes layout when written to docs.json. Those swatches are
 * marked, and "save" writes the previewed variant to disk.
 *
 * The strip is PUBLISHED: palette-picker.js is committed so the deployed site
 * shows it too, for review from any device. Colour preview is pure client-side
 * and works anywhere; "save" needs the local switch server, so it only renders
 * on localhost. Remove both this script's output and the docs.json banner
 * before the docs go to real users — `--unpublish` does that.
 */
import {readFileSync, writeFileSync, readdirSync, rmSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execSync} from 'node:child_process';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'pix-docs-mintlify');
const design = join(site, 'design');
const docsJson = join(site, 'docs.json');
const pickerJs = join(site, 'palette-picker.js');

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

if (arg === '--unpublish') {
  execSync('git checkout -q docs.json', {cwd: site});
  rmSync(pickerJs, {force: true});
  console.log('palette-picker.js removed and docs.json restored. Commit and push to take the strip off the deployed site.');
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

const base = JSON.parse(execSync('git show HEAD:docs.json', {cwd: site, encoding: 'utf8'}));
const cfg = {...base, ...v, appearance: {default: 'system'}};
if (!v.fonts) cfg.fonts = base.fonts;
cfg.banner = {content: `Palette: ${arg}`, dismissible: false};
writeFileSync(docsJson, JSON.stringify(cfg, null, 2) + '\n');

const data = ordered.map(([name, vv]) => ({
  name,
  theme: vv.theme,
  accent: vv.colors.primary,
  accentLight: vv.colors.light,
  accentDark: vv.colors.dark ?? vv.colors.primary,
  bg: vv.background?.color?.light ?? '#ffffff',
  bgDark: vv.background?.color?.dark ?? '#0b0b0b',
}));

const script = `// Palette review strip. Written by scripts/palette.mjs; removed by --reset.
// Switches colours client-side via Mintlify's CSS variables: instant, and the
// strip never unmounts. Stateless — current variant is read from the banner.
(function () {
  var LOCAL = /^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname);
  var VARIANTS = ${JSON.stringify(data)};
  var SAVE = 'http://localhost:3334/switch?name=';
  var MARKER = /Palette:\\s*([A-Za-z0-9._-]+)/;
  var STYLE_ID = 'palette-override';
  var preview = null;       // variant being previewed, null = as configured
  var configured = null;    // what docs.json actually says

  function rgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return ((n >> 16) & 255) + ' ' + ((n >> 8) & 255) + ' ' + (n & 255);
  }

  function apply(v) {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    if (!v) { el.textContent = ''; return; }
    el.textContent = ':root, html, body, .light, .dark {' +
      '--primary:' + rgb(v.accent) + ';' +
      '--primary-light:' + rgb(v.accentLight) + ';' +
      '--primary-dark:' + rgb(v.accentDark) + ';' +
      '--background-light:' + rgb(v.bg) + ';' +
      '--background-dark:' + rgb(v.bgDark) + ';' +
      '}';
  }

  function isDark() { return document.documentElement.classList.contains('dark'); }

  function build() {
    var shown = preview || configured;
    var strip = document.createElement('span');
    strip.className = 'palette-strip';
    strip.style.cssText = 'display:inline-flex;align-items:center;gap:5px;vertical-align:middle;flex-wrap:wrap;';
    var dark = isDark();
    VARIANTS.forEach(function (v) {
      var a = document.createElement('a');
      a.href = '#';
      a.title = v.name + (v.theme !== 'mint' ? ' (theme ' + v.theme + ' — save to see layout)' : '');
      a.setAttribute('data-palette', v.name);
      a.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;border:1px solid rgba(128,128,128,.45);background:' +
        (dark ? v.bgDark : v.bg) + ';cursor:pointer;' +
        (v.name === shown ? 'outline:2px solid currentColor;outline-offset:1px;' : '') +
        (v.theme !== 'mint' ? 'border-style:dashed;' : '');
      var dot = document.createElement('span');
      dot.style.cssText = 'display:block;width:11px;height:11px;border-radius:3px;background:' + (dark ? v.accentLight : v.accent) + ';';
      a.appendChild(dot);
      a.addEventListener('click', function (e) {
        e.preventDefault();
        preview = v.name;
        apply(v);
        render();
      });
      strip.appendChild(a);
    });

    var label = document.createElement('span');
    label.textContent = shown + (preview && preview !== configured ? ' (preview)' : '');
    label.style.cssText = 'margin-left:8px;opacity:.75;font-size:.85em;white-space:nowrap;';
    strip.appendChild(label);

    // "save" writes docs.json through the local switch server, so it is
    // meaningless on the deployed site.
    if (LOCAL && preview && preview !== configured) {
      var save = document.createElement('a');
      save.href = '#';
      save.textContent = 'save';
      save.title = 'Write this variant to docs.json (slow: the dev server rebuilds)';
      save.style.cssText = 'margin-left:8px;font-size:.8em;opacity:.8;text-decoration:underline;cursor:pointer;';
      save.addEventListener('click', function (e) {
        e.preventDefault();
        save.textContent = 'saving...';
        fetch(SAVE + encodeURIComponent(preview), {mode: 'no-cors'}).catch(function () {});
      });
      strip.appendChild(save);

      var rev = document.createElement('a');
      rev.href = '#';
      rev.textContent = 'revert';
      rev.style.cssText = save.style.cssText;
      rev.addEventListener('click', function (e) {
        e.preventDefault();
        preview = null;
        apply(null);
        render();
      });
      strip.appendChild(rev);
    }
    return strip;
  }

  function render() {
    document.querySelectorAll('.palette-strip').forEach(function (s) { s.replaceWith(build()); });
  }

  function mount() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node, found = [];
    while ((node = walker.nextNode())) {
      var m = node.nodeValue && node.nodeValue.match(MARKER);
      if (m) found.push({host: node.parentElement, name: m[1]});
    }
    if (!found.length) return;
    configured = found[0].name;
    // docs.json caught up with the preview — clear the override so the real
    // config renders, including any theme change.
    if (preview && preview === configured) { preview = null; apply(null); }
    found.forEach(function (f) { if (f.host) { f.host.textContent = ''; f.host.appendChild(build()); } });
    if (preview) { var v = VARIANTS.find(function (x) { return x.name === preview; }); if (v) apply(v); }
  }

  function start() {
    mount();
    new MutationObserver(mount).observe(document.body, {childList: true, subtree: true});
    new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
`;

if (!existsSync(pickerJs) || readFileSync(pickerJs, 'utf8') !== script) {
  writeFileSync(pickerJs, script);
  console.log(`docs.json -> ${arg}; palette-picker.js written (restart mint dev once to load it).`);
} else {
  console.log(`docs.json -> ${arg}.`);
}
