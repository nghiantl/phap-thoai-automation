import test from "node:test";
import assert from "node:assert/strict";
import {generateMetricoolCsv,parseTemplateHeader} from "../src/csv-drafts.mjs";
const template="Text,Date,Time,Draft,Facebook,Instagram,Picture Url 1,LinkedIn\n";
const post={date:"2026-11-16",time:"06:00:00",text:"Một ngày mới bình an và nhiều tỉnh thức.",imageUrl:"https://res.cloudinary.com/yiygxwxc/image/upload/v1/sample.png"};
test("CSV preserves template order, forces draft, disables other networks",()=>{
 const csv=generateMetricoolCsv(template,[post]);
 assert.ok(csv.startsWith("\uFEFF"));
 assert.match(csv,/"TRUE","TRUE","FALSE"/);
 assert.match(csv,/"FALSE"\r\n$/);
 assert.equal(csv.trim().split(/\r\n/).length,2);
});
test("quoted commas and quotes escaped",()=>{
 const csv=generateMetricoolCsv(template,[{...post,text:'Lòng "an", tâm sáng, sống tỉnh thức.'}]);
 assert.match(csv,/Lòng ""an"", tâm sáng/);
});
test("missing template columns rejected",()=>assert.throws(()=>parseTemplateHeader("Text,Date,Time"),/Missing/));
test("duplicate schedule rejected",()=>assert.throws(()=>generateMetricoolCsv(template,[post,post]),/Duplicate/));
test("external image host rejected",()=>assert.throws(()=>generateMetricoolCsv(template,[{...post,imageUrl:"https://example.com/a.png"}]),/Cloudinary/));
