// Sincroniza suas imagens -> app. Lê uma pasta local, otimiza pro web e gera o catálogo por sentimento.
//
// COMO USAR:
// 1) Crie uma pasta "assets/" na raiz do projeto com esta estrutura:
//      assets/
//        coach/                ← suas fotos pra CAPA (você / a marca). Vira o pool "coach".
//        treino/               ← fotos com o sentimento "treino"
//        foco/                 ← sentimento "foco"
//        superacao/            ← etc. (cada subpasta = uma chave de sentimento)
//        ...
//    (As chaves podem ser qualquer nome; o app lista elas no menu de imagens.)
// 2) Rode:  node scripts/sync-assets.mjs
//    Ele otimiza tudo pra public/library/ e reescreve lib/catalog.json.
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const SRC = process.env.ASSETS_DIR || path.join(process.cwd(), "assets");
const PUB = path.join(process.cwd(), "public", "library");
const CATALOG = path.join(process.cwd(), "lib", "catalog.json");

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function listImages(dir) {
  const out = [];
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.isFile() && /\.(jpe?g|png|webp)$/i.test(e.name)) out.push(path.join(dir, e.name));
  }
  return out;
}

async function optimize(srcAbs, destAbs, max = 1600) {
  await fs.mkdir(path.dirname(destAbs), { recursive: true });
  await sharp(srcAbs).resize({ width: max, height: max, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(destAbs);
}

async function main() {
  let subdirs;
  try { subdirs = (await fs.readdir(SRC, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name); }
  catch { console.error(`Pasta de origem não encontrada: ${SRC}\nCrie a pasta "assets/" com subpastas por sentimento (ex: assets/coach, assets/treino, assets/foco).`); process.exit(1); }

  if (!subdirs.length) { console.error(`Nenhuma subpasta em ${SRC}. Crie pastas por sentimento (ex: assets/coach, assets/treino).`); process.exit(1); }

  const catalog = { images: {} };
  let n = 0;

  for (const sub of subdirs) {
    const key = slug(sub);
    const files = await listImages(path.join(SRC, sub));
    if (!files.length) continue;
    catalog.images[key] = [];
    for (let i = 0; i < files.length; i++) {
      const dest = path.join(PUB, key, `${key}-${i}.jpg`);
      try { await optimize(files[i], dest); } catch { continue; }
      catalog.images[key].push("/library/" + key + "/" + path.basename(dest));
      n++;
    }
    console.log(`  ${key}: ${catalog.images[key].length} imagens`);
  }

  await fs.mkdir(path.dirname(CATALOG), { recursive: true });
  await fs.writeFile(CATALOG, JSON.stringify(catalog, null, 2));
  const keys = Object.keys(catalog.images).sort();
  console.log(`\nOK: ${n} imagens otimizadas em ${keys.length} sentimentos.`);
  console.log("Sentimentos:", keys.join(", "));
  if (!keys.includes("coach")) console.log("⚠ Dica: crie a pasta assets/coach com as fotos de CAPA (sua/da marca) — o app usa esse pool na capa.");
}

main().catch((e) => { console.error(e); process.exit(1); });
