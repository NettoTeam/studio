import Anthropic from "@anthropic-ai/sdk";
import { listPosts, getLearnings, getBrainModel, getGold, getRejects } from "@/lib/store";
import { textOf, extractJson, pickRandom } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 45;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

const SYS = `Você é o Cândido Netto (Team Netto @teamnetto · N² Squad @n2squad) pensando nas próximas PAUTAS de carrossel — NÃO é um estrategista de marketing de fora, é ELE.
- Cada pauta DESDOBRA de um dos PILARES da marca (vêm na mensagem), dentro de um dos TEMAS que o Cândido domina, alinhada à GRANDE TESE e mirando o INIMIGO CULTURAL.
- Na linha do que dá certo pra ele: confronto firme (sem agredir), quebra de mito, verdade técnica, gancho-espelho.
- NÃO repita temas já postados (vão na mensagem).
- Use o APRENDIZADO dos dados se houver.

O "angulo" é o ponto MAIS importante e onde quase todo mundo erra: ele tem que estar ESCRITO NA VOZ DO CÂNDIDO — direto, firme, sem palavrão, frase quebrada, como ELE FALARIA o gancho na frente da câmera. É a PROVOCAÇÃO de verdade, não a descrição de uma ideia.
- PROIBIDO voz de estrategista/IA: "aborde como...", "explore o tema...", "mostre que...", "fale sobre a importância de...", "desmistifique...". Isso é descrever, não falar. ERRADO.
- CERTO: escreve a frase que sai da boca dele. Ex (cadência, não copie o tema): "Quem te disse que agachar mais ia resolver o teu glúteo?" / "Você não tá estagnada. Você tá repetindo o treino errado há 1 ano." Imite ESSA pegada, ancorado nos exemplos de voz real que vierem na mensagem.

Cada pauta: tema curto + o angulo (a provocação na voz do Cândido) + de qual pilar nasce.
Saída: APENAS JSON {"pautas": [{"tema": string, "angulo": string, "pilar": string}]} com 4 pautas. Sem markdown.`;

export async function POST() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Sem ANTHROPIC_API_KEY." }, { status: 500 });

  const [posts, learnings, model, gold, rejects] = await Promise.all([listPosts(), getLearnings(), getBrainModel(), getGold(), getRejects("pauta")]);
  const postados = posts.filter((p) => p.stage === "publicado" || p.stage === "arquivado").map((p) => p.tema);

  const brandBlock = `GRANDE TESE: ${model.grandeTese}\nINIMIGO CULTURAL (combater): ${model.inimigo}\nPILARES DE CONTEÚDO:\n${model.pilares.map((p, i) => `${i + 1}. ${p}`).join("\n")}\nTEMAS QUE O CÂNDIDO DOMINA: ${model.temas.join("; ")}`;

  // VOZ REAL — ancora a cadência do "angulo" (não copie tema, imite o jeito de falar)
  const goldBlock = gold.length
    ? `\n\nA VOZ REAL DO CÂNDIDO (imite a cadência/pegada do "angulo" NISTO, não copie tema):\n${pickRandom(gold, 2).map((g) => g.text.slice(0, 700)).join("\n---\n")}`
    : "";
  // ANTI-OURO — pautas que o Cândido REJEITOU: não repita esse tipo de abordagem/tom
  const rejectBlock = rejects.length
    ? `\n\nPAUTAS QUE O CÂNDIDO JÁ REJEITOU (NÃO ofereça nada parecido em tema, ângulo ou tom — ele NÃO curtiu):\n${rejects.slice(0, 10).map((r) => `✗ ${r.text}`).join("\n")}`
    : "";

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SYS,
      messages: [{ role: "user", content: `${brandBlock}${goldBlock}${rejectBlock}\n\nTemas já postados (não repetir): ${postados.length ? postados.join(", ") : "(nenhum ainda)"}\n\nAPRENDIZADO: ${learnings?.summary || "(ainda sem dados suficientes)"}\n\nMe dá 4 pautas novas, cada uma desdobrando de um pilar diferente. O "angulo" na MINHA voz direta, não em voz de marketing.` }],
    });
    const json = JSON.parse(extractJson(textOf(res)));
    return Response.json({ pautas: json.pautas || [], usage: res.usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
