import test from "node:test";
import assert from "node:assert/strict";
import {buildPost} from "../src/content-engine.mjs";
import {vietnamSlot,runSlot} from "../src/slot-runner.mjs";
import {publishFacebookPhoto} from "../src/facebook-publisher.mjs";
const env={AUTO_PUBLISH_ENABLED:"false",FACEBOOK_PAGE_ID:"296758006853316"};
test("Vietnam time slots respect UTC offset",()=>{
 assert.deepEqual(vietnamSlot(new Date("2026-11-16T23:00:00Z")),{date:"2026-11-17",period:"morning"});
 assert.deepEqual(vietnamSlot(new Date("2026-11-17T12:30:00Z")),{date:"2026-11-17",period:"evening"});
 assert.equal(vietnamSlot(new Date("2026-11-17T10:00:00Z")).period,null);
});
test("content generation is deterministic and meaningful",()=>{
 const a=buildPost({date:"2026-11-17",period:"morning"});
 assert.deepEqual(a,buildPost({date:"2026-11-17",period:"morning"}));
 assert.ok(a.text.length>100);
});
test("dry run makes no network calls or image uploads",async()=>{
 const result=await runSlot({now:new Date("2026-11-16T23:00:00Z"),env,
   publish:async()=>{throw Error("unexpected publish");},
   render:async()=>{throw Error("unexpected image");},
   ledger:{claim:async()=>{throw Error("unexpected claim");}}});
 assert.equal(result.status,"DRY_RUN");
});
test("Facebook publisher requires three explicit switches",async()=>{
 await assert.rejects(publishFacebookPhoto({imageUrl:"https://res.cloudinary.com/yiygxwxc/image/upload/v1/x.png",
 message:"Lời chúc buổi sáng bình an và tỉnh thức",env,fetchImpl:async()=>{throw Error("unexpected network");}}),/disabled/);
});
test("live publishing fails closed without atomic ledger",async()=>{
 await assert.rejects(runSlot({now:new Date("2026-11-16T23:00:00Z"),
 env:{...env,AUTO_PUBLISH_ENABLED:"true",FACEBOOK_PUBLISH_ENABLED:"true",PUBLISH_CONFIRMATION:"I_APPROVE_FACEBOOK_POSTING",FACEBOOK_PAGE_ACCESS_TOKEN:"fake"},
 ledger:{claim:async()=>{throw Error("No atomic durable ledger configured");}}}),/ledger/);
});
