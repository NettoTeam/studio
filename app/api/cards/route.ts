// ETAPA 2 — fatia o ROTEIRO aprovado em cards (formatação/design). NÃO reescreve o texto.
import Anthropic from "@anthropic-ai/sdk";
import { CARDS_SYSTEM, CARDS_SYSTEM_L2, CARDS_SYSTEM_L3, CARDS_SYSTEM_L4, CARDS_SYSTEM_L5, CARDS_SYSTEM_L6, CARDS_SYSTEM_L7, CARDS_SYSTEM_L8, CARDS_SYSTEM_L9, CARDS_SYSTEM_L10 } from "@/lib/n2squad";
import { intentLabel } from "@/lib/frameworks";
import { textOf } from "@/lib/llm";
import { sentimentMenu, resolveImage, coverPhoto, imagesForCategory, sentimentKeys } from "@/lib/catalog";
import type { Carousel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;
// Diagramador: Sonnet 4.6 (mais esperto nas escolhas de capa/layout/foto/destaque).
const MODEL = process.env.ANTHROPIC_CARDS_MODEL || "claude-sonnet-4-6";

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { roteiro?: string; nCards?: number; caption?: boolean; registro?: string; hook?: string; emotions?: string[]; cover?: string; style?: string };
  const roteiro = (body.roteiro || "").trim();
  if (!roteiro) return Response.json({ error: "Manda o roteiro." }, { status: 400 });
  const isL2 = body.style === "layout2"; // arco editorial de 7 cards (Layout 2)
  const isL3 = body.style === "layout3"; // arco de storytelling de 5 cards (Layout 3)
  const isL4 = body.style === "layout4"; // revista de negócios, 8 cards (Layout 4)
  const isL5 = body.style === "layout5"; // editorial minimalista, 8 cards (Layout 5)
  const isL6 = body.style === "layout6"; // manifesto, 6 cards (Layout 6)
  const isL7 = body.style === "layout7"; // científico/autoridade, 9 cards (Layout 7)
  const isL8 = body.style === "layout8"; // 80/20 lifestyle, 5 cards (Layout 8)
  const isL9 = body.style === "layout9"; // editorial minimalista, 6 cards (Layout 9)
  const isL10 = body.style === "layout10"; // editorial vinho premium, 8 cards (Layout 10)
  const hasArc = !!body.style && body.style !== "layout1"; // qualquer estilo de arco fixo

  const lockedCover = (body.cover || "").trim().slice(0, 200);
  const intent = intentLabel(body.registro, body.hook, body.emotions);
  const intentBlock = lockedCover
    ? `\n\nA CAPA (card 1) JÁ ESTÁ DEFINIDA por você: "${lockedCover}". Use EXATAMENTE essa frase no headline do card de CAPA (com os ** do rosa). NÃO reescreva, NÃO destile, NÃO crie outra capa.`
    : intent
    ? `\n\nINTENÇÃO QUE VOCÊ ESCOLHEU PRO POST (${intent}). Use isto SÓ pra escolher a CAPA certa e o destaque em rosa — NÃO reescreva o texto. A CAPA tem que ser a linha da ABERTURA do roteiro que CUMPRE esse tipo de gancho e carrega esse tom; nunca a linha mais resumida/motivacional.`
    : "";

  const anthropic = new Anthropic({ apiKey: key });
  const { getGoldSlices } = await import("@/lib/store");
  const [menu, slices] = await Promise.all([sentimentMenu(), getGoldSlices()]);
  const libBlock = `\n\nSENTIMENTOS DISPONÍVEIS (imageSentiment): ${menu}`;
  // DIAGRAMAÇÕES QUE VOCÊ APROVOU — mostra o RITMO de layout que você curte (combate o "fatiado no automático")
  const sliceBlock = slices.length && !hasArc // só o Layout 1 usa os ritmos aprovados; os demais têm arco fixo
    ? `\n\nRITMOS DE DIAGRAMAÇÃO QUE VOCÊ APROVOU (siga ESTE tipo de variedade e ritmo de layout — capa que soca, verdade curta em quote, dado em data; NUNCA repita o mesmo layout em sequência). NÃO copie o tema, copie o RITMO:\n${slices.slice(0, 4).map((s) => `• ${s.pattern}`).join("\n")}`
    : "";
  const captionBlock = body.caption
    ? `\n\nINCLUA também no JSON um campo "legenda" (string): a legenda do post pro Instagram na voz do Cândido — a partir do roteiro, gancho na 1ª linha, 2-4 linhas, cta, e 8-12 hashtags.`
    : "";

  const userMsg = isL2
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 2 — arco editorial de 7 cards: capa → PROBLEMA 01 → PROBLEMA 02 → PROBLEMA 03 → impacto emocional → virada → CTA. PRESERVE as palavras do Cândido; distribua o conteúdo nos 7 beats, escolha imageSentiment e marque os destaques (**rosa** e ==caixa==). Os 7 layouts são exatamente: l2-capa, l2-dor-dir, l2-dor-esq, l2-dor-dir, l2-emocional, l2-virada, l2-cta.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL3
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 3 — storytelling de caso, 5 cards: capa educacional (abertura) → apresentação do caso → prova social → desenvolvimento (só texto) → antes e depois. PRESERVE as palavras do Cândido; distribua a história nos 5 beats, narrativa de revista premium, e marque o destaque em **rosa** com parcimônia. Os 5 layouts são exatamente, nesta ordem: l3-educacional, l3-capa, l3-prova, l3-historia, l3-antes-depois.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL4
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 4 — revista premium de negócios, 8 cards: capa → 3 argumentos (split) → destaque horizontal → 2 de autoridade (faixa) → CTA final. PRESERVE as palavras do Cândido; escolha imageSentiment pra todos e marque o destaque (**rosa**/==caixa==). Os 8 layouts, nesta ordem: l4-capa, l4-split, l4-split, l4-split, l4-horizontal, l4-faixa, l4-faixa, l4-final.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL5
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 5 — editorial minimalista premium, 8 cards: capa → argumento → impacto → 2 respiros (só texto) → solução → antes e depois → galeria. Minimalista, poucas palavras por slide. Os 8 layouts, nesta ordem: l5-capa, l5-split, l5-caixa, l5-texto, l5-texto, l5-solucao, l3-antes-depois, l5-galeria.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL6
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 6 — manifesto fitness premium, 6 cards: capa manifesto → storytelling pessoal → divisão 50/50 → manifesto (só texto) → lifestyle → fecho. Títulos enormes, storytelling, contraste alto. Os 6 layouts, nesta ordem: l6-capa, l6-historia, l2-dor-esq, l6-manifesto, l6-lifestyle, l6-fecho.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL7
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 7 — científico/autoridade, 9 cards: capa → problema → ciência → problema → ciência → prova → virada → prova → CTA. Use bullets no problema e referência (source) na ciência. Os 9 layouts, nesta ordem: l7-capa, l7-problema, l7-ciencia, l7-problema, l7-ciencia, l7-prova, l7-virada, l7-prova, l7-cta.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL8
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 8 — 80/20 lifestyle, 5 cards: 3 comparações (split com números, ex 80%/20%) → ruptura (frase central) → CTA (pergunta gigante). Pouquíssimo texto. Os 5 layouts, nesta ordem: l8-split, l8-split, l8-split, l8-ruptura, l8-cta.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL9
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 9 — editorial minimalista preto/cinza, 6 cards: capa (título gigante) → intro (palavra-gatilho) → 3 pontos/ferramentas → oferta/CTA. Hierarquia extrema, muito respiro. Os 6 layouts, nesta ordem: l9-capa, l9-intro, l9-conteudo, l9-conteudo, l9-conteudo, l9-final.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL10
    ? `Diagrame o ROTEIRO abaixo no LAYOUT 10 — editorial vinho premium (serifada + dourado), 8 cards: capa → direção (2, esquerda/direita) → método (2, esquerda/direita) → regra (caixa dourada) → resumo (checklist) → CTA. Elegância, 70% espaço vazio. Os 8 layouts, nesta ordem: l10-capa, l10-texto, l10-texto, l10-texto, l10-texto, l10-regra, l10-resumo, l10-cta.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : `Fatie o ROTEIRO abaixo em ${body.nCards || "8"} cards (aproximado — use bom senso, o número de cards segue o texto). PRESERVE as palavras do Cândido; só distribua, formate, escolha layout/imagem e marque o destaque em rosa.${intentBlock}${sliceBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`;

  // tenta extrair + reparar + parsear o JSON; retorna null se falhar
  function tryParse(text: string): (Carousel & { legenda?: string }) | null {
    let s = text.replace(/```json/gi, "").replace(/```/g, "");
    s = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
    const attempts = [
      s,
      s.replace(/[“”„]/g, '\\"').replace(/[‘’]/g, "'"), // aspas curvas -> escapadas
      s.replace(/,\s*([}\]])/g, "$1"), // vírgula sobrando
    ];
    for (const a of attempts) {
      try { return JSON.parse(a) as Carousel & { legenda?: string }; } catch {}
    }
    return null;
  }

  try {
    let parsed: (Carousel & { legenda?: string }) | null = null;
    let lastErr = "";
    let usage: Anthropic.Usage | undefined;
    // SEM extended thinking: o "planeje antes de cortar" mora no CARDS_SYSTEM (ele planeja na própria escrita).
    // Thinking aqui deixava o fatiador mais lento que o roteiro e estourava o tempo do servidor. Saída direta = rápido.
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: [{ type: "text", text: isL10 ? CARDS_SYSTEM_L10 : isL9 ? CARDS_SYSTEM_L9 : isL8 ? CARDS_SYSTEM_L8 : isL7 ? CARDS_SYSTEM_L7 : isL6 ? CARDS_SYSTEM_L6 : isL5 ? CARDS_SYSTEM_L5 : isL4 ? CARDS_SYSTEM_L4 : isL3 ? CARDS_SYSTEM_L3 : isL2 ? CARDS_SYSTEM_L2 : CARDS_SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: attempt === 0 ? userMsg : userMsg + "\n\nATENÇÃO: a resposta anterior veio quebrada. Gere JSON ESTRITAMENTE VÁLIDO — escape as aspas com \\\" , use \\n pra quebra de linha, sem vírgula sobrando, sem aspas curvas." }],
      });
      usage = res.usage;
      parsed = tryParse(textOf(res));
      if (!parsed) lastErr = "JSON inválido (tentativa " + (attempt + 1) + ")";
    }
    if (!parsed) throw new Error("Não consegui montar os cards (JSON do modelo veio quebrado). Tenta de novo. " + lastErr);
    const carousel: Carousel = { tema: parsed.tema, cards: parsed.cards };
    const legenda = parsed.legenda?.replace(/\*\*/g, "");

    // CAPA TRAVADA: usa a frase verbatim no card cover (o cards não destila/distorce)
    if (lockedCover) {
      const cv = carousel.cards.find((c) => c.layout === "cover" || c.layout.endsWith("-capa")) || carousel.cards[0];
      if (cv) cv.headline = lockedCover;
    }

    const n = carousel.cards.length;
    const NO_PHOTO = new Set(["l2-emocional", "l3-historia", "l5-texto", "l6-manifesto", "l8-cta", "l9-intro", "l10-texto", "l10-regra", "l10-resumo", "l10-cta"]); // layouts de arco sem foto
    for (let i = 0; i < n; i++) {
      const c = carousel.cards[i];
      c.id ||= `card-${i + 1}`;
      c.index = `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
      if (c.layout === "cover") c.image = (await coverPhoto()) || c.image;
      else if (c.layout === "l2-emocional" || c.layout === "l3-historia") { /* sem foto */ }
      else if (c.layout === "l2-capa") c.image = (c.imageSentiment ? await resolveImage(c.imageSentiment) : await coverPhoto()) || c.image;
      else if (c.layout === "l3-prova") c.image = (await resolveImage(c.imageSentiment || "feedbacks")) || c.image;
      else if (c.layout === "l3-antes-depois") {
        const imgs = await imagesForCategory("antes-e-depois");
        if (imgs.length) {
          const a = Math.floor(Math.random() * imgs.length);
          let b = Math.floor(Math.random() * imgs.length);
          if (imgs.length > 1) while (b === a) b = Math.floor(Math.random() * imgs.length);
          c.image = imgs[a]; c.image2 = imgs[b];
        }
      }
      else if (c.imageSentiment) c.image = (await resolveImage(c.imageSentiment)) || c.image;
      else if (c.layout === "moral") c.image = (await resolveImage("foco")) || c.image;
      // fallback: nos estilos de arco, layouts que pedem foto nunca ficam sem (a IA às vezes esquece o imageSentiment)
      if (hasArc && !c.image && !NO_PHOTO.has(c.layout)) {
        let img = c.imageSentiment ? await resolveImage(c.imageSentiment) : undefined;
        if (!img) {
          for (const k of (await sentimentKeys()).sort(() => Math.random() - 0.5)) {
            const pool = await imagesForCategory(k);
            if (pool.length) { img = pool[Math.floor(Math.random() * pool.length)]; break; }
          }
        }
        if (img) c.image = img;
      }
      // Layout 8 (split/ruptura) usa 2 fotos: a de baixo (image2) sai de outra categoria
      if ((c.layout === "l8-split" || c.layout === "l8-ruptura") && !c.image2) {
        for (const k of (await sentimentKeys()).sort(() => Math.random() - 0.5)) {
          const cand = (await imagesForCategory(k)).filter((u) => u !== c.image);
          if (cand.length) { c.image2 = cand[Math.floor(Math.random() * cand.length)]; break; }
        }
      }
    }
    return Response.json({ carousel, legenda, usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
