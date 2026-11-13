import test from "node:test";
import assert from "node:assert/strict";
import { createMetricoolApi } from "../src/metricool-api.mjs";

const env={AUTO_PUBLISH_ENABLED:"false",METRICOOL_BLOG_ID:"8074409",FACEBOOK_PAGE_ID:"296758006853316",METRICOOL_USER_ID:"6344451",METRICOOL_API_TOKEN:"test-token",METRICOOL_DRAFT_WRITES_ENABLED:"false"};
const original={id:123,uuid:"uuid-1",draft:true,autoPublish:false,providers:[{network:"facebook"}],facebookData:{type:"POST"},publicationDate:{dateTime:"2026-11-15T06:00:00",timezone:"Asia/Ho_Chi_Minh"},text:"Bình an"};
test("GET uses fixed host and auth without logging secrets",async()=>{
  let calls=0;
  const api=createMetricoolApi({env,fetchImpl:async(url,options)=>{
    calls++;assert.equal(url.hostname,"app.metricool.com");
    assert.equal(url.searchParams.get("blogId"),"8074409");
    assert.equal(url.searchParams.get("userId"),"6344451");
    assert.equal(options.headers["X-Mc-Auth"],"test-token");
    assert.equal(options.method,"GET");
    return {ok:true,json:async()=>({data:[original,{...original,id:124,draft:false}]})};
  }});
  const result=await api.listDrafts({start:"2026-11-15T00:00:00",end:"2026-11-16T00:00:00"});
  assert.equal(result.length,1);assert.equal(calls,1);
});
test("PUT is blocked by default",async()=>{
  const api=createMetricoolApi({env,fetchImpl:async()=>{throw Error("network should not be called");}});
  await assert.rejects(api.updateDraft({id:123,uuid:"uuid-1",blogId:"8074409",info:original}),/disabled/);
});
test("PUT only accepts draft=true and autoPublish=false",async()=>{
  const api=createMetricoolApi({env:{...env,METRICOOL_DRAFT_WRITES_ENABLED:"true"},fetchImpl:async()=>{throw Error("network should not be called");}});
  await assert.rejects(api.updateDraft({id:123,uuid:"uuid-1",blogId:"8074409",info:{...original,autoPublish:true}}),/required/);
});
test("fails closed without correct brand or global flag",()=>{
  assert.throws(()=>createMetricoolApi({env:{...env,METRICOOL_BLOG_ID:"1"}}));
  assert.throws(()=>createMetricoolApi({env:{...env,AUTO_PUBLISH_ENABLED:"true"}}));
});
test("non-2xx responses fail without exposing token",async()=>{
  const api=createMetricoolApi({env,fetchImpl:async()=>({ok:false,status:403})});
  await assert.rejects(api.listDrafts({start:"2026-11-15T00:00:00",end:"2026-11-16T00:00:00"}),/HTTP 403/);
});
