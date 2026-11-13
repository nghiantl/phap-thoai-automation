import test from "node:test";
import assert from "node:assert/strict";
import {checkFacebookPage} from "../src/facebook-readonly.mjs";
const env={AUTO_PUBLISH_ENABLED:"false",FACEBOOK_PUBLISH_ENABLED:"false",FACEBOOK_PAGE_ID:"296758006853316",FACEBOOK_PAGE_ACCESS_TOKEN:"fake-secret"};
const ok=async()=>({ok:true,json:async()=>({id:"296758006853316",name:"Pháp Thoại Khai Sáng"})});
test("GET only requests supported id,name and hides token from URL",async()=>{
 const result=await checkFacebookPage({env,fetchImpl:async(url,options)=>{
   assert.equal(url.hostname,"graph.facebook.com");
   assert.equal(url.searchParams.get("fields"),"id,name");
   assert.equal(url.searchParams.has("access_token"),false);
   assert.equal(options.method,"GET");
   assert.equal(options.headers.Authorization,"Bearer fake-secret");
   return ok();
 }});
 assert.equal(result.pageId,"296758006853316");
 assert.equal(result.hasCreateContent,null);
});
test("missing flags default to disabled",async()=>{
 const result=await checkFacebookPage({env:{...env,AUTO_PUBLISH_ENABLED:undefined,FACEBOOK_PUBLISH_ENABLED:undefined},fetchImpl:ok});
 assert.equal(result.pageId,"296758006853316");
});
test("publishing enabled fails closed",async()=>{
 for(const key of ["AUTO_PUBLISH_ENABLED","FACEBOOK_PUBLISH_ENABLED"])
   await assert.rejects(checkFacebookPage({env:{...env,[key]:"true"},fetchImpl:async()=>{throw Error("network called")}}),/disabled/);
});
test("Graph API error exposes only numeric codes, not token or error message",async()=>{
 const result=checkFacebookPage({env,fetchImpl:async()=>({ok:false,status:400,json:async()=>({error:{code:190,error_subcode:463,type:"OAuthException",message:"SECRET fake-secret"}})})});
 await assert.rejects(result,error=>{
   assert.match(error.message,/HTTP 400; Graph code 190; subcode 463/);
   assert.doesNotMatch(error.message,/SECRET|fake-secret/);
   return true;
 });
});
test("wrong page rejected",async()=>{
 await assert.rejects(checkFacebookPage({env:{...env,FACEBOOK_PAGE_ID:"bad"},fetchImpl:ok}),/unexpected/i);
});
