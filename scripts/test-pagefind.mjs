#!/usr/bin/env node
// No external test dependencies: use the Chromium browser installed on the GitHub runner.
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import { readFile, stat, mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preparePage } from "./build-pagefind.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..","_site");
const prefix="/Luxraj-Blog/";
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".wasm":"application/wasm"};
const fixture='<html lang="en" data-cms-seo-type="BlogPosting"><head><title>{{TITLE}}</title><meta name="author" content="Example"><meta property="article:published_time" content="2026-11-01"></head><body><main><h1>Drone &amp; batteries</h1><h2>Voltage</h2><p>Public content.</p></main><dialog>Dialog label</dialog></body></html>';
const prepared=preparePage(fixture,"categories/engineering/drones/articles/test.html");
assert(prepared.indexed.includes("Engineering")&&prepared.indexed.includes("date[content]"));
assert(!prepared.indexed.includes("Dialog label")&&prepared.anchored.includes('id="section-voltage"'));
assert.equal(preparePage(fixture,"404.html"),null);
const manifest=JSON.parse(await readFile(path.join(root,"assets/js/search-dependencies/pagefind/luxraj-index.json"),"utf8"));
assert.equal(manifest.version,"1.6.0");assert(manifest.pages>0);assert(manifest.languages.some(x=>x.startsWith("en")));
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
    if(!pathname.startsWith(prefix)){res.writeHead(404).end();return;}
    let target=path.resolve(root,pathname.slice(prefix.length)||"index.html");
    if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
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
  const engine=await evaluate("(async()=>{const p=await import('"+prefix+"assets/js/adapter/search-adapters/ui-pagefind.js');const f=await p.filters();const q=await p.search('drone',{});const d=await Promise.all(q.results.slice(0,5).map(r=>p.data(r)));const category=Object.keys(f.category||{})[0];const filtered=category?await p.search(null,{filters:{category}}):null;const sorted=await p.search(null,{sort:{title:'asc'}});return {count:q.results.length,category,filtered:filtered?.results.length,sorted:sorted.results.length,titles:d.map(x=>x.meta?.title),urls:d.map(x=>x.url)}})()");
  assert(engine.count>0,"real drone search");assert(engine.category&&engine.filtered>0,"native faceted filter");assert(engine.sorted>0,"native title sorting");assert(engine.titles.every(x=>x&&!x.includes("{{")),"real titles");assert(engine.urls.every(x=>new URL(x).pathname.startsWith(prefix)),"project base URL");
  console.log("Native Pagefind:",JSON.stringify(engine));
  await until(()=>evaluate("(()=>{const d=document.querySelector('#search-dialog');if(d.open&&document.querySelector('#ns-query'))return true;const trigger=document.querySelector('[data-search-open=\"general\"]')||document.querySelector('[data-search-open]');if(trigger)trigger.click();const radio=document.querySelector('#search-mode-general');if(!document.querySelector('#ns-query')&&radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}return d.open&&!!document.querySelector('#ns-query')})()"),"Normal Search opens");
  await until(()=>evaluate("document.querySelectorAll('[data-ns-filter]').length>0"),"real indexed filter options");
  await evaluate("(()=>{const q=document.querySelector('#ns-query');q.value='drone';q.form.requestSubmit();return true})()");
  await until(()=>evaluate("document.querySelectorAll('[data-ns-results] [data-ns-result]').length>0"),"real UI cards");
  const ui=await evaluate("(()=>{const r=document.querySelector('[data-ns-results] [data-ns-result]');return {title:r.querySelector('h4').textContent,href:r.querySelector('a[href]').href,developerHidden:getComputedStyle(document.querySelector('[data-ns-view=\"diagnostics\"]')).display==='none',collapsed:document.querySelector('[data-ns-top-shell]').dataset.expanded==='false'}})()");
  assert(ui.title&&!ui.title.includes("{{"));assert(new URL(ui.href).pathname.startsWith(prefix));assert(ui.developerHidden);assert(ui.collapsed);
  await evaluate("document.querySelector('#search-dialog').setAttribute('data-search-ui-mode','developer')");
  await until(()=>evaluate("getComputedStyle(document.querySelector('[data-ns-view=\"diagnostics\"]')).display!=='none'"),"developer mode");
  await evaluate("document.querySelector('#search-dialog').setAttribute('data-search-ui-mode','user')");
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const mobile=await evaluate("(()=>{const r=document.querySelector('#search-dialog').getBoundingClientRect();return {width:r.width,viewport:innerWidth}})()");
  assert(Math.abs(mobile.width-mobile.viewport)<=2,"mobile full-screen dialog");
  await evaluate("(()=>{const q=document.querySelector('#ns-query');q.value='zxqvzzzzunlikelymatchzzqxx';q.form.requestSubmit();return true})()");
  await until(()=>evaluate("document.querySelector('[data-ns-state]').value==='no-results'"),"real empty state");
  console.log("UI smoke: native results, filters, toolbar collapse, developer mode, mobile viewport, empty results passed");
}finally{ws?.close();chrome.kill();await new Promise(r=>{if(chrome.exitCode!==null||chrome.signalCode!==null)r();else{chrome.once("exit",r);setTimeout(r,3000).unref();}});await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true}).catch(()=>{});}
