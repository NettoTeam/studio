// Aprende com os posts CAMPEÕES do Instagram: rankeia por performance real,
// extrai o padrão do que funciona e guarda como aprendizado que alimenta a geração.
import Anthropic from "@anthropic-ai/sdk";
import { textOf } from "@/lib/llm";
import type { IgSnapshot, IgMedia } from "@/lib/instagram";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_CARDS_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

// nota de performance: alcance é a base; salvos e compartilhamentos pesam mais (sinal forte)
function score(m: IgMedia): number {
  const reach = m.reach || 0;
  const saves = m.saved || 0;
  const shares = m.shares || 0;
  const eng = (m.likes || 0) + (m.comments || 0) + saves + shares;
  const engRate = reach > 0 ? eng / reach : 0;
  return reach + saves * 15 + shares * 20 + engRate * 5000;
}

export async function GET() {
  const { getWinnerLearnings } = await import("@/lib/store");
  const learnings = await getWinnerLearnings();
  return Response.json({ learnings });
}

export async function POST() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada (precisa de crédito na Anthropic)." }, { status: 400 });

  const { getIgSnapshot, getAudience, getEdge, setWinnerLearnings } = await import("@/lib/store");
  const snap = (await getIgSnapshot()) as IgSnapshot | null;
  if (!snap?.media?.length) return Response.json({ error: "Atualize os insights do Instagram primeiro (aba Perfil)." }, { status: 400 });

  const [aud, edg] = await Promise.all([getAudience(), getEdge()]);

  const ranked = [...snap.media].sort((a, b) => score(b) - score(a));
  const top = ranked.slice(0, Math.min(8, ranked.length));
  const bottom = ranked.slice(-Math.min(5, ranked.length)).reverse();

  const fmt = (m: IgMedia) => {
    const tipo = m.productType || m.mediaType || "post";
    const cap = (m.caption || "").replace(/\s+/g, " ").slice(0, 110);
    return `[${tipo}] alcance ${m.reach ?? "?"} · salvos ${m.saved ?? "?"} · compart ${m.shares ?? "?"} · likes ${m.likes} · coment ${m.comments}${m.views != null ? ` · views ${m.views}` : ""} — "${cap}"`;
  };

  const userMsg = `Você é o estrategista do Cândido Netto (treino feminino / glúteo, consultoria N² Squad). Analise os dados REAIS do Instagram dele e extraia o PADRÃO do que funciona, pra alimentar a criação de conteúdo.

PÚBLICO: ${aud}
CARA DA MARCA: ${edg}

POSTS QUE MAIS PERFORMARAM (campeões, ordenados):
${top.map((m, i) => `${i + 1}. ${fmt(m)}`).join("\n")}

POSTS QUE MENOS PERFORMARAM:
${bottom.map((m, i) => `${i + 1}. ${fmt(m)}`).join("\n")}

TAREFA: escreve um resumo OBJETIVO e ACIONÁVEL (máx 400 palavras, sem travessão longo, markdown simples) que será injetado nas próximas gerações de carrossel/reel/stories pra IA acertar mais. Cobre:
- FORMATOS que funcionam (reels vs carrossel vs foto) — o que priorizar
- TEMAS e ÂNGULOS campeões — o que a audiência dele mais salva e compartilha
- GANCHOS que pararam o dedo (baseado nos que bombaram)
- O que EVITAR (padrão dos que performaram mal)
- Regras práticas: "faça mais X", "evite Y"

Escreve direto, como instrução pra outra IA seguir. Nada de encher linguiça.`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL, max_tokens: 1500,
      messages: [{ role: "user", content: userMsg }],
    });
    const summary = textOf(res).trim();
    const learnings = { updatedAt: new Date().toISOString(), n: snap.media.length, summary };
    await setWinnerLearnings(learnings);
    return Response.json({ learnings });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
