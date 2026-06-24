// PONTE ENTRE AS TELAS — agora que cada aba é uma página própria, os "abre o Criar já com X"
// passam por aqui: a tela de origem grava uma intenção, navega pra /criar, e o Criar aplica no carregar.
import type { Carousel, Post } from "@/lib/types";
import type { Registro } from "@/lib/vitals";

export type Intent =
  | { kind: "novo" }                                   // começar do zero (etapa texto)
  | { kind: "resume" }                                 // continuar o rascunho de onde parou
  | { kind: "pede"; registro: Registro }               // criar já com um tom (Dose pediu)
  | { kind: "hook"; post: Post }                        // criar a partir de uma ideia/gancho do Quadro
  | { kind: "open"; carousel: Carousel }               // abrir um carrossel pronto no editor
  | { kind: "pauta"; tema: string; angulo: string };   // criar a partir de uma pauta da Marca

const INTENT_KEY = "dg_intent";

export function setIntent(i: Intent) {
  try { sessionStorage.setItem(INTENT_KEY, JSON.stringify(i)); } catch {}
}
export function takeIntent(): Intent | null {
  try {
    const s = sessionStorage.getItem(INTENT_KEY);
    if (!s) return null;
    sessionStorage.removeItem(INTENT_KEY); // consome uma vez só
    return JSON.parse(s) as Intent;
  } catch { return null; }
}

// RASCUNHO do Criar (localStorage) — lido por outras telas (ex: Hoje mostra "continuar de onde parou").
export interface Draft {
  carousel?: Carousel; legenda?: string; roteiro?: string; content?: string; nCards?: number;
  registro?: Registro | ""; hook?: string; emotions?: string[]; caption?: boolean;
  chosenHook?: string; chosenCover?: string; correlation?: string; inlineSrc?: string; inlineName?: string;
}
export const DRAFT_KEY = "dg_draft";
export function readDraft(): Draft | null {
  try {
    const s = localStorage.getItem(DRAFT_KEY);
    if (!s) return null;
    const d = JSON.parse(s);
    // compat: formato antigo era o carrossel cru
    if (d && !d.carousel && d.cards) return { carousel: d };
    return d as Draft;
  } catch { return null; }
}
