// Juiz cruzado: a OpenAI revisa o que o Claude gerou e aponta fraquezas.
// NÃO reescreve — só critica. O texto final continua sendo do Claude.
import { pickRandom } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 45;
const OPENAI_MODEL = process.env.OPENAI_JUDGE_MODEL || "gpt-4o-mini";

type Critica = {
  nota: number;
  veredito: string;
  fortes: string[];
  fracos: string[];
  sugestoes: string[];
};

function tryParse(text: string): Critica | null {
  let s = text.replace(/```json/gi, "").replace(/```/g, "");
  s = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
  try {
    const j = JSON.parse(s);
    if (typeof j.nota === "number") return j as Critica;
  } catch {}
  return null;
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "OPENAI_API_KEY não configurada. Adicione a chave da OpenAI no .env.local e no Vercel." }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { text?: string; tipo?: string; contexto?: string };
  const text = (body.text || "").trim();
  const tipo = body.tipo || "roteiro";
  if (text.length < 30) return Response.json({ error: "Texto curto demais pra revisar." }, { status: 400 });

  const { getAudience, getEdge, getGold } = await import("@/lib/store");
  const [aud, edg, gold] = await Promise.all([getAudience(), getEdge(), getGold()]);
  const goldBlock = gold.length
    ? `\n\nEXEMPLOS DA VOZ REAL DELE (o alvo — o texto tem que soar assim):\n${pickRandom(gold, 2).map(g => g.text).join("\n---\n")}`
    : "";

  const sys = `Você é um editor-crítico rígido de conteúdo para Instagram, especialista em copy que para o dedo. Está revisando o conteúdo de um treinador (treino feminino, glúteo, consultoria). Seu trabalho é achar FRAQUEZAS e apontar melhorias concretas — NÃO reescrever, NÃO elogiar de graça. Seja específico e duro, mas justo.

O que você caça:
- Gancho/capa fraco (não para o dedo, é genérico, motivacional vazio)
- "Cara de IA": paralelismo perfeito, "não é A, é B" espelhado, toda frase virando punchline, floreio, clichê de coach ("acredite", "confie no processo", "saia da zona de conforto"), jargão técnico cru
- Texto que não ensina nada de concreto / vago
- Card ou trecho com texto demais (deveria ser enxuto)
- Fecho fraco (não arde, não tem CTA claro)
- Perda da voz: se soa como influencer/copywriter em vez de treinador que vive o que ensina

PÚBLICO: ${aud}
CARA DA MARCA: ${edg}${goldBlock}`;

  const user = `Revise este ${tipo}${body.contexto ? ` (contexto: ${body.contexto})` : ""} e devolve SÓ um JSON válido, sem markdown:
{"nota": <0-100, quão forte está>, "veredito": "<1 frase direta>", "fortes": ["<o que já está bom, curto>"], "fracos": ["<fraqueza específica, aponte o trecho>"], "sugestoes": ["<melhoria concreta e acionável>"]}

Máx 3 itens em cada lista. Seja específico (cite trechos). Sem enrolação.

CONTEÚDO A REVISAR:
${text.slice(0, 6000)}`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        temperature: 0.4,
        max_tokens: 900,
        response_format: { type: "json_object" },
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || `OpenAI erro (${r.status})`);
    const content = d.choices?.[0]?.message?.content || "";
    const critica = tryParse(content);
    if (!critica) throw new Error("A revisão veio fora do formato. Tenta de novo.");
    return Response.json({ critica });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
