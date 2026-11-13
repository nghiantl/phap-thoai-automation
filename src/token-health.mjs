import {checkFacebookPage} from "./facebook-readonly.mjs";
// Read-only probe; never print token or free-text Graph errors.
export async function checkTokenHealth({env=process.env,fetchImpl=globalThis.fetch}={}) {
 const result=await checkFacebookPage({env,fetchImpl});
 return {status:"VALID_FOR_PAGE_READ",pageId:result.pageId,name:result.name,
   publishPermission:"NOT_VERIFIED_BY_THIS_PROBE"};
}
