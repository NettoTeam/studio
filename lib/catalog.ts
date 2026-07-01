// Catálogo de imagens por sentimento (gerado por scripts/sync-assets.mjs). SERVER-ONLY.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";

type Catalog = { images: Record<string, string[]> };
const CATALOG_KV_KEY = "library_catalog";
const LIBRARY_BUCKET = process.env.SUPABASE_LIBRARY_BUCKET || "library-assets";

let supabase: SupabaseClient | null | undefined;
let bucketReady: Promise<void> | null = null;

function getSupabase(): SupabaseClient | null {
  if (supabase !== undefined) return supabase;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return supabase;
}

async function baseCatalog(): Promise<Catalog> {
  try {
    const raw = JSON.parse(await fs.readFile(path.join(process.cwd(), "lib", "catalog.json"), "utf8"));
    return { images: raw.images || {} };
  } catch {
    return { images: {} };
  }
}

async function getCatalog(): Promise<Catalog> {
  const sb = getSupabase();
  if (!sb) return baseCatalog();
  const { data, error } = await sb.from("kv").select("value").eq("key", CATALOG_KV_KEY).maybeSingle();
  if (!error && data?.value && typeof data.value === "object" && "images" in data.value) {
    return { images: (data.value as Catalog).images || {} };
  }
  if (error) {
    console.error("library catalog read", error.message);
    return baseCatalog();
  }
  const seeded = await baseCatalog();
  await writeCatalog(seeded);
  return seeded;
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
  const clean = { images: Object.fromEntries(Object.entries(c.images).map(([k, imgs]) => [slugKey(k), Array.from(new Set(imgs || []))]).filter(([k]) => !!k)) };
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("kv").upsert({ key: CATALOG_KV_KEY, value: clean });
    if (error) throw new Error(error.message);
    return;
  }
  await fs.writeFile(path.join(process.cwd(), "lib", "catalog.json"), JSON.stringify(clean, null, 2));
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
  const k = slugKey(key);
  const c = await getCatalog();
  const images = c.images[k] || [];
  delete c.images[k];
  await writeCatalog(c);
  await Promise.allSettled(images.map((url) => deleteLibraryAsset(url)));
}
export async function addImageToCategory(key: string, url: string): Promise<void> {
  key = slugKey(key);
  const c = await getCatalog();
  (c.images[key] ||= []).push(url);
  await writeCatalog(c);
}
// adiciona VÁRIAS imagens numa só gravação do catálogo (evita corrida no upload em rajada)
export async function addImagesToCategory(key: string, urls: string[]): Promise<void> {
  key = slugKey(key);
  if (!urls.length) return;
  const c = await getCatalog();
  (c.images[key] ||= []).push(...urls);
  await writeCatalog(c);
}
export async function removeImageFromCategory(key: string, url: string): Promise<void> {
  key = slugKey(key);
  const c = await getCatalog();
  if (c.images[key]) c.images[key] = c.images[key].filter((u) => u !== url);
  await writeCatalog(c);
  await deleteLibraryAsset(url);
}
export async function renameCategory(from: string, toName: string): Promise<{ ok: boolean; key?: string; error?: string }> {
  from = slugKey(from);
  const to = slugKey(toName);
  if (!to) return { ok: false, error: "nome inválido" };
  const c = await getCatalog();
  if (!c.images[from]) return { ok: false, error: "categoria não existe" };
  if (to === from) return { ok: true, key: to };
  if (c.images[to]) return { ok: false, error: "já existe uma categoria com esse nome" };

  const sb = getSupabase();
  if (sb) {
    // Supabase: só renomeia a chave no catálogo — os arquivos continuam nas mesmas URLs (ainda válidas)
    c.images[to] = c.images[from] || [];
    delete c.images[from];
    await writeCatalog(c);
    return { ok: true, key: to };
  }

  // Filesystem local: tenta mover a pasta; se mover atualiza os caminhos, se não mover mantém
  const libDir = path.join(process.cwd(), "public", "library");
  let folderMoved = false;
  try { await fs.rename(path.join(libDir, from), path.join(libDir, to)); folderMoved = true; } catch {}
  c.images[to] = (c.images[from] || []).map((u) =>
    folderMoved ? u.replace(`/library/${from}/`, `/library/${to}/`) : u
  );
  delete c.images[from];
  await writeCatalog(c);
  return { ok: true, key: to };
}

async function ensureLibraryBucket(sb: SupabaseClient): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const found = await sb.storage.getBucket(LIBRARY_BUCKET);
      if (!found.error) return;
      const created = await sb.storage.createBucket(LIBRARY_BUCKET, {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      });
      if (created.error && !/already exists/i.test(created.error.message)) throw new Error(created.error.message);
    })();
  }
  await bucketReady;
}

