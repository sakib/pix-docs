// Confirms the landing page follows the palette: reads a themed element's
// computed colour, clicks another swatch, and checks the colour changed.
import {spawn} from 'node:child_process';
import WebSocket from 'ws';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_=process.argv[2]??'http://127.0.0.1:3333/';
const TARGET=process.argv[3]??'J-peacock-saffron';
const port=9561; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=spawn(CHROME,['--headless=new','--disable-gpu','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=/tmp/landing-${process.pid}`,'about:blank'],{stdio:'ignore'});
let t; for(let i=0;i<40&&!t;i++){try{t=await(await fetch(`http://127.0.0.1:${port}/json`)).json()}catch{await sleep(500)}}
const ws=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.on('open',r));
let id=0; const p=new Map();
ws.on('message',m=>{const d=JSON.parse(m); if(d.id&&p.has(d.id)){p.get(d.id)(d);p.delete(d.id)}});
const send=(m,q={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:q}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true})).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate',{url:URL_});
for(let i=0;i<80;i++){await sleep(500); if(await ev(`!!document.querySelector('.palette-strip')`)) break;}
const probe=`(() => { const a=[...document.querySelectorAll('a')].find(x=>/Get started/i.test(x.textContent)); return a?getComputedStyle(a).backgroundColor:'(no hero button)'; })()`;
console.log('strip present: ', await ev(`document.querySelectorAll('.palette-strip').length`));
const before=await ev(probe);
console.log('hero button bg before:', before);
await ev(`document.querySelector('.palette-strip a[data-palette="${TARGET}"]')?.click(); true`);
await sleep(600);
const after=await ev(probe);
console.log(`hero button bg after ${TARGET}:`, after);
console.log('CHANGED:', before!==after ? 'yes — landing page follows the palette' : 'NO — still ignoring it');
ws.close(); chrome.kill();
