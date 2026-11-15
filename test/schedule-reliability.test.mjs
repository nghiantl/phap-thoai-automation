import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {vietnamSlot,runSlot} from "../src/slot-runner.mjs";

const yaml=readFileSync(new URL("../.github/workflows/facebook-production-ready.yml",import.meta.url),"utf8");
const cron=[...yaml.matchAll(/^\s+- cron: "([^"]+)"$/gm)].map(m=>m[1]);
const expected=["*/10 23,0,1 * * *","30,40,50 12 * * *","*/10 13,14 * * *","0,10,20 15 * * *"];
test("production cron covers morning and evening with 10-minute retry opportunities",()=>{
 assert.deepEqual(cron,expected);
 assert.match(yaml,/vars\.LIVE_PUBLISH_RELEASE == 'true'/);
 assert.match(yaml,/cancel-in-progress: false/);
 assert.match(yaml,/contents: write/);
 // 24h UTC simulation: all scheduled triggers are inside the intended ICT windows.
 const times=[];
 for(let hour=0;hour<24;hour++) for(let minute=0;minute<60;minute+=10) {
   const isScheduled=[23,0,1,13,14].includes(hour)||
     (hour===12&&minute>=30)||(hour===15&&minute<=20);
   if(!isScheduled) continue;
   const at=new Date(Date.UTC(2026,10,14,hour,minute));
   const slot=vietnamSlot(at);
   assert.ok(slot.period,at.toISOString()+" should be inside a Vietnam slot");
   times.push({hour,minute,period:slot.period});
 }
 assert.equal(times.filter(x=>x.period==="morning").length,18);
 assert.equal(times.filter(x=>x.period==="evening").length,18);
});
test("repeated scheduled executions share one durable claim, with no second publish",async()=>{
 let claimed=false,rendered=0,uploaded=0,published=0;
 const ledger={
   async claim(){if(claimed)return false;claimed=true;return true;},
   async finish(_key,{status}){assert.equal(status,"PUBLISHED");}
 };
 const env={AUTO_PUBLISH_ENABLED:"true",FACEBOOK_PUBLISH_ENABLED:"true",
 PUBLISH_CONFIRMATION:"I_APPROVE_FACEBOOK_POSTING",FACEBOOK_PAGE_ID:"296758006853316",
 FACEBOOK_PAGE_ACCESS_TOKEN:"mock",CLOUDINARY_API_KEY:"mock",CLOUDINARY_API_SECRET:"mock"};
 const opts={now:new Date("2026-11-14T00:10:00Z"),env,ledger,
 render:async()=>{rendered++;return Buffer.from("image");},
 uploader:{upload:async()=>{uploaded++;return {secure_url:"https://res.cloudinary.com/yiygxwxc/image/upload/v1/test.png"};}},
 publish:async()=>{published++;return {photoId:"123"};}};
 const first=await runSlot(opts);
 const second=await runSlot({...opts,now:new Date("2026-11-14T00:20:00Z")});
 assert.equal(first.status,"PUBLISHED");
 assert.equal(second.status,"ALREADY_CLAIMED");
 assert.deepEqual([rendered,uploaded,published],[1,1,1]);
});
