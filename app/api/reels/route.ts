// Gera ideias de Reels para o Cândido Netto — falado, conversa ou POV/trend.
import Anthropic from "@anthropic-ai/sdk";
import { REELS_SYSTEM, REELS_TRANSCRICOES } from "@/lib/reels";
import { GENERATION_RULES } from "@/lib/generation-rules";
import { textOf, pickRandom } from "@/lib/llm";
import { cleanGeneratedText } from "@/lib/generation-rules";
import { registroBlock } from "@/lib/vitals";

export const runtime = "nodejs";
export const maxDuration = 90;
const MODEL = process.env.ANTHROPIC_CARDS_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

type ReelFormato = "falado" | "conversa" | "pov_trend";
type Batch = {
  n: number;
  formatos: ReelFormato[];
  focus: string;
};
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
const VALID_FORMATOS: ReelFormato[] = ["falado", "conversa", "pov_trend"];
const BATCH_SIZE = 10;
const BATCH_CONCURRENCY = 3;
const BATCH_FOCUS = [
  "execução e biomecânica aplicada",
  "mitos, crenças erradas e opinião forte",
  "progressão, método e bastidor da consultoria",
  "prova social, objeções e decisão",
];

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

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanIdea(idea: Partial<ReelIdea>, fallbackFormato: ReelFormato): ReelIdea | null {
  const formato = VALID_FORMATOS.includes(idea.formato as ReelFormato) ? (idea.formato as ReelFormato) : fallbackFormato;
  const titulo = cleanGeneratedText(cleanString(idea.titulo)) || cleanString(idea.titulo);
  const descricao = cleanGeneratedText(cleanString(idea.descricao)) || cleanString(idea.descricao);
  const angulo = cleanGeneratedText(cleanString(idea.angulo)) || cleanString(idea.angulo);
  const dicaGravacao = cleanGeneratedText(cleanString(idea.dicaGravacao)) || cleanString(idea.dicaGravacao);
  if (!titulo || !descricao || !angulo || !dicaGravacao) return null;

  return {
    titulo,
    descricao,
    formato,
    angulo,
    dicaGravacao,
    tags: Array.isArray(idea.tags) ? idea.tags.map(cleanString).filter(Boolean).slice(0, 4) : [],
  };
}

function batchesFor(nIdeas: number, formatos: ReelFormato[]): Batch[] {
  if (nIdeas <= BATCH_SIZE) {
    return [{ n: nIdeas, formatos, focus: BATCH_FOCUS[0] }];
  }

  const counts = formatos.map((formato, idx) => ({
    formato,
    n: Math.floor(nIdeas / formatos.length) + (idx < nIdeas % formatos.length ? 1 : 0),
  }));

  const batches: Batch[] = [];
  for (const { formato, n } of counts) {
    let left = n;
    while (left > 0) {
      const batchN = Math.min(BATCH_SIZE, left);
      batches.push({
        n: batchN,
        formatos: [formato],
        focus: BATCH_FOCUS[batches.length % BATCH_FOCUS.length],
      });
      left -= batchN;
    }
  }
  return batches;
}

