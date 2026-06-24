// Verifica que o editor inline abre e atualiza o card ao vivo.
// Uso: npm run dev (noutro terminal) e depois: node scripts/check-editor.mjs
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";

const OUT = process.env.SHOOT_OUT || "./shots";
mkdirSync(OUT, { recursive: true });

const b = await puppeteer.launch({ headless: "new" });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000", { waitUntil: "networkidle0" });
await p.evaluate(async () => { await document.fonts.ready; });
await new Promise((r) => setTimeout(r, 600));

// clica no botão "editar" do primeiro card (se existir)
const editButtons = await p.$$("button");
let clicked = false;
for (const btn of editButtons) {
  const t = await p.evaluate((el) => el.textContent, btn);
  if (t === "editar") { await btn.click(); clicked = true; break; }
}
console.log("clicou editar:", clicked);
await new Promise((r) => setTimeout(r, 500));

const tas = await p.$$("textarea");
console.log("textareas na tela:", tas.length);

if (tas.length > 1) {
  const target = tas[tas.length - 1];
  await target.click({ clickCount: 3 });
  await target.type(" EDITADO");
}
await new Promise((r) => setTimeout(r, 400));
await p.screenshot({ path: `${OUT}/editor-check.png` });
console.log("screenshot salvo em", OUT);
await b.close();
