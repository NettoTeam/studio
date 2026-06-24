import { sentimentKeys, imagesFor, imagesForCategory, overlayImages, listLibrary, createCategory, deleteCategory, addImagesToCategory, removeImageFromCategory, renameCategory, slugKey } from "@/lib/catalog";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("all")) return Response.json({ library: await listLibrary() });
  if (searchParams.get("overlays")) return Response.json({ images: await overlayImages() });
  const cat = searchParams.get("category");
  if (cat) return Response.json({ images: await imagesForCategory(cat) });
  const key = searchParams.get("sentiment");
  if (key) return Response.json({ images: await imagesFor(key) });
  return Response.json({ sentiments: await sentimentKeys() });
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
    const dir = path.join(process.cwd(), "public", "library", category);
    await fs.mkdir(dir, { recursive: true });
    const isOverlay = category === "overlays"; // overlays = PNG (preserva transparência); fundos = JPG
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const raw = Buffer.from(await files[i].arrayBuffer());
      const name = `${category}-${Date.now().toString(36)}${i}${Math.random().toString(36).slice(2, 5)}.${isOverlay ? "png" : "jpg"}`;
      const dest = path.join(dir, name);
      try {
        const img = sharp(raw).rotate().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true });
        await (isOverlay ? img.png() : img.jpeg({ quality: 82 })).toFile(dest);
      } catch {
        await fs.writeFile(dest, raw);
      }
      urls.push(`/library/${category}/${name}`);
    }
    await addImagesToCategory(category, urls);
    return Response.json({ urls });
  }

  // ações JSON (criar / renomear / apagar categoria)
  const body = (await req.json().catch(() => ({}))) as { action?: string; name?: string; from?: string };
  if (body.action === "create" && body.name) { const k = await createCategory(body.name); return Response.json({ ok: !!k, key: k }); }
  if (body.action === "rename" && body.from && body.name) { return Response.json(await renameCategory(body.from, body.name)); }
  if (body.action === "delete" && body.name) { await deleteCategory(body.name); return Response.json({ ok: true }); }
  return Response.json({ error: "ação inválida" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const image = searchParams.get("image");
  if (category && image) {
    await removeImageFromCategory(category, image);
    try { await fs.unlink(path.join(process.cwd(), "public", image.replace(/^\//, ""))); } catch {}
    return Response.json({ ok: true });
  }
  if (category) { await deleteCategory(category); return Response.json({ ok: true }); }
  return Response.json({ error: "faltam parâmetros" }, { status: 400 });
}
