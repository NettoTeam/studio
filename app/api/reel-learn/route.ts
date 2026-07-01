import Anthropic from "@anthropic-ai/sdk";
import { listReelIdeas, setReelLearnings, getReelLearnings } from "@/lib/store";
import { textOf } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_STORIES_MODEL || "claude-sonnet-4-6";

export async function GET() {
  const learnings = await getReelLearnings();
  return Response.json({ learnings });
}

export async function POST() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const ideas = await listReelIdeas();
  const relevant = ideas.filter(i => i.isBase || i.feedback || i.engajamento || i.stage === "publicado");
  if (relevant.length < 2) return Response.json({ error: "Salva pelo menos 2 reels com feedback ou marca como base pra eu aprender." }, { status: 400 });

  const sample = relevant.slice(0, 40).map(i =>
    `[${i.formato}] "${i.titulo}" | ${i.isBase ? "BASE " : ""}stage:${i.stage}\nDescrição: ${i.descricao}\nAngulo: ${i.angulo}\nFeedback: ${i.feedback || "-"} | Engajamento: ${i.engajamento || "-"}`
  ).join("\n\n");

  const anthropic = new Anthropic({ apiKey: key });
  const res = await anthropic.messages.create({
    model: MODEL, max_tokens: 1200,
    messages: [{
      role: "user",
      content: `Analisa estes reels do Cândido Netto (@teamnetto · @n2squad) e extrai padrões que funcionaram:\n\n${sample}\n\nRetorna um parágrafo conciso (máx 900 chars) com: quais formatos performam melhor, quais temas geram mais engajamento, padrões de ângulo/gancho que funcionam, o que evitar. Escreve como instrução direta pro gerador de ideias futuras.`
    }],
  });

  const summary = textOf(res).trim().slice(0, 1000);
  const l = { updatedAt: new Date().toISOString(), n: relevant.length, summary };
  await setReelLearnings(l);
  return Response.json({ learnings: l });
}
