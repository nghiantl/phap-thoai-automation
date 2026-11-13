const PAGE_ID="296758006853316";
const HOST="https://graph.facebook.com";
export async function checkFacebookPage({env=process.env,fetchImpl=globalThis.fetch}={}) {
 for (const key of ["AUTO_PUBLISH_ENABLED","FACEBOOK_PUBLISH_ENABLED"]) {
   if (env[key] !== undefined && env[key] !== "" && env[key] !== "false")
     throw Error("Read-only verification requires publishing disabled");
 }
 if(env.FACEBOOK_PAGE_ID!==PAGE_ID) throw Error("Unexpected Facebook Page ID");
 if(!env.FACEBOOK_PAGE_ACCESS_TOKEN) throw Error("Missing Page Access Token");
 // Avoid requesting 'tasks' directly on Page node: it may be unsupported.
 const url=new URL(HOST+"/v24.0/"+PAGE_ID);
 url.searchParams.set("fields","id,name");
 const response=await fetchImpl(url,{method:"GET",headers:{Authorization:"Bearer "+env.FACEBOOK_PAGE_ACCESS_TOKEN,Accept:"application/json"}});
 if(!response.ok) {
   let code=null,subcode=null,type=null;
   try {
     const body=await response.json();
     const e=body?.error;
     if(Number.isInteger(e?.code)) code=e.code;
     if(Number.isInteger(e?.error_subcode)) subcode=e.error_subcode;
     if(typeof e?.type==="string" && /^[A-Za-z]+$/.test(e.type)) type=e.type;
   } catch { /* malformed error response */ }
   // Do not echo Meta's free-text message, URLs, request body or tokens.
   const parts=["Facebook read-only check failed: HTTP "+response.status];
   if(code!==null) parts.push("Graph code "+code);
   if(subcode!==null) parts.push("subcode "+subcode);
   if(type!==null) parts.push("type "+type);
   throw Error(parts.join("; "));
 }
 const result=await response.json();
 if(String(result.id)!==PAGE_ID) throw Error("Facebook returned an unexpected Page");
 return {pageId:String(result.id),name:result.name||"",tasks:[],
   hasCreateContent:null,notice:"Page identity verified. CREATE_CONTENT must be checked separately via /me/accounts with User Token."};
}
