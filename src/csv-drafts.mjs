const REQUIRED=["Text","Date","Time","Draft","Facebook","Picture Url 1"];
export function parseTemplateHeader(csv) {
  const first=csv.replace(/^\uFEFF/,"").split(/\r?\n/,1)[0];
  if(!first) throw Error("Metricool template header missing");
  // Metricool template headers must not contain quoted commas.
  const columns=first.split(",").map(x=>x.trim().replace(/^"|"$/g,""));
  if(new Set(columns).size!==columns.length) throw Error("Duplicate template columns");
  for(const name of REQUIRED) if(!columns.includes(name)) throw Error("Missing Metricool column: "+name);
  return columns;
}
function cell(value) {return '"'+String(value??"").replace(/"/g,'""')+'"';}
export function generateMetricoolCsv(templateCsv,posts) {
  const columns=parseTemplateHeader(templateCsv);
  if(!Array.isArray(posts)||!posts.length||posts.length>50) throw Error("Expected 1-50 posts");
  const lines=[columns.map(cell).join(",")];
  const unique=new Set();
  for(const post of posts) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(post.date)||!/^\d{2}:\d{2}:\d{2}$/.test(post.time))
      throw Error("Invalid date or time");
    if(!post.text||post.text.length<20) throw Error("Post text too short");
    const url=new URL(post.imageUrl);
    if(url.protocol!=="https:"||url.hostname!=="res.cloudinary.com"||
      !url.pathname.startsWith("/yiygxwxc/image/upload/"))
      throw Error("Cloudinary URL required");
    const key=post.date+"T"+post.time;
    if(unique.has(key)) throw Error("Duplicate date/time");
    unique.add(key);
    const values={"Text":post.text,"Date":post.date,"Time":post.time,
      "Draft":"TRUE","Facebook":"TRUE","Picture Url 1":url.toString()};
    // Explicitly mark every other platform false. Blank fields remain blank.
    for(const platform of ["Twitter/X","Twitter","X","LinkedIn","GBP","Instagram","Pinterest","TikTok","YouTube","Threads","Bluesky"])
      if(columns.includes(platform)) values[platform]="FALSE";
    lines.push(columns.map(col=>cell(values[col]??"")).join(","));
  }
  return "\uFEFF"+lines.join("\r\n")+"\r\n";
}
