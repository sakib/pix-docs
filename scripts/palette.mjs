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

const script = `// Palette review strip. Written by scripts/palette.mjs; removed by --unpublish.
//
// PURELY ADDITIVE: this appends one fixed-position bar to <body> and never
// reads, clears, or replaces any element Mintlify rendered. An earlier version
// mounted into the banner by clearing its parent's textContent, which on the
// production build also deleted the navigation — the container holding the
// banner text holds the nav too. Nothing here can remove page content.
//
// Colour switching rewrites Mintlify's five CSS custom properties in an
// injected <style>, so it is instant and needs no server.
(function () {
  window.__paletteBar = 'loaded';
  var LOCAL = /^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname);
  var VARIANTS = ${JSON.stringify(data)};
  var CONFIGURED = ${JSON.stringify(arg)};
  var SAVE = 'http://localhost:3334/switch?name=';
  var preview = null;

  function rgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return ((n >> 16) & 255) + ' ' + ((n >> 8) & 255) + ' ' + (n & 255);
  }

  function apply(v) {
    var el = document.getElementById('palette-override');
    if (!el) { el = document.createElement('style'); el.id = 'palette-override'; }
    // Re-append so this rule is always the last stylesheet in <head>, and mark
    // each property !important: Mintlify's own theme CSS loads after us and
    // would otherwise win on source order at equal specificity.
    document.head.appendChild(el);
    if (!v) { el.textContent = ''; return; }
    var imp = function (name, hex) { return '--' + name + ':' + rgb(hex) + ' !important;'; };
    el.textContent = ':root, html, body, .light, .dark {' +
      imp('primary', v.accent) + imp('primary-light', v.accentLight) +
      imp('primary-dark', v.accentDark) + imp('background-light', v.bg) +
      imp('background-dark', v.bgDark) + '}';
  }

  function dark() { return document.documentElement.classList.contains('dark'); }

  function fill(bar) {
    bar.textContent = '';
    var shown = preview || CONFIGURED;
    var isDark = dark();
    var tag = document.createElement('span');
    tag.textContent = 'palette';
    tag.style.cssText = 'font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.55;margin-right:2px;';
    bar.appendChild(tag);
    VARIANTS.forEach(function (v) {
      var a = document.createElement('a');
      a.href = '#'; a.title = v.name + (v.theme !== 'mint' ? ' (theme ' + v.theme + ')' : '');
      a.setAttribute('data-palette', v.name);
      a.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:5px;cursor:pointer;background:' +
        (isDark ? v.bgDark : v.bg) + ';border:1px solid rgba(128,128,128,.5);' +
        (v.name === shown ? 'outline:2px solid currentColor;outline-offset:1px;' : '') +
        (v.theme !== 'mint' ? 'border-style:dashed;' : '');
      var dot = document.createElement('span');
      dot.style.cssText = 'display:block;width:11px;height:11px;border-radius:3px;background:' + (isDark ? v.accentLight : v.accent) + ';';
      a.appendChild(dot);
      a.addEventListener('click', function (e) { e.preventDefault(); preview = v.name; apply(v); fill(bar); });
      bar.appendChild(a);
    });
    var label = document.createElement('span');
    label.textContent = shown;
    label.style.cssText = 'font-size:12px;opacity:.75;margin-left:6px;white-space:nowrap;';
    bar.appendChild(label);
    if (LOCAL && preview && preview !== CONFIGURED) {
      var save = document.createElement('a');
      save.href = '#'; save.textContent = 'save';
      save.style.cssText = 'font-size:12px;margin-left:8px;text-decoration:underline;cursor:pointer;';
      save.addEventListener('click', function (e) {
        e.preventDefault(); save.textContent = 'saving...';
        fetch(SAVE + encodeURIComponent(preview), {mode: 'no-cors'}).catch(function () {});
      });
      bar.appendChild(save);
    }
  }

  function start() {
    if (document.getElementById('palette-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'palette-bar';
    // Bottom rather than top: a fixed top bar would overlap Mintlify's own
    // navbar, and compensating for that means editing its layout. The bottom
    // is always visible and collides with nothing.
    bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:2147483647;' +
      'display:flex;align-items:center;gap:5px;padding:7px 11px;border-radius:10px;' +
      'background:rgba(250,250,250,.94);color:#18181b;border:1px solid rgba(0,0,0,.14);' +
      'box-shadow:0 3px 14px rgba(0,0,0,.16);font-family:ui-sans-serif,system-ui,sans-serif;' +
      'backdrop-filter:blur(8px);max-width:94vw;flex-wrap:wrap;justify-content:center;';
    if (dark()) bar.style.background = 'rgba(24,24,27,.94)', bar.style.color = '#e4e4e7';
    document.documentElement.appendChild(bar);
    fill(bar);
    new MutationObserver(function () {
      if (dark()) { bar.style.background = 'rgba(24,24,27,.94)'; bar.style.color = '#e4e4e7'; }
      else { bar.style.background = 'rgba(250,250,250,.94)'; bar.style.color = '#18181b'; }
      fill(bar);
    }).observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
  }

  // React hydration replaces <body>'s children and drops anything it did not
  // render, so mounting once is not enough — re-append whenever it vanishes.
  function keep() {
    start();
    new MutationObserver(function () {
      if (!document.getElementById('palette-bar')) start();
    }).observe(document.documentElement, {childList: true, subtree: false});
  }
  if (document.body) keep();
  else document.addEventListener('DOMContentLoaded', keep);
})();
`;

if (!existsSync(pickerJs) || readFileSync(pickerJs, 'utf8') !== script) {
  writeFileSync(pickerJs, script);
  console.log(`docs.json -> ${arg}; palette-picker.js written (restart mint dev once to load it).`);
} else {
  console.log(`docs.json -> ${arg}.`);
}
