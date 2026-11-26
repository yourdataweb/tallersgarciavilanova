import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import puppeteer from "puppeteer";
const ROOT = "/home/davidoc/projects/tallersgarciavilanova";
const MIME = { ".html":"text/html; charset=utf-8", ".css":"text/css", ".js":"text/javascript", ".woff2":"font/woff2", ".jpg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json" };
const server = createServer((req,res)=>{ let p=decodeURIComponent(req.url.split("?")[0]); if(p.endsWith("/"))p+="index.html"; const f=normalize(join(ROOT,p)); if(!f.startsWith(ROOT)||!existsSync(f)){res.writeHead(404);res.end("404");return;} res.writeHead(200,{"content-type":MIME[extname(f)]||"application/octet-stream"}); res.end(readFileSync(f)); });
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({args:["--no-sandbox"]});
const page = await browser.newPage();
for (const w of [1280, 820, 390]) {
  await page.setViewport({width:w,height:900});
  await page.goto(BASE,{waitUntil:"networkidle2"});
  const o = await page.evaluate(()=>{
    const fig=document.querySelector(".hero__photo"), img=fig.querySelector("img"), aside=fig.parentElement;
    const cs=getComputedStyle(fig), cis=getComputedStyle(img), cas=getComputedStyle(aside);
    return {figH:fig.getBoundingClientRect().height, imgH:img.getBoundingClientRect().height,
      imgNatural:[img.naturalWidth,img.naturalHeight], figAlignSelf:cs.alignSelf,
      asideAlign:cas.alignItems, asideDir:cas.flexDirection, asideH:aside.getBoundingClientRect().height,
      imgMinH:cis.minHeight, imgObjFit:cis.objectFit, figH_css:cs.height};
  });
  console.log(w, JSON.stringify(o));
}
await browser.close(); server.close();
