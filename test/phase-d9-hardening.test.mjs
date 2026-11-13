import test from "node:test";
import assert from "node:assert/strict";
import {vietnamSlot,runSlot} from "../src/slot-runner.mjs";
const env={AUTO_PUBLISH_ENABLED:"true",FACEBOOK_PUBLISH_ENABLED:"true",PUBLISH_CONFIRMATION:"I_APPROVE_FACEBOOK_POSTING",FACEBOOK_PAGE_ID:"296758006853316",FACEBOOK_PAGE_ACCESS_TOKEN:"test-token",CLOUDINARY_API_KEY:"test",CLOUDINARY_API_SECRET:"test"};
const at=(s)=>new Date(s);
test("delayed GitHub schedule remains eligible for three hours",()=>{
 assert.equal(vietnamSlot(at("2026-11-16T23:00:00Z")).period,"morning");
 assert.equal(vietnamSlot(at("2026-11-17T01:59:00Z")).period,"morning");
 assert.equal(vietnamSlot(at("2026-11-17T02:00:00Z")).period,null);
 assert.equal(vietnamSlot(at("2026-11-17T12:30:00Z")).period,"evening");
 assert.equal(vietnamSlot(at("2026-11-17T15:29:00Z")).period,"evening");
 assert.equal(vietnamSlot(at("2026-11-17T15:30:00Z")).period,null);
});
test("no side effects outside slot even with live flags",async()=>{
 const result=await runSlot({now:at("2026-11-17T02:00:00Z"),env,ledger:{claim:async()=>{throw Error("unexpected")}}});
 assert.equal(result.status,"OUTSIDE_SLOT");
});
test("claim rejected means no Cloudinary or Facebook requests",async()=>{
 const result=await runSlot({now:at("2026-11-16T23:00:00Z"),env,
 ledger:{claim:async()=>false,finish:async()=>{throw Error("unexpected")}},
 render:async()=>{throw Error("unexpected")},publish:async()=>{throw Error("unexpected")}});
 assert.equal(result.status,"ALREADY_CLAIMED");
});
test("render failure creates FAILED marker and never attempts Facebook",async()=>{
 const statuses=[];
 await assert.rejects(runSlot({now:at("2026-11-16T23:00:00Z"),env,
 ledger:{claim:async()=>true,finish:async(_key,entry)=>{statuses.push(entry.status)}},
 render:async()=>{throw Error("test render failed")},publish:async()=>{throw Error("unexpected")}}),/locked/);
 assert.deepEqual(statuses,["FAILED"]);
});
test("Facebook uncertainty creates UNKNOWN marker",async()=>{
 const statuses=[];
 await assert.rejects(runSlot({now:at("2026-11-16T23:00:00Z"),env,
 ledger:{claim:async()=>true,finish:async(_key,entry)=>{statuses.push(entry.status)}},
 render:async()=>Buffer.from("mock"),uploader:{upload:async()=>({secure_url:"https://res.cloudinary.com/yiygxwxc/image/upload/v1/test.png"})},
 publish:async()=>{throw Error("test Facebook timeout")}}),/locked/);
 assert.deepEqual(statuses,["UNKNOWN"]);
});
test("successful Facebook write with failed state marker does not write UNKNOWN",async()=>{
 const statuses=[];
 await assert.rejects(runSlot({now:at("2026-11-16T23:00:00Z"),env,
 ledger:{claim:async()=>true,finish:async(_key,entry)=>{statuses.push(entry.status);throw Error("ledger outage")}},
 render:async()=>Buffer.from("mock"),uploader:{upload:async()=>({secure_url:"https://res.cloudinary.com/yiygxwxc/image/upload/v1/test.png"})},
 publish:async()=>({photoId:"123"})}),/locked/);
 assert.deepEqual(statuses,["PUBLISHED"]);
});
