// Analisa os story posts com feedback/engajamento e extrai padrões pra guiar gerações futuras.
import Anthropic from "@anthropic-ai/sdk";
import { listStoryPosts, setStoryLearnings, getStoryLearnings } from "@/lib/store";
import { textOf } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_LEARN_MODEL || "claude-sonnet-4-6";

const SYS = `Você analisa stories do Instagram do Cândido Netto (Team Netto / N² Squad, consultoria fitness feminina) para extrair padrões de conteúdo que funcionam ou não.

Você recebe posts de stories com:
- Conteúdo dos frames (texto, tipo câmera/tela, figurinhas)
- Se foi salvo como "base" (o Cândido achou bom)
- Feedback qualitativo escrito pelo Cândido
- Engajamento observado (livre, ex: "5 DMs", "muita caixinha")
- Stage (publicado / arquivado = descartado)

REGRAS:
- Com poucos dados: seja HONESTO — diga "hipótese fraca, precisa de mais posts"
- Compare o que funcionou (base=true, feedback positivo, engajamento forte) vs o que não funcionou (arquivado, feedback negativo)
- Foque em padrões ACIONÁVEIS: tipo de abertura, tom, quando usar enquete, quando ir direto ao ponto, que tipo de insight cola
- Resposta em bullets curtos, português, sem enrolação
- No final: 1-2 REGRAS DIRETAS pra incorporar na geração ("sempre que...", "nunca...")`;

export async function GET() {
  return Response.json({ learnings: await getStoryLearnings() });
}

export async function POST() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Sem ANTHROPIC_API_KEY." }, { status: 500 });

  const posts = await listStoryPosts();
  const comDados = posts.filter(p => p.feedback || p.engajamento || p.isBase || p.stage === "arquivado" || p.stage === "publicado");

  if (comDados.length < 2) {
    const l = { updatedAt: new Date().toISOString(), n: comDados.length, summary: `Ainda poucos stories com dados (${comDados.length}). Continue postando e adicionando feedback — de umas 3–5 entradas eu começo a achar padrão confiável.` };
    await setStoryLearnings(l);
    return Response.json({ learnings: l });
  }

  const dataset = comDados.map(p => ({
    titulo: p.titulo,
    periodo: p.periodo || "avulso",
    stage: p.stage,
    isBase: p.isBase || false,
    nFrames: p.frames.length,
    tiposFrames: p.frames.map(f => f.tipo || "camera"),
    textosResumidos: p.frames.map(f => (f.texto || "").slice(0, 80)),
    temFigurinha: p.frames.some(f => f.figurinha?.tipo && f.figurinha.tipo !== "nenhuma"),
    feedback: p.feedback || null,
    engajamento: p.engajamento || null,
  }));

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL, max_tokens: 1000,
      system: SYS,
      messages: [{ role: "user", content: `Stories analisados (${comDados.length}):\n\n${JSON.stringify(dataset, null, 2)}\n\nExtraia padrões.` }],
    });
    const summary = textOf(res).trim();
    const l = { updatedAt: new Date().toISOString(), n: comDados.length, summary };
    await setStoryLearnings(l);
    return Response.json({ learnings: l });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
