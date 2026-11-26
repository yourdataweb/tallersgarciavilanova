import { readFileSync } from "node:fs";
import jsQR from "jsqr";
import { PNG } from "pngjs";

const png = PNG.sync.read(readFileSync("assets/photos/handover.png"));
const { data, width, height } = png;
const res = jsQR(new Uint8ClampedArray(data), width, height);
console.log("png:", width + "x" + height);
console.log("decoded:", res ? res.data : "NO QR FOUND");
console.log("expected: https://tallersgarciavilanova.vilanovailageltru.info/");
console.log("match:", res && res.data === "https://tallersgarciavilanova.vilanovailageltru.info/");
