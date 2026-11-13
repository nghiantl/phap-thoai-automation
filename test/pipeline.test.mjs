import test from "node:test";
import assert from "node:assert/strict";
import { buildFacebookDraft, publishDraft } from "../src/metricool-draft.mjs";
import { generateAndUploadImage } from "../src/image.mjs";

const env = { AUTO_PUBLISH_ENABLED: "false", CLOUDINARY_CLOUD_NAME: "yiygxwxc" };
const url = "https://res.cloudinary.com/yiygxwxc/image/upload/v1/phap-thoai-khai-sang/test.png";
const base = { caption: "Một ngày mới bắt đầu với tâm bình an, sự tỉnh thức và lòng từ bi dành cho tất cả mọi người.", imageUrl:url, publishAt:"2026-11-15T06:00:00+07:00",env };
test("draft has both protective flags",()=>{
  const post=buildFacebookDraft(base);
  assert.equal(post.draft,true);
  assert.equal(post.autoPublish,false);
  assert.deepEqual(post.providers,[{network:"facebook"}]);
  assert.deepEqual(post.media,[url]);
});
test("fail closed if publishing enabled or unset",()=>{
  for(const value of ["true",undefined,"TRUE"])
    assert.throws(()=>buildFacebookDraft({...base,env:{...env,AUTO_PUBLISH_ENABLED:value}}));
});
test("rejects arbitrary image hosts",()=>assert.throws(()=>buildFacebookDraft({...base,imageUrl:"https://example.com/test.png"})));
test("Metricool writes remain disabled",async()=>await assert.rejects(publishDraft(),/disabled/));
test("mock OpenAI to Cloudinary upload pipeline", async()=>{
  let received;
  const result=await generateAndUploadImage({
    topic:"Buông bỏ phiền não vào buổi tối",
    postId:"test-1",
    env,
    imageClient:{images:{generate:async()=>({data:[{b64_json:"dGVzdA=="}]})}},
    uploader:{upload:async(...args)=>{received=args;return {secure_url:url,public_id:"phap-thoai-khai-sang/post-test-1",width:1024,height:1536,resource_type:"image"};}}
  });
  assert.match(received[0],/^data:image\/png;base64,/);
  assert.equal(result.imageUrl,url);
});
