import "dotenv/config";
import {checkFacebookPage} from "../src/facebook-readonly.mjs";
const env=process.env;
const required=["FACEBOOK_PAGE_ACCESS_TOKEN","CLOUDINARY_API_KEY","CLOUDINARY_API_SECRET"];
const missing=required.filter(k=>!env[k]);
if(missing.length) throw Error("Missing required secrets: "+missing.join(", "));
if(env.FACEBOOK_PAGE_ID!=="296758006853316") throw Error("Unexpected Page ID");
// Read-only verification explicitly overrides live flags; never sends a write request.
const page=await checkFacebookPage({env:{...env,AUTO_PUBLISH_ENABLED:"false",FACEBOOK_PUBLISH_ENABLED:"false"}});
if(!page.pageId) throw Error("Page verification failed");
console.log(JSON.stringify({status:"READ_ONLY_PREFLIGHT_PASSED",pageId:page.pageId,
 cloudinarySecretsPresent:true,facebookPublishPermission:"NOT_VERIFIED_BY_THIS_PROBE"}));
