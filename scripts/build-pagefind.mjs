#!/usr/bin/env node
// Index the assembled public output, never source files or shared partials.
// The pinned upstream release archive is retained outside the public tree.
import { readFile, writeFile, mkdir, readdir, mkdtemp, rm, copyFile, rename, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const site=path.join(root,"_site");
const bundle=path.join(site,"assets/js/search-dependencies/pagefind");
const backup=path.join(root,"search-dependencies/pagefind");
const version="1.6.0";
const archiveName="pagefind-v1.6.0-x86_64-unknown-linux-musl.tar.gz";
const digest="004d40c9a644c995dadc42b8031196c6f17e7a6dacf9a6c15c63286dd6ead5f2";
const upstream="https://github.com/Pagefind/pagefind/releases/download/v1.6.0/"+archiveName;
function run(program,args){const r=spawnSync(program,args,{stdio:"inherit",cwd:root});if(r.error)throw r.error;if(r.status!==0)throw Error(program+" failed: "+r.status);}
const escape=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const decode=s=>String(s).replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi,(m,k)=>{if(k[0]==="#"){const n=k[1].toLowerCase()==="x"?parseInt(k.slice(2),16):Number(k.slice(1));return n>0&&n<=0x10ffff?String.fromCodePoint(n):m;}return ({amp:"&",quot:'"',apos:"'",lt:"<",gt:">",nbsp:" "})[k.toLowerCase()]||m;});
const clean=s=>decode(String(s||"").replace(/<!--[\s\S]*?-->/g,"").replace(/<[^>]*>/g," ").replace(/\{\{[^}]*\}\}/g,"")).replace(/\s+/g," ").trim();
const valid=s=>typeof s==="string"&&s.trim()&&!/\{\{|\}\}/.test(s);
const attr=(tag,key)=>{const m=tag.match(new RegExp("(?:^|\\s)"+key+"\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))","i"));return m?decode(m[1]??m[2]??m[3]):"";};
const label=s=>s.replace(/-/g," ").replace(/\b[a-z]/g,c=>c.toUpperCase());
function metaValues(html,key){return [...html.matchAll(/<meta\b[^>]*>/gi)].filter(m=>[attr(m[0],"name"),attr(m[0],"property")].includes(key)).map(m=>attr(m[0],"content")).filter(valid);}
const first=(html,key)=>metaValues(html,key)[0]||"";
function addAnchorIds(html){
  const used=new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]));
  return html.replace(/<(h[2-6])\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi,(full,tag,attrs,body)=>{
    if(/\bid\s*=/i.test(attrs)||!clean(body))return full;
    const base="section-"+(clean(body).normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"").slice(0,70)||"heading");
    let id=base,i=2;while(used.has(id))id=base+"-"+i++;used.add(id);
    return "<"+tag+attrs+' id="'+escape(id)+'">'+body+"</"+tag+">";
  });
}
export function preparePage(html,relative,authors={}){
  if(!html.trim()||/(^|\/)(404|newsletter-thank-you|unsubscribe)\.html$/i.test(relative)||relative.startsWith("assets/")||/\bnoindex\b/i.test(first(html,"robots")))return null;
  const source=html.replace(/<!--[\s\S]*?-->/g,"");
  const main=source.match(/<main\b[^>]*>[\s\S]*?<\/main\s*>/i);
  const body=source.match(/<body\b[^>]*>[\s\S]*?<\/body\s*>/i);
  if(!body)return null;
  const htmlTag=source.match(/<html\b[^>]*>/i)?.[0]||"";
  const language=attr(htmlTag,"lang")||"en";
  const title=first(source,"og:title")|| (valid(source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1])?clean(source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)[1]):"") ||clean((main?.[0]||body[0]).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  // Do not advertise template-only articles as finished content.
  if(!title||!clean(main?.[0]||body[0]))return null;
  const mainOriginal=html.match(/<main\b[^>]*>[\s\S]*?<\/main\s*>/i);
  const anchored=mainOriginal?html.replace(mainOriginal[0],addAnchorIds(mainOriginal[0])):html;
  let content=(anchored.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)||anchored.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i))[1];
  content=content.replace(/<!--[\s\S]*?-->/g,"").replace(/\{\{[^}]*\}\}/g,"").replace(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/gi,"").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"");
  const parts=relative.split("/"),catIndex=parts.indexOf("categories");
  const category=first(source,"article:section")||(catIndex>=0?label(parts[catIndex+1]||""):"");
  const type=attr(htmlTag,"data-cms-seo-type")||(relative.includes("/articles/")?"BlogPosting":"Page");
  const byline=source.match(/<[a-z][^>]*\bdata-author-id\s*=[^>]*>/i)?.[0]||"";
  const author=first(source,"author")||authors[attr(byline,"data-author-id")]?.name||"";
  const date=first(source,"article:published_time")||attr(byline,"data-published-date");
  const updated=first(source,"article:modified_time")||attr(byline,"data-modified-date");
  const dateOK=v=>valid(v)&&/^\d{4}-\d{2}-\d{2}/.test(v)&&Number.isFinite(Date.parse(v));
  const tags=metaValues(source,"article:tag");
  const hero=content.match(/<img\b[^>]*>/i)?.[0]||"";
  const image=first(source,"og:image")||attr(hero,"src");
  const alt=first(source,"og:image:alt")||attr(hero,"alt");
  const description=first(source,"description");
  let metadata="";
  function add(kind,key,value){if(valid(value))metadata+='<meta data-pagefind-'+kind+'="'+key+'[content]" content="'+escape(value)+'">';}
  for(const [k,v] of Object.entries({title,category,type,author,description,image:valid(image)?image:"",image_alt:alt,date:dateOK(date)?date:"",updated:dateOK(updated)?updated:""}))add("meta",k,v);
  for(const [k,v] of Object.entries({category,type,author,year:dateOK(date)?date.slice(0,4):""}))add("filter",k,v);
  tags.forEach(v=>add("filter","tags",v));
  add("sort","title",title);
  if(dateOK(date))add("sort","date",date);
  // Native sorting field, based on indexed visible text rather than synthetic data.
  const words=clean(content).split(/\s+/u).filter(Boolean).length;
  add("sort","word_count",String(words));
  const indexed='<!doctype html><html lang="'+escape(language)+'"><head><title>'+escape(title)+'</title>'+metadata+'</head><body><main data-pagefind-body>'+content+'</main></body></html>';
  return {indexed,anchored,language,sortFields:dateOK(date)?["title","date","word_count"]:["title","word_count"]};
}
async function walk(dir){const all=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())all.push(...await walk(p));else if(e.isFile()&&/\.html?$/i.test(e.name))all.push(p);}return all;}
async function main(){
  const tmp=await mkdtemp(path.join(os.tmpdir(),"luxraj-pagefind-"));
  try{
    await mkdir(backup,{recursive:true});
    const archive=path.join(backup,archiveName);
    try{await stat(archive);}catch(e){if(e.code!=="ENOENT")throw e;run("curl",["--fail","--location","--retry","3","--output",archive+".tmp",upstream]);const hash=createHash("sha256").update(await readFile(archive+".tmp")).digest("hex");if(hash!==digest)throw Error("Pagefind release checksum mismatch");await rename(archive+".tmp",archive);}
    if(createHash("sha256").update(await readFile(archive)).digest("hex")!==digest)throw Error("Stored Pagefind release checksum mismatch");
    const binDir=path.join(tmp,"bin");await mkdir(binDir);run("tar",["-xzf",archive,"-C",binDir]);
    const binary=path.join(binDir,"pagefind");await stat(binary);
    run(binary,["--version"]);
    const stage=path.join(tmp,"html");await mkdir(stage);
    const authorsPath=path.join(site,"assets/js/author-library.js");
    const authorsSource=await readFile(authorsPath,"utf8");
    // The library is trusted repository source and contains public display metadata.
    const {AUTHORS_BY_ID}=await import("data:text/javascript;base64,"+Buffer.from(authorsSource).toString("base64"));
    let pages=0;const languages=new Set(),sortFields=new Set();
    for(const file of await walk(site)){
      const relative=path.relative(site,file).split(path.sep).join("/");
      const html=await readFile(file,"utf8");
      const p=preparePage(html,relative,AUTHORS_BY_ID);if(!p)continue;
      const dest=path.join(stage,relative);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,p.indexed);
      if(p.anchored!==html)await writeFile(file,p.anchored);
      languages.add(p.language);p.sortFields.forEach(k=>sortFields.add(k));pages++;
    }
    if(!pages)throw Error("No eligible public HTML pages to index");
    await mkdir(bundle,{recursive:true});
    run(binary,["--site",stage,"--output-path",bundle,"--glob","**/*.{html,htm}"]);
    await stat(path.join(bundle,"pagefind.js"));await stat(path.join(bundle,"pagefind-entry.json"));
    await copyFile(path.join(backup,"LICENSE"),path.join(bundle,"LICENSE"));
    await writeFile(path.join(bundle,"luxraj-index.json"),JSON.stringify({version,pages,languages:[...languages].sort(),sortFields:[...sortFields].sort()}));
    console.log("Pagefind "+version+": "+pages+" eligible public pages, languages "+[...languages].join(", "));
  }finally{await rm(tmp,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1;});
