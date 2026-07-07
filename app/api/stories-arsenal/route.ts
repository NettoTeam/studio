// Gera uma sequência de stories baseada em um script do Arsenal (curso).
// O script é o ESQUELETO narrativo; a IA reescreve 100% na voz do Cândido.
import Anthropic from "@anthropic-ai/sdk";
import { STORIES_SYSTEM } from "@/lib/stories";
import { GENERATION_RULES } from "@/lib/generation-rules";
import { textOf, pickRandom } from "@/lib/llm";
import { detectTells } from "@/lib/tells";
import { cleanGeneratedText } from "@/lib/generation-rules";
import { ARSENAL_SCRIPTS, ARSENAL_CATEGORIAS, scriptsDaCategoria, type ArsenalCategoria } from "@/lib/arsenal";

export const runtime = "nodejs";
export const maxDuration = 90;
const MODEL = process.env.ANTHROPIC_CARDS_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

type Frame = {
  tipo?: string; mostrar?: string; texto?: string; fundo_tipo?: string;
  posicao_texto?: string; sugestao_visual?: string;
  figurinha?: { tipo: string; pergunta?: string; opcoes?: string[] } | null;
  cta?: string | null;
};
type Sequencia = { titulo: string; angulo: string; frames: Frame[]; dica?: string };

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
    categoria?: ArsenalCategoria;
    dia?: number;           // script específico (opcional)
    contexto?: string;      // contexto do momento (opcional)
    excluirDias?: number[]; // scripts já usados recentemente (evitar repetição)
  };

  const categoria = body.categoria;
  if (!categoria || !(categoria in ARSENAL_CATEGORIAS)) {
    return Response.json({ error: "categoria inválida" }, { status: 400 });
  }

  // Escolhe o script: dia específico, ou sorteia da categoria evitando repetidos
  let script = body.dia ? ARSENAL_SCRIPTS.find(s => s.dia === body.dia && s.categoria === categoria) : undefined;
  if (!script) {
    const pool = scriptsDaCategoria(categoria);
    const excluir = new Set(body.excluirDias || []);
    const fresh = pool.filter(s => !excluir.has(s.dia));
    const candidates = fresh.length ? fresh : pool;
    script = candidates[Math.floor(Math.random() * candidates.length)];
  }
  if (!script) return Response.json({ error: "nenhum script nessa categoria" }, { status: 404 });

  const catInfo = ARSENAL_CATEGORIAS[categoria];
  const contexto = (body.contexto || "").trim();

  // Cérebro do Cândido
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
  const ctxBlock = contexto ? `\n\nCONTEXTO DO MOMENTO (encaixe no roteiro se fizer sentido):\n${contexto}` : "";

  const userMsg = `${GENERATION_RULES}${reguaBlock}${histBlock}${estiloBlock}${learnBlock}${goldBlock}${rejectBlock}${ctxBlock}

═══════════════════════════════════════════
SCRIPT DO ARSENAL — "${script.nome}" (categoria: ${catInfo.label})
OBJETIVO DA CATEGORIA: ${catInfo.objetivo}
═══════════════════════════════════════════

${script.roteiro}

═══════════════════════════════════════════
COMO USAR ESTE SCRIPT:
• O script acima é um ESQUELETO narrativo com lacunas [assim] e exemplos genéricos.
• Sua tarefa: preencher o esqueleto 100% com o universo do Cândido — treino feminino, glúteo, progressão de carga, consultoria N2 Squad, alunas reais, a Nath, o método dele.
• A ESTRUTURA story-a-story do script deve ser respeitada (mesma ordem, mesma progressão narrativa, mesmas figurinhas/enquetes onde indicadas).
• A VOZ é do Cândido: "a real é que", "entendam isso", frases curtas, zero coach genérico. Os exemplos do script são de OUTRA pessoa — NÃO copie o texto deles, use só como referência de estrutura.
• Onde o script pede imagem/vídeo, descreva no campo "mostrar" o que o Cândido deve mostrar/gravar (algo da rotina real dele).
• Onde o script pede enquete/caixinha/reação, use o campo "figurinha".
• Se o script menciona Manychat/código no direct, adapte para o padrão do Cândido: reação no story ou "me chama no direct".
═══════════════════════════════════════════

TAREFA: crie EXATAMENTE 1 sequência de stories seguindo o script acima.
O número de frames deve seguir o número de stories do script (agrupe stories que o script agrupa, ex: "Story 4 e 5" pode virar 2 frames).

REGRAS:
- NUNCA use travessão longo nem meio travessão em nenhum campo. Use vírgula, dois pontos ou frase nova.
- Frases curtas. Nunca terminam com ponto final.

Devolve APENAS este JSON válido:
{"opcoes":[{"titulo":"string","angulo":"string","frames":[{"tipo":"camera"|"tela","mostrar":"string","texto":"string","fundo_tipo":"camera_escuro"|"tela_escura"|"vermelho"|"preto","posicao_texto":"topo"|"meio"|"rodape","sugestao_visual":"string","figurinha":{"tipo":"enquete"|"caixinha"|"quiz"|"controle"|"nenhuma","pergunta":"string","opcoes":["string"]},"cta":"string"|null}],"dica":"string"}]}`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    let parsed: { opcoes?: Sequencia[] } | null = null;
    let retryNote = "";
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      const res = await anthropic.messages.create({
        model: MODEL, max_tokens: 4000,
        system: STORIES_SYSTEM,
        messages: [{ role: "user", content: userMsg + retryNote }],
      });
      const cand = tryParse(textOf(res)) as { opcoes?: Sequencia[] } | null;
      if (!cand) {
        retryNote = "\n\nATENÇÃO: o JSON anterior veio quebrado. Devolve JSON ESTRITAMENTE VÁLIDO com 1 opção.";
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
    if (!parsed?.opcoes?.length) throw new Error("Não consegui montar a sequência. Tenta de novo.");
    return Response.json({
      categoria,
      script: { dia: script.dia, nome: script.nome },
      opcoes: parsed.opcoes,
    });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
