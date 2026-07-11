// Plano B: lê prints dos Insights do Instagram (visão) + análise da IA.
// Não precisa da API da Meta — o Cândido sobe as imagens e a IA analisa.
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";
import { textOf } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_CARDS_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

type ImgBlock = { type: "image"; source: { type: "base64"; media_type: "image/jpeg" | "image/png"; data: string } };

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: "Manda pelo menos um print dos Insights." }, { status: 400 });

  const imgs: ImgBlock[] = [];
  for (const file of files.slice(0, 8)) {
    const raw = Buffer.from(await file.arrayBuffer());
    try {
      const b64 = (await sharp(raw).resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()).toString("base64");
      imgs.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } });
    } catch {
      imgs.push({ type: "image", source: { type: "base64", media_type: file.type.includes("png") ? "image/png" : "image/jpeg", data: raw.toString("base64") } });
    }
  }

  const { getAudience, getEdge, getStoryLearnings, setIgAnalysis } = await import("@/lib/store");
  const [aud, edg] = await Promise.all([getAudience(), getEdge()]);
  const learn = await getStoryLearnings().catch(() => null);

  const prompt = `Estas imagens são prints dos Insights do Instagram do Cândido Netto (treinador, treino feminino / glúteo, consultoria N² Squad), em português.

Primeiro LEIA os números que aparecerem (contas alcançadas, seguidores, visitas ao perfil, engajamento, curtidas, comentários, salvamentos, compartilhamentos, melhores horários, posts que mais performaram, etc.).

Depois entrega uma ANÁLISE prática e direta, na língua dele (sem coachismo, sem enrolação, sem travessão longo):

PÚBLICO: ${aud}
ARESTA/CARA DA MARCA: ${edg}
${learn?.summary ? `\nJÁ APRENDIDO DOS STORIES:\n${learn.summary.slice(0, 500)}` : ""}

Cobre em tópicos curtos (markdown simples, títulos com ** e listas com -):
1. **O que os números dizem** — resumo do que você conseguiu ler dos prints.
2. **O que está funcionando** — formatos/temas/posts com melhor performance.
3. **O que melhorar** — o que está fraco e por quê.
4. **5 ações práticas** pra próxima semana — específicas pro conteúdo dele.
5. **Ideias de post** que surfam o que já performou (3 a 5 temas concretos).

Se algum número não der pra ler, diz o que faltou em vez de inventar.`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL, max_tokens: 2500,
      messages: [{ role: "user", content: [...imgs, { type: "text", text: prompt }] }],
    });
    const summary = textOf(res).trim();
    const analysis = { updatedAt: new Date().toISOString(), summary };
    await setIgAnalysis(analysis);
    return Response.json({ analysis });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
