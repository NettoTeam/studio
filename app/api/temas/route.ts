import Anthropic from "@anthropic-ai/sdk";
import { getBrainModel, getGoldHooks, sourcesBackground, getRecentTemas, addRecentTemas, listSavedTemas } from "@/lib/store";
import { textOf } from "@/lib/llm";
import { GENERATION_RULES } from "@/lib/generation-rules";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_WRITE_MODEL || "claude-opus-4-8";

// LENTES: ângulos de ataque. Sorteamos algumas a cada geração pra forçar território novo
// (sem isso o modelo sempre converge nos mesmos temas "óbvios" do nicho).
const LENTES = [
  "o erro que ela comete ACHANDO que está fazendo certo",
  "dois exercícios/métodos que parecem iguais mas entregam coisas diferentes",
  "o que a indústria fitness vende e simplesmente não funciona",
  "a consequência invisível de um hábito que ela acha inofensivo",
  "o que você vê no vídeo dela em 3 segundos e ela não percebe há 2 anos",
  "a ordem certa das coisas (o que fazer ANTES do que ela quer fazer)",
  "por que o que funcionou pra ela ano passado parou de funcionar",
  "o conselho popular que está tecnicamente correto mas aplicado na hora errada",
  "o que separa quem evolui de quem trava, olhando o treino das duas",
  "um número/dado que quebra a intuição dela",
  "o que ela copia de atleta/influencer e não serve pro caso dela",
  "a desculpa mais comum e o que está por trás dela de verdade",
  "o detalhe de execução que muda o músculo que trabalha",
  "o que a balança/espelho não mostra e o treino mostra",
  "a pergunta que ela deveria fazer e nunca faz",
  "o que acontece no corpo quando ela pula a progressão",
  "por que ela sente e não cresce (sensação vs estímulo)",
  "o que você faz com uma aluna nova nos primeiros 30 dias e por quê",
];
function sorteia<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

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

## ANTI-GENÉRICO E ANTI-REPETIÇÃO (o teste mais duro — vale mais que qualquer outra regra)
Tema genérico é o que QUALQUER personal postaria. O do Cândido nunca é. Cada tema precisa:
- ser ESPECÍFICO: nomeia o exercício, o erro, o número ou a cena. "Treinar pesado" não é tema. "Por que ela apoia a escápula errado na elevação pélvica e sente lombar" é tema.
- ter uma TESE defensável (dá pra discordar) — se ninguém discorda, é banal.
- ter argumento + objeção real + resolução. Se não dá pra desenvolver um carrossel inteiro com substância, não é tema.
TESTE: se o tema serviria no perfil de outro treinador sem mudar nada, DESCARTA e escreve outro.
PROIBIDO: tema óbvio do nicho, conselho vago, motivação, "a importância de X".
VARIEDADE OBRIGATÓRIA: os 20 temas têm que atacar territórios DIFERENTES entre si. Nada de 5 temas que são o mesmo assunto com títulos diferentes.

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

  const [brain, hookGold, sourcesBg, recentes, salvos] = await Promise.all([
    getBrainModel(),
    getGoldHooks(),
    sourcesBackground(5000),
    getRecentTemas().catch(() => [] as string[]),
    listSavedTemas().catch(() => []),
  ]);

  // tudo que já foi sugerido antes (gerado ou salvo) vira lista de banidos
  const banidos = [...recentes, ...salvos.map(t => t.tema)]
    .map(t => (t || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 130);
  const banBlock = banidos.length
    ? `\n\n🚫 JÁ SUGERIDOS ANTES — PROIBIDO REPETIR (${banidos.length} temas). Não repita nem "primos": mesmo assunto com outro título, mesmo ângulo com outras palavras, ou variação leve. Se o tema que você pensou está nesta lista ou é parente dele, DESCARTA e vai pra território novo:\n${banidos.map(t => `✗ ${t.slice(0, 95)}`).join("\n")}`
    : "";

  const lentes = sorteia(LENTES, 6);
  const lentesBlock = `\n\n🎯 LENTES DESTA RODADA (ataque os temas por estes ângulos — força território novo, não repita o de sempre):\n${lentes.map(l => `• ${l}`).join("\n")}`;

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

  const userMsg = `${GENERATION_RULES}\n\n${brandBlock}${hookGoldBlock}${sourcesBlock}${booksBlock}${lentesBlock}${banBlock}\n\nGere 20 temas variados com 2 capas cada. Mine os livros e fontes pra encontrar ângulos que o mercado não explora. Distribua entre os tipos listados. Todos os hooks no padrão agressivo e direto das capas aprovadas. NENHUM tema pode repetir a lista de banidos, e os 20 têm que ser diferentes ENTRE SI.`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4500,
      temperature: 1,
      system: SYS,
      messages: [{ role: "user", content: userMsg }],
    });

    let text = textOf(res);
    text = text.replace(/```json/gi, "").replace(/```/g, "");
    text = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const json = JSON.parse(text) as { temas?: { tema: string; hook1: string; hook2: string; pilar: string }[] };
    const temas = json.temas || [];
    // guarda no histórico pra nunca mais repetir estes
    if (temas.length) addRecentTemas(temas.map(t => t.tema)).catch(() => {});
    return Response.json({ temas, usage: res.usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
