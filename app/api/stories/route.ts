// Gera uma SEQUÊNCIA DE STORIES do dia a dia (misto câmera/tela), na voz do Cândido.
// Usa o mesmo Cérebro do carrossel: régua, história (Nath/cachorros/Universidade), voz-ouro, anti-ouro.
import Anthropic from "@anthropic-ai/sdk";
import { STORIES_SYSTEM, CANDIDO_ROUTINE } from "@/lib/stories";
import { GENERATION_RULES } from "@/lib/generation-rules";
import { registroBlock } from "@/lib/vitals";
import { textOf, pickRandom } from "@/lib/llm";
import { detectTells } from "@/lib/tells";
import { cleanGeneratedText } from "@/lib/generation-rules";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_STORIES_MODEL || "claude-sonnet-4-6";

type Frame = { tipo?: string; mostrar?: string; texto?: string; fundo_tipo?: string; posicao_texto?: string; sugestao_visual?: string; figurinha?: { tipo: string; pergunta?: string; opcoes?: string[] } | null; cta?: string | null };

const OBJETIVOS: Record<string, string> = {
  equilibrar: "EQUILIBRE a sequência: abra aquecendo (bastidor/humano), entregue autoridade no meio, encaixe prova social se der, e feche com CTA leve.",
  engajar: "FOCO em aquecer e gerar interação: bastidor, rotina, figurinhas. Pelo menos uma enquete/caixinha forte. CTA leve no fim.",
  autoridade: "FOCO em autoridade: o erro que ele vê todo dia, um detalhe técnico, um mito desmascarado. Prova social se couber.",
  venda: "FOCO em venda da consultoria: prova social (feedback), o que a consultoria é de verdade, CTA pro link da bio. Sem ser pidão.",
};

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { theme?: string; objetivo?: string; nFrames?: number; registro?: string };
  const theme = (body.theme || "").trim();
  if (!theme) return Response.json({ error: "Me diz o que rolou hoje ou escolhe uma ideia." }, { status: 400 });
  const nFrames = Math.min(7, Math.max(3, Math.round(body.nFrames || 5)));
  const objetivo = OBJETIVOS[body.objetivo || "equilibrar"] || OBJETIVOS.equilibrar;

  // CÉREBRO (mesmo do carrossel): régua, história (pra puxar Nath/cachorros/Universidade quando couber), voz, anti-ouro
  const { getAudience, getEdge, getBrainModel, getGold, getRejects, getStoriesStyle, getStoryLearnings } = await import("@/lib/store");
  const [aud, edg, model, gold, rejects, estilo, storyLearnings] = await Promise.all([getAudience(), getEdge(), getBrainModel(), getGold(), getRejects("voice"), getStoriesStyle(), getStoryLearnings()]);
  const reguaBlock = `\n\nRÉGUA DA MARCA:\nPÚBLICO: ${aud}\nARESTA/CARA: ${edg}`;
  const histBlock = model.historia?.trim() ? `\n\nVIDA REAL DO CÂNDIDO (use SÓ quando o tema pedir algo pessoal/bastidor: Nath, os cachorros Chico e Simba, consultoria N2 Squad, Universidade Darkside; NUNCA invente):\n${model.historia.trim().slice(0, 3000)}` : "";
  const goldBlock = gold.length ? `\n\nA VOZ DO CÂNDIDO (imite a cadência, NÃO copie):\n${pickRandom(gold, 2).map((g) => g.text).join("\n---\n")}` : "";
  const rejectBlock = rejects.length ? `\n\nFOGE DESSE PADRÃO (o Cândido odeia: anti-ouro):\n${rejects.slice(0, 6).map((r) => `✗ ${r.text}`).join("\n")}` : "";
  const regBlock = registroBlock(body.registro);
  const estiloBlock = estilo ? `\n\nESTILO DE REFERÊNCIA DOS STORIES (siga ESTE estilo de escrita e formato: é o jeito que o Cândido curte fazer story, calibrado pelos prints e pelo arquivo base dele; PRIORIZE isto sobre suposições):\n${estilo}` : "";
  const learnBlock = storyLearnings?.summary ? `\n\nO QUE FUNCIONA NOS STORIES DO CÂNDIDO (aprendido dos posts reais — aplique):\n${storyLearnings.summary.slice(0, 1200)}` : "";

  const userMsg = `${GENERATION_RULES}${reguaBlock}${histBlock}${CANDIDO_ROUTINE}${regBlock}${estiloBlock}${learnBlock}${goldBlock}${rejectBlock}\n\nOBJETIVO DESTA SEQUÊNCIA: ${objetivo}\nQUANTIDADE: gere EXATAMENTE ${nFrames} frames.\nREGRA DE FORMATAÇÃO: não use travessão longo nem meio travessão em nenhum campo do JSON. Use vírgula, dois pontos ou frase nova.\n\nIDEIA / O QUE ROLOU HOJE:\n${theme}\n\nMonta a sequência de stories.`;

  function tryParse(text: string): { titulo?: string; frames?: unknown[]; dica?: string } | null {
    let s = text.replace(/```json/gi, "").replace(/```/g, "");
    s = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
    const attempts = [s, s.replace(/[“”„]/g, '\\"').replace(/[‘’]/g, "'"), s.replace(/,\s*([}\]])/g, "$1")];
    for (const a of attempts) {
      try { const j = JSON.parse(a); if (Array.isArray(j.frames)) return j; } catch {}
    }
    return null;
  }

  const anthropic = new Anthropic({ apiKey: key });
  try {
    let parsed: { titulo?: string; frames?: Frame[]; dica?: string } | null = null;
    let usage: Anthropic.Usage | undefined;
    let retryNote = "";
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      const res = await anthropic.messages.create({
        model: MODEL, max_tokens: 2600,
        system: [{ type: "text", text: STORIES_SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: userMsg + retryNote }],
      });
      usage = res.usage;
      const cand = tryParse(textOf(res)) as { titulo?: string; frames?: Frame[]; dica?: string } | null;
      if (!cand) { retryNote = `\n\nATENÇÃO: o JSON anterior veio quebrado. Devolve JSON ESTRITAMENTE VÁLIDO com EXATAMENTE ${nFrames} frames.`; continue; }
      // DETECTOR ANTI-IA (mesma régua do carrossel): se o texto dos frames tiver tell, regera
      const blob = (cand.frames || []).map((f) => `${f.texto || ""}\n${f.mostrar || ""}`).join("\n");
      const tells = detectTells(blob);
      if (tells.length && attempt < 2) {
        retryNote = `\n\nATENÇÃO: a versão anterior tinha cara de IA (${tells.slice(0, 4).join(" | ")}). Refaz mais humano e mais Cândido: SEM "não é A, é B", sem espelho "não é sobre X é sobre Y", sem clichê de coach, sem floreio e sem travessão.`;
        continue;
      }
      cand.titulo = cleanGeneratedText(cand.titulo) || cand.titulo;
      cand.dica = cleanGeneratedText(cand.dica) || cand.dica;
      cand.frames = (cand.frames || []).map((f) => ({
        ...f,
        mostrar: cleanGeneratedText(f.mostrar) || f.mostrar,
        texto: cleanGeneratedText(f.texto) || f.texto,
        sugestao_visual: cleanGeneratedText(f.sugestao_visual) || f.sugestao_visual,
        cta: f.cta ? cleanGeneratedText(f.cta) || f.cta : f.cta,
      }));
      parsed = cand;
    }
    if (!parsed) throw new Error("Não consegui montar os stories (JSON veio quebrado). Tenta de novo.");
    return Response.json({ titulo: parsed.titulo || cleanGeneratedText(theme.slice(0, 60)) || theme.slice(0, 60), frames: parsed.frames || [], dica: parsed.dica || "", usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
