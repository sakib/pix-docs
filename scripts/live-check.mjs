// Renders a URL in headless Chrome and reports what actually appears:
// navbar tabs, sidebar links, palette strip, and any page errors.
//   node scripts/live-check.mjs <url>
import {spawn} from 'node:child_process';
import WebSocket from 'ws';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_ = process.argv[2];
const port = 9560;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/live-${process.pid}`, '--window-size=1440,1000', 'about:blank'], {stdio: 'ignore'});
let targets;
for (let i = 0; i < 40 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(500); } }
if (!targets) { console.log('chrome never came up'); chrome.kill(); process.exit(2); }

const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let id = 0; const pending = new Map(); const errs = [];
ws.on('message', (m) => {
  const d = JSON.parse(m);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') errs.push((d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text).slice(0, 180));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({id: i, method, params})); });
const ev = async (e) => (await send('Runtime.evaluate', {expression: e, returnByValue: true})).result?.result?.value;

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', {url: URL_}); await sleep(9000);

console.log(`url:            ${URL_}`);
console.log(`title:          ${await ev('document.title')}`);
console.log(`tab links:      ${await ev(`[...document.querySelectorAll('a')].filter(a=>/^(Docs|Internals|Enterprise|Documentation)$/.test(a.textContent.trim())).map(a=>a.textContent.trim()).join(', ')||'(none)'`)}`);
console.log(`nav/aside links:${await ev(`document.querySelectorAll('nav a, aside a').length`)}`);
console.log(`all links:      ${await ev(`document.querySelectorAll('a').length`)}`);
console.log(`palette strips: ${await ev(`document.querySelectorAll('#palette-bar').length`)}`);
console.log(`swatches:       ${await ev(`document.querySelectorAll('#palette-bar a[data-palette]').length`)}`);
console.log(`raw marker:     ${JSON.stringify(await ev(`(document.body.innerText.match(/Palette: [A-Za-z0-9._-]+/)||[''])[0]`))}`);
console.log(`body chars:     ${await ev('document.body.innerText.length')}`);
console.log(`first headings: ${await ev(`[...document.querySelectorAll('h1,h2')].slice(0,4).map(h=>h.textContent.trim()).join(' | ')`)}`);
console.log(`errors:         ${errs.length ? errs.join(' | ') : 'none'}`);

ws.close(); chrome.kill();
