// Gera ideias de Reels para o Cândido Netto — falado, conversa ou POV/trend.
import Anthropic from "@anthropic-ai/sdk";
import { REELS_SYSTEM, REELS_TRANSCRICOES } from "@/lib/reels";
import { GENERATION_RULES } from "@/lib/generation-rules";
import { textOf, pickRandom } from "@/lib/llm";
import { detectTells } from "@/lib/tells";
import { cleanGeneratedText } from "@/lib/generation-rules";
import { registroBlock } from "@/lib/vitals";

export const runtime = "nodejs";
export const maxDuration = 90;
const MODEL = process.env.ANTHROPIC_STORIES_MODEL || "claude-sonnet-4-6";

type ReelFormato = "falado" | "conversa" | "pov_trend";
type ReelIdea = {
  titulo: string;
  descricao: string;
  formato: ReelFormato;
  angulo: string;
  dicaGravacao: string;
  tags?: string[];
};

const FORMATO_LABEL: Record<ReelFormato, string> = {
  falado:    "falado (câmera direta, B-roll de exercícios na edição)",
  conversa:  "conversa (academia, demonstrando, natural)",
  pov_trend: "pov_trend (visual, legenda, trending)",
};

// Busca tendências reais no Exa para o formato POV/Trend
async function buscarTendencias(exaKey: string): Promise<string> {
  const recente = new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10); // últimos 45 dias

  const queries = [
    "trending fitness gym reels instagram format 2025",
    "viral gym tiktok POV trend bodybuilding 2025",
    "instagram reels tendência academia treino viral",
  ];

  const results: { title?: string; url?: string; text?: string }[] = [];

  await Promise.allSettled(queries.map(async (query) => {
    try {
      const r = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": exaKey },
        body: JSON.stringify({
          query, numResults: 3, type: "auto",
          startPublishedDate: recente,
          contents: { text: { maxCharacters: 300 } },
        }),
      });
      if (!r.ok) return;
      const d = await r.json();
      results.push(...((d.results || []) as typeof results));
    } catch {}
  }));

  if (!results.length) return "";

  const snippets = results
    .filter(r => r.title || r.text)
    .slice(0, 8)
    .map(r => `• ${r.title || ""}${r.text ? ": " + r.text.slice(0, 180) : ""}`)
    .join("\n");

  return snippets
    ? `\n\nTENDÊNCIAS REAIS DO MOMENTO (busca web — últimos 45 dias):\n${snippets}\n\nUse essas referências para criar ideias de POV/Trend que se encaixam no que está bombando AGORA — adaptado pro universo do Cândido (glúteo, treino feminino, método, N2 Squad). Não copie, inspire-se no formato e no espírito da tendência.`
    : "";
}

function tryParse(text: string): { ideias?: ReelIdea[] } | null {
  let s = text.replace(/```json/gi, "").replace(/```/g, "");
  s = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
  const attempts = [s, s.replace(/[""„]/g, '\\"').replace(/['']/g, "'"), s.replace(/,\s*([}\]])/g, "$1")];
  for (const a of attempts) {
    try {
      const j = JSON.parse(a);
      if (Array.isArray(j.ideias) && j.ideias.length > 0) return j;
    } catch {}
  }
  return null;
}

