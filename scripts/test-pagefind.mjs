#!/usr/bin/env node
// No external test dependencies: use the Chromium browser installed on the GitHub runner.
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import { readFile, stat, mkdtemp, rm, mkdir, writeFile, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildPagefind } from "./build-pagefind.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..","_site");
const prefix="/Luxraj-Blog/";
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".wasm":"application/wasm"};
const fixtureRoot=await mkdtemp(path.join(os.tmpdir(),"luxraj-pagefind-native-fixture-"));
const fixtureBundle=path.join(fixtureRoot,"pagefind");
const fixturePath=path.join(fixtureRoot,"article.html");
const fixture='<html lang="en"><head><title>{{SEO_TITLE}}</title><meta name="description" content="{{SEO_DESCRIPTION}}"><meta data-pagefind-filter="topic[content]" content="{{CATEGORY}}"><meta data-pagefind-sort="order[content]" content="2"><meta data-pagefind-meta="description[content]" content="{{SEO_DESCRIPTION}}"></head><body><main data-pagefind-body><h1>{{ARTICLE_TITLE}}</h1><p>Half filled article. {{UNFINISHED_CONTENT}}. Example {{username}}.</p><h2 id="existing-anchor">Battery section</h2><h2>Heading without ID</h2><span data-pagefind-ignore="all">zzignoredmarker</span></main></body></html>';
const second='<html lang="en"><head><meta data-pagefind-sort="order[content]" content="1"><meta data-pagefind-filter="topic[content]" content="Another"></head><body><main data-pagefind-body><h1>Another article</h1><p>Second article.</p></main></body></html>';
await writeFile(fixturePath,fixture);await writeFile(path.join(fixtureRoot,"second.html"),second);
const nativeFixture=await buildPagefind(fixtureRoot,fixtureBundle);
assert.equal(nativeFixture.pages,2);assert(nativeFixture.sortFields.includes("order"),"native explicit sort discovery");
assert.equal(await readFile(fixturePath,"utf8"),fixture,"native indexer leaves original fixture HTML byte-identical");
assert.equal(await readFile(path.join(fixtureRoot,"second.html"),"utf8"),second);
const manifest=JSON.parse(await readFile(path.join(root,"assets/js/search-dependencies/pagefind/luxraj-index.json"),"utf8"));
const nativeEntry=JSON.parse(await readFile(path.join(root,"assets/js/search-dependencies/pagefind/pagefind-entry.json"),"utf8"));
assert.equal(manifest.version,nativeEntry.version);
assert.equal(manifest.pages,Object.values(nativeEntry.languages).reduce((n,v)=>n+v.page_count,0));
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
    const serveRoot=pathname.startsWith("/fixture/")?fixtureRoot:pathname.startsWith(prefix)?root:null;
    if(!serveRoot){res.writeHead(404).end();return;}
    let target=path.resolve(serveRoot,pathname.slice(serveRoot===root?prefix.length:"/fixture/".length)||"index.html");
    if(target!==serveRoot&&!target.startsWith(serveRoot+path.sep)){res.writeHead(403).end();return;}
    if((await stat(target)).isDirectory())target=path.join(target,"index.html");
    const bytes=await readFile(target);res.writeHead(200,{"Content-Type":types[path.extname(target)]||"application/octet-stream","Cache-Control":"no-store"});res.end(bytes);
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port, profile=await mkdtemp(path.join(os.tmpdir(),"luxraj-chrome-"));
const chrome=spawn(process.env.CHROME_BIN||"google-chrome",["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--disable-background-networking","--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:"ignore"});
let chromeError;chrome.on("error",err=>{chromeError=err;});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,timeout=20000){const end=Date.now()+timeout;let last;while(Date.now()<end){if(chromeError)throw chromeError;try{const v=await fn();if(v)return v;}catch(e){last=e;}await wait(150);}throw Error("Timeout: "+label+(last?" ("+last.message+")":""));}
let ws;
try{
  const port=await until(async()=>Number((await readFile(path.join(profile,"DevToolsActivePort"),"utf8")).split("\n")[0]),"Chrome startup");
  const tabs=await (await fetch("http://127.0.0.1:"+port+"/json/list")).json();
  ws=new WebSocket(tabs.find(t=>t.type==="page").webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
  let id=0;const pending=new Map();
  ws.addEventListener("message",ev=>{const msg=JSON.parse(ev.data);const p=pending.get(msg.id);if(!p)return;pending.delete(msg.id);msg.error?p.reject(Error(msg.error.message)):p.resolve(msg.result);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));setTimeout(()=>{if(pending.delete(key))reject(Error("CDP timeout: "+method));},25000).unref();});
  const evaluate=async expression=>{const r=await send("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  await send("Page.enable");await send("Page.navigate",{url:origin+prefix});
  await until(()=>evaluate("document.readyState !== 'loading' && !!document.querySelector('#search-dialog')"),"site loaded");
  // Test native placeholder handling, explicit metadata/filter/sort, and ignored content
  // against an isolated fixture. No content requirements are imposed on the real website.
  const checks=await evaluate("(async()=>{const p=await import('/fixture/pagefind/pagefind.js');await p.options({baseUrl:'/fixture/'});const r=await p.search('username');const d=await r.results[0]?.data();const f=await p.filters();const filtered=await p.search(null,{filters:{topic:'{{CATEGORY}}'}});const sorted=await p.search(null,{sort:{order:'asc'}});const sortedData=await Promise.all(sorted.results.map(x=>x.data()));const ignored=await p.search('zzignoredmarker');return {count:r.results.length,title:d?.meta?.title,description:d?.meta?.description,content:d?.content,filters:f,filtered:filtered.results.length,sorted:sortedData.map(x=>x.url),ignored:ignored.results.length}})()");
  assert.equal(checks.count,1);assert(checks.content.includes("username"));assert(checks.content.includes("UNFINISHED_CONTENT"));assert.equal(checks.description,"{{SEO_DESCRIPTION}}");
  assert.equal(checks.filtered,1);assert.equal(checks.filters.topic["{{CATEGORY}}"],1);
  assert(checks.sorted[0].includes("second.html"));assert.equal(checks.ignored,0);
  console.log("Native partial article, placeholders, explicit filters/sort, and native ignore passed:",JSON.stringify(checks));
  // Rebuild the same independent fixture after an edit, an addition and a deletion.
  await writeFile(fixturePath,fixture.replace("{{UNFINISHED_CONTENT}}","zznewarticlecontent").replace("{{ARTICLE_TITLE}}","Updated article"));
  await unlink(path.join(fixtureRoot,"second.html"));
  await writeFile(path.join(fixtureRoot,"added.html"),second.replace("Second article.","zzaddedarticlecontent"));
  const rebuilt=await buildPagefind(fixtureRoot,fixtureBundle);assert.equal(rebuilt.pages,2);
  await send("Page.navigate",{url:"about:blank"});
  await send("Page.navigate",{url:origin+prefix});
  await until(()=>evaluate("document.readyState !== 'loading' && !!document.querySelector('#search-dialog')"),"site reloaded");
  const updates=await evaluate("(async()=>{const p=await import('/fixture/pagefind/pagefind.js');await p.options({baseUrl:'/fixture/'});const a=await p.search('zznewarticlecontent');const b=await p.search('zzaddedarticlecontent');const c=await p.search('unfinished_content');const all=await p.search(null);const data=await Promise.all(all.results.map(x=>x.data()));return {changed:a.results.length,added:b.results.length,stale:c.results.length,urls:data.map(x=>x.url)}})()");
  assert.equal(updates.changed,1);assert.equal(updates.added,1);assert.equal(updates.stale,0);assert(!updates.urls.some(x=>x.includes("second.html")));
  console.log("Native edit/add/delete reindex passed:",JSON.stringify(updates));
  const engine=await evaluate("(async()=>{const p=await import('"+prefix+"assets/js/adapter/search-adapters/ui-pagefind.js');const f=await p.filters();const q=await p.search(null,{});const d=await Promise.all(q.results.slice(0,5).map(r=>p.data(r)));return {count:q.results.length,filters:Object.keys(f),urls:d.map(x=>x.url)}})()");
  assert(engine.urls.every(x=>new URL(x).pathname.startsWith(prefix)),"project base URL");
  console.log("Native actual site:",JSON.stringify(engine));
  await until(()=>evaluate("(()=>{const d=document.querySelector('#search-dialog');if(d.open&&document.querySelector('#ns-query'))return true;const trigger=document.querySelector('[data-search-open=\"general\"]')||document.querySelector('[data-search-open]');if(trigger)trigger.click();const radio=document.querySelector('#search-mode-general');if(!document.querySelector('#ns-query')&&radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}return d.open&&!!document.querySelector('#ns-query')})()"),"Normal Search opens");
  await until(()=>evaluate("! ['initial-loading','disconnected','bundle-error'].includes(document.querySelector('[data-ns-state]').value)"),"native search ready");
  await evaluate("(()=>{const q=document.querySelector('#ns-query');q.value='';q.form.requestSubmit();return true})()");
  if(engine.count>0){
  await until(()=>evaluate("document.querySelectorAll('[data-ns-results] [data-ns-result]').length>0"),"real UI cards");
  const ui=await evaluate("(()=>{const r=document.querySelector('[data-ns-results] [data-ns-result]');return {title:r.querySelector('h4').textContent,href:r.querySelector('a[href]').href,developerHidden:getComputedStyle(document.querySelector('[data-ns-view=\"diagnostics\"]')).display==='none',collapsed:document.querySelector('[data-ns-top-shell]').dataset.expanded==='false'}})()");
  assert(new URL(ui.href).pathname.startsWith(prefix));assert(ui.developerHidden);assert(ui.collapsed);
  }
  await evaluate("document.querySelector('#search-dialog').setAttribute('data-search-ui-mode','developer')");
  await until(()=>evaluate("getComputedStyle(document.querySelector('[data-ns-view=\"diagnostics\"]')).display!=='none'"),"developer mode");
  await evaluate("document.querySelector('#search-dialog').setAttribute('data-search-ui-mode','user')");
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const mobile=await evaluate("(()=>{const r=document.querySelector('#search-dialog').getBoundingClientRect();return {width:r.width,viewport:innerWidth}})()");
  assert(Math.abs(mobile.width-mobile.viewport)<=2,"mobile full-screen dialog");
  await evaluate("(()=>{const q=document.querySelector('#ns-query');q.value='zxqvzzzzunlikelymatchzzqxx';q.form.requestSubmit();return true})()");
  await until(()=>evaluate("document.querySelector('[data-ns-state]').value==='no-results'"),"real empty state");
  console.log("UI smoke: native browsing, toolbar collapse, developer mode, mobile viewport, empty results passed");
}finally{ws?.close();chrome.kill();await new Promise(r=>{if(chrome.exitCode!==null||chrome.signalCode!==null)r();else{chrome.once("exit",r);setTimeout(r,3000).unref();}});await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true}).catch(()=>{});await rm(fixtureRoot,{recursive:true,force:true});}
