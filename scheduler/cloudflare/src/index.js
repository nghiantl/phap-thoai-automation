// Independent scheduler. Requires Cloudflare Workers Cron Triggers and a secret
// GH_DISPATCH_TOKEN (fine-grained GitHub PAT, Actions: write, only this repository).
// Never expose the token to the browser or commit it to the repository.
const ENDPOINT="https://api.github.com/repos/nghiantl/phap-thoai-automation/actions/workflows/facebook-production-ready.yml/dispatches";
export default {
 async scheduled(_event,env,ctx) {
   ctx.waitUntil(dispatch(env));
 },
 async fetch() {
   return new Response("Scheduler active; no public dispatch endpoint.",{status:200});
 }
};
export async function dispatch(env,fetchImpl=fetch) {
 if(!env.GH_DISPATCH_TOKEN) throw Error("GH_DISPATCH_TOKEN is missing");
 const response=await fetchImpl(ENDPOINT,{
   method:"POST",
   headers:{
     "Authorization":"Bearer "+env.GH_DISPATCH_TOKEN,
     "Accept":"application/vnd.github+json",
     "X-GitHub-Api-Version":"2022-11-28",
     "User-Agent":"phap-thoai-cron-fallback",
     "Content-Type":"application/json"
   },
   body:JSON.stringify({ref:"main"})
 });
 if(response.status!==204) throw Error("GitHub workflow dispatch failed: HTTP "+response.status);
 return {status:"DISPATCH_ACCEPTED"};
}
