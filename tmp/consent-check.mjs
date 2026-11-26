import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
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
const out = {};

async function run(label, choice) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const reqs = [];
  page.on("request", r => {
    const u = r.url();
    if (/googletagmanager|google-analytics/.test(u)) reqs.push(u);
  });
  await page.goto(BASE, { waitUntil: "networkidle2" });
  await new Promise(r=>setTimeout(r,1500));
  const before = { reqs: reqs.length, cookies: (await page.cookies()).length };
  const res = { before };
  if (choice) {
    await page.evaluate((c)=>{
      const b = document.querySelector(`[data-cookie="${c}"]`);
      if (b) b.click();
    }, choice);
    await new Promise(r=>setTimeout(r,3000));
    res.after = { reqs: reqs.length, cookies: (await page.cookies()).map(c=>c.name), hosts: reqs.map(u=>u.split("?")[0]) };
    res.mapIframes = await page.evaluate(()=>document.querySelectorAll("#map-shell iframe").length);
    res.stored = await page.evaluate(()=>localStorage.getItem("cookie-consent-v1"));
  }
  out[label] = res;
  await page.close(); await ctx.close();
}

await run("noChoice");
await run("accept", "accept");
await run("reject", "essential");
console.log(JSON.stringify(out, null, 2));
await browser.close(); server.close();
