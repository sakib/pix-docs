// Verifies the palette swatch strip: that it mounts, that clicking a swatch
// recolours the page instantly, and that the strip survives the switch.
//   node scripts/strip-check.mjs [url] [switchTo]
import {spawn} from 'node:child_process';
import WebSocket from 'ws';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_ = process.argv[2] ?? 'http://127.0.0.1:3333/guides/handoffs';
const TARGET = process.argv[3] ?? 'J-peacock-saffron';
const port = 9555;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/strip-check-${process.pid}`, 'about:blank'], {stdio: 'ignore'});
let targets;
for (let i = 0; i < 40 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(500); } }
if (!targets) { console.log('chrome never came up'); chrome.kill(); process.exit(2); }

const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let id = 0; const pending = new Map(); const errors = [];
ws.on('message', (m) => {
  const d = JSON.parse(m);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') errors.push((d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text).slice(0, 160));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({id: i, method, params})); });
const ev = async (e) => (await send('Runtime.evaluate', {expression: e, returnByValue: true})).result?.result?.value;

await send('Page.enable'); await send('Runtime.enable');
const t0 = Date.now();
await send('Page.navigate', {url: URL_});

let mounted = null;
for (let i = 0; i < 160; i++) {
  await sleep(250);
  if (await ev(`!!document.querySelector('.palette-strip')`)) { mounted = Date.now() - t0; break; }
}
console.log(`strip mounted after: ${mounted ? (mounted / 1000).toFixed(1) + 's' : 'NEVER'}`);
console.log(`strips on page:      ${await ev(`document.querySelectorAll('.palette-strip').length`)}`);
console.log(`swatches per strip:  ${await ev(`[...document.querySelectorAll('.palette-strip')].map(s => s.querySelectorAll('a[data-palette]').length).join('+')`)}`);
console.log(`raw marker left:     ${JSON.stringify(await ev(`(document.body.innerText.match(/Palette: [A-Za-z0-9._-]+/) || [''])[0]`))}   (empty = good)`);

const primaryBefore = await ev(`getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()`);
console.log(`\n--primary before:    ${primaryBefore}`);

const t1 = Date.now();
await ev(`document.querySelector('.palette-strip a[data-palette="${TARGET}"]').click(); true`);
let recoloured = null;
for (let i = 0; i < 40; i++) {
  await sleep(100);
  const now = await ev(`getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()`);
  if (now && now !== primaryBefore) { recoloured = Date.now() - t1; break; }
}
console.log(`clicked ${TARGET}`);
console.log(`--primary after:     ${await ev(`getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()`)}`);
console.log(`recoloured in:       ${recoloured !== null ? recoloured + 'ms' : 'NEVER'}`);
console.log(`strips still there:  ${await ev(`document.querySelectorAll('.palette-strip').length`)}   (must be > 0)`);
console.log(`label now:           ${await ev(`(() => { const s = document.querySelector('.palette-strip'); return s ? s.textContent.replace(/\\s+/g,' ').trim() : '(none)'; })()`)}`);
console.log(`page errors:         ${errors.length ? errors.join(' | ') : 'none'}`);

ws.close(); chrome.kill();
