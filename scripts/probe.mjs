// Minimal probe: did palette-picker.js execute, and does its bar survive?
import {spawn} from 'node:child_process';
import WebSocket from 'ws';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_ = process.argv[2] ?? 'http://127.0.0.1:3333/guides/handoffs';
const port = 9562;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/probe-${process.pid}`, 'about:blank'], {stdio: 'ignore'});
let t; for (let i = 0; i < 40 && !t; i++) { try { t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(500); } }
const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let id = 0; const p = new Map(); const errs = [];
ws.on('message', (m) => { const d = JSON.parse(m);
  if (d.id && p.has(d.id)) { p.get(d.id)(d); p.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') errs.push((d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text).slice(0, 300));
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push('console: ' + d.params.args.map((a) => a.value ?? '').join(' ').slice(0, 200));
});
const send = (m, q = {}) => new Promise((r) => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({id: i, method: m, params: q})); });
const ev = async (e) => (await send('Runtime.evaluate', {expression: e, returnByValue: true})).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', {url: URL_});
for (let i = 0; i < 24; i++) {
  await sleep(1000);
  const marker = await ev('window.__paletteBar || "(not run)"');
  const bar = await ev(`!!document.getElementById('palette-bar')`);
  if (i % 4 === 0 || bar) console.log(`t+${i + 1}s  marker=${marker}  bar=${bar}`);
  if (bar) break;
}
console.log('inline script tags containing our code:', await ev(`[...document.scripts].filter(s=>/palette-bar/.test(s.textContent)).length`));
console.log('external picker script tags:', await ev(`[...document.scripts].filter(s=>/palette-picker/.test(s.src||'')).length`));
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
ws.close(); chrome.kill();
