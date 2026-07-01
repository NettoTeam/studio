// Gera 2 opções de sequência de stories para um período do dia (manhã / tarde / noite).
// Recebe descrição do período + contexto do dia todo → devolve 2 sequências completas.
import Anthropic from "@anthropic-ai/sdk";
import { STORIES_SYSTEM, CANDIDO_ROUTINE } from "@/lib/stories";
import { GENERATION_RULES } from "@/lib/generation-rules";
import { textOf, pickRandom } from "@/lib/llm";
import { detectTells } from "@/lib/tells";
import { cleanGeneratedText } from "@/lib/generation-rules";
import { registroBlock } from "@/lib/vitals";

export const runtime = "nodejs";
export const maxDuration = 90;
const MODEL = process.env.ANTHROPIC_STORIES_MODEL || "claude-sonnet-4-6";

type Frame = {
  tipo?: string; mostrar?: string; texto?: string; fundo_tipo?: string;
  posicao_texto?: string; sugestao_visual?: string;
  figurinha?: { tipo: string; pergunta?: string; opcoes?: string[] } | null;
  cta?: string | null;
};
type Sequencia = { titulo: string; angulo: string; frames: Frame[]; dica?: string };

const PERIODO_LABELS: Record<string, string> = {
  manha: "MANHÃ (abertura + consultoria + treino pessoal)",
  tarde:  "TARDE (consultoria 2ª parte + treino da Nath)",
  noite:  "NOITE (fechamento + momento pessoal + programação hobby)",
};

const PERIODO_ANGULOS: Record<string, string[]> = {
  manha: [
    "abertura humana do dia: bastidor de café / rotina pessoal antes do trabalho (E) → gancho que segura a audiência até o próximo bloco",
    "skin in the game: treino pessoal ou bastidor da consultoria de manhã (A) → insight técnico real que surgiu no treino ou na correção de aluna",
  ],
  tarde: [
    "prova social ou resultado de aluna: feedback real + contexto técnico de POR QUE esse resultado aconteceu (A+I)",
    "treino da Nath: humor natural do casal + aplicação do método em quem ele mais conhece (E→A)",
  ],
  noite: [
    "fechamento do dia com reflexão leve: o que esse dia ensinou / CTA natural para a consultoria (A→venda suave)",
    "bastidor humano noturno: momento com a Nath, hobby de programação ou algo fora do trabalho que mostra quem ele é (E)",
  ],
};

const OBJETIVO_MAP: Record<string, string> = {
  equilibrar: "Mix A.E.I equilibrado: abra com E (bastidor humano), entregue A (autoridade), feche com I (informação útil) ou CTA leve.",
  engajar:    "Foco em gerar interação e proximidade: bastidor, figurinhas fortes, CTA leve. Autoridade só se encaixar naturalmente.",
  autoridade: "Foco em autoridade: erro técnico real, insight de treino, mito desmascarado. Prova social se disponível.",
  venda:      "Foco em vender a consultoria: prova social (feedback), o que a consultoria entrega de verdade, CTA orgânico pro link da bio.",
};

function tryParse(text: string): { opcoes?: unknown[] } | null {
  let s = text.replace(/```json/gi, "").replace(/```/g, "");
  s = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
  const attempts = [s, s.replace(/[""„]/g, '\\"').replace(/['']/g, "'"), s.replace(/,\s*([}\]])/g, "$1")];
  for (const a of attempts) {
    try {
      const j = JSON.parse(a);
      if (Array.isArray(j.opcoes) && j.opcoes.length > 0) return j;
    } catch {}
  }
  return null;
}

