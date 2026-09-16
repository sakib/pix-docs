// Loads the mirror in one headless Chrome via CDP and reports whether the
// palette swatch strip rendered. Usage: node scripts/strip-check.mjs [url]
import {spawn} from 'node:child_process';
import WebSocket from 'ws';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_ = process.argv[2] ?? 'http://127.0.0.1:3333/guides/handoffs';
const port = 9555;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/strip-check-${process.pid}`, 'about:blank'], {stdio: 'ignore'});
let targets;
for (let i = 0; i < 40 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(500); } }
if (!targets) { console.log('chrome never came up'); chrome.kill(); process.exit(2); }
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let id = 0; const pending = new Map();
ws.on('message', (m) => { const d = JSON.parse(m); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({id: i, method, params})); });
const evaluate = async (expr) => (await send('Runtime.evaluate', {expression: expr, returnByValue: true})).result?.result?.value;
const errors = [];
ws.on('message', (m) => { const d = JSON.parse(m); if (d.method === 'Runtime.exceptionThrown') errors.push((d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text).slice(0, 200)); });
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', {url: URL_}); await sleep(10000);
const scripts = await evaluate(`[...document.scripts].filter(s => /palette-strip/.test(s.textContent) || /palette-picker/.test(s.src)).length`);
console.log(`marker:             ${await evaluate('window.__paletteStrip || "(script did not execute)"')}`);
console.log(`mount attempts:     ${await evaluate('window.__paletteMounts || 0')}`);
console.log(`page errors:        ${errors.length ? errors.join(' | ') : 'none'}`);
const swatches = await evaluate(`(() => { const s = document.querySelectorAll('.palette-strip'); return s.length ? [...s].map(x => x.querySelectorAll('a').length).join('+') : -1; })()`);
const bannerText = await evaluate(`(document.body.innerText.match(/Palette: [A-Z]-[a-z-]+/) || [''])[0]`);
console.log(`picker script tags: ${scripts}  (inline or src)`);
console.log(`swatches rendered:  ${swatches}   (-1 = strip not mounted)`);
console.log(`banner text left:   ${JSON.stringify(bannerText)}`);
ws.close(); chrome.kill();
