// NOTA DE DESEMPENHO — composto equilibrado (escolha do Cândido).
// Junta QUALIDADE (salvar/compartilhar/comentar) + CRESCIMENTO (perfil/seguidor) + NEGÓCIO (DM/venda),
// TUDO relativo ao alcance. Cada métrica é normalizada pelo melhor post (0..1) e somada pelos pesos.
// Curtida fica DE FORA de propósito (sinal fraco/vaidade). A nota é RELATIVA aos teus próprios posts.
import type { Post, Metrics } from "@/lib/types";

type W = { key: keyof Metrics; w: number; group: "qualidade" | "crescimento" | "negocio" };
export const WEIGHTS: W[] = [
  { key: "salvamentos", w: 0.20, group: "qualidade" },     // qualidade ~40%
  { key: "compartilhamentos", w: 0.13, group: "qualidade" },
  { key: "comentarios", w: 0.07, group: "qualidade" },
  { key: "visitasPerfil", w: 0.15, group: "crescimento" },  // crescimento ~30%
  { key: "seguidores", w: 0.15, group: "crescimento" },
  { key: "dms", w: 0.15, group: "negocio" },                // negócio ~30%
  { key: "vendas", w: 0.15, group: "negocio" },
];

export const NOTA_MINIMA_OURO = 70;   // pra virar estrutura-ouro: top do teu acervo
export const MIN_MEDIDOS_OURO = 3;    // e com pelo menos isso de amostra (senão "top" não significa nada)

function rate(m: Metrics | undefined, key: keyof Metrics): number | null {
  if (!m || !m.alcance) return null;
  const v = m[key] as number | undefined;
  return typeof v === "number" ? v / m.alcance : null;
}

// post "medido" = tem alcance E pelo menos uma métrica que entra na nota
export function isMeasured(p: Post): boolean {
  return !!p.metrics?.alcance && WEIGHTS.some((wm) => typeof p.metrics?.[wm.key] === "number");
}
export function measuredCount(posts: Post[]): number {
  return posts.filter(isMeasured).length;
}

// nota 0..100 por post (null = sem dados suficientes). Renormaliza os pesos só nas métricas que EXISTEM no acervo.
export function performanceScores(posts: Post[]): Record<string, number | null> {
  const measured = posts.filter(isMeasured);
  const maxRate: Partial<Record<keyof Metrics, number>> = {};
  for (const wm of WEIGHTS) {
    let mx = 0;
    for (const p of measured) { const r = rate(p.metrics, wm.key); if (r && r > mx) mx = r; }
    maxRate[wm.key] = mx;
  }
  const out: Record<string, number | null> = {};
  for (const p of posts) {
    if (!isMeasured(p)) { out[p.id] = null; continue; }
    let num = 0, den = 0;
    for (const wm of WEIGHTS) {
      const mx = maxRate[wm.key] || 0;
      if (mx <= 0) continue; // métrica que ninguém tem → ignora (não pune todo mundo igual)
      num += wm.w * ((rate(p.metrics, wm.key) || 0) / mx);
      den += wm.w;
    }
    out[p.id] = den > 0 ? Math.round((num / den) * 100) : null;
  }
  return out;
}
