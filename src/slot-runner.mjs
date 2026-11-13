import {buildPost} from "./content-engine.mjs";
import {createImageBuffer} from "./image.mjs";
import {publishFacebookPhoto,assertPublishConfig} from "./facebook-publisher.mjs";
import {v2 as cloudinary} from "cloudinary";
import {randomUUID} from "node:crypto";

export function vietnamSlot(now=new Date()) {
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",
 year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
 const get=k=>parts.find(x=>x.type===k)?.value;
 const date=[get("year"),get("month"),get("day")].join("-");
 const minutes=Number(get("hour"))*60+Number(get("minute"));
 const period=minutes>=360&&minutes<390?"morning":minutes>=1170&&minutes<1200?"evening":null;
 return {date,period};
}
export async function runSlot({now=new Date(),env=process.env,publish=publishFacebookPhoto,uploader=cloudinary.uploader,render=createImageBuffer,ledger}={}) {
 const {date,period}=vietnamSlot(now);
 if(!period) return {status:"OUTSIDE_SLOT",date};
 const post=buildPost({date,period});
 const key=date+"-"+period;
 // Dry-run is intentionally fully offline: no image upload, Facebook request or secret access.
 if(env.AUTO_PUBLISH_ENABLED!=="true") return {status:"DRY_RUN",key,post};
 assertPublishConfig(env);
 if(!ledger||typeof ledger.claim!=="function"||typeof ledger.finish!=="function")
   throw Error("Durable ledger is required before publishing");
 const claimed=await ledger.claim(key);
 if(!claimed) return {status:"ALREADY_CLAIMED",key};
 try {
   const png=await render(post);
   cloudinary.config({cloud_name:"yiygxwxc",api_key:env.CLOUDINARY_API_KEY,api_secret:env.CLOUDINARY_API_SECRET,secure:true});
   if(!env.CLOUDINARY_API_KEY||!env.CLOUDINARY_API_SECRET) throw Error("Cloudinary secrets missing");
   const result=await uploader.upload("data:image/png;base64,"+png.toString("base64"),{
     folder:"phap-thoai-khai-sang",public_id:"auto-"+key+"-"+randomUUID(),overwrite:false,resource_type:"image"
   });
   const published=await publish({imageUrl:result.secure_url,message:post.text,env});
   await ledger.finish(key,{status:"PUBLISHED",...published});
   return {status:"PUBLISHED",key,...published};
 } catch(error) {
   // Claim intentionally remains locked: retry only after manual reconciliation.
   throw error;
 }
}
