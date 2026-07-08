// ETAPA 2 — fatia o ROTEIRO aprovado em cards (formatação/design). NÃO reescreve o texto.
import Anthropic from "@anthropic-ai/sdk";
import { CARDS_SYSTEM, CARDS_SYSTEM_L2, CARDS_SYSTEM_L3, CARDS_SYSTEM_L4, CARDS_SYSTEM_L5, CARDS_SYSTEM_L6, CARDS_SYSTEM_L7, CARDS_SYSTEM_L8, CARDS_SYSTEM_L9, CARDS_SYSTEM_L10 } from "@/lib/n2squad";
import { intentLabel } from "@/lib/frameworks";
import { textOf } from "@/lib/llm";
import { sentimentMenu, resolveImage, coverPhoto, imagesForCategory, sentimentKeys } from "@/lib/catalog";
import { cleanCaption, cleanCarousel, cleanGeneratedText, GENERATION_RULES } from "@/lib/generation-rules";
import type { Card, Carousel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;
// Diagramador: Sonnet 4.6 (mais esperto nas escolhas de capa/layout/foto/destaque).
const MODEL = process.env.ANTHROPIC_CARDS_MODEL || "claude-sonnet-4-6";

const STYLE_LAYOUTS: Record<string, Card["layout"][]> = {
  layout2: ["l2-capa", "l2-dor-dir", "l2-dor-esq", "l2-dor-dir", "l2-emocional", "l2-virada", "l2-cta"],
  layout3: ["l3-educacional", "l3-capa", "l3-prova", "l3-historia", "l3-antes-depois"],
  layout4: ["l4-capa", "l4-split", "l4-split", "l4-split", "l4-horizontal", "l4-faixa", "l4-faixa", "l4-final"],
  layout5: ["l5-capa", "l5-split", "l5-caixa", "l5-texto", "l5-texto", "l5-solucao", "l3-antes-depois", "l5-galeria"],
  layout6: ["l6-capa", "l6-historia", "l2-dor-esq", "l6-manifesto", "l6-lifestyle", "l6-fecho"],
  layout7: ["l7-capa", "l7-problema", "l7-ciencia", "l7-problema", "l7-ciencia", "l7-prova", "l7-virada", "l7-prova", "l7-cta"],
  layout8: ["l8-split", "l8-split", "l8-split", "l8-ruptura", "l8-cta"],
  layout9: ["l9-capa", "l9-intro", "l9-conteudo", "l9-conteudo", "l9-conteudo", "l9-final"],
  layout10: ["l10-capa", "l10-texto", "l10-texto", "l10-texto", "l10-texto", "l10-regra", "l10-resumo", "l10-cta"],
};

function clampCards(n?: number) {
  const x = Number.isFinite(n) ? Math.round(n!) : 8;
  return Math.min(12, Math.max(3, x));
}

// O Cândido odeia card lotado de texto — orçamento duro anexado a TODO layout.
const BREVIDADE = `

## POUCO TEXTO POR CARD (REGRA MAIS IMPORTANTE DE TODAS)
O Cândido NÃO GOSTA de card com muito texto. Card lotado = FALHOU, mesmo que o conteúdo seja bom.
- ORÇAMENTO DURO por card: headline até 8 palavras · body até 22 palavras (2 a 3 linhas curtas) · bullets no máximo 4, cada um até 6 palavras.
- PROIBIDO card com mais de 40 palavras somando headline + body + bullets.
- Se o trecho do roteiro estoura o orçamento: corte a gordura (conectivos, repetições, exemplo redundante) mantendo VERBATIM as frases do Cândido que ficarem — ou distribua em mais um card.
- Um card com UMA frase forte vale mais que um card com cinco frases médias. Respiro visual > completude.
- Na dúvida entre caber tudo ou cortar: CORTE. O carrossel ensina UMA ideia por card, não despeja o roteiro inteiro.

## O ÚLTIMO CARD (moral/cta/fecho) — O MENOR DE TODOS
O fecho é um CTA bonito e chamativo, não um resumo. REGRA DURA:
- headline: NO MÁXIMO 6 palavras (a moral em uma frase que arde)
- SEM body. Se precisar muito, body de até 8 palavras
- signoff: SÓ "Click no link da bio" — curto, nada além disso
- NUNCA despeje sobra de roteiro no último card. Sobrou texto? Corta ou redistribui nos cards do meio.`;

function adaptLayouts(base: Card["layout"][], n: number): Card["layout"][] {
  if (!base.length) return [];
  if (n <= base.length) {
    const mids = base.slice(1, -1);
    const midCount = Math.max(0, n - 2);
    const picked = midCount === 0
      ? []
      : midCount === 1
      ? [mids[Math.floor(mids.length / 2)] || base[1]]
      : Array.from({ length: midCount }, (_, i) => mids[Math.round((i * (mids.length - 1)) / (midCount - 1))] || mids[0]);
    return [base[0], ...picked, base[base.length - 1]];
  }
  const out = [...base];
  const mids = base.slice(1, -1);
  let i = 0;
  while (out.length < n) out.splice(out.length - 1, 0, mids[i++ % mids.length] || base[1] || base[0]);
  return out;
}

function pickEvenCards(cards: Card[], n: number): Card[] {
  if (cards.length <= n) return cards;
  if (n === 1) return [cards[0]];
  return Array.from({ length: n }, (_, i) => cards[Math.round((i * (cards.length - 1)) / (n - 1))]);
}

function styleInstruction(style: string | undefined, n: number): { text: string; layouts: Card["layout"][] } {
  const layouts = style ? adaptLayouts(STYLE_LAYOUTS[style] || [], n) : [];
  const seq = layouts.length ? `\nSEQUENCIA DE LAYOUTS OBRIGATORIA (${n} cards): ${layouts.join(" → ")}.` : "";
  const count = `QUANTIDADE OBRIGATORIA: gere EXATAMENTE ${n} cards. Nem mais, nem menos. O campo "Nº de cards" do usuario manda mais que qualquer arco de layout.`;
  if (style === "layout2") return { layouts, text: `${count}${seq}\nEstilo Layout 2: editorial premium, minimalista, alto contraste. Adapte o arco para ${n} cards: capa, dores/erro principal, impacto/virada e CTA conforme couber.` };
  if (style === "layout3") return { layouts, text: `${count}${seq}\nEstilo Layout 3: storytelling/caso, clima de reportagem premium. Adapte abertura, caso/prova, desenvolvimento e antes/depois conforme couber.` };
  if (style === "layout4") return { layouts, text: `${count}${seq}\nEstilo Layout 4: revista premium de negocios, titulos fortes, foto editorial e espaco negativo.` };
  if (style === "layout5") return { layouts, text: `${count}${seq}\nEstilo Layout 5: editorial minimalista premium, uma mensagem por slide, muito respiro.` };
  if (style === "layout6") return { layouts, text: `${count}${seq}\nEstilo Layout 6: manifesto fitness premium, conviccao, fotos escuras e contraste alto.` };
  if (style === "layout7") return { layouts, text: `${count}${seq}\nEstilo Layout 7: cientifico/autoridade, visual de relatorio premium e linguagem clara.` };
  if (style === "layout8") return { layouts, text: `${count}${seq}\nEstilo Layout 8: 80/20 lifestyle premium, fotos e numeros grandes, pouquissimo texto.` };
  if (style === "layout9") return { layouts, text: `${count}${seq}\nEstilo Layout 9: editorial minimalista preto/cinza, hierarquia agressiva e muito vazio.` };
  if (style === "layout10") return { layouts, text: `${count}${seq}\nEstilo Layout 10: vinho premium, serifada, dourado e regra 70/30 de espaco vazio.` };
  return { layouts, text: `${count}\nUse layouts do Layout 1 com variedade coerente e preserve o texto aprovado.` };
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { roteiro?: string; nCards?: number; caption?: boolean; registro?: string; hook?: string; emotions?: string[]; cover?: string; style?: string };
  const roteiro = (body.roteiro || "").trim();
  if (!roteiro) return Response.json({ error: "Manda o roteiro." }, { status: 400 });
  const desiredCards = clampCards(body.nCards);
  const isL2 = body.style === "layout2"; // editorial premium
  const isL3 = body.style === "layout3"; // storytelling
  const isL4 = body.style === "layout4"; // revista de negócios
  const isL5 = body.style === "layout5"; // editorial minimalista
  const isL6 = body.style === "layout6"; // manifesto
  const isL7 = body.style === "layout7"; // científico/autoridade
  const isL8 = body.style === "layout8"; // 80/20 lifestyle
  const isL9 = body.style === "layout9"; // editorial minimalista
  const isL10 = body.style === "layout10"; // editorial vinho premium
  const hasArc = !!body.style && body.style !== "layout1"; // estilos com sequência própria adaptável

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
  const styleGuide = styleInstruction(body.style, desiredCards);
  // DIAGRAMAÇÕES QUE VOCÊ APROVOU — mostra o RITMO de layout que você curte (combate o "fatiado no automático")
  const sliceBlock = slices.length && !hasArc // só o Layout 1 usa os ritmos aprovados; os demais usam sequência adaptável
    ? `\n\nRITMOS DE DIAGRAMAÇÃO QUE VOCÊ APROVOU (siga ESTE tipo de variedade e ritmo de layout — capa que soca, verdade curta em quote, dado em data; NUNCA repita o mesmo layout em sequência). NÃO copie o tema, copie o RITMO:\n${slices.slice(0, 4).map((s) => `• ${s.pattern}`).join("\n")}`
    : "";
  const captionBlock = body.caption
    ? `\n\nINCLUA também no JSON um campo "legenda" (string): a legenda do post pro Instagram na voz do Cândido — a partir do roteiro, gancho na 1ª linha, 2-4 linhas, CTA e no máximo 5 hashtags. Escolha as hashtags com maior chance de engajamento para público feminino fitness, treino, glúteo, evolução e consultoria.`
    : "";

  const userMsg = isL2
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; escolha imageSentiment e marque os destaques (**rosa** e ==caixa==).${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL3
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; distribua a história com narrativa premium e marque o destaque em **rosa** com parcimônia.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL4
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; escolha imageSentiment e marque o destaque (**rosa**/==caixa==).${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL5
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; use poucas palavras por slide e muito respiro.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL6
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; títulos grandes, storytelling e contraste alto.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL7
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; use bullets quando ajudar e ciência como clareza, não jargão.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL8
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; pouquíssimo texto, fotos fortes e números quando couber.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL9
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; hierarquia extrema e muito respiro.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : isL10
    ? `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; elegância, 70% espaço vazio e CTA limpo.${intentBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`
    : `${GENERATION_RULES}\n\n${styleGuide.text}\nPRESERVE as palavras do Cândido; só distribua, formate, escolha layout/imagem e marque o destaque em rosa.${intentBlock}${sliceBlock}${libBlock}${captionBlock}\n\nROTEIRO APROVADO:\n${roteiro}`;

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
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      const retryNote = attempt === 0
        ? ""
        : `\n\nATENÇÃO: a resposta anterior falhou (${lastErr}). Gere JSON ESTRITAMENTE VÁLIDO e com EXATAMENTE ${desiredCards} cards. Escape as aspas com \\\" , use \\n pra quebra de linha, sem vírgula sobrando, sem aspas curvas.`;
      const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: [{ type: "text", text: (isL10 ? CARDS_SYSTEM_L10 : isL9 ? CARDS_SYSTEM_L9 : isL8 ? CARDS_SYSTEM_L8 : isL7 ? CARDS_SYSTEM_L7 : isL6 ? CARDS_SYSTEM_L6 : isL5 ? CARDS_SYSTEM_L5 : isL4 ? CARDS_SYSTEM_L4 : isL3 ? CARDS_SYSTEM_L3 : isL2 ? CARDS_SYSTEM_L2 : CARDS_SYSTEM) + BREVIDADE, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: userMsg + retryNote }],
      });
      usage = res.usage;
      parsed = tryParse(textOf(res));
      if (!parsed) {
        lastErr = "JSON inválido na tentativa " + (attempt + 1);
        continue;
      }
      const count = parsed.cards?.length || 0;
      if (count < desiredCards) {
        lastErr = `vieram ${count} cards, preciso de ${desiredCards}`;
        parsed = null;
      }
    }
    if (!parsed) throw new Error("Não consegui montar os cards (JSON do modelo veio quebrado). Tenta de novo. " + lastErr);
    const fittedCards = pickEvenCards(parsed.cards || [], desiredCards).map((c, i) => styleGuide.layouts[i] ? { ...c, layout: styleGuide.layouts[i] } : c);
    const carousel: Carousel = cleanCarousel({ tema: parsed.tema, cards: fittedCards });
    const legenda = cleanCaption(parsed.legenda?.replace(/\*\*/g, ""));

    // CAPA TRAVADA: usa a frase verbatim no card cover (o cards não destila/distorce)
    if (lockedCover) {
      const cv = carousel.cards.find((c) => c.layout === "cover" || c.layout.endsWith("-capa")) || carousel.cards[0];
      if (cv) cv.headline = cleanGeneratedText(lockedCover) || lockedCover;
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
