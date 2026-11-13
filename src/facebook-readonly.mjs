const PAGE_ID="296758006853316";
const HOST="https://graph.facebook.com";
export async function checkFacebookPage({env=process.env,fetchImpl=globalThis.fetch}={}) {
 // Undefined means disabled for read-only checks. Explicit "true" or invalid
 // non-empty values are rejected to avoid accidental publishing-mode confusion.
 for (const key of ["AUTO_PUBLISH_ENABLED","FACEBOOK_PUBLISH_ENABLED"]) {
   if (env[key] !== undefined && env[key] !== "" && env[key] !== "false")
     throw Error("Read-only verification requires publishing disabled");
 }
 if(env.FACEBOOK_PAGE_ID!==PAGE_ID) throw Error("Unexpected Facebook Page ID");
 if(!env.FACEBOOK_PAGE_ACCESS_TOKEN) throw Error("Missing Page Access Token");
 const url=new URL(HOST+"/v24.0/"+PAGE_ID);
 url.searchParams.set("fields","id,name,tasks");
 const response=await fetchImpl(url,{method:"GET",headers:{Authorization:"Bearer "+env.FACEBOOK_PAGE_ACCESS_TOKEN,Accept:"application/json"}});
 if(!response.ok) throw Error("Facebook read-only check failed: HTTP "+response.status);
 const result=await response.json();
 if(String(result.id)!==PAGE_ID) throw Error("Facebook returned an unexpected Page");
 return {pageId:String(result.id),name:result.name||"",tasks:Array.isArray(result.tasks)?result.tasks:[],
  hasCreateContent:Array.isArray(result.tasks)?result.tasks.includes("CREATE_CONTENT"):null};
}
