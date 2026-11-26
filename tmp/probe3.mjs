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
for (const w of [1024, 900, 861, 860, 800, 700, 480, 360]) {
  await page.setViewport({width:w,height:900});
  await page.goto(BASE,{waitUntil:"networkidle2"});
  const o = await page.evaluate(()=>{
    const hdr = document.querySelector(".header__inner");
    const kids = [...hdr.children].map(c=>({cls:c.className.split(" ")[0], w:Math.round(c.getBoundingClientRect().width), l:Math.round(c.getBoundingClientRect().left), r:Math.round(c.getBoundingClientRect().right), disp:getComputedStyle(c).display}));
    return {hdrH:Math.round(hdr.getBoundingClientRect().height), kids,
      scrollW:document.documentElement.scrollWidth, clientW:document.documentElement.clientWidth,
      navDisplay:getComputedStyle(document.getElementById("site-nav")).display,
      toggleDisplay:getComputedStyle(document.querySelector(".nav-toggle")).display};
  });
  console.log(w, JSON.stringify(o));
}
await browser.close(); server.close();
