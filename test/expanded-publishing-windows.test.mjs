import test from "node:test";
import assert from "node:assert/strict";
import {vietnamSlot} from "../src/slot-runner.mjs";
const at=s=>new Date(s);
test("morning starts at 06:00 ICT, ends immediately before 12:00 ICT",()=>{
 assert.equal(vietnamSlot(at("2026-11-15T22:59:00Z")).period,null);
 assert.deepEqual(vietnamSlot(at("2026-11-15T23:00:00Z")),{date:"2026-11-16",period:"morning"});
 assert.deepEqual(vietnamSlot(at("2026-11-16T02:34:54Z")),{date:"2026-11-16",period:"morning"});
 assert.equal(vietnamSlot(at("2026-11-16T04:59:59Z")).period,"morning");
 assert.equal(vietnamSlot(at("2026-11-16T05:00:00Z")).period,null);
});
test("evening starts at 18:00 ICT, ends at midnight ICT",()=>{
 assert.equal(vietnamSlot(at("2026-11-16T10:59:59Z")).period,null);
 assert.deepEqual(vietnamSlot(at("2026-11-16T11:00:00Z")),{date:"2026-11-16",period:"evening"});
 assert.equal(vietnamSlot(at("2026-11-16T16:59:59Z")).period,"evening");
 assert.equal(vietnamSlot(at("2026-11-16T17:00:00Z")).period,null);
});
