// Tira foto de cada card em tamanho real, pra verificação visual.
// Uso: npm run dev (noutro terminal) e depois: node scripts/shoot.mjs [nCards]
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";

const N = Number(process.argv[2] || 10);
const OUT = process.env.SHOOT_OUT || "./shots";
mkdirSync(OUT, { recursive: true });

const b = await puppeteer.launch({ headless: "new" });
const p = await b.newPage();
await p.setViewport({ width: 1160, height: 1400, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/preview", { waitUntil: "networkidle0" });
await p.evaluate(async () => { await document.fonts.ready; });
await new Promise((r) => setTimeout(r, 800));

for (let i = 0; i < N; i++) {
  const el = await p.$(`#card-${i}`);
  if (!el) { console.log("sem card", i); continue; }
  await el.screenshot({ path: `${OUT}/shot-${i}.png` });
  console.log("shot", i);
}
await b.close();
console.log("OK — imagens em", OUT);
