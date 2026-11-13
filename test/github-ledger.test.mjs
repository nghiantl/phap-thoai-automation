import test from "node:test";
import assert from "node:assert/strict";
import {createGitHubLedger} from "../src/github-ledger.mjs";
const env={GITHUB_REPOSITORY:"example/repo",GITHUB_TOKEN:"fake-token",GITHUB_SHA:"a".repeat(40)};
function fakeGitHub(){
 const refs=new Set();
 return {refs,fetchImpl:async(url,options)=>{
   assert.equal(options.headers.Authorization,"Bearer fake-token");
   if(options.method==="POST"){
     const {ref}=JSON.parse(options.body);
     if(refs.has(ref))return {status:422};
     refs.add(ref);return {status:201};
   }
   if(options.method==="GET"){
     const ref="refs/"+url.split("/git/refs/")[1];
     return {status:refs.has(ref)?200:404};
   }
   throw Error("Unexpected request");
 }};
}
test("claim is atomic and never reopens after PUBLISHED",async()=>{
 const api=fakeGitHub(),a=createGitHubLedger({env,fetchImpl:api.fetchImpl}),b=createGitHubLedger({env,fetchImpl:api.fetchImpl});
 const key="2026-11-13-morning";
 const results=await Promise.all([a.claim(key),b.claim(key)]);
 assert.deepEqual(results.sort(),[false,true]);
 await a.finish(key,{status:"PUBLISHED"});
 assert.equal(await b.claim(key),false);
});
test("unknown and failed slots never retry",async()=>{
 const api=fakeGitHub(),ledger=createGitHubLedger({env,fetchImpl:api.fetchImpl});
 for(const [key,status] of [["2026-11-13-evening","UNKNOWN"],["2026-11-14-morning","FAILED"]]){
   assert.equal(await ledger.claim(key),true);
   await ledger.finish(key,{status});
   assert.equal(await ledger.claim(key),false);
 }
});
test("422 without existing ref fails closed",async()=>{
 const ledger=createGitHubLedger({env,fetchImpl:async(_url,options)=>({status:options.method==="POST"?422:404})});
 await assert.rejects(ledger.claim("2026-11-13-morning"),/validation failed/);
});
test("GitHub API outage fails closed",async()=>{
 const ledger=createGitHubLedger({env,fetchImpl:async()=>({status:503})});
 await assert.rejects(ledger.claim("2026-11-13-morning"),/HTTP 503/);
});
