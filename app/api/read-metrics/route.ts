import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

const PROMPT = `Esta imagem é um print das métricas (Insights) de um post do Instagram, em português.
Extraia os números e devolva APENAS um JSON, sem markdown, com estas chaves (TODAS opcionais — inclua só o que realmente aparecer na imagem):
{"alcance": int, "salvamentos": int, "compartilhamentos": int, "comentarios": int, "curtidas": int, "visitasPerfil": int, "seguidores": int, "dms": int, "vendas": int}

Regras:
- Converta formatos para inteiro: "1.234" -> 1234 ; "1,2 mil" ou "1.2K" -> 1200 ; "12,5 mil" -> 12500.
- "Contas alcançadas" = alcance. "Visitas ao perfil" = visitasPerfil. "Novos seguidores"/"Seguidores" = seguidores.
- "Interações com mensagens"/"DMs" = dms. Curtidas, comentários, compartilhamentos, salvamentos pelos nomes.
- Se uma métrica não estiver visível, NÃO inclua a chave (não chute).
- Responda só o JSON.`;

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "manda a imagem do print" }, { status: 400 });

  const raw = Buffer.from(await file.arrayBuffer());
  let b64: string;
  let mediaType: "image/jpeg" | "image/png" = "image/jpeg";
  try {
    b64 = (await sharp(raw).resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()).toString("base64");
  } catch {
    b64 = raw.toString("base64");
    mediaType = file.type.includes("png") ? "image/png" : "image/jpeg";
  }

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
          { type: "text", text: PROMPT },
        ],
      }],
    });
    const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("");
    const jsonStr = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const metrics = JSON.parse(jsonStr);
    // só números válidos
    const clean: Record<string, number> = {};
    for (const [k, v] of Object.entries(metrics)) {
      const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d]/g, ""));
      if (Number.isFinite(n) && n >= 0) clean[k] = n;
    }
    return Response.json({ metrics: clean });
  } catch (e) {
    return Response.json({ error: "Não consegui ler o print: " + (e instanceof Error ? e.message : String(e)) }, { status: 500 });
  }
}
