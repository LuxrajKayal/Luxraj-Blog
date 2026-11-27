#!/usr/bin/env node
// Index the assembled public output, never source files or shared partials.
// The pinned upstream release archive is retained outside the public tree.
import { readFile, writeFile, mkdir, mkdtemp, rm, copyFile, rename, stat } from "node:fs/promises";
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
export async function buildPagefind(input=site,output=bundle){
  const tmp=await mkdtemp(path.join(os.tmpdir(),"luxraj-pagefind-"));
  try{
    await mkdir(backup,{recursive:true});
    const archive=path.join(backup,archiveName);
    try{await stat(archive);}catch(e){if(e.code!=="ENOENT")throw e;run("curl",["--fail","--location","--retry","3","--output",archive+".tmp",upstream]);const hash=createHash("sha256").update(await readFile(archive+".tmp")).digest("hex");if(hash!==digest)throw Error("Pagefind release checksum mismatch");await rename(archive+".tmp",archive);}
    if(createHash("sha256").update(await readFile(archive)).digest("hex")!==digest)throw Error("Stored Pagefind release checksum mismatch");
    const binDir=path.join(tmp,"bin");await mkdir(binDir);run("tar",["-xzf",archive,"-C",binDir]);
    const binary=path.join(binDir,"pagefind");await stat(binary);
    run(binary,["--version"]);
    // Pagefind alone determines what is indexed. No HTML inspection or rewriting.
    await mkdir(output,{recursive:true});
    const logfile=path.join(tmp,"pagefind.log");
    run(binary,["--site",input,"--output-path",output,"--glob","**/*.{html,htm}","--logfile",logfile]);
    await stat(path.join(output,"pagefind.js"));
    const entry=JSON.parse(await readFile(path.join(output,"pagefind-entry.json"),"utf8"));
    const languages=Object.keys(entry.languages);
    const pages=Object.values(entry.languages).reduce((sum,lang)=>sum+lang.page_count,0);
    // Sort names are reported by the pinned native indexer, not inferred from HTML.
    const log=await readFile(logfile,"utf8");
    const sortFields=[...new Set([...log.matchAll(/^\[Info\]: Prebuilding sort order for (.*), processed as type: (?:String|Number)$/gm)].map(m=>m[1]))].sort();
    await copyFile(path.join(backup,"LICENSE"),path.join(output,"LICENSE"));
    const manifest={version:entry.version,pages,languages,sortFields};
    await writeFile(path.join(output,"luxraj-index.json"),JSON.stringify(manifest));
    console.log("Pagefind native index:",JSON.stringify(manifest));
    return manifest;
  }finally{await rm(tmp,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildPagefind().catch(e=>{console.error(e);process.exitCode=1;});
