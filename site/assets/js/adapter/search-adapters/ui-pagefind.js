// Communication only. Pagefind owns search, filter, ranking and sort semantics.
const bundleUrl=new URL("../../search-dependencies/pagefind/pagefind.js",import.meta.url);
export const siteRoot=new URL("../../../../",import.meta.url);
let enginePromise;
function engine(){
  if(!enginePromise)enginePromise=import(bundleUrl.href).then(async p=>{
    await p.options({baseUrl:siteRoot.href,highlightParam:"pagefind-highlight"});
    await p.init();
    return p;
  }).catch(error=>{enginePromise=undefined;throw error;});
  return enginePromise;
}
export const search=async(term,options={})=>(await engine()).search(term,options);
export const debouncedSearch=async(term,options={},delay=300)=>(await engine()).debouncedSearch(term,options,delay);
export const filters=async()=>(await engine()).filters();
export const options=async(value)=>(await engine()).options(value);
export const preload=async(term,value={})=>(await engine()).preload(term,value);
export const data=result=>result.data();
export const init=async()=>{const e=await engine();await e.init();return e;};
export const mergeIndex=async(path,opts={})=>(await engine()).mergeIndex(path,opts);
export async function destroy(){if(enginePromise){const p=await enginePromise;enginePromise=undefined;await p.destroy();}}
export async function manifest(){const r=await fetch(new URL("luxraj-index.json",bundleUrl));if(!r.ok)throw Error("Search manifest unavailable");return r.json();}
