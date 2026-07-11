// A IA analisa os insights do Instagram com o cérebro do Cândido e sugere melhorias.
import Anthropic from "@anthropic-ai/sdk";
import { textOf } from "@/lib/llm";
import type { IgSnapshot } from "@/lib/instagram";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_CARDS_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

function resumoPosts(snap: IgSnapshot): string {
  const rows = (snap.media || []).map((m, i) => {
    const eng = (m.likes || 0) + (m.comments || 0) + (m.saved || 0) + (m.shares || 0);
    const tipo = m.productType || m.mediaType || "post";
    const cap = (m.caption || "").replace(/\s+/g, " ").slice(0, 90);
    const data = m.timestamp ? m.timestamp.slice(0, 10) : "";
    return `${i + 1}. [${tipo}] ${data} · alcance ${m.reach ?? "?"} · likes ${m.likes} · coment ${m.comments} · salvos ${m.saved ?? "?"} · compart ${m.shares ?? "?"}${m.views != null ? ` · views ${m.views}` : ""} · eng ${eng} — "${cap}"`;
  });
  return rows.join("\n");
}

export async function POST() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const { getIgSnapshot, setIgAnalysis, getAudience, getEdge, getStoryLearnings } = await import("@/lib/store");
  const snap = (await getIgSnapshot()) as IgSnapshot | null;
  if (!snap?.media?.length) return Response.json({ error: "Atualize os insights primeiro." }, { status: 400 });

  const [aud, edg] = await Promise.all([getAudience(), getEdge()]);
  const learn = await getStoryLearnings().catch(() => null);

  const userMsg = `Você é o estrategista de conteúdo do Cândido Netto (treinador, treino feminino / glúteo, consultoria N² Squad).
Analise os dados REAIS do Instagram dele e devolva um diagnóstico prático e direto, na língua dele (sem coachismo, sem enrolação).

PÚBLICO: ${aud}
ARESTA/CARA DA MARCA: ${edg}
${learn?.summary ? `\nJÁ APRENDIDO DOS STORIES:\n${learn.summary.slice(0, 600)}` : ""}

PERFIL AGORA:
- @${snap.username || "?"}
- Seguidores: ${snap.followers ?? "?"}
- Posts publicados: ${snap.mediaCount ?? "?"}
- Alcance somado dos últimos posts: ${snap.reachTotal ?? "?"}

ÚLTIMOS POSTS (mais recente primeiro):
${resumoPosts(snap)}

TAREFA: entrega uma análise em tópicos curtos, SEM travessão longo, cobrindo:
1. O QUE ESTÁ FUNCIONANDO — formatos/temas/ganchos com melhor alcance e engajamento (cita os posts).
2. O QUE NÃO ESTÁ — o que teve baixa performance e por quê.
3. PADRÕES — reels vs carrossel vs foto, horários/dias se der pra ver, salvamentos e compartilhamentos (sinais fortes).
4. 5 AÇÕES PRÁTICAS pra próxima semana — específicas pro conteúdo dele, não genéricas.
5. IDEIAS DE POST que surfam o que já performou (3 a 5 temas concretos).

Escreve como quem entende de verdade, direto ao ponto, frases curtas. Markdown simples (títulos com **, listas com -).`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL, max_tokens: 2500,
      messages: [{ role: "user", content: userMsg }],
    });
    const summary = textOf(res).trim();
    const analysis = { updatedAt: new Date().toISOString(), summary };
    await setIgAnalysis(analysis);
    return Response.json({ analysis });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function GET() {
  const { getIgAnalysis } = await import("@/lib/store");
  const analysis = await getIgAnalysis();
  return Response.json({ analysis });
}
