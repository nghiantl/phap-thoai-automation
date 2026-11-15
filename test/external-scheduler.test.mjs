import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dispatch} from "../scheduler/cloudflare/src/index.js";
const root=new URL("../",import.meta.url);
test("external scheduler sends a workflow_dispatch for main without exposing a token",async()=>{
 let calls=0;
 const result=await dispatch({GH_DISPATCH_TOKEN:"fake-test-token"},async(url,opts)=>{
  calls++;
  assert.match(url,/actions\/workflows\/facebook-production-ready\.yml\/dispatches$/);
  assert.equal(opts.method,"POST");
  assert.equal(opts.headers.Authorization,"Bearer fake-test-token");
  assert.deepEqual(JSON.parse(opts.body),{ref:"main"});
  return {status:204};
 });
 assert.equal(result.status,"DISPATCH_ACCEPTED");
 assert.equal(calls,1);
});
test("external scheduler fails closed on missing token or GitHub errors",async()=>{
 await assert.rejects(dispatch({},async()=>{throw Error("unexpected")}),/missing/);
 await assert.rejects(dispatch({GH_DISPATCH_TOKEN:"test"},async()=>({status:403})),/HTTP 403/);
});
test("production workflow remains gated, serialized, and supports manual dispatch",()=>{
 const yaml=readFileSync(new URL(".github/workflows/facebook-production-ready.yml",root),"utf8");
 assert.match(yaml,/workflow_dispatch:/);
 assert.match(yaml,/LIVE_PUBLISH_RELEASE == 'true'/);
 assert.match(yaml,/cancel-in-progress: false/);
 assert.match(yaml,/GITHUB_TOKEN:/);
});
