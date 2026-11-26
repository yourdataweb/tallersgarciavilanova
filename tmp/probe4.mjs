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

for (const path of ["", "es/", "en/"]) {
  for (const w of [1280, 820, 390]) {
    const page = await browser.newPage();
    await page.setViewport({width:w,height:900});
    await page.goto(BASE+path,{waitUntil:"networkidle2"});
    await page.evaluate(()=>document.querySelectorAll(".reveal").forEach(e=>e.classList.add("is-visible")));
    const r = await page.evaluate(()=>{
      const clipped = [];
      document.querySelectorAll("h1,h2,h3,p,li,a,span,dt,dd,blockquote,figcaption").forEach(el=>{
        if (el.children.length) return;
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") clipped.push(el.className+":"+el.textContent.trim().slice(0,30));
        const cs = getComputedStyle(el);
        if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) clipped.push("ellipsis:"+el.textContent.trim().slice(0,30));
      });
      // any element wider than the viewport
      const wide = [];
      document.querySelectorAll("body *").forEach(el=>{
        const b = el.getBoundingClientRect();
        if (b.width > document.documentElement.clientWidth + 1 && b.height > 1) wide.push(el.tagName+"."+el.className+":"+Math.round(b.width));
      });
      // hero overflow beyond its own box
      const hero = document.querySelector(".hero").getBoundingClientRect();
      const sticking = [...document.querySelectorAll(".hero *")].filter(el=>{
        const b=el.getBoundingClientRect(); return b.bottom > hero.bottom + 2 || b.right > hero.right + 2;
      }).map(el=>el.tagName+"."+el.className);
      // list of section heights
      const secs = [...document.querySelectorAll("main > section")].map(s=>({id:s.id,h:Math.round(s.getBoundingClientRect().height)}));
      return {clipped: clipped.slice(0,8), wide: wide.slice(0,8), sticking: sticking.slice(0,5), secs};
    });
    console.log(path||"/", w, JSON.stringify(r));
    await page.close();
  }
}
await browser.close(); server.close();
