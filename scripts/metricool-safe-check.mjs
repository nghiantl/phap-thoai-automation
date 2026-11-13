import "dotenv/config";
import { createMetricoolApi } from "../src/metricool-api.mjs";
import { assertDraftMode } from "../src/config.mjs";

assertDraftMode();
const start=process.argv[2] || "2026-11-15T00:00:00";
const end=process.argv[3] || "2026-11-16T00:00:00";
const api=createMetricoolApi();
const drafts=await api.listDrafts({start,end});
console.log(JSON.stringify(drafts.map(p=>({
  id:p.id,uuid:p.uuid,draft:p.draft,autoPublish:p.autoPublish,
  publicationDate:p.publicationDate,mediaCount:p.media?.length||0
})),null,2));
console.log("READ ONLY: no drafts were created, updated, or published.");
