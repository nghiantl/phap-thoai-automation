import test from "node:test";
import assert from "node:assert/strict";
import {createPublishingLedger} from "../src/publishing-ledger.mjs";
import {runSlot} from "../src/slot-runner.mjs";
function mockDb(){
 const rows=new Map();
 return {rows,async query(sql,args){
   const [key,value,photo,post]=args;
   if(sql.startsWith("INSERT")){if(rows.has(key))return {rows:[]};rows.set(key,{status:"PROCESSING"});return {rows:[{slot_key:key}]};}
   if(sql.startsWith("UPDATE")){const r=rows.get(key);if(!r||r.status!=="PROCESSING")return {rows:[]};r.status=sql.includes("status='UNKNOWN'")?"UNKNOWN":value;r.photo_id=photo;r.post_id=post;return {rows:[{slot_key:key}]};}
   if(sql.startsWith("SELECT"))return {rows:rows.has(key)?[rows.get(key)]:[]};
   throw Error("unexpected SQL");
 }};
}
test("atomic claim rejects repeated attempt, including after PUBLISHED",async()=>{
 const db=mockDb(),ledger=createPublishingLedger(db),key="2026-11-13-morning";
 assert.equal(await ledger.claim(key),true);
 assert.equal(await ledger.claim(key),false);
 await ledger.finish(key,{status:"PUBLISHED",photoId:"123"});
 assert.equal((await ledger.status(key)).status,"PUBLISHED");
 assert.equal(await ledger.claim(key),false);
});
test("UNKNOWN remains locked; no automatic retry",async()=>{
 const ledger=createPublishingLedger(mockDb()),key="2026-11-13-evening";
 await ledger.claim(key);await ledger.markUnknown(key);
 assert.equal(await ledger.claim(key),false);
 assert.equal((await ledger.status(key)).status,"UNKNOWN");
});
test("failed publish cannot cause second claim",async()=>{
 const ledger=createPublishingLedger(mockDb()),key="2026-11-14-morning";
 await ledger.claim(key);await ledger.finish(key,{status:"FAILED"});
 assert.equal(await ledger.claim(key),false);
});
test("dry-run never calls ledger, publisher, uploader or render",async()=>{
 const bomb=async()=>{throw Error("unexpected side effect")};
 const result=await runSlot({now:new Date("2026-11-12T23:00:00Z"),env:{AUTO_PUBLISH_ENABLED:"false"},
   ledger:{claim:bomb,finish:bomb},publish:bomb,uploader:{upload:bomb},render:bomb});
 assert.equal(result.status,"DRY_RUN");
});
