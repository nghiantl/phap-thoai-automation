import { assertDraftMode, envValue } from "./config.mjs";
import { assertDraftPost } from "./metricool-integration.mjs";

const BASE = "https://app.metricool.com/api";
const BRAND = "8074409";
const ZONE = "Asia/Ho_Chi_Minh";

export function createMetricoolApi({env=process.env, fetchImpl=globalThis.fetch}={}) {
  assertDraftMode(env);
  if (env.METRICOOL_BLOG_ID !== BRAND) throw new Error("METRICOOL_BLOG_ID mismatch");
  if (env.FACEBOOK_PAGE_ID !== "296758006853316") throw new Error("FACEBOOK_PAGE_ID mismatch");
  if (typeof fetchImpl !== "function") throw new Error("fetch is required");
  const userId=envValue("METRICOOL_USER_ID",env);
  const token=envValue("METRICOOL_API_TOKEN",env);
  if (!/^\d+$/.test(userId)) throw new Error("Invalid Metricool userId");

  async function request(method,path,query={},body) {
    const url=new URL(BASE+path);
    url.searchParams.set("userId",userId);
    url.searchParams.set("blogId",BRAND);
    for(const [key,value] of Object.entries(query)) url.searchParams.set(key,value);
    const response=await fetchImpl(url,{
      method,
      headers:{"X-Mc-Auth":token,"Accept":"application/json",...(body?{"Content-Type":"application/json"}:{})},
      ...(body?{body:JSON.stringify(body)}:{})
    });
    if(!response.ok) throw new Error("Metricool "+method+" failed: HTTP "+response.status);
    const json=await response.json();
    if(json?.data===undefined) throw new Error("Unexpected Metricool API response");
    return json.data;
  }

  return {
    async listDrafts({start,end}={}) {
      if(!start || !end || !/^\d{4}-\d{2}-\d{2}T/.test(start) || !/^\d{4}-\d{2}-\d{2}T/.test(end))
        throw new Error("Explicit start/end required");
      const data=await request("GET","/v2/scheduler/posts",{start,end,timezone:ZONE});
      if(!Array.isArray(data)) throw new Error("Expected post array");
      return data.filter(p=>p.draft===true);
    },
    async updateDraft({id,uuid,blogId,info}) {
      if(env.METRICOOL_DRAFT_WRITES_ENABLED!=="true")
        throw new Error("Draft writes are disabled");
      if(blogId!==BRAND || !/^\d+$/.test(String(id)) || !uuid)
        throw new Error("Invalid draft identity");
      assertDraftPost(info);
      const result=await request("PUT","/v2/scheduler/posts/"+encodeURIComponent(String(id)),{},{
        ...info,id:Number(id),uuid
      });
      assertDraftPost(result);
      return result;
    }
  };
}