// Liga as fotos que estão em bucketFolder (nome real no storage) à chave catalogKey no catálogo.
// Útil quando o rename mudou a chave mas os arquivos continuam na pasta antiga do bucket.
export async function relinkCategory(bucketFolder: string, catalogKey: string): Promise<string[]> {
  const sb = getSupabase();
  let urls: string[] = [];

  if (sb) {
    const { data: files, error } = await sb.storage.from(LIBRARY_BUCKET).list(bucketFolder, { limit: 1000 });
    if (error) throw new Error(error.message);
    urls = (files || [])
      .filter((f) => f.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .map((f) => sb.storage.from(LIBRARY_BUCKET).getPublicUrl(`${bucketFolder}/${f.name}`).data.publicUrl);
  } else {
    const dir = path.join(process.cwd(), "public", "library", bucketFolder);
    try {
      const files = await fs.readdir(dir);
      urls = files.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f)).map((f) => `/library/${bucketFolder}/${f}`);
    } catch {}
  }

  const c = await getCatalog();
  c.images[slugKey(catalogKey)] = urls;
  await writeCatalog(c);
  return urls;
}

// Reconstrói os links de uma categoria lendo os arquivos diretamente do bucket/pasta.
// Usado quando o catálogo fica com URLs corrompidas (ex: após rename com bug anterior).
export async function repairCategory(key: string): Promise<string[]> {
  key = slugKey(key);
  const sb = getSupabase();
  let urls: string[] = [];

  if (sb) {
    const { data: files, error } = await sb.storage.from(LIBRARY_BUCKET).list(key, { limit: 1000 });
    if (error) throw new Error(error.message);
    urls = (files || [])
      .filter((f) => f.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .map((f) => sb.storage.from(LIBRARY_BUCKET).getPublicUrl(`${key}/${f.name}`).data.publicUrl);
  } else {
    const dir = path.join(process.cwd(), "public", "library", key);
    try {
      const files = await fs.readdir(dir);
      urls = files.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f)).map((f) => `/library/${key}/${f}`);
    } catch {}
  }

  const c = await getCatalog();
  c.images[key] = urls;
  await writeCatalog(c);
  return urls;
}

export async function saveLibraryAsset(category: string, filename: string, data: Uint8Array, contentType: string): Promise<string> {
  const key = slugKey(category);
  const sb = getSupabase();
  if (sb) {
    await ensureLibraryBucket(sb);
    const objectPath = `${key}/${filename}`;
    const { error } = await sb.storage.from(LIBRARY_BUCKET).upload(objectPath, data, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw new Error(error.message);
    return sb.storage.from(LIBRARY_BUCKET).getPublicUrl(objectPath).data.publicUrl;
  }

  const dir = path.join(process.cwd(), "public", "library", key);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), data);
  return `/library/${key}/${filename}`;
}

// Gira 90° CW, salva com NOVO nome (evita CDN cache do Supabase), atualiza catálogo.
// Retorna a nova URL pública da foto girada.
export async function rotateLibraryAsset(category: string, url: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sharp = require("sharp") as typeof import("sharp");

  // 1. Baixa a imagem (fetch funciona tanto pra URL do Supabase quanto local via servidor)
  let raw: Buffer;
  if (url.startsWith("http")) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`erro ao baixar a foto (${resp.status})`);
    raw = Buffer.from(await resp.arrayBuffer());
  } else if (url.startsWith("/library/")) {
    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, "").split("?")[0]);
    raw = await fs.readFile(filePath);
  } else {
    throw new Error("URL de foto não reconhecida");
  }

  // 2. Gira 90° sentido horário e redimensiona de volta para 1080×1350
  // Sem o resize, a imagem ficaria 1350×1080 (landscape) e o card faria zoom pra preencher
  const rotated = await sharp(raw)
    .rotate(90)
    .resize({ width: 2160, height: 2160, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84 })
    .toBuffer();

  // 3. Novo nome de arquivo (remove sufixo _r antigo, adiciona novo) → invalida CDN
  const oldName = url.split("/").pop()?.split("?")[0] || "foto.jpg";
  const base = oldName.replace(/\.[^.]+$/, "").replace(/_r[a-z0-9]+$/, "");
  const ts = Date.now().toString(36);
  const newName = `${base}_r${ts}.jpg`;

  // 4. Salva (saveLibraryAsset lida com Supabase e filesystem local)
  const newUrl = await saveLibraryAsset(category, newName, rotated, "image/jpeg");

  // 5. Atualiza catálogo (troca URL antiga pela nova)
  const c = await getCatalog();
  const key = slugKey(category);
  if (c.images[key]) {
    c.images[key] = c.images[key].map((u) => (u === url ? newUrl : u));
    await writeCatalog(c);
  }

  // 6. Remove arquivo antigo (sem bloquear em caso de erro)
  deleteLibraryAsset(url).catch(() => {});

  return newUrl;
}

async function deleteLibraryAsset(url: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      const u = new URL(url);
      const needle = `/storage/v1/object/public/${LIBRARY_BUCKET}/`;
      const idx = u.pathname.indexOf(needle);
      if (idx >= 0) {
        const objectPath = decodeURIComponent(u.pathname.slice(idx + needle.length));
        if (objectPath) await sb.storage.from(LIBRARY_BUCKET).remove([objectPath]);
        return;
      }
    } catch {}
  }
  if (url.startsWith("/library/")) {
    try { await fs.unlink(path.join(process.cwd(), "public", url.replace(/^\//, ""))); } catch {}
  }
}
