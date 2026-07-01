import type { Card, Layout } from "@/lib/types";

export type CardElementKind = "logo" | "text" | "bar" | "decor" | "marker";

export interface CardElementDef {
  id: string;
  label: string;
  kind: CardElementKind;
  hidden?: boolean;
  x: number;
  y: number;
  w?: number;
  h?: number;
  size?: number;
  color?: string;
  text?: string;
  movable?: boolean;
  sizable?: boolean;
  editable?: boolean;
  colorable?: boolean;
}

const RED = "#ef476f";
const GOLD = "#c9a24b";

const l2Layouts: Layout[] = ["l2-capa", "l2-dor-dir", "l2-dor-esq", "l2-emocional", "l2-virada", "l2-cta"];
const l3DarkLayouts: Layout[] = ["l3-capa", "l3-educacional", "l3-prova", "l3-historia"];
const l7ChromeLayouts: Layout[] = ["l7-capa", "l7-problema", "l7-ciencia", "l7-prova", "l7-virada"];
const l9Layouts: Layout[] = ["l9-capa", "l9-intro", "l9-conteudo", "l9-final"];
const l10ChromeLayouts: Layout[] = ["l10-capa", "l10-texto", "l10-regra", "l10-resumo"];

function topBar(h: number): CardElementDef {
  return { id: "topBar", label: "Barra superior", kind: "bar", x: 0, y: 0, w: 1080, h, color: RED, movable: true, sizable: true, colorable: true };
}

