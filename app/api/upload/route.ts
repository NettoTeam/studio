import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 30;

// Retorna a imagem como data URL (base64) — funciona no servidor sem disco e persiste no card.
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "sem arquivo" }, { status: 400 });

  const raw = Buffer.from(await file.arrayBuffer());
  const isPng = file.type.includes("png") || file.name.toLowerCase().endsWith(".png");
  const mime = isPng ? "image/png" : "image/jpeg";
  let b64: string;
  try {
    let img = sharp(raw).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true });
    img = isPng ? img.png() : img.jpeg({ quality: 82 });
    b64 = (await img.toBuffer()).toString("base64");
  } catch {
    b64 = raw.toString("base64"); // formato que o sharp não decodifica (ex: HEIC)
  }
  return Response.json({ src: `data:${mime};base64,${b64}` });
}
