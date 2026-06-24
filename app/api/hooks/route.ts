import Anthropic from "@anthropic-ai/sdk";
import { emotionBlock, hookBlock } from "@/lib/frameworks";
import { registroBlock } from "@/lib/vitals";
import { textOf, pickRandom } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 45;
const WRITE_MODEL = process.env.ANTHROPIC_WRITE_MODEL || "claude-opus-4-8";

const SYS = `Você é o Cândido Netto (Team Netto @teamnetto · N² Squad @n2squad). Gere 5 GANCHOS pra um ROTEIRO de carrossel. Cada gancho tem DUAS partes que combinam:
- "capa": a CHAMADA da capa (card 1). CURTA — 1, no máximo 2 linhas. Tem que SOCAR SOZINHA fora de contexto (a leitora não viu o resto). UMA palavra/expressão em **rosa** (asteriscos). PROIBIDO depender de metáfora interna que só faz sentido depois. PROIBIDO motivação genérica ("você consegue") e promessa de resultado fácil ("bumbum em 30 dias").
- "abertura": a primeira fala do ROTEIRO (2 a 4 linhas) que EXPANDE a capa, na voz do Cândido.
Regras:
- Na VOZ real do Cândido: calmo, direto, firme, breve, SEM palavrão, frase quebrada. Imite a cadência dos exemplos reais que vierem na mensagem.
- Aplica o TIPO DE GANCHO e a(s) EMOÇÃO(ÕES) escolhidas (vêm na mensagem). Se houver ponte de correlação, parte dela.
- Varie os ângulos entre as 5. Nada de "todo mundo sabe" nem clichê.
Saída: APENAS JSON {"hooks":[{"capa":"...","abertura":"..."}, ...]}. Sem markdown.
REGRAS DE JSON (críticas — o parse não pode quebrar): escape TODA aspa dupla dentro das strings com \\" ; use \\n pra quebra de linha (nunca quebra crua); nada de aspas curvas (" " ' '); sem vírgula sobrando antes de } ou ].`;

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Sem ANTHROPIC_API_KEY." }, { status: 500 });
  const body = (await req.json()) as { content?: string; hook?: string; emotions?: string[]; correlation?: string; registro?: string };
  const content = (body.content || "").trim();
  if (!content) return Response.json({ error: "Manda o conteúdo." }, { status: 400 });

  const emoBlock = emotionBlock(body.emotions || []);
  const hkBlock = hookBlock(body.hook);
  const regBlock = registroBlock(body.registro);
  const correlation = (body.correlation || "").trim().slice(0, 600);
  const corrBlock = correlation ? `\n\nPONTE DE CORRELAÇÃO (a abertura parte deste tema e conecta ao assunto, pelo princípio comum):\n${correlation}` : "";

  const { getGold, getRejects } = await import("@/lib/store");
  const [gold, rejects] = await Promise.all([getGold(), getRejects("hook")]);
  const goldBlock = gold.length
    ? `\n\nVOZ DO CÂNDIDO (imite a cadência, não copie):\n${pickRandom(gold, 2).map((g) => g.text).join("\n---\n")}`
    : "";
  // ANTI-OURO — ganchos que o Cândido REJEITOU: não repita esse tipo
  const rejectBlock = rejects.length
    ? `\n\nGANCHOS QUE O CÂNDIDO JÁ REJEITOU (NÃO gere nada parecido — ele NÃO curtiu esse tipo de capa/abertura/tom):\n${rejects.slice(0, 10).map((r) => `✗ ${r.text}`).join("\n")}`
    : "";

  const userMsg = `${regBlock}${hkBlock}${emoBlock}${corrBlock}${goldBlock}${rejectBlock}\n\nCONTEÚDO:\n${content}`;

  // extrai + repara + parseia (capa/abertura têm texto do Cândido com aspas — JSON quebra fácil)
  function tryParse(text: string): { capa: string; abertura: string }[] | null {
    let s = text.replace(/```json/gi, "").replace(/```/g, "");
    s = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
    const attempts = [s, s.replace(/[“”„]/g, '\\"').replace(/[‘’]/g, "'"), s.replace(/,\s*([}\]])/g, "$1")];
    for (const a of attempts) {
      try { const j = JSON.parse(a) as { hooks?: { capa: string; abertura: string }[] }; if (Array.isArray(j.hooks)) return j.hooks; } catch {}
    }
    return null;
  }

  const anthropic = new Anthropic({ apiKey: key });
  try {
    let hooks: { capa: string; abertura: string }[] | null = null;
    let usage: Anthropic.Usage | undefined;
    let lastErr = "";
    for (let attempt = 0; attempt < 3 && !hooks; attempt++) {
      const res = await anthropic.messages.create({
        model: WRITE_MODEL,
        max_tokens: 1400,
        system: SYS,
        messages: [{ role: "user", content: attempt === 0 ? userMsg : userMsg + "\n\nATENÇÃO: o JSON anterior veio quebrado. Gere JSON ESTRITAMENTE VÁLIDO — escape as aspas com \\\", use \\n pra quebra de linha, sem vírgula sobrando, sem aspas curvas." }],
      });
      usage = res.usage;
      hooks = tryParse(textOf(res));
      if (!hooks) lastErr = "JSON inválido (tentativa " + (attempt + 1) + ")";
    }
    if (!hooks) throw new Error("Não consegui gerar os ganchos (o JSON veio quebrado). Tenta de novo. " + lastErr);
    return Response.json({ hooks, usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
