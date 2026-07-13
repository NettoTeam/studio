// Assistente de DM/venda e de parcerias: rascunha respostas na voz do Cândido.
// O texto final é sempre do Claude (voz calibrada). Devolve opções pra ele escolher/editar.
import Anthropic from "@anthropic-ai/sdk";
import { textOf, pickRandom } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_WRITE_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

type Opcao = { tom: string; texto: string };

function tryParse(text: string): { opcoes?: Opcao[] } | null {
  let s = text.replace(/```json/gi, "").replace(/```/g, "");
  s = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
  const attempts = [s, s.replace(/,\s*([}\]])/g, "$1")];
  for (const a of attempts) {
    try { const j = JSON.parse(a); if (Array.isArray(j.opcoes) && j.opcoes.length) return j; } catch {}
  }
  return null;
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada (precisa de crédito na Anthropic)." }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { tipo?: "dm" | "parceria"; mensagem?: string; contexto?: string };
  const tipo = body.tipo === "parceria" ? "parceria" : "dm";
  const mensagem = (body.mensagem || "").trim();
  const contexto = (body.contexto || "").trim();
  if (mensagem.length < 2) return Response.json({ error: "Cola a mensagem que você recebeu (ou descreve a situação)." }, { status: 400 });

  const { getAudience, getEdge, getBrainModel, getGold } = await import("@/lib/store");
  const [aud, edg, model, gold] = await Promise.all([getAudience(), getEdge(), getBrainModel(), getGold()]);
  const goldBlock = gold.length ? `\n\nA VOZ DO CÂNDIDO (imite a cadência, o jeito de falar — NÃO copie o assunto):\n${pickRandom(gold, 2).map(g => g.text).join("\n---\n")}` : "";
  const histBlock = model.historia?.trim() ? `\n\nVIDA/NEGÓCIO DO CÂNDIDO (use SÓ o que couber, NUNCA invente):\n${model.historia.trim().slice(0, 1800)}` : "";

  const base = `Você é o Cândido Netto (treinador, treino feminino / glúteo, consultoria N² Squad). Escreve como ELE fala: direto, humano, sem coachismo, sem parecer robô de vendas, sem travessão longo. Frases curtas. Autêntico.

PÚBLICO: ${aud}
CARA DA MARCA: ${edg}${histBlock}${goldBlock}`;

  const dmTask = `SITUAÇÃO: uma pessoa mandou mensagem no direct (lead em potencial). Você vende no 1-a-1, de forma consultiva — NUNCA empurrado.
${contexto ? `CONTEXTO (produto/objeção/onde ela está): ${contexto}\n` : ""}
MENSAGEM QUE VOCÊ RECEBEU:
"""${mensagem}"""

TAREFA: rascunha 3 respostas na voz do Cândido pra mover a conversa na direção certa (entender a real situação dela, quebrar a objeção com verdade, e conduzir pra consultoria quando fizer sentido). Regras:
- Consultivo, não pushy. Primeiro ENTENDE a pessoa, depois direciona.
- Nada de promessa milagrosa nem clichê de vendedor.
- Pode fazer 1 pergunta que aprofunda (social selling).
- Curto e natural, como mensagem de WhatsApp/direct.
- 3 tons diferentes: um mais acolhedor, um mais direto/técnico, um mais provocativo (darkside leve).`;

  const parceriaTask = `SITUAÇÃO: uma parceria (marca, academia, outro criador, nutri, etc.). Pode ser resposta a quem te procurou OU uma abordagem que você quer fazer.
${contexto ? `CONTEXTO (quem é, o que rolou, teu objetivo): ${contexto}\n` : ""}
MENSAGEM / SITUAÇÃO:
"""${mensagem}"""

TAREFA: rascunha 3 mensagens na voz do Cândido pra conduzir essa parceria. Regras:
- Profissional mas autêntico (a cara dele, não corporativo engomado).
- Deixa claro o valor dele (audiência de treino feminino engajada, autoridade real) sem se rebaixar nem se gabar.
- Se for abordagem, propõe algo concreto. Se for resposta, avança pra um próximo passo (call, condições, teste).
- Curto e direto.
- 3 tons: um mais cordial/aberto, um mais objetivo/negócio, um que já propõe próximo passo concreto.`;

  const userMsg = `${base}\n\n${tipo === "parceria" ? parceriaTask : dmTask}

Devolve APENAS este JSON válido:
{"opcoes":[{"tom":"string curto (ex: acolhedor)","texto":"a mensagem pronta pra enviar"},{"tom":"...","texto":"..."},{"tom":"...","texto":"..."}]}`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    let parsed: { opcoes?: Opcao[] } | null = null;
    let retry = "";
    for (let i = 0; i < 3 && !parsed; i++) {
      const res = await anthropic.messages.create({
        model: MODEL, max_tokens: 1600,
        messages: [{ role: "user", content: userMsg + retry }],
      });
      parsed = tryParse(textOf(res));
      if (!parsed) retry = "\n\nATENÇÃO: devolve JSON ESTRITAMENTE VÁLIDO com 3 opções.";
    }
    if (!parsed?.opcoes?.length) throw new Error("Não consegui montar as respostas. Tenta de novo.");
    return Response.json({ opcoes: parsed.opcoes });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