function cleanSeq(seq: Sequencia): Sequencia {
  return {
    ...seq,
    titulo: cleanGeneratedText(seq.titulo) || seq.titulo,
    angulo: cleanGeneratedText(seq.angulo) || seq.angulo,
    dica:   seq.dica ? cleanGeneratedText(seq.dica) || seq.dica : seq.dica,
    frames: (seq.frames || []).map(f => ({
      ...f,
      mostrar:         cleanGeneratedText(f.mostrar) || f.mostrar,
      texto:           cleanGeneratedText(f.texto) || f.texto,
      sugestao_visual: cleanGeneratedText(f.sugestao_visual) || f.sugestao_visual,
      cta:             f.cta ? cleanGeneratedText(f.cta) || f.cta : f.cta,
    })),
  };
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as {
    periodo?: string;
    descricao?: string;
    diaCompleto?: string;
    contexto?: { treinou?: string; provaSocial?: string; aconteceu?: string; vendendo?: boolean };
    objetivo?: string;
    nFrames?: number;
    modoEscrita?: boolean;
  };

  const periodo = (body.periodo || "manha") as "manha" | "tarde" | "noite";
  const descricao = (body.descricao || "").trim();
  const diaCompleto = (body.diaCompleto || "").trim();
  if (!descricao && !diaCompleto) {
    return Response.json({ error: "Descreve o que vai acontecer neste período." }, { status: 400 });
  }
  const nFrames = Math.min(6, Math.max(3, Math.round(body.nFrames || 4)));
  const objetivo = OBJETIVO_MAP[body.objetivo || "equilibrar"] || OBJETIVO_MAP.equilibrar;
  const modoEscrita = !!body.modoEscrita;

  // Contexto do dia e extras
  const ctx = body.contexto || {};
  const ctxLines: string[] = [];
  if (ctx.treinou) ctxLines.push(`TREINOU HOJE: ${ctx.treinou}`);
  if (ctx.provaSocial) ctxLines.push(`PROVA SOCIAL DISPONÍVEL: ${ctx.provaSocial}`);
  if (ctx.aconteceu) ctxLines.push(`ALGO ESPECÍFICO: ${ctx.aconteceu}`);
  if (ctx.vendendo) ctxLines.push("QUER VENDER CONSULTORIA HOJE: sim (CTA orgânico na sequência certa)");
  const ctxBlock = ctxLines.length ? `\nCONTEXTO EXTRA DO DIA:\n${ctxLines.join("\n")}` : "";

  // Cérebro (mesmo do carrossel)
  const { getAudience, getEdge, getBrainModel, getGold, getRejects, getStoriesStyle, getStoryLearnings } = await import("@/lib/store");
  const [aud, edg, model, gold, rejects, estilo, storyLearnings] = await Promise.all([
    getAudience(), getEdge(), getBrainModel(), getGold(), getRejects("voice"), getStoriesStyle(), getStoryLearnings()
  ]);
  const reguaBlock = `\n\nRÉGUA DA MARCA:\nPÚBLICO: ${aud}\nARESTA/CARA: ${edg}`;
  const histBlock = model.historia?.trim()
    ? `\n\nVIDA REAL DO CÂNDIDO (use SÓ quando couber: Nath, Chico, Simba, N2 Squad, Darkside; NUNCA invente):\n${model.historia.trim().slice(0, 2000)}`
    : "";
  const goldBlock = gold.length ? `\n\nA VOZ DO CÂNDIDO (imite a cadência, NÃO copie):\n${pickRandom(gold, 2).map(g => g.text).join("\n---\n")}` : "";
  const rejectBlock = rejects.length ? `\n\nFOGE DESSE PADRÃO (anti-ouro):\n${rejects.slice(0, 4).map(r => `✗ ${r.text}`).join("\n")}` : "";
  const estiloBlock = estilo ? `\n\nESTILO DOS STORIES (priorize):\n${estilo}` : "";
  const learnBlock = storyLearnings?.summary ? `\n\nO QUE FUNCIONA NOS STORIES DO CÂNDIDO (aprendido dos posts reais — aplique):\n${storyLearnings.summary.slice(0, 1000)}` : "";
  const escritaBlock = modoEscrita
    ? `\n\nMODO SEQUÊNCIA ESCRITA (OBRIGATÓRIO):\n• Todos os frames devem ser tipo "tela" (campo "tipo": "tela"). NENHUM frame de câmera.\n• Cada frame carrega apenas texto escrito — curto, direto, impactante.\n• Os frames se complementam em sequência: cada um continua ou aprofunda o anterior, como uma thread visual.\n• Campo "mostrar": deixe vazio ou descreva apenas o fundo/cenário visual estático.\n• Sem "gravar", sem "câmera", sem instruções de gravação — é conteúdo 100% escrito.`
    : "";

  const userMsg = `${GENERATION_RULES}${reguaBlock}${histBlock}${CANDIDO_ROUTINE}${estiloBlock}${learnBlock}${goldBlock}${rejectBlock}${escritaBlock}

OBJETIVO DO DIA: ${objetivo}${ctxBlock}

CONTEXTO GERAL DO DIA (para coerência entre os períodos):
${diaCompleto || "Não informado"}

RELATO DO PERÍODO ${PERIODO_LABELS[periodo].toUpperCase()}:
${descricao || "Rotina padrão do Cândido para este período"}

────────────────────────────────────────────────────
COMO INTERPRETAR O RELATO ACIMA:
O relato pode estar em qualquer tempo verbal:
  • FUTURO: "vou treinar hoje" "quero falar sobre X" "vou corrigir vídeos"
  • PASSADO: "treinei pesado" "chegou feedback de aluna" "aconteceu X"
  • PRESENTE: "estou treinando" "acabei de corrigir"
Independente do tempo verbal: gere conteúdo para postar NESTE PERÍODO do dia.

O CONTEÚDO GERADO NÃO PRECISA SER LITERAL do que o Cândido está fazendo:
  ✅ Pode ser SOBRE a atividade: mostrar o treino, a correção, o feedback
  ✅ Pode ser INSPIRADO pela atividade: insight técnico que surgiu, erro que viu, mito que quer quebrar
  ✅ Pode ser EDUCATIVO relacionado ao tema: por que aquele exercício/conceito funciona
  ✅ Pode ser BASTIDOR: mostrar o processo, a rotina, o método por trás
O que NÃO pode: inventar história que não foi contada; clichê de coach; narrar sem insight.
────────────────────────────────────────────────────

TAREFA: crie EXATAMENTE 2 opções de sequência de stories para este período.
Cada opção deve ter EXATAMENTE ${nFrames} frames.
As 2 opções devem ter abordagens DISTINTAS (ex: uma mais bastidor/humana, outra mais técnica/autoridade).
Escolha os ângulos que mais fazem sentido com o relato — não siga fórmula fixa.

REGRAS:
- NUNCA use travessão longo nem meio travessão em nenhum campo. Use vírgula, dois pontos ou frase nova.
- Frases curtas. Nunca terminam com ponto final.

Devolve APENAS este JSON válido:
{"opcoes":[{"titulo":"string","angulo":"string","frames":[{"tipo":"camera"|"tela","mostrar":"string","texto":"string","fundo_tipo":"camera_escuro"|"tela_escura"|"vermelho"|"preto","posicao_texto":"topo"|"meio"|"rodape","sugestao_visual":"string","figurinha":{"tipo":"enquete"|"caixinha"|"quiz"|"controle"|"nenhuma","pergunta":"string","opcoes":["string"]},"cta":"string"|null}],"dica":"string"},{"titulo":"string","angulo":"string","frames":[...],"dica":"string"}]}`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    let parsed: { opcoes?: Sequencia[] } | null = null;
    let retryNote = "";
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      const res = await anthropic.messages.create({
        model: MODEL, max_tokens: 4000,
        system: [{ type: "text", text: STORIES_SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: userMsg + retryNote }],
      });
      const cand = tryParse(textOf(res)) as { opcoes?: Sequencia[] } | null;
      if (!cand) {
        retryNote = `\n\nATENÇÃO: o JSON anterior veio quebrado. Devolve JSON ESTRITAMENTE VÁLIDO com exatamente 2 opções, cada uma com ${nFrames} frames.`;
        continue;
      }
      const blob = (cand.opcoes || []).flatMap(o => o.frames || []).map(f => `${f.texto || ""}\n${f.mostrar || ""}`).join("\n");
      const tells = detectTells(blob);
      if (tells.length && attempt < 2) {
        retryNote = `\n\nATENÇÃO: o texto tinha cara de IA (${tells.slice(0, 3).join(" | ")}). Refaz mais humano, mais Cândido, sem travessão e sem clichê de coach.`;
        continue;
      }
      parsed = { opcoes: (cand.opcoes || []).map(o => cleanSeq(o as Sequencia)) };
    }
    if (!parsed?.opcoes?.length) throw new Error("Não consegui montar as sequências. Tenta de novo.");
    return Response.json({ periodo, opcoes: parsed.opcoes });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
