import Anthropic from "@anthropic-ai/sdk";
import { listPosts, setLearnings } from "@/lib/store";
import { performanceScores } from "@/lib/score";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_LEARN_MODEL || "claude-sonnet-4-6";

const SYS = `Você é analista de performance de conteúdo da Team Netto / N² Squad (treinador Cândido Netto, consultoria fitness feminina, foco em glúteo). Recebe os carrosséis postados com a NOTA de desempenho de cada um e extrai PADRÕES VALIDADOS — o que faz um post ser bom pra ESTE público.

COMO LER A NOTA (0–100): é um composto EQUILIBRADO, tudo relativo ao alcance — QUALIDADE (salvar/compartilhar/comentar) + CRESCIMENTO (visita ao perfil/seguidor novo) + NEGÓCIO (DM/venda). Não é só salvamento. Curtida não entra (sinal fraco). A nota é RELATIVA aos posts do próprio Cândido (100 = o melhor dele até agora).

REGRAS DURAS:
- HONESTIDADE DE AMOSTRA acima de tudo. Com menos de ~5 posts medidos, isto é HIPÓTESE FRACA — diga isso explicitamente e NÃO crave lei. Não invente padrão onde só há ruído. É melhor dizer "ainda não dá pra afirmar" do que chutar.
- Não confunda CAUSA com COINCIDÊNCIA. Um padrão só conta se aparecer em vários posts e na MESMA direção. Diferença de 1 post não é padrão.
- Compare CAMPEÕES (nota alta) × FRACASSOS (nota baixa + os "arquivado", que o Cândido DESCARTOU = exemplo do que EVITAR). Aponte o que os separa.
- Olhe: registro/tom, tipo de gancho (capa), sequência de layouts, sentimentos de imagem, tema, presença de overlay/dado/bullets — e como cada um se relaciona com a NOTA e com CADA grupo (o que puxa salvamento? o que puxa seguidor? o que puxa DM/venda?).
- O FEEDBACK escrito do Cândido vale TANTO quanto os números, principalmente com amostra pequena — leve a sério.
- Saída: regras CURTAS e ACIONÁVEIS (bullets) que vão direto pro prompt de geração. Marque o que é HIPÓTESE (fraca) vs o que já dá pra confiar. Sem enrolação. Português, pegada direta.`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { ack?: boolean };
  if (body.ack) {
    const { ackLearnings } = await import("@/lib/store");
    return Response.json({ learnings: await ackLearnings() });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Sem ANTHROPIC_API_KEY." }, { status: 500 });

  const posts = (await listPosts()).filter((p) => (p.metrics && (p.metrics.alcance || p.metrics.salvamentos)) || !!p.feedback || p.stage === "arquivado" || p.stage === "publicado");
  if (posts.length < 2) {
    const l = { updatedAt: new Date().toISOString(), n: posts.length, summary: `Ainda há poucos posts com dados (${posts.length}). Continue logando métricas e feedback — de ~5 medições eu começo a achar padrão confiável.` };
    await setLearnings(l);
    return Response.json({ learnings: l });
  }

  // dataset compacto (estrutura + nota + números, sem imagens) — barato em tokens
  const scores = performanceScores(posts);
  const dataset = posts
    .sort((a, b) => (scores[b.id] ?? -1) - (scores[a.id] ?? -1))
    .map((p) => ({
      tema: p.tema,
      nota: scores[p.id],            // 0–100 (composto) — null = sem dados
      registro: p.registro,
      gancho: p.carousel.cards[0]?.headline,
      layouts: p.carousel.cards.map((c) => c.layout),
      sentimentos: p.carousel.cards.map((c) => c.imageSentiment).filter(Boolean),
      usou_overlay: p.carousel.cards.some((c) => c.overlays && c.overlays.length),
      stage: p.stage,
      metrics: p.metrics,
      feedback: p.feedback,
    }));
  const nMed = Object.values(scores).filter((s) => s != null).length;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYS,
      messages: [{ role: "user", content: `Posts (${posts.length}, sendo ${nMed} COM nota/métricas), ordenados pela NOTA composta (100 = melhor):\n\n${JSON.stringify(dataset, null, 2)}` }],
    });
    const summary = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("").trim();
    const l = { updatedAt: new Date().toISOString(), n: posts.length, summary };
    await setLearnings(l);
    return Response.json({ learnings: l, usage: res.usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function GET() {
  const { getLearnings } = await import("@/lib/store");
  return Response.json({ learnings: await getLearnings() });
}
