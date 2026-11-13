import test from "node:test";
import assert from "node:assert/strict";
import {checkFacebookPage} from "../src/facebook-readonly.mjs";
const env={AUTO_PUBLISH_ENABLED:"false",FACEBOOK_PUBLISH_ENABLED:"false",FACEBOOK_PAGE_ID:"296758006853316",FACEBOOK_PAGE_ACCESS_TOKEN:"fake-secret"};
const ok=async()=>({ok:true,json:async()=>({id:"296758006853316",name:"Pháp Thoại Khai Sáng",tasks:["CREATE_CONTENT"]})});
test("read-only check uses GET, Authorization header and correct page",async()=>{
 let calls=0;
 const result=await checkFacebookPage({env,fetchImpl:async(url,options)=>{
   calls++;assert.equal(url.hostname,"graph.facebook.com");
   assert.equal(url.pathname,"/v24.0/296758006853316");
   assert.equal(options.method,"GET");
   assert.equal(options.headers.Authorization,"Bearer fake-secret");
   assert.equal(url.searchParams.has("access_token"),false);
   return ok();
 }});
 assert.equal(result.hasCreateContent,true);assert.equal(calls,1);
});
test("undefined or empty publishing flags are disabled by default",async()=>{
 for(const patch of [
   {AUTO_PUBLISH_ENABLED:undefined,FACEBOOK_PUBLISH_ENABLED:undefined},
   {AUTO_PUBLISH_ENABLED:"",FACEBOOK_PUBLISH_ENABLED:""}
 ]) {
   const result=await checkFacebookPage({env:{...env,...patch},fetchImpl:ok});
   assert.equal(result.pageId,"296758006853316");
 }
});
test("fail closed when publishing enabled or invalid",async()=>{
 for(const [key,value] of [["AUTO_PUBLISH_ENABLED","true"],["FACEBOOK_PUBLISH_ENABLED","true"],["AUTO_PUBLISH_ENABLED","yes"]])
   await assert.rejects(checkFacebookPage({env:{...env,[key]:value},fetchImpl:async()=>{throw Error("network called")}}),/disabled/);
});
test("fail closed for wrong page ID",async()=>{
 await assert.rejects(checkFacebookPage({env:{...env,FACEBOOK_PAGE_ID:"other"},fetchImpl:async()=>{throw Error("network called")}}),/unexpected/i);
});
test("reject unexpected returned page ID",async()=>{
 await assert.rejects(checkFacebookPage({env,fetchImpl:async()=>({ok:true,json:async()=>({id:"wrong"})})}),/unexpected/i);
});
test("safe error does not leak token",async()=>{
 await assert.rejects(checkFacebookPage({env,fetchImpl:async()=>({ok:false,status:403})}),/HTTP 403/);
});
