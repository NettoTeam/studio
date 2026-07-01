import { sentimentKeys, imagesFor, imagesForCategory, overlayImages, listLibrary, createCategory, deleteCategory, addImagesToCategory, removeImageFromCategory, renameCategory, saveLibraryAsset, slugKey, rotateLibraryAsset, repairCategory, relinkCategory } from "@/lib/catalog";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

const PHOTO_WIDTH = 1080;
const PHOTO_HEIGHT = 1350;
const LIBRARY_PHOTO_QUALITY = 84;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("all")) return Response.json({ library: await listLibrary() });
  if (searchParams.get("overlays")) return Response.json({ images: await overlayImages() });
  if (searchParams.get("scan")) return Response.json(await scanBucket());
  const fixlink = searchParams.get("fixlink");
  const fixfrom = searchParams.get("from");
  if (fixlink && fixfrom) {
    try { const urls = await relinkCategory(fixfrom, fixlink); return Response.json({ ok: true, count: urls.length }); }
    catch (e) { return Response.json({ error: e instanceof Error ? e.message : "erro" }, { status: 500 }); }
  }
  const cat = searchParams.get("category");
  if (cat) return Response.json({ images: await imagesForCategory(cat) });
  const key = searchParams.get("sentiment");
  if (key) return Response.json({ images: await imagesFor(key) });
  return Response.json({ sentiments: await sentimentKeys() });
}


async function scanBucket() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
  if (!url || !key) return { error: "Supabase não configurado", folders: [] };
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const bucket = process.env.SUPABASE_LIBRARY_BUCKET || "library-assets";
  const { data: folders, error } = await sb.storage.from(bucket).list("", { limit: 200 });
  if (error) return { error: error.message, folders: [] };
  const result: { folder: string; count: number; sample: string[] }[] = [];
  for (const f of folders || []) {
    if (!f.name) continue;
    const { data: files } = await sb.storage.from(bucket).list(f.name, { limit: 5 });
    result.push({
      folder: f.name,
      count: files?.length ?? 0,
      sample: (files || []).slice(0, 2).map((img) => sb.storage.from(bucket).getPublicUrl(`${f.name}/${img.name}`).data.publicUrl),
    });
  }
  return { folders: result };
}

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";

  // upload de UMA ou VÁRIAS imagens (multipart) pra uma categoria — tudo numa gravação só
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    const category = slugKey(String(form.get("category") || ""));
    if (!files.length) return Response.json({ error: "sem arquivo" }, { status: 400 });
    if (!category) return Response.json({ error: "sem categoria" }, { status: 400 });
    const isOverlay = category === "overlays"; // overlays = PNG (preserva transparência); fundos = JPG
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const raw = Buffer.from(await files[i].arrayBuffer());
      const name = `${category}-${Date.now().toString(36)}${i}${Math.random().toString(36).slice(2, 5)}.${isOverlay ? "png" : "jpg"}`;
      let out: Uint8Array = raw;
      try {
        const img = isOverlay
          ? sharp(raw).rotate().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).png()
          : sharp(raw).rotate().resize({ width: 2160, height: 2160, fit: "inside", withoutEnlargement: true }).jpeg({ quality: LIBRARY_PHOTO_QUALITY });
        out = await img.toBuffer();
      } catch {}
      urls.push(await saveLibraryAsset(category, name, out, isOverlay ? "image/png" : "image/jpeg"));
    }
    await addImagesToCategory(category, urls);
    return Response.json({ urls });
  }

  // ações JSON (criar / renomear / apagar / reparar categoria)
  const body = (await req.json().catch(() => ({}))) as { action?: string; name?: string; from?: string };
  if (body.action === "create" && body.name) { const k = await createCategory(body.name); return Response.json({ ok: !!k, key: k }); }
  if (body.action === "rename" && body.from && body.name) { return Response.json(await renameCategory(body.from, body.name)); }
  if (body.action === "delete" && body.name) { await deleteCategory(body.name); return Response.json({ ok: true }); }
  if (body.action === "repair" && body.name) {
    try { const urls = await repairCategory(body.name); return Response.json({ ok: true, count: urls.length, urls }); }
    catch (e) { return Response.json({ error: e instanceof Error ? e.message : "erro ao reparar" }, { status: 500 }); }
  }
  return Response.json({ error: "ação inválida" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const image = searchParams.get("image");
  const category = searchParams.get("category");
  if (!image || !category) return Response.json({ error: "faltam parâmetros" }, { status: 400 });
  try {
    const newUrl = await rotateLibraryAsset(category, image);
    return Response.json({ ok: true, newUrl });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "erro ao girar" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const image = searchParams.get("image");
  if (category && image) {
    await removeImageFromCategory(category, image);
    return Response.json({ ok: true });
  }
  if (category) { await deleteCategory(category); return Response.json({ ok: true }); }
  return Response.json({ error: "faltam parâmetros" }, { status: 400 });
}
