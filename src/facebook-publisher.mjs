const PAGE_ID="296758006853316";
const GRAPH_VERSION="v27.0";
export function assertPublishConfig(env=process.env) {
 if(env.AUTO_PUBLISH_ENABLED!=="true" || env.FACEBOOK_PUBLISH_ENABLED!=="true" ||
    env.PUBLISH_CONFIRMATION!=="I_APPROVE_FACEBOOK_POSTING")
   throw Error("Publishing is disabled; three explicit switches required");
 if(env.FACEBOOK_PAGE_ID!==PAGE_ID) throw Error("Wrong Facebook Page");
 if(!env.FACEBOOK_PAGE_ACCESS_TOKEN) throw Error("Missing Page access token");
}
export async function publishFacebookPhoto({imageUrl,message,env=process.env,fetchImpl=globalThis.fetch}) {
 assertPublishConfig(env);
 if(typeof message!=="string"||message.length<30) throw Error("Invalid caption");
 const url=new URL(imageUrl);
 if(url.protocol!=="https:"||url.hostname!=="res.cloudinary.com"||
   !url.pathname.startsWith("/yiygxwxc/image/upload/")) throw Error("Invalid Cloudinary URL");
 const body=new URLSearchParams({url:url.toString(),caption:message,published:"true"});
 const response=await fetchImpl("https://graph.facebook.com/"+GRAPH_VERSION+"/"+PAGE_ID+"/photos",{
   method:"POST",headers:{Authorization:"Bearer "+env.FACEBOOK_PAGE_ACCESS_TOKEN,
   "Content-Type":"application/x-www-form-urlencoded"},body:body.toString()
 });
 if(!response.ok) throw Error("Facebook photo upload failed: HTTP "+response.status);
 const result=await response.json();
 if(!/^\d+$/.test(String(result.id||""))) throw Error("Facebook did not return a photo ID");
 return {photoId:String(result.id),postId:result.post_id||null};
}
