// Gancho por correlação: acha temas conhecidos/atemporais (fora do fitness) que compartilham o
// princípio do assunto técnico — pra servir de ponte no gancho. Usa Exa (busca semântica).
import Anthropic from "@anthropic-ai/sdk";
import { getAudience, getEdge } from "@/lib/store";
import { textOf, extractJson, extractArray } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 45;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

async function exaSearch(query: string, key: string, category?: string) {
  const recent = new Date(Date.now() - 1000 * 60 * 60 * 24 * 540).toISOString().slice(0, 10); // ~18 meses
  const r = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key },
    body: JSON.stringify({
      query, numResults: 3, type: "auto",
      ...(category ? { category } : {}),
      ...(category === "news" ? { startPublishedDate: recent } : {}),
      contents: { text: { maxCharacters: 240 } },
    }),
  });
  if (!r.ok) throw new Error("Exa " + r.status + ": " + (await r.text()).slice(0, 120));
  const d = await r.json();
  return (d.results || []) as { title?: string; url?: string; text?: string }[];
}

export async function POST(req: Request) {
  const exaKey = process.env.EXA_API_KEY;
  if (!exaKey) return Response.json({ error: "EXA_API_KEY não configurada. Cria a chave em exa.ai e adiciona no Vercel." }, { status: 400 });
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return Response.json({ error: "sem ANTHROPIC_API_KEY" }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { content?: string };
  const content = (body.content || "").trim();
  if (!content) return Response.json({ error: "manda o conteúdo/tema" }, { status: 400 });

  const [AUDIENCE, EDGE] = await Promise.all([getAudience(), getEdge()]);
  const anthropic = new Anthropic({ apiKey: anthropicKey });
  try {
    // 1) monta buscas por temas ATEMPORAIS e RELACIONÁVEIS (filosofia, história, lendas de disciplina/superação)
    const plan = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Quero abrir um carrossel de fitness (consultoria feminina, foco em glúteo) com um GANCHO POR CORRELAÇÃO sobre: "${content}".

PÚBLICO (a ponte tem que ressoar com a ferida dela): ${AUDIENCE}

TEMPERO / CARA DA MARCA: ${EDGE}

IMPORTANTE — a marca NÃO é noticiário. A ponte NÃO pode ser notícia de pessoa pouco conhecida/regional. Tem que ter PESO e reconhecimento, algo ATEMPORAL que a pessoa reconhece como grande:
- FILOSOFIA (estoicismo, Sêneca, Marco Aurélio, amor fati, "o obstáculo é o caminho", disciplina, hábito...)
- HISTÓRIA (figuras históricas de disciplina, persistência e construção a longo prazo; grandes feitos que levaram anos)
- GRANDES NOMES / LENDAS reconhecidos — esporte e arte (atletas, ginastas, bailarinas, maratonistas, nomes icônicos de superação e constância, homens e mulheres). Use a história, a rotina ou a frase marcante deles.
- MITOLOGIA e arquétipos (a fênix, Sísifo, a jornada da heroína, o renascimento...)
Conecte ao assunto técnico E à ferida do público (constância acima de motivação, método contra atalho, parar de se sabotar, resultado construído no processo).
A RÉGUA é ÍCONE × ATEMPORAL (não clássico × recente): um nome ATUAL icônico/reconhecido PODE; gente regional/desconhecida NÃO. Nada de noticiário.
NÃO quero: notícia de gente desconhecida/regional; tema técnico/acadêmico; superação açucarada de influencer.
Proponha 3 buscas curtas (em português), cada uma de um DOMÍNIO SEPARADO e distinto:
1ª = FILOSOFIA (um pensador/conceito);
2ª = HISTÓRIA ou MITOLOGIA (um episódio/figura/arquétipo);
3ª = GRANDE NOME / LENDA (esporte, arte, superação).
REGRA DE VARIEDADE: NUNCA a mesma figura ou tema em duas buscas — quero pontes de origens BEM diferentes pra eu escolher. Não busque sobre a própria figura/assunto do conteúdo; busque pontes DE FORA.
Responda APENAS JSON: {"queries":["filosofia","história/mito","grande nome"]}`,
      }],
    });
    const parsed = JSON.parse(extractJson(textOf(plan))) as { queries?: string[] };
    const queries = (parsed.queries || []).slice(0, 3);

    // 2) busca no Exa — semântica/atemporal (filosofia, história, lendas), sem viés de notícia
    const seen = new Set<string>();
    const candidates: { title: string; snippet: string; url: string }[] = [];
    for (let i = 0; i < queries.length; i++) {
      const results = await exaSearch(queries[i], exaKey);
      for (const r of results) {
        const title = (r.title || "").trim();
        if (!title || seen.has(title)) continue;
        seen.add(title);
        candidates.push({ title, snippet: (r.text || "").replace(/\s+/g, " ").trim().slice(0, 200), url: r.url || "" });
      }
    }
    const pool = candidates.slice(0, 10);
    if (!pool.length) return Response.json({ candidates: [] });

    // frescor: marca pontes cujo tema já foi usado recentemente
    const { recentFreshLabels } = await import("@/lib/store");
    const recent = (await recentFreshLabels(30)).map((s) => s.toLowerCase());
    const wasUsed = (title: string) => { const t = title.toLowerCase(); return recent.some((r) => r.length > 4 && (t.includes(r.slice(0, 18)) || r.includes(t.slice(0, 18)))); };

    // 3) filtra/anota: mantém só as pontes que CONECTAM de verdade com o assunto, e diz COMO conectam
    try {
      const ann = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 700,
        messages: [{
          role: "user",
          content: `Assunto do carrossel: "${content}".
Abaixo, temas-ponte candidatos pra um gancho por correlação. Pra CADA um que tem conexão REAL e honesta com o assunto (compartilha um PRINCÍPIO/tema de verdade), devolva o título exato e uma linha curta de COMO conecta com o assunto. DESCARTE os que seriam ponte forçada ou sem relação real.
REGRA DE VARIEDADE (importante): devolva pontes de figuras/temas DIFERENTES entre si. Se vários candidatos forem a MESMA figura/tema, mantenha SÓ UMA — a melhor — e descarte as repetidas. NUNCA devolva 2 versões da mesma figura. Priorize diversidade de origens (filosofia, história, lenda).
Candidatos:
${pool.map((c, i) => `${i + 1}. ${c.title}${c.snippet ? " — " + c.snippet.slice(0, 120) : ""}`).join("\n")}
Responda APENAS JSON: [{"title":"...","comoConecta":"..."}]`,
        }],
      });
      const arr = JSON.parse(extractArray(textOf(ann))) as { title: string; comoConecta: string }[];
      const byTitle = new Map(pool.map((c) => [c.title, c]));
      const out = arr.map((a) => ({ title: a.title, comoConecta: a.comoConecta, url: byTitle.get(a.title)?.url || "", usado: wasUsed(a.title) })).filter((a) => a.title).slice(0, 8);
      if (out.length) return Response.json({ candidates: out });
    } catch (e) {
      console.error("annotate", e instanceof Error ? e.message : String(e));
    }
    // fallback: sem anotação
    return Response.json({ candidates: pool.slice(0, 8).map((c) => ({ ...c, usado: wasUsed(c.title) })) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
