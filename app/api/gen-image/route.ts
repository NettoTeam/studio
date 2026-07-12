// Gera fundo/imagem para os cards com o gpt-image-1 (OpenAI) — o mais fiel ao prompt.
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 120;
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

// dá pra pedir fundo com uma "cara" — o app injeta um norte de marca no prompt do usuário
const BRAND_HINT = "Fundo para post de Instagram de marca fitness premium, estética escura, sofisticada, alto contraste, com espaço negativo pra caber texto por cima. Sem letras, sem palavras, sem logos na imagem.";

const SIZE_MAP: Record<string, string> = {
  retrato: "1024x1536",
  quadrado: "1024x1024",
  paisagem: "1536x1024",
};

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "OPENAI_API_KEY não configurada. Adicione a chave da OpenAI no .env.local e no Vercel." }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { prompt?: string; formato?: string; marca?: boolean };
  const prompt = (body.prompt || "").trim();
  if (prompt.length < 4) return Response.json({ error: "Descreve o fundo que você quer." }, { status: 400 });

  const size = SIZE_MAP[body.formato || "retrato"] || SIZE_MAP.retrato;
  const finalPrompt = body.marca === false ? prompt : `${prompt}\n\n${BRAND_HINT}`;

  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: finalPrompt,
        size,
        n: 1,
        quality: body.marca === false ? "medium" : "high",
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || `OpenAI imagem erro (${r.status})`);
    const b64 = d.data?.[0]?.b64_json;
    if (!b64) throw new Error("A imagem veio vazia. Tenta de novo.");

    // recomprime pra caber leve no card (data URL persiste no post)
    let out = b64;
    let mime = "image/png";
    try {
      const jpg = await sharp(Buffer.from(b64, "base64")).jpeg({ quality: 88 }).toBuffer();
      out = jpg.toString("base64");
      mime = "image/jpeg";
    } catch { /* mantém png se o sharp falhar */ }

    return Response.json({ src: `data:${mime};base64,${out}` });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
