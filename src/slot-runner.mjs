import {buildPost} from "./content-engine.mjs";
import {createImageBuffer} from "./image.mjs";
import {publishFacebookPhoto,assertPublishConfig} from "./facebook-publisher.mjs";
import {v2 as cloudinary} from "cloudinary";

export function vietnamSlot(now=new Date()) {
 if(!(now instanceof Date)||!Number.isFinite(now.getTime())) throw Error("Invalid time");
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",
 year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
 const get=k=>parts.find(x=>x.type===k)?.value;
 const date=[get("year"),get("month"),get("day")].join("-");
 const minutes=Number(get("hour"))*60+Number(get("minute"));
 // Asia/Ho_Chi_Minh: morning [06:00,12:00), evening [18:00,24:00).
 // 12:00-17:59 is outside both slots; 00:00 belongs to the next calendar day.
 const morning=minutes>=360&&minutes<720;
 const evening=minutes>=1080&&minutes<1440;
 const period=morning?"morning":evening?"evening":null;
 return {date,period};
}
export async function runSlot({now=new Date(),env=process.env,publish=publishFacebookPhoto,uploader=cloudinary.uploader,render=createImageBuffer,ledger}={}) {
 const {date,period}=vietnamSlot(now);
 if(!period) return {status:"OUTSIDE_SLOT",date};
 const post=buildPost({date,period});
 const key=date+"-"+period;
 if(env.AUTO_PUBLISH_ENABLED!=="true") return {status:"DRY_RUN",key,post};
 assertPublishConfig(env);
 if(!ledger||typeof ledger.claim!=="function"||typeof ledger.finish!=="function") throw Error("Durable ledger required");
 if(!env.CLOUDINARY_API_KEY||!env.CLOUDINARY_API_SECRET) throw Error("Cloudinary secrets missing");
 const claimed=await ledger.claim(key);
 if(!claimed) return {status:"ALREADY_CLAIMED",key};
 let facebookAttempted=false;
 let published=false;
 try {
   const png=await render(post);
   cloudinary.config({cloud_name:"yiygxwxc",api_key:env.CLOUDINARY_API_KEY,api_secret:env.CLOUDINARY_API_SECRET,secure:true});
   const result=await uploader.upload("data:image/png;base64,"+png.toString("base64"),{
     folder:"phap-thoai-khai-sang",public_id:"auto-"+key,overwrite:false,resource_type:"image"
   });
   facebookAttempted=true;
   const outcome=await publish({imageUrl:result.secure_url,message:post.text,env});
   published=true;
   await ledger.finish(key,{status:"PUBLISHED",...outcome});
   return {status:"PUBLISHED",key,...outcome};
 } catch(error) {
   // A failed status-marker write after a confirmed publish must not be
   // mislabeled UNKNOWN; the permanent claim still blocks any retry.
   if(!published) {
     try {await ledger.finish(key,{status:facebookAttempted?"UNKNOWN":"FAILED"});}
     catch { /* claim remains the permanent lock */ }
   }
   // Avoid exposing raw SDK error text which may contain sensitive data.
   throw Error("Publishing attempt failed; claimed slot "+key+" is locked for manual reconciliation");
 }
}
