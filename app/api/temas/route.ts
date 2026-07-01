import Anthropic from "@anthropic-ai/sdk";
import { getBrainModel, getGoldHooks, sourcesBackground } from "@/lib/store";
import { textOf } from "@/lib/llm";
import { GENERATION_RULES } from "@/lib/generation-rules";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_WRITE_MODEL || "claude-opus-4-8";

const SYS = `Você é o Cândido Netto (Team Netto @teamnetto · N² Squad @n2squad) gerando 20 TEMAS para carrosséis de Instagram.

Para cada tema gere:
- "tema": o briefing do carrossel (1-3 linhas descritivas — vai pra caixa de conteúdo pra gerar o post)
- "hook1": capa forte — 4 a 8 palavras, zero contexto necessário, soca sozinha. UMA expressão em **asteriscos**.
- "hook2": capa alternativa — ângulo diferente, mesma força
- "pilar": qual pilar da marca este tema representa (curto: "hipertrofia" / "progressão" / "execução" / "mentalidade" / "desinformação" / "composição" / "comportamento" / "comunidade" / "método")

## REGRA DOS HOOKS — o padrão aprovado pelo Cândido:
Estude as CAPAS APROVADAS que vêm na mensagem — esse é o padrão exato que ele quer.
Fórmula: use UMA das 5 linhas:
1. Contradição direta: desfaz crença sem rodeio — "Repouso **não** cura dor" / "Equilíbrio **não** traz evolução"
2. Call-out: aponta o erro/limitação diretamente — "A sua consultoria é **genérica**" / "Low volume é coisa de **preguiçoso**"
3. Provocação de identidade: verdade incômoda — "Não acorde pra ser a **porra da média**" / "Gente mole **não** evolui"
4. Observação chocante: real, que o mercado silencia — "Ela emagreceu mas o **rosto afundou**"
5. Declaração absoluta: afirma pesado, sem hedge — "Treino é **mais importante** que dieta"
PROIBIDO: explicativo ("não foi X que travou Y"), mais de 9 palavras, motivação genérica ("você consegue"), "não é A, é B" espelhado.

## FONTES DE TEMAS:
Mine os livros, fontes da biblioteca, pilares, inimigo cultural e grande tese. Cada tema = um ângulo único que pode virar carrossel real com argumento, objeção e resolução. Dos 20 temas, distribua entre:
- 5-6 sobre execução/técnica/biomecânica
- 4-5 sobre mentalidade/comportamento/erros
- 3-4 sobre desinformação/mitos do mercado
- 3-4 sobre progressão/método/composição
- 2-3 de opinião forte (posição clara sobre crença do nicho)

Saída: APENAS JSON {"temas": [{"tema": string, "hook1": string, "hook2": string, "pilar": string}]}. Sem markdown.
REGRAS JSON: escape aspas com \\" ; use \\n pra quebra; sem aspas curvas; sem vírgula sobrando.`;

export async function POST() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Sem ANTHROPIC_API_KEY." }, { status: 500 });

  const [brain, hookGold, sourcesBg] = await Promise.all([
    getBrainModel(),
    getGoldHooks(),
    sourcesBackground(5000),
  ]);

  // RAG nos livros — 3 queries cobrindo os temas principais da marca
  let booksBlock = "";
  try {
    const { hasEmbeddings, embed } = await import("@/lib/embed");
    if (hasEmbeddings()) {
      const queries = [
        "treinamento feminino glúteo hipertrofia progressão carga",
        "erros comuns execução exercício mulher estagnação resultado",
        "nutrição composição corporal emagrecimento crenças mitos fitness",
      ];
      const vecs = await embed(queries, "query");
      const { searchBooks } = await import("@/lib/store");
      const arrs = await Promise.all(vecs.map((v) => searchBooks(v, 5)));
      const seen = new Set<string>();
      const hits: string[] = [];
      for (const arr of arrs) for (const h of arr) {
        const k = h.content.slice(0, 60);
        if (!seen.has(k)) { seen.add(k); hits.push(h.content.slice(0, 350)); }
      }
      if (hits.length) booksBlock = `\n\nCONHECIMENTO DOS LIVROS (mine insights, conceitos e erros que podem virar carrossel):\n${hits.map((h) => `• ${h}`).join("\n")}`;
    }
  } catch (e) { console.error("RAG temas", e instanceof Error ? e.message : String(e)); }

  const brandBlock = `GRANDE TESE: ${brain.grandeTese.slice(0, 300)}
INIMIGO CULTURAL: ${brain.inimigo.slice(0, 200)}
PILARES: ${brain.pilares.join(" · ")}
TEMAS QUE O CÂNDIDO DOMINA: ${brain.temas.join(", ")}`;

  const hookGoldBlock = hookGold.length
    ? `\n\nCAPAS APROVADAS PELO CÂNDIDO (esse é exatamente o padrão de capa que ele quer):\n${hookGold.map((h) => `✓ ${h.capa}`).join("\n")}`
    : "";

  const sourcesBlock = sourcesBg ? `\n\nFONTES DA BIBLIOTECA:\n${sourcesBg}` : "";

  const userMsg = `${GENERATION_RULES}\n\n${brandBlock}${hookGoldBlock}${sourcesBlock}${booksBlock}\n\nGere 20 temas variados com 2 capas cada. Mine os livros e fontes pra encontrar ângulos que o mercado não explora. Distribua entre os tipos listados. Todos os hooks no padrão agressivo e direto das capas aprovadas.`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4500,
      system: SYS,
      messages: [{ role: "user", content: userMsg }],
    });

    let text = textOf(res);
    text = text.replace(/```json/gi, "").replace(/```/g, "");
    text = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const json = JSON.parse(text) as { temas?: { tema: string; hook1: string; hook2: string; pilar: string }[] };
    return Response.json({ temas: json.temas || [], usage: res.usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