async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      try {
        results[index] = { status: "fulfilled", value: await fn(items[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function uniqueIdeas(ideas: ReelIdea[], limit: number): ReelIdea[] {
  const seen = new Set<string>();
  const out: ReelIdea[] = [];
  for (const idea of ideas) {
    const key = `${idea.titulo} ${idea.angulo}`.toLowerCase().replace(/\s+/g, " ").slice(0, 220);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(idea);
    if (out.length >= limit) break;
  }
  return out;
}

function apiErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/string did not match the expected pattern/i.test(msg)) {
    return "A API recebeu algum campo fora do formato esperado. Ajustei a geração para validar os lotes antes de devolver.";
  }
  if (/timeout|aborted|fetch failed|network/i.test(msg)) {
    return "A geração demorou demais ou caiu no meio. Tenta novamente.";
  }
  return msg || "Erro ao gerar ideias.";
}

function buildUserMsg(args: {
  nIdeas: number;
  formatos: ReelFormato[];
  reguaBlock: string;
  histBlock: string;
  learnBlock: string;
  goldBlock: string;
  rejectBlock: string;
  ctxBlock: string;
  funilBlock: string;
  tomBlock: string;
  trendBlock: string;
  focus: string;
}) {
  const formatosStr = args.formatos.map(f => FORMATO_LABEL[f]).join(", ");
  const distribuicao = args.formatos.length === 1
    ? `Todas as ${args.nIdeas} ideias devem ser no formato "${args.formatos[0]}".`
    : `Distribui as ${args.nIdeas} ideias de forma equilibrada entre os formatos solicitados: ${args.formatos.join(", ")}.`;

  return `${GENERATION_RULES}

${args.reguaBlock}${args.histBlock}${args.learnBlock}${args.goldBlock}${args.rejectBlock}${args.ctxBlock}${args.funilBlock}${args.tomBlock}

${REELS_TRANSCRICOES}${args.trendBlock}

═══════════════════════════════════════════
FORMATOS PARA ESTA GERAÇÃO: ${formatosStr}
${distribuicao}
FOCO DESTE LOTE: ${args.focus}. Não repita ideias óbvias de outros lotes.
═══════════════════════════════════════════

TAREFA: gera EXATAMENTE ${args.nIdeas} ideias de Reel para o Instagram do Cândido Netto.
Cada ideia é um TEMA e ÂNGULO específico, não um roteiro. O Cândido vai falar do jeito dele.

VARIEDADE TEMÁTICA, escolha assuntos diferentes entre si:
• Erro de execução de exercício específico, glúteo, posterior, quadríceps, ombro etc.
• Diferença entre exercícios parecidos que as alunas confundem
• Mito fitness que o mercado repete, com o porquê real
• Volume vs intensidade, um dos temas mais fortes do Cândido
• Por que mulheres têm medo de carga e por que estão erradas
• Bastidor da consultoria N2 Squad, como ele pensa, o que ele vê
• Prova social, resultado de aluna com o contexto técnico do porquê funcionou
• Progressão de carga, como fazer, por que importa mais que volume
• Técnica avançada no momento errado
• Treino de glúteo que na verdade vira treino de quadríceps
• Mentalidade, disciplina, constância e intensidade no estilo darkside, sem clichê
• POV ou trend de treino com gancho visual forte

REGRAS:
- titulo: tema direto e forte, como ele falaria na academia
- descricao: 2-3 frases do que vai ser dito/mostrado, conteúdo real e específico
- formato: exatamente "falado", "conversa" ou "pov_trend"
- angulo: o gancho ou ponto de virada único que torna este reel diferente dos outros sobre o mesmo tema
- dicaGravacao: instrução prática e específica pro formato escolhido
- tags: 2-4 palavras-chave temáticas
- NUNCA use travessão longo nem hífen ornamental. Frases curtas.
- NUNCA genérico, nunca motivacional vazio. Cada ideia tem que ser específica e acionável.

Devolve APENAS este JSON válido:
{"ideias":[{"titulo":"string","descricao":"string","formato":"falado","angulo":"string","dicaGravacao":"string","tags":["string"]},...]}`;
}

async function generateBatch(anthropic: Anthropic, userMsg: string, batch: Batch): Promise<ReelIdea[]> {
  const fallbackFormato = batch.formatos[0] || "falado";
  let retryNote = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: Math.min(3800, Math.max(1800, batch.n * 340)),
      system: REELS_SYSTEM,
      messages: [{ role: "user", content: userMsg + retryNote }],
    });
    const cand = tryParse(textOf(res)) as { ideias?: ReelIdea[] } | null;
    if (cand?.ideias?.length) {
      return cand.ideias
        .map(i => cleanIdea(i as Partial<ReelIdea>, fallbackFormato))
        .filter((i): i is ReelIdea => Boolean(i))
        .slice(0, batch.n);
    }
    retryNote = `\n\nATENÇÃO: JSON inválido. Devolve JSON ESTRITAMENTE VÁLIDO com exatamente ${batch.n} ideias.`;
  }

  throw new Error("O modelo respondeu fora do formato esperado.");
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
  const formatos: ReelFormato[] = (body.formatos || VALID_FORMATOS).filter(
    (f): f is ReelFormato => VALID_FORMATOS.includes(f)
  );
  if (formatos.length === 0) formatos.push(...VALID_FORMATOS);
  const contexto = (body.contexto || "").trim();
  const funil = body.funil || null;
  const reg = body.registro || null;

  const { getAudience, getEdge, getBrainModel, getGold, getRejects, getReelLearnings, getWinnerLearnings } = await import("@/lib/store");
  const [aud, edg, model, gold, rejects, reelLearnings, winner] = await Promise.all([
    getAudience(), getEdge(), getBrainModel(), getGold(), getRejects("voice"), getReelLearnings(), getWinnerLearnings().catch(() => null),
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
  const learnBlock = [
    reelLearnings?.summary ? `\n\nO QUE FUNCIONA NOS REELS DO CÂNDIDO (aprendido — aplique):\n${reelLearnings.summary.slice(0, 800)}` : "",
    winner?.summary ? `\n\nO QUE BOMBA NO INSTAGRAM DELE (campeões reais — ${winner.n} posts; surfe esse padrão):\n${winner.summary.slice(0, 800)}` : "",
  ].join("");
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

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const batches = batchesFor(nIdeas, formatos);
    const settled = await mapLimited(batches, BATCH_CONCURRENCY, (batch) => generateBatch(
      anthropic,
      buildUserMsg({
        nIdeas: batch.n,
        formatos: batch.formatos,
        reguaBlock,
        histBlock,
        learnBlock,
        goldBlock,
        rejectBlock,
        ctxBlock,
        funilBlock,
        tomBlock,
        trendBlock: batch.formatos.includes("pov_trend") ? trendBlock : "",
        focus: batch.focus,
      }),
      batch
    ));

    const errors = settled
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map(r => apiErrorMessage(r.reason));
    const generated = uniqueIdeas(
      settled.flatMap(r => r.status === "fulfilled" ? r.value : []),
      nIdeas
    );

    if (!generated.length) throw new Error(errors[0] || "Não consegui gerar as ideias. Tenta de novo.");

    const warning = generated.length < nIdeas
      ? `Gerei ${generated.length} de ${nIdeas} ideias porque um lote demorou ou voltou fora do formato. Pode clicar em gerar de novo para completar.`
      : errors.length
        ? "Um lote falhou, mas consegui gerar as ideias restantes."
        : undefined;

    return Response.json({ ideias: generated, warning });
  } catch (e: unknown) {
    return Response.json({ error: apiErrorMessage(e) }, { status: 500 });
  }
}
