import test from "node:test";
import assert from "node:assert/strict";
import {buildPost} from "../src/content-engine.mjs";
test("curated content is stable, nonempty, and has at least 12 unique entries per period",()=>{
 for(const period of ["morning","evening"]){
   const posts=Array.from({length:12},(_,i)=>buildPost({date:new Date(Date.UTC(2026,10,1+i)).toISOString().slice(0,10),period}));
   assert.equal(new Set(posts.map(p=>p.message)).size,12);
   for(const post of posts){assert.ok(post.text.length>110);assert.ok(post.message.length>=5);}
 }
});
