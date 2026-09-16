// Drive headless Chrome via CDP: load landing, click the Docs tab (client-side
// route), toggle colour mode, visit a mermaid page, and report React crashes.
import {spawn} from 'node:child_process';
import WebSocket from 'ws';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.argv[2] ?? 'https://thejalalorganization.github.io/pix-docs';
const port = 9333;
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu',`--remote-debugging-port=${port}`,`--user-data-dir=/tmp/cdp-profile-${process.pid}`,'--no-first-run','about:blank'], {stdio:'ignore'});
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(500); } }
if (!targets) { console.error('chrome debug port never came up'); chrome.kill(); process.exit(2); }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.on('open', r));
let id = 0; const pending = new Map(); const logs = [];
ws.on('message', (m) => { const d = JSON.parse(m);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  if (d.method === 'Runtime.consoleAPICalled' && ['error','warning'].includes(d.params.type)) logs.push(d.params.type + ': ' + d.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
  if (d.method === 'Runtime.exceptionThrown') logs.push('EXCEPTION: ' + (d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text).slice(0, 400));
});
const send = (method, params={}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({id:i, method, params})); });
const evaluate = async (expr) => (await send('Runtime.evaluate', {expression: expr, returnByValue: true, awaitPromise: true})).result?.result?.value;
const crashed = async (label) => { const t = await evaluate('document.body.innerText'); const c = /This page crashed|Something went wrong|Minified React error/.test(t); console.log(`${c ? 'CRASH' : 'ok   '}  ${label}  (${(await evaluate('location.pathname'))})`); if (c) console.log('   ' + t.split('\n').filter(l => /crash|error|Error/.test(l)).slice(0,4).join(' | ')); };
await send('Runtime.enable'); await send('Page.enable');
await send('Page.navigate', {url: BASE + '/'}); await sleep(3500); await crashed('landing fresh load');
await evaluate(`document.querySelector('a.navbar__item[href$="/intro"], a.navbar__link[href*="intro"]')?.click()`); await sleep(2500); await crashed('click Docs tab (client-side)');
await evaluate(`document.querySelector('a[href$="/getting-started/install"]')?.click()`); await sleep(2000); await crashed('click Install in sidebar');
await evaluate(`document.querySelector('button.clean-btn[class*="colorModeToggle"], button[title*="dark mode"], button[title*="light mode"]')?.click()`); await sleep(1500); await crashed('toggle colour mode');
await evaluate(`document.querySelector('a.navbar__item[href*="under-the-hood"]')?.click()`); await sleep(2500); await crashed('click Internals tab');
await evaluate(`document.querySelector('a[href$="/under-the-hood/session-log-format"]')?.click()`); await sleep(3000); await crashed('mermaid page via sidebar');
await evaluate(`document.querySelector('a.navbar__item[href*="enterprise"]')?.click()`); await sleep(2500); await crashed('click Enterprise tab');
await send('Page.navigate', {url: BASE + '/guides/surfaces'}); await sleep(3000); await crashed('surfaces fresh load (2 screenshots)');
console.log('--- console/exception log:'); console.log(logs.length ? logs.join('\n') : '(none)');
ws.close(); chrome.kill();
