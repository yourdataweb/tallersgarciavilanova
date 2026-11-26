import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import puppeteer from "puppeteer";

const ROOT = "/home/davidoc/projects/tallersgarciavilanova";
const MIME = { ".html":"text/html; charset=utf-8", ".css":"text/css", ".js":"text/javascript", ".woff2":"font/woff2", ".jpg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json" };
const server = createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = normalize(join(ROOT,p));
  if (!f.startsWith(ROOT) || !existsSync(f)) { res.writeHead(404); res.end("404"); return; }
  res.writeHead(200,{"content-type":MIME[extname(f)]||"application/octet-stream"});
  res.end(readFileSync(f));
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await puppeteer.launch({args:["--no-sandbox"]});
const page = await browser.newPage();

for (const [w,h,label] of [[1280,900,"desktop"],[820,1200,"cardTablet"],[390,844,"mobile"]]) {
  await page.setViewport({width:w,height:h,deviceScaleFactor:1});
  await page.goto(BASE,{waitUntil:"networkidle2"});
  await page.evaluate(()=>document.querySelectorAll(".reveal").forEach(e=>e.classList.add("is-visible")));
  await new Promise(r=>setTimeout(r,300));
  const m = await page.evaluate(()=>{
    const r = (s)=>{ const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return {t:Math.round(b.top+scrollY),h:Math.round(b.height),w:Math.round(b.width),l:Math.round(b.left)}; };
    return {
      hero: r(".hero"), heroTitle: r(".hero__title"), phone: r(".hero__phone"),
      photo: r(".hero__photo"), photoImg: r(".hero__photo img"), card: r(".hero__card"),
      services: r("#serveis"), cards: r(".cards"), trust: r("#confianca"), steps: r(".steps"),
      quotes: r(".quotes"), contact: r("#contacte"), map: r(".map-shell"),
      docH: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      titleLines: (()=>{const e=document.querySelector(".hero__title"); const lh=parseFloat(getComputedStyle(e).lineHeight); return Math.round(e.getBoundingClientRect().height/lh);})(),
      cardH: r(".hero__card")?.h,
    };
  });
  console.log(label, JSON.stringify(m));
}
await browser.close(); server.close();