export function cardElementDefs(cardOrLayout: Card | Layout): CardElementDef[] {
  const layout = typeof cardOrLayout === "string" ? cardOrLayout : cardOrLayout.layout;
  const hasIndex = typeof cardOrLayout !== "string" && !!cardOrLayout.index;
  const defs: CardElementDef[] = [];

  if (hasIndex) {
    defs.push({ id: "index", label: "Índice / numeração", kind: "text", x: 0.86, y: 0.93, size: 34, color: "#d2d2d2", text: "índice", movable: true, sizable: true, editable: true, colorable: true });
  }

  if (layout === "moral") {
    defs.push({ id: "moralLogo", label: "Logo do fecho", kind: "logo", x: 0.06, y: 0.82, w: 200, movable: true, sizable: true });
  }
  if (layout === "quote") {
    defs.push({ id: "quoteMark", label: "Aspas decorativa", kind: "text", x: 0.065, y: 0.096, size: 200, color: RED, text: "“", movable: true, sizable: true, editable: true, colorable: true });
  }
  if (layout === "list") {
    defs.push({ id: "listMarker", label: "Marcador dos bullets", kind: "marker", x: 0, y: 0, w: 34, h: 6, color: RED, sizable: true, colorable: true });
  }
  if (layout === "steps") {
    defs.push({ id: "stepMarker", label: "Marcador dos passos", kind: "marker", x: 0, y: 0, w: 66, h: 66, color: RED, text: "número", sizable: true, editable: true, colorable: true });
  }
  if (l2Layouts.includes(layout)) defs.push(topBar(9));
  if (l3DarkLayouts.includes(layout)) defs.push(topBar(5));

  if (layout === "l3-antes-depois") {
    defs.push({ id: "beforeAfterLogo", label: "Logo central", kind: "logo", x: 0.457, y: 0.111, w: 92, movable: true, sizable: true });
    defs.push({ id: "beforeLabel", label: "Texto ANTES", kind: "text", x: 0.08, y: 0.225, size: 26, color: "#ffffff", text: "ANTES", movable: true, sizable: true, editable: true, colorable: true });
    defs.push({ id: "afterLabel", label: "Texto DEPOIS", kind: "text", x: 0.526, y: 0.225, size: 26, color: "#ffffff", text: "DEPOIS", movable: true, sizable: true, editable: true, colorable: true });
  }

  if (layout === "l4-capa") {
    defs.push({ id: "l4Logo", label: "Logo da capa", kind: "logo", x: 0.852, y: 0.881, w: 120, movable: true, sizable: true });
  }
  if (layout === "l4-final") {
    defs.push({ id: "l4Logo", label: "Logo final", kind: "logo", x: 0.804, y: 0.843, w: 168, movable: true, sizable: true });
  }
  if (layout === "l4-faixa") {
    defs.push({ id: "sideBand", label: "Faixa azul lateral", kind: "decor", x: 0, y: 0, w: 497, h: 1350, color: "rgba(20,33,61,.95)", movable: true, sizable: true, colorable: true });
  }

  if (layout === "l5-capa") {
    defs.push({ id: "l5Logo", label: "Logo da capa", kind: "logo", x: 0.052, y: 0.04, w: 118, movable: true, sizable: true });
  }
  if (layout === "l5-galeria") {
    defs.push({ id: "galleryBrand", label: "Rodapé da galeria", kind: "text", x: 0.5, y: 0.944, size: 24, color: "#14213d", text: "CÂNDIDO NETTO\n· N² SQUAD", movable: true, sizable: true, editable: true, colorable: true });
  }

  if (layout.startsWith("l6-")) {
    defs.push({ id: "l6Decor", label: "Moldura / vinheta", kind: "decor", x: 0, y: 0, w: 1080, h: 1350, color: RED, movable: false, sizable: false, colorable: true });
  }
  if (layout === "l6-capa" || layout === "l6-fecho" || layout === "l6-manifesto") {
    defs.push({ id: "brandFooter", label: "Assinatura do rodapé", kind: "text", x: 0.5, y: 0.92, size: 28, color: "#f5f5f5", text: "CÂNDIDO NETTO\nCONSULTORIA FITNESS · N² SQUAD", movable: true, sizable: true, editable: true, colorable: true });
  }

  if (l7ChromeLayouts.includes(layout)) {
    defs.push(topBar(6));
    defs.push({ id: "l7Logo", label: "Logo superior", kind: "logo", x: 0.446, y: 0.022, w: 116, movable: true, sizable: true });
    defs.push({ id: "l7Progress", label: "Progresso inferior", kind: "decor", x: 0.059, y: 0.941, w: 952, h: 32, color: RED, movable: true, sizable: true, colorable: true });
  }
  if (layout === "l7-cta") {
    defs.push(topBar(6));
    defs.push({ id: "l7Logo", label: "Logo superior", kind: "logo", x: 0.42, y: 0.033, w: 172, movable: true, sizable: true });
  }
  if (layout === "l7-problema") {
    defs.push({ id: "l7Bullet", label: "Marcador dos bullets", kind: "marker", x: 0, y: 0, w: 18, h: 4, color: RED, sizable: true, colorable: true });
  }

  if (l9Layouts.includes(layout)) {
    defs.push({ id: "l9Footer", label: "Rodapé editorial", kind: "text", x: 0.052, y: 0.957, size: 15, color: "#f5f5f5", text: "editorial premium · n² squad", movable: true, sizable: true, editable: true, colorable: true });
    defs.push({ id: "l9Barcode", label: "Código de barras", kind: "decor", x: 0.809, y: 0.931, w: 150, h: 26, color: "#f5f5f5", movable: true, sizable: true, colorable: true });
  }

  if (l10ChromeLayouts.includes(layout)) {
    defs.push({ id: "l10Logo", label: "Logo inferior", kind: "logo", x: 0.464, y: 0.911, w: 78, movable: true, sizable: true });
  }
  if (layout === "l10-cta") {
    defs.push({ id: "l10Logo", label: "Logo CTA", kind: "logo", x: 0.458, y: 0.305, w: 90, movable: true, sizable: true });
  }
  if (layout === "l10-resumo") {
    defs.push({ id: "l10Check", label: "Ícone do checklist", kind: "marker", x: 0, y: 0, size: 30, color: GOLD, text: "✓", sizable: true, editable: true, colorable: true });
  }

  return defs;
}

export function resolveCardElement(card: Card, def: CardElementDef): CardElementDef {
  const o = card.elements?.[def.id] || {};
  return {
    ...def,
    ...o,
    text: o.text ?? def.text,
    x: o.x ?? def.x,
    y: o.y ?? def.y,
    w: o.w ?? def.w,
    h: o.h ?? def.h,
    size: o.size ?? def.size,
    color: o.color ?? def.color,
  };
}

export function cardElement(card: Card, id: string, fallback: CardElementDef): CardElementDef {
  return resolveCardElement(card, fallback);
}