function cleanIdea(idea: ReelIdea): ReelIdea {
  return {
    ...idea,
    titulo:       cleanGeneratedText(idea.titulo) || idea.titulo,
    descricao:    cleanGeneratedText(idea.descricao) || idea.descricao,
    angulo:       cleanGeneratedText(idea.angulo) || idea.angulo,
    dicaGravacao: cleanGeneratedText(idea.dicaGravacao) || idea.dicaGravacao,
  };
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as {
    nIdeas?: number;
    formatos?: ReelFormato[];
    contexto?: string;
    funil?: "topo" | "meio" | "fundo";
    registro?: string;
  };

  const nIdeas = Math.min(30, Math.max(5, Math.round(body.nIdeas || 15)));
  const formatos: ReelFormato[] = (body.formatos || ["falado", "conversa", "pov_trend"]).filter(
    (f): f is ReelFormato => ["falado", "conversa", "pov_trend"].includes(f)
  );
  if (formatos.length === 0) formatos.push("falado", "conversa", "pov_trend");
  const contexto = (body.contexto || "").trim();
  const funil = body.funil || null;
  const reg = body.registro || null;

  const { getAudience, getEdge, getBrainModel, getGold, getRejects, getReelLearnings } = await import("@/lib/store");
  const [aud, edg, model, gold, rejects, reelLearnings] = await Promise.all([
    getAudience(), getEdge(), getBrainModel(), getGold(), getRejects("voice"), getReelLearnings(),
  ]);

  const reguaBlock = `PÚBLICO-ALVO: ${aud}\n\nARESTA E CARA DO CÂNDIDO: ${edg}`;
  const histBlock = model.historia?.trim()
    ? `\n\nVIDA REAL DO CÂNDIDO (use SÓ quando couber — Nath, Chico, Simba, N2 Squad, Darkside; NUNCA invente):\n${model.historia.trim().slice(0, 2000)}`
    : "";
  const goldBlock = gold.length
    ? `\n\nVOZ DO CÂNDIDO (cadência e tom — imite sem copiar):\n${pickRandom(gold, 3).map(g => g.text).join("\n---\n")}`
    : "";
  const rejectBlock = rejects.length
    ? `\n\nFUGE DESSE PADRÃO (anti-ouro):\n${rejects.slice(0, 4).map(r => `✗ ${r.text}`).join("\n")}`
    : "";
  const learnBlock = reelLearnings?.summary
    ? `\n\nO QUE FUNCIONA NOS REELS DO CÂNDIDO (aprendido — aplique):\n${reelLearnings.summary.slice(0, 800)}`
    : "";
  const ctxBlock = contexto ? `\n\nCONTEXTO DO MOMENTO:\n${contexto}` : "";
  const tomBlock = registroBlock(reg);

  const FUNIL_DESC: Record<string, string> = {
    topo:  "TOPO DE FUNIL: ideias focadas em ALCANCE e DESCOBERTA. Gancho viral, curiosidade, contraintuição, temas amplos que atraem quem ainda não conhece o Cândido. Evita mencionar consultoria diretamente.",
    meio:  "MEIO DE FUNIL: ideias focadas em AUTORIDADE e EDUCAÇÃO. Profundidade técnica, método real, diferença que só quem é especialista vê. Audiência já conhece o Cândido — quer aprender mais.",
    fundo: "FUNDO DE FUNIL: ideias focadas em CONVERSÃO. Prova social (resultados de alunas), quebra de objeção, custo de não agir, CTA orgânico para a consultoria N2 Squad. Audiência está quase decidindo.",
  };
  const funilBlock = funil ? `\n\nETAPA DO FUNIL — OBRIGATÓRIO:\n${FUNIL_DESC[funil]}` : "";

  // Busca tendências reais quando POV/Trend está selecionado
  let trendBlock = "";
  const exaKey = process.env.EXA_API_KEY;
  if (formatos.includes("pov_trend") && exaKey && exaKey !== "SEU_VALOR_AQUI") {
    trendBlock = await buscarTendencias(exaKey);
  }

  const formatosStr = formatos.map(f => FORMATO_LABEL[f]).join(", ");
  const distribuicao = formatos.length === 1
    ? `Todas as ${nIdeas} ideias devem ser no formato "${formatos[0]}".`
    : `Distribui as ${nIdeas} ideias de forma equilibrada entre os formatos solicitados: ${formatos.join(", ")}.`;

  const userMsg = `${GENERATION_RULES}

${reguaBlock}${histBlock}${learnBlock}${goldBlock}${rejectBlock}${ctxBlock}${funilBlock}${tomBlock}

${REELS_TRANSCRICOES}${trendBlock}

═══════════════════════════════════════════
FORMATOS PARA ESTA GERAÇÃO: ${formatosStr}
${distribuicao}
═══════════════════════════════════════════

TAREFA: gera EXATAMENTE ${nIdeas} ideias de Reel para o Instagram do Cândido Netto.
Cada ideia é um TEMA e ÂNGULO específico — não um roteiro. O Cândido vai falar do jeito dele.

VARIEDADE TEMÁTICA (distribui entre elas — não pode repetir o mesmo assunto):
• Erro de execução de exercício específico (glúteo, posterior, quadríceps, ombro, etc.)
• Diferença entre exercícios parecidos que as alunas confundem
• Mito fitness que o mercado repete — com o porquê real
• Volume vs intensidade — um dos temas mais fortes do Cândido
• Por que mulheres têm medo de carga (e por que estão erradas)
• Bastidor da consultoria N2 Squad — como ele pensa, o que ele vê
• Prova social — resultado de aluna com o contexto técnico do porquê funcionou
• Progressão de carga — como fazer, por que importa mais que volume
• Técnica avançada no momento errado (desespero)
• Treino de "glúteo" que na verdade é treino de quadríceps
• Mentalidade: disciplina, constância, intensidade — no estilo darkside, sem clichê
• POV ou trend de treino com gancho visual forte

REGRAS:
- titulo: tema direto e forte (como ele falaria na academia, não título de slide)
- descricao: 2-3 frases do que vai ser dito/mostrado — conteúdo real, específico
- formato: exatamente "falado", "conversa" ou "pov_trend"
- angulo: o gancho ou ponto de virada único que torna este reel diferente dos outros sobre o mesmo tema
- dicaGravacao: instrução prática e específica pro formato escolhido (onde gravar, como enquadrar, o que mostrar, tom de fala)
- tags: 2-4 palavras-chave temáticas (ex: ["técnica", "glúteo", "progressão"])
- NUNCA use travessão longo nem hífen ornamental. Frases curtas.
- NUNCA genérico, nunca motivacional vazio. Cada ideia tem que ser específica e acionável.

Devolve APENAS este JSON válido:
{"ideias":[{"titulo":"string","descricao":"string","formato":"falado","angulo":"string","dicaGravacao":"string","tags":["string"]},...]}`

  const anthropic = new Anthropic({ apiKey: key });
  try {
    let parsed: { ideias?: ReelIdea[] } | null = null;
    let retryNote = "";
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      const res = await anthropic.messages.create({
        model: MODEL, max_tokens: 6000,
        system: [{ type: "text", text: REELS_SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: userMsg + retryNote }],
      });
      const cand = tryParse(textOf(res)) as { ideias?: ReelIdea[] } | null;
      if (!cand) {
        retryNote = `\n\nATENÇÃO: JSON inválido. Devolve JSON ESTRITAMENTE VÁLIDO com exatamente ${nIdeas} ideias.`;
        continue;
      }
      const blob = (cand.ideias || []).map(i => `${i.titulo} ${i.descricao} ${i.angulo}`).join("\n");
      const tells = detectTells(blob);
      if (tells.length && attempt < 2) {
        retryNote = `\n\nATENÇÃO: texto genérico/IA detectado (${tells.slice(0, 3).join(" | ")}). Refaz mais Cândido, mais específico, sem clichê.`;
        continue;
      }
      parsed = { ideias: (cand.ideias || []).map(i => cleanIdea(i as ReelIdea)) };
    }
    if (!parsed?.ideias?.length) throw new Error("Não consegui gerar as ideias. Tenta de novo.");
    return Response.json({ ideias: parsed.ideias });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
