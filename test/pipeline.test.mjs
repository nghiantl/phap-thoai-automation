import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { buildFacebookDraft, publishDraft } from "../src/metricool-draft.mjs";
import { createImageBuffer, renderTemplateSvg, generateAndUploadImage } from "../src/image.mjs";

const env = { AUTO_PUBLISH_ENABLED:"false", CLOUDINARY_CLOUD_NAME:"yiygxwxc" };
const url = "https://res.cloudinary.com/yiygxwxc/image/upload/v1/phap-thoai-khai-sang/test.png";
const base = {caption:"Một ngày mới bắt đầu với tâm bình an, sự tỉnh thức và lòng từ bi dành cho tất cả mọi người.",imageUrl:url,publishAt:"2026-11-15T06:00:00+07:00",env};
test("draft has protective flags",()=>{
  const post=buildFacebookDraft(base);
  assert.equal(post.draft,true);
  assert.equal(post.autoPublish,false);
  assert.deepEqual(post.media,[url]);
});
test("fails closed if publishing enabled or unset",()=>{
  for (const flag of ["true",undefined,"TRUE"])
    assert.throws(()=>buildFacebookDraft({...base,env:{...env,AUTO_PUBLISH_ENABLED:flag}}));
});
test("rejects arbitrary image hosts",()=>assert.throws(()=>buildFacebookDraft({...base,imageUrl:"https://example.com/a.png"})));
test("Metricool writes disabled",async()=>await assert.rejects(publishDraft(),/disabled/));
test("morning and evening generate PNG 1080x1350",async()=>{
  for (const period of ["morning","evening"]) {
    const buffer=await createImageBuffer({period,message:"Bình an từ trong tâm"});
    const info=await sharp(buffer).metadata();
    assert.equal(info.format,"png");
    assert.equal(info.width,1080);
    assert.equal(info.height,1350);
  }
});
test("escapes user-supplied text in SVG",()=>{
  const svg=renderTemplateSvg({period:"morning",message:'Bình an & <thương yêu>'});
  assert.match(svg,/&amp;/);
  assert.match(svg,/&lt;/);
  assert.doesNotMatch(svg,/<thương yêu>/);
});
test("rejects excessively long text",()=>assert.throws(()=>renderTemplateSvg({period:"morning",message:"xin ".repeat(100)})));
test("morning and evening variants differ",()=>{
  assert.notEqual(renderTemplateSvg({period:"morning",message:"Tâm an lành",variant:0}),renderTemplateSvg({period:"morning",message:"Tâm an lành",variant:1}));
  assert.notEqual(renderTemplateSvg({period:"morning",message:"Tâm an lành"}),renderTemplateSvg({period:"evening",message:"Tâm an lành"}));
});
test("mock Cloudinary upload, no paid image API",async()=>{
  let uploadData;
  const result=await generateAndUploadImage({
    period:"morning",message:"Tâm an mỗi ngày",postId:"test-1",env,
    uploader:{upload:async(data)=>{uploadData=data;return {secure_url:url,public_id:"phap-thoai-khai-sang/post-test-1",resource_type:"image"};}}
  });
  assert.match(uploadData,/^data:image\/png;base64,/);
  assert.equal(result.imageUrl,url);
  assert.equal(result.width,1080);
});
test("image generation refuses publishing mode",async()=>await assert.rejects(generateAndUploadImage({
  period:"morning",message:"Tâm an mỗi ngày",postId:"test-2",env:{...env,AUTO_PUBLISH_ENABLED:"true"}
}),/false/));
