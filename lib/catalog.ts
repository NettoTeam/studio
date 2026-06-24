// Catálogo de imagens por sentimento (gerado por scripts/sync-assets.mjs). SERVER-ONLY.
import { promises as fs } from "fs";
import path from "path";

type Catalog = { images: Record<string, string[]> };

async function getCatalog(): Promise<Catalog> {
  try {
    const raw = JSON.parse(await fs.readFile(path.join(process.cwd(), "lib", "catalog.json"), "utf8"));
    return { images: raw.images || {} };
  } catch {
    return { images: {} };
  }
}

function pick<T>(a: T[]): T | undefined {
  return a.length ? a[Math.floor(Math.random() * a.length)] : undefined;
}

export async function resolveImage(sentiment?: string): Promise<string | undefined> {
  if (!sentiment) return undefined;
  const c = await getCatalog();
  return pick(c.images[sentiment] || []);
}

// pools de capa "de marca" (fotos do Cândido / da marca) — a IA sorteia destes; sentimentos comuns ficam de fora
const COVER_POOLS = ["coach", "coach-treino", "coach-perfil", "coach-shape"];
export async function coverPhoto(): Promise<string | undefined> {
  const c = await getCatalog();
  const pool = COVER_POOLS.flatMap((k) => c.images[k] || []);
  return pick(pool.length ? pool : (c.images["coach"] || []));
}

// menu compacto pro prompt: sentimentos disponíveis (sem os pools de capa)
export async function sentimentMenu(): Promise<string> {
  const c = await getCatalog();
  const keys = Object.keys(c.images).filter((k) => !k.startsWith("coach") && k !== "overlays").sort();
  return keys.join(", ");
}

export async function sentimentKeys(): Promise<string[]> {
  const c = await getCatalog();
  return Object.keys(c.images).filter((k) => !k.startsWith("coach") && k !== "overlays").sort();
}
// imagens de overlay (figuras com fundo transparente que vão POR CIMA do card)
export async function overlayImages(): Promise<string[]> {
  const c = await getCatalog();
  return c.images["overlays"] || [];
}

export async function imagesFor(key: string): Promise<string[]> {
  const c = await getCatalog();
  return c.images[key] || [];
}

// todas as imagens de um TEMA (categoria), juntando os sub-sentimentos (ex: treino = treino + treino-pesado...)
export async function imagesForCategory(cat: string): Promise<string[]> {
  const c = await getCatalog();
  const out: string[] = [];
  for (const [k, arr] of Object.entries(c.images)) {
    if (k.startsWith("coach")) continue;
    if (k === cat || k.startsWith(cat + "-")) out.push(...arr);
  }
  return [...new Set(out)];
}

// ---- EDIÇÃO DA BIBLIOTECA (aba Biblioteca de Fotos) — escreve no lib/catalog.json ----
export function slugKey(s: string): string {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
async function writeCatalog(c: { images: Record<string, string[]> }): Promise<void> {
  await fs.writeFile(path.join(process.cwd(), "lib", "catalog.json"), JSON.stringify(c, null, 2));
}
export async function listLibrary(): Promise<{ key: string; images: string[] }[]> {
  const c = await getCatalog();
  return Object.keys(c.images).sort().map((k) => ({ key: k, images: c.images[k] }));
}
export async function createCategory(name: string): Promise<string> {
  const k = slugKey(name);
  if (!k) return "";
  const c = await getCatalog();
  if (!c.images[k]) c.images[k] = [];
  await writeCatalog(c);
  return k;
}
export async function deleteCategory(key: string): Promise<void> {
  const c = await getCatalog();
  delete c.images[key];
  await writeCatalog(c);
}
export async function addImageToCategory(key: string, url: string): Promise<void> {
  const c = await getCatalog();
  (c.images[key] ||= []).push(url);
  await writeCatalog(c);
}
// adiciona VÁRIAS imagens numa só gravação do catálogo (evita corrida no upload em rajada)
export async function addImagesToCategory(key: string, urls: string[]): Promise<void> {
  if (!urls.length) return;
  const c = await getCatalog();
  (c.images[key] ||= []).push(...urls);
  await writeCatalog(c);
}
export async function removeImageFromCategory(key: string, url: string): Promise<void> {
  const c = await getCatalog();
  if (c.images[key]) c.images[key] = c.images[key].filter((u) => u !== url);
  await writeCatalog(c);
}
export async function renameCategory(from: string, toName: string): Promise<{ ok: boolean; key?: string; error?: string }> {
  const to = slugKey(toName);
  if (!to) return { ok: false, error: "nome inválido" };
  const c = await getCatalog();
  if (!c.images[from]) return { ok: false, error: "categoria não existe" };
  if (to === from) return { ok: true, key: to };
  if (c.images[to]) return { ok: false, error: "já existe uma categoria com esse nome" };
  // move a pasta no disco (se existir) e atualiza as URLs das imagens
  const libDir = path.join(process.cwd(), "public", "library");
  try { await fs.rename(path.join(libDir, from), path.join(libDir, to)); } catch {}
  c.images[to] = (c.images[from] || []).map((u) => u.replace(`/library/${from}/`, `/library/${to}/`));
  delete c.images[from];
  await writeCatalog(c);
  return { ok: true, key: to };
}
