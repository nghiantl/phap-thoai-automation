import "dotenv/config";
import { readFile,writeFile,mkdir } from "node:fs/promises";
import { generateAndUploadImage } from "../src/image.mjs";
import { generateMetricoolCsv } from "../src/csv-drafts.mjs";
import { assertDraftMode } from "../src/config.mjs";

assertDraftMode();
const templatePath=process.env.METRICOOL_CSV_TEMPLATE || "metricool-template.csv";
const planPath=process.argv[2] || "content/draft-plan.json";
const plan=JSON.parse(await readFile(planPath,"utf8"));
if(!Array.isArray(plan.posts)||!plan.posts.length||plan.posts.length>50)
  throw Error("Invalid draft plan");
const template=await readFile(templatePath,"utf8");
const posts=[];
for(const item of plan.posts) {
  if(!["morning","evening"].includes(item.period)) throw Error("Invalid period");
  const time=item.period==="morning"?"06:00:00":"19:30:00";
  if(!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw Error("Invalid date");
  const image=await generateAndUploadImage({
    period:item.period,message:item.message,postId:item.date+"-"+item.period,
    variant:item.variant||0
  });
  posts.push({date:item.date,time,text:item.text,imageUrl:image.imageUrl});
}
await mkdir("dist",{recursive:true});
await writeFile("dist/metricool-drafts.csv",generateMetricoolCsv(template,posts),"utf8");
await writeFile("dist/draft-manifest.json",JSON.stringify(posts,null,2));
console.log("Generated "+posts.length+" draft CSV rows. No Metricool API calls or Facebook publishing.");
