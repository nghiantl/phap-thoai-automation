import test from "node:test";
import assert from "node:assert/strict";
import { prepareDraftUpdate, updateExistingDraft } from "../src/metricool-integration.mjs";

const imageUrl="https://res.cloudinary.com/yiygxwxc/image/upload/v1794543552/phap-thoai-khai-sang/post-test-1794543549446.png";
const env={AUTO_PUBLISH_ENABLED:"false",CLOUDINARY_CLOUD_NAME:"yiygxwxc",METRICOOL_BLOG_ID:"8074409",FACEBOOK_PAGE_ID:"296758006853316"};
const original={id:426476787,uuid:"-2137464596706156",text:"Bình an mỗi sáng, nguyện mọi người thân tâm an lạc.",firstCommentText:"",publicationDate:{dateTime:"2026-11-15T06:00:00",timezone:"Asia/Ho_Chi_Minh"},providers:[{network:"facebook"}],facebookData:{type:"POST"},draft:true,autoPublish:false};
test("image-only update preserves text/time and draft flags",()=>{
  const {info}=prepareDraftUpdate({original,imageUrl,env});
  assert.equal(info.draft,true);assert.equal(info.autoPublish,false);
  assert.equal(info.text,original.text);assert.deepEqual(info.publicationDate,original.publicationDate);
  assert.deepEqual(info.media,[imageUrl]);
});
test("unsafe drafts, wrong page and publish flag rejected",()=>{
  for(const patch of [{draft:false},{autoPublish:true},{providers:[{network:"instagram"}]}])
    assert.throws(()=>prepareDraftUpdate({original:{...original,...patch},imageUrl,env}));
  assert.throws(()=>prepareDraftUpdate({original,imageUrl,env:{...env,AUTO_PUBLISH_ENABLED:"true"}}));
  assert.throws(()=>prepareDraftUpdate({original,imageUrl,env:{...env,FACEBOOK_PAGE_ID:"wrong"}}));
});
test("dry run never calls network",async()=>{
  const result=await updateExistingDraft({original,imageUrl,env});
  assert.equal(result.status,"DRY_RUN");
});
test("mock update verifies readback and idempotency",async()=>{
  const state={...original};let writes=0;
  const transport={
    listDrafts:async()=>[structuredClone(state)],
    updateDraft:async request=>{writes++;Object.assign(state,request.info,{id:426529682,uuid:original.uuid});return structuredClone(state);}
  };
  const enabled={...env,METRICOOL_DRAFT_WRITES_ENABLED:"true"};
  const result=await updateExistingDraft({original,imageUrl,env:enabled,transport,allowWrite:true});
  assert.equal(result.status,"UPDATED_DRAFT");assert.equal(writes,1);
  const repeat=await updateExistingDraft({original:{...original,id:426529682,media:[imageUrl]},imageUrl,env:enabled,transport,allowWrite:true});
  assert.equal(repeat.status,"UNCHANGED");assert.equal(writes,1);
});
test("refuses to overwrite edited drafts",async()=>{
  const enabled={...env,METRICOOL_DRAFT_WRITES_ENABLED:"true"};
  const transport={listDrafts:async()=>[{...original,text:"edited"}],updateDraft:async()=>{throw Error("unexpected write");}};
  await assert.rejects(updateExistingDraft({original,imageUrl,env:enabled,transport,allowWrite:true}),/modified/);
});
