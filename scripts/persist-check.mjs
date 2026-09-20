// Samples the palette bar's presence once a second for 25s, then clicks a
// swatch and confirms the recolour sticks. Prints a presence timeline so
// flicker is visible rather than hidden by a single lucky sample.
import {spawn} from 'node:child_process';
import WebSocket from 'ws';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_ = process.argv[2] ?? 'http://127.0.0.1:3333/guides/handoffs';
const TARGET = process.argv[3] ?? 'J-peacock-saffron';
const port = 9563;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/persist-${process.pid}`, 'about:blank'], {stdio: 'ignore'});
let t; for (let i = 0; i < 40 && !t; i++) { try { t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(500); } }
const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let id = 0; const p = new Map(); const errs = [];
ws.on('message', (m) => { const d = JSON.parse(m);
  if (d.id && p.has(d.id)) { p.get(d.id)(d); p.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') errs.push((d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text).slice(0, 200));
});
const send = (m, q = {}) => new Promise((r) => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({id: i, method: m, params: q})); });
const ev = async (e) => (await send('Runtime.evaluate', {expression: e, returnByValue: true})).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', {url: URL_});

let timeline = '';
for (let i = 0; i < 25; i++) {
  await sleep(1000);
  timeline += (await ev(`!!document.getElementById('palette-bar')`)) ? '#' : '.';
}
console.log(`presence (1s/char, # = present): ${timeline}`);
console.log(`nav intact:   ${await ev(`document.querySelectorAll('nav a, aside a').length`)} links`);
console.log(`tabs:         ${await ev(`[...document.querySelectorAll('a')].filter(a=>/^(Docs|Internals|Enterprise)$/.test(a.textContent.trim())).length`)}`);
console.log(`swatches:     ${await ev(`document.querySelectorAll('#palette-bar a[data-palette]').length`)}`);

const before = await ev(`getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()`);
await ev(`document.querySelector('#palette-bar a[data-palette="${TARGET}"]')?.click(); true`);
await sleep(800);
const after = await ev(`getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()`);
await sleep(4000);
const held = await ev(`getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()`);
console.log(`--primary:    ${before} -> ${after} (after 4s: ${held})`);
console.log(`switch works: ${before !== after && after === held ? 'yes' : 'NO'}`);
console.log(`errors:       ${errs.length ? errs.join(' | ') : 'none'}`);
ws.close(); chrome.kill();
