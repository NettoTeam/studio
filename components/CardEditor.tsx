"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import type { Card, Layout, Overlay, CardImage, Carousel, TextAlign, CardElementOverride } from "@/lib/types";
import { cardElementDefs, resolveCardElement } from "@/lib/card-elements";

function sectionIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("layout")) return "▦";
  if (t.includes("título")) return "T";
  if (t.includes("mover")) return "↕";
  if (t.includes("texto")) return "Aa";
  if (t.includes("fundo")) return "◐";
  if (t.includes("logo")) return "◇";
  if (t.includes("elementos")) return "◆";
  if (t.includes("nick")) return "@";
  if (t.includes("overlay") || t.includes("imagens")) return "□";
  if (t.includes("ia")) return "AI";
  if (t.includes("kit")) return "K";
  return "•";
}

function Section({ title, children, right, open, onToggle, secId }: { title: string; children: ReactNode; right?: ReactNode; open?: boolean; onToggle?: () => void; secId?: string }) {
  const collapsible = onToggle != null;
  const isOpen = collapsible ? !!open : true;
  return (
    <section
      className={"dg-box card-section-shell" + (isOpen ? " is-open" : "")}
      id={secId ? "sec-" + secId : undefined}
      style={{ marginBottom: 6, borderRadius: 12, overflow: "hidden", borderColor: isOpen ? "rgba(239,71,111,.32)" : "rgba(255,255,255,.07)", scrollMarginTop: 80, transition: "border-color .2s" }}
    >
      <div
        className="card-section-toggle"
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onClick={onToggle}
        onKeyDown={(e) => { if (!collapsible) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle?.(); } }}
        style={{ width: "100%", border: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 52, padding: "0 14px", cursor: collapsible ? "pointer" : "default", userSelect: "none", background: isOpen ? "rgba(239,71,111,0.07)" : "rgba(255,255,255,.025)", transition: "background .18s", textAlign: "left" }}
      >
        <div className="card-section-label" style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <span className="card-section-icon" style={{ width: 34, height: 34, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 900, color: isOpen ? "#fff" : "#7a8399", background: isOpen ? "#ef476f" : "rgba(255,255,255,.06)", border: "1.5px solid " + (isOpen ? "#ef476f" : "rgba(255,255,255,.09)"), transition: "background .18s, color .18s, border-color .18s" }}>{sectionIcon(title)}</span>
          <span className="card-section-title" style={{ fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: 14, fontWeight: 700, color: isOpen ? "#fff" : "#9aa0b0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color .18s" }}>{title}</span>
        </div>
        <div className="card-section-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {right && <div className="card-section-right" onClick={(e) => e.stopPropagation()}>{right}</div>}
          {collapsible && <span className="card-section-caret" style={{ color: isOpen ? "#ef476f" : "#4a5168", fontSize: 18, lineHeight: 1, display: "inline-block", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .22s, color .18s" }}>⌄</span>}
        </div>
      </div>
      {/* Animação via CSS grid — compatível com altura dinâmica */}
      <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows .25s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <div className="card-section-body" style={{ padding: "4px 14px 16px" }}>{children}</div>
        </div>
      </div>
    </section>
  );
}

function Slider({ label, val, min, max, step, on, fmt, pctEdit }: { label: string; val: number; min: number; max: number; step: number; on: (v: number) => void; fmt?: (v: number) => string; pctEdit?: boolean }) {
  return (
    <div className="card-slider" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
      <span className="card-slider-label" style={{ width: 88, fontSize: 12, color: "#9aa0b2", flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => on(Number(e.target.value))} style={{ flex: 1, accentColor: "#ef476f", height: 4 }} />
      {pctEdit ? (
        <span style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <input type="number" value={Math.round(val * 100)} min={Math.round(min * 100)} max={Math.round(max * 100)}
            onChange={(e) => { const n = Number(e.target.value); if (Number.isFinite(n)) on(Math.min(max, Math.max(min, n / 100))); }}
            style={{ width: 42, fontSize: 12, color: "#cfcfcf", textAlign: "right", background: "#121216", border: "1px solid #2e2e36", borderRadius: 5, padding: "3px 4px", MozAppearance: "textfield" }} />
          <span style={{ fontSize: 11, color: "#8a93a8" }}>%</span>
        </span>
      ) : (
        <span style={{ width: 42, fontSize: 12, color: "#8a93a8", textAlign: "right", flexShrink: 0 }}>{fmt ? fmt(val) : val}</span>
      )}
    </div>
  );
}

// paleta padrão da marca + branco/preto, base dos seletores de cor
const PALETTE_SWATCHES: { hex: string; n: string }[] = [
  { hex: "#f5f5f5", n: "branco" },
  { hex: "#000000", n: "preto" },
  { hex: "#ef476f", n: "rosa" },
  { hex: "#14213d", n: "azul" },
  { hex: "#9aa0b0", n: "cinza" },
];
function Swatch({ hex, on, onClick, title }: { hex: string; on: boolean; onClick: () => void; title?: string }) {
  return <button title={title} onClick={onClick} style={{ width: 26, height: 26, borderRadius: 6, background: hex, border: on ? "2px solid #ef476f" : "1px solid #5a6480", cursor: "pointer", boxShadow: on ? "0 0 0 2px rgba(239,71,111,.35)" : "none", flex: "0 0 auto" }} />;
}
// Seletor de cor: paleta + favoritas + cor por código + salvar favorita + voltar ao padrão
function ColorRow({ label, value, def, onChange, favs, onFav }: { label: string; value?: string; def: string; onChange: (v: string | undefined) => void; favs: string[]; onFav: (hex: string) => void }) {
  const cur = (value || def).toLowerCase();
  return (
    <div style={{ marginTop: 10 }}>
      <label style={{ fontSize: 11, color: "#b0b6c4", display: "block", marginBottom: 5 }}>{label}</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {PALETTE_SWATCHES.map((s) => <Swatch key={s.hex} hex={s.hex} title={s.n} on={cur === s.hex.toLowerCase()} onClick={() => onChange(s.hex)} />)}
        {favs.length > 0 && <span style={{ width: 1, height: 22, background: "#2e2e36", margin: "0 1px" }} />}
        {favs.map((h) => <Swatch key={h} hex={h} title={h} on={cur === h} onClick={() => onChange(h)} />)}
        <label style={{ position: "relative", width: 26, height: 26, borderRadius: 6, border: "1px dashed #5a6480", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#9aa0b0", flex: "0 0 auto" }} title="cor por código">
          +
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(cur) ? cur : "#ffffff"} onChange={(e) => onChange(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
        </label>
        <input value={value || ""} placeholder={def} onChange={(e) => onChange(e.target.value || undefined)} style={{ width: 82, fontSize: 11, color: "#cfcfcf", background: "#121216", border: "1px solid #2e2e36", borderRadius: 6, padding: "5px 6px" }} />
        <button onClick={() => onFav(cur)} title="salvar nas favoritas" style={{ fontSize: 12, background: "transparent", color: "#e8c860", border: "1px solid #6a5a1e", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>★</button>
        <button onClick={() => onChange(undefined)} title="voltar ao padrão" style={{ fontSize: 11, background: "transparent", color: "#9aa0b0", border: "1px solid #3b3b44", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>padrão</button>
      </div>
    </div>
  );
}

// Botões "alinhar à página" (estilo Canva): 3 verticais + 3 horizontais
function AlignButtons({ onSet }: { onSet: (axis: "x" | "y", where: "start" | "mid" | "end") => void }) {
  const b = (label: string, title: string, ax: "x" | "y", wh: "start" | "mid" | "end") => (
    <button onMouseDown={(e) => e.preventDefault()} onClick={() => onSet(ax, wh)} title={title}
      style={{ fontSize: 11, background: "#17171b", color: "#cfcfcf", border: "1px solid #2e2e36", borderRadius: 6, padding: "5px 7px", cursor: "pointer", textAlign: "left" }}>{label}</button>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginTop: 4 }}>
      {b("⬆ em cima", "Alinhar em cima", "y", "start")}
      {b("⬅ esquerda", "Alinhar à esquerda", "x", "start")}
      {b("⬍ no meio", "Centralizar na vertical", "y", "mid")}
      {b("↔ ao centro", "Centralizar na horizontal", "x", "mid")}
      {b("⬇ embaixo", "Alinhar embaixo", "y", "end")}
      {b("➡ à direita", "Alinhar à direita", "x", "end")}
    </div>
  );
}

// Layouts agrupados por "estilo". Layout 1 = o conjunto atual. Novos estilos (Layout 2, 3…) entram como grupos.
const G1 = "Layout 1 (estilo atual)";
const G2 = "Layout 2 (editorial premium)";
const G3 = "Layout 3 (storytelling / caso)";
const G4 = "Layout 4 (revista de negócios)";
const G5 = "Layout 5 (editorial minimalista)";
const G6 = "Layout 6 (manifesto)";
const G7 = "Layout 7 (científico / autoridade)";
const G8 = "Layout 8 (80/20 lifestyle)";
const G9 = "Layout 9 (editorial minimalista)";
const G10 = "Layout 10 (editorial vinho premium)";
const LAYOUTS: { v: Layout; n: string; g: string }[] = [
  { v: "cover", n: "Capa (foto da marca)", g: G1 },
  { v: "top", n: "Foto no topo", g: G1 },
  { v: "bottom", n: "Foto na base", g: G1 },
  { v: "full", n: "Full-bleed", g: G1 },
  { v: "list", n: "Lista / bullets", g: G1 },
  { v: "data", n: "Dado (números)", g: G1 },
  { v: "moral", n: "Moral (fecho)", g: G1 },
  { v: "quote", n: "Citação gigante", g: G1 },
  { v: "text", n: "Texto pleno", g: G1 },
  { v: "split", n: "Split foto/texto", g: G1 },
  { v: "steps", n: "Passo a passo", g: G1 },
  { v: "l2-capa", n: "1 · Capa (foto full + caixa rosa)", g: G2 },
  { v: "l2-dor-dir", n: "2 · Dor (foto à direita)", g: G2 },
  { v: "l2-dor-esq", n: "3 · Dor (foto à esquerda)", g: G2 },
  { v: "l2-emocional", n: "5 · Impacto emocional (sem foto)", g: G2 },
  { v: "l2-virada", n: "6 · Virada (foto + solução)", g: G2 },
  { v: "l2-cta", n: "7 · CTA (foto full + botão)", g: G2 },
  { v: "l3-educacional", n: "1 · Capa educacional (abertura/teaser)", g: G3 },
  { v: "l3-capa", n: "2 · Capa do caso (foto + narrativa)", g: G3 },
  { v: "l3-prova", n: "3 · Prova social (depoimento)", g: G3 },
  { v: "l3-historia", n: "4 · Desenvolvimento (só texto)", g: G3 },
  { v: "l3-antes-depois", n: "5 · Antes e depois (2 fotos)", g: G3 },
  { v: "l4-capa", n: "1 · Capa (foto + headline rosa)", g: G4 },
  { v: "l4-split", n: "2 · Split 60/40 (texto claro)", g: G4 },
  { v: "l4-horizontal", n: "3 · Editorial horizontal", g: G4 },
  { v: "l4-faixa", n: "4 · Faixa vertical azul", g: G4 },
  { v: "l4-final", n: "5 · Final (pergunta + comentário)", g: G4 },
  { v: "l5-capa", n: "1 · Capa (foto 60% + caixa rosa)", g: G5 },
  { v: "l5-split", n: "2 · Split 50/50", g: G5 },
  { v: "l5-caixa", n: "3 · Foto cheia + caixa rosa", g: G5 },
  { v: "l5-texto", n: "4 · Respiro (só texto serif)", g: G5 },
  { v: "l5-solucao", n: "5 · Solução (70/30)", g: G5 },
  { v: "l5-galeria", n: "6 · Galeria (moldura + rodapé)", g: G5 },
  { v: "l6-capa", n: "1 · Capa manifesto (foto + assinatura)", g: G6 },
  { v: "l6-historia", n: "2 · História (foto 80%)", g: G6 },
  { v: "l6-manifesto", n: "3 · Manifesto (só texto)", g: G6 },
  { v: "l6-lifestyle", n: "4 · Lifestyle (foto dominante)", g: G6 },
  { v: "l6-fecho", n: "5 · Fecho (foto + headline)", g: G6 },
  { v: "l7-capa", n: "1 · Capa (foto + headline 2 tons)", g: G7 },
  { v: "l7-problema", n: "2 · Problema (foto fade + bullets)", g: G7 },
  { v: "l7-ciencia", n: "3 · Ciência (foto + referência)", g: G7 },
  { v: "l7-prova", n: "4 · Prova (foto topo + fundo claro)", g: G7 },
  { v: "l7-virada", n: "5 · Virada (foto P&B + respiro)", g: G7 },
  { v: "l7-cta", n: "6 · CTA (caixa de borda branca)", g: G7 },
  { v: "l8-split", n: "1 · Split 80/20 (2 fotos + números)", g: G8 },
  { v: "l8-ruptura", n: "2 · Ruptura (2 fotos + frase)", g: G8 },
  { v: "l8-cta", n: "3 · CTA (fundo escuro + handle)", g: G8 },
  { v: "l9-capa", n: "1 · Capa (título gigante + foto)", g: G9 },
  { v: "l9-intro", n: "2 · Intro (palavra-gatilho + CTA)", g: G9 },
  { v: "l9-conteudo", n: "3 · Conteúdo (cartão + demonstração)", g: G9 },
  { v: "l9-final", n: "4 · Final (40/60 texto + pessoa)", g: G9 },
  { v: "l10-capa", n: "1 · Capa (foto + título 3 níveis)", g: G10 },
  { v: "l10-texto", n: "2 · Texto editorial (serifada)", g: G10 },
  { v: "l10-regra", n: "3 · Regra (caixa dourada)", g: G10 },
  { v: "l10-resumo", n: "4 · Resumo (checklist)", g: G10 },
  { v: "l10-cta", n: "5 · CTA (monograma)", g: G10 },
];

const IMG_LAYOUTS: Layout[] = ["cover", "top", "bottom", "full", "moral", "list", "data", "split", "l2-capa", "l2-dor-dir", "l2-dor-esq", "l2-virada", "l2-cta", "l3-capa", "l3-prova", "l3-antes-depois", "l3-educacional", "l4-capa", "l4-split", "l4-horizontal", "l4-faixa", "l4-final", "l5-capa", "l5-split", "l5-caixa", "l5-solucao", "l5-galeria", "l6-capa", "l6-historia", "l6-lifestyle", "l6-fecho", "l7-capa", "l7-problema", "l7-ciencia", "l7-prova", "l7-virada", "l7-cta", "l8-split", "l8-ruptura", "l9-capa", "l9-conteudo", "l9-final", "l10-capa"];

// quais campos CADA layout realmente desenha — o editor só mostra os que funcionam naquele card
const NO_HEADLINE: Layout[] = ["l3-capa", "l3-historia", "l3-antes-depois"];
const NO_BODY: Layout[] = ["cover", "list", "quote", "steps", "l2-capa", "l2-emocional", "l3-antes-depois", "l3-educacional", "l4-final", "l8-cta"];
const HAS_KICKER: Layout[] = ["top", "bottom", "full", "moral", "list", "data", "text", "split", "steps", "l2-dor-dir", "l2-dor-esq", "l2-emocional", "l2-virada", "l3-capa", "l3-historia", "l4-split", "l4-faixa", "l4-final", "l5-split", "l6-historia", "l7-problema", "l9-intro", "l9-conteudo", "l9-final", "l10-capa", "l10-texto", "l10-regra"];
const HAS_BULLETS: Layout[] = ["list", "steps", "l7-problema", "l10-resumo"];
const HAS_SIGNOFF: Layout[] = ["top", "full", "moral", "l2-cta", "l3-historia", "l3-antes-depois", "l3-educacional", "l4-final", "l7-cta", "l9-intro", "l9-final", "l10-capa", "l10-cta"];
const HAS_SOURCE: Layout[] = ["data", "l7-ciencia"];
function caps(l: Layout) {
  return {
    headline: !NO_HEADLINE.includes(l),
    body: !NO_BODY.includes(l),
    kicker: HAS_KICKER.includes(l),
    bullets: HAS_BULLETS.includes(l),
    signoff: HAS_SIGNOFF.includes(l),
    source: HAS_SOURCE.includes(l),
  };
}

// campos de ESTILO que o "Kit da marca" salva e aplica (não mexe em conteúdo, layout, foto nem posições)
const KIT_KEYS: (keyof Card)[] = ["titleFont", "bodyFont", "titleColor", "bodyColor", "highlightColor", "caixaColor", "sublinhColor", "marcaColor", "contornoColor", "kickerColor", "signoffColor", "titleScale", "bodyScale", "titleShadow", "bodyShadow", "titleTracking", "titleLeading", "bodyTracking", "bodyLeading", "align", "titleAlign", "bodyAlign", "bg", "tint", "nicks", "hideNick"];

// TEMPLATE = look COMPLETO do card: estilo + layout + POSIÇÕES do texto + fundo. Não pega o conteúdo (texto).
const TEMPLATE_KEYS: (keyof Card)[] = [
  ...KIT_KEYS,
  "layout", "overlayColor", "indexStyle", "imageFit", "focalX", "focalY", "scale", "rotate", "bw",
  "textX", "textY", "titleX", "titleY", "bodyX", "bodyY", "kickerX", "kickerY", "signoffX", "signoffY", "signoffScale",
  "nickPos",
];
const TEMPLATE_IMG_KEYS: (keyof Card)[] = ["image", "image2", "imageSentiment"]; // só quando o usuário pede pra incluir o fundo

// fontes auto-hospedadas, separadas por força: FORTES (display/título) x SECUNDÁRIAS (corpo)
const FONT_GROUPS: { label: string; fonts: string[] }[] = [
  { label: "Fortes (título)", fonts: ["Anton", "Sequel100Black-75", "Montserrat ExtraBlack", "Airnt"] },
  { label: "Secundárias (corpo)", fonts: ["Inter", "Montserrat", "Open Sans"] },
];

// texto cru de um card (pra guardar como exemplo-ouro de voz)
function cardText(c: Card): string {
  const parts: string[] = [];
  if (c.kicker) parts.push(c.kicker);
  if (c.headline) parts.push(c.headline);
  if (c.body) parts.push(c.body);
  if (c.bullets?.length) parts.push(c.bullets.map((b) => "- " + b).join("\n"));
  if (c.signoff) parts.push(c.signoff);
  return parts.join("\n").replace(/\*\*/g, "").trim();
}

const fieldStyle: React.CSSProperties = { width: "100%", background: "var(--dg-sunken)", color: "var(--dg-white)", border: "1px solid var(--dg-line)", borderRadius: 8, padding: 10, fontSize: 14, resize: "vertical", fontFamily: "inherit" };
const selStyle: React.CSSProperties = { width: "100%", background: "var(--dg-sunken)", color: "var(--dg-white)", border: "1px solid var(--dg-line)", borderRadius: 8, padding: "9px 10px" };

// reduz o PNG resultante (com transparência) pra não pesar o rascunho
function blobToScaledPng(blob: Blob, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      const s = Math.min(1, max / Math.max(w, h));
      w = Math.round(w * s); h = Math.round(h * s);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/png"));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function RedField({ label, value, onChange, rows = 3, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // digita no estado local (instantâneo) e comita pro carrossel ao parar (debounce) — não trava a digitação
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const sync = setTimeout(() => setLocal(value), 0);
    return () => clearTimeout(sync);
  }, [value]); // sincroniza quando o valor muda de fora (trocar card, undo, regerar)
  const onType = (v: string) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 200);
  };
  const flush = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } if (local !== value) onChange(local); };
  const wrap = (mark: string) => {
    const ta = ref.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    if (s === e) return;
    const nv = local.slice(0, s) + mark + local.slice(s, e) + mark + local.slice(e);
    setLocal(nv);
    if (timer.current) clearTimeout(timer.current);
    onChange(nv);
  };
  return (
    <div className="card-red-field" style={{ marginBottom: 12 }}>
      <div className="card-red-field-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <label style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
        <span className="card-red-field-tools" style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {([
            ["**", "#3a1424", "#ff6b8f", "1px solid #ef476f", "none", "● rosa", "Cor rosa — selecione um trecho"],
            ["==", "#ef476f", "#fff", "1px solid #ef476f", "none", "▢ caixa", "Caixa sólida rosa"],
            ["__", "#2a1018", "#ff6b8f", "1px solid #ef476f", "underline", "_ linha", "Sublinhado rosa"],
            ["~~", "rgba(239,71,111,.35)", "#fff", "1px solid #ef476f", "none", "▒ marca", "Marca-texto rosa"],
            ["++", "transparent", "#ff6b8f", "1px solid #ef476f", "none", "□ borda", "Contorno rosa"],
          ] as const).map(([mark, bg, color, border, decoration, lbl, title]) => (
            <button key={mark} onMouseDown={(e) => e.preventDefault()} onClick={() => wrap(mark)} title={title}
              style={{ fontSize: 11.5, background: bg, color, border, borderRadius: 6, padding: "5px 9px", cursor: "pointer", textDecoration: decoration, whiteSpace: "nowrap", minHeight: 32 }}>
              {lbl}
            </button>
          ))}
        </span>
      </div>
      <textarea ref={ref} value={local} onChange={(e) => onType(e.target.value)} onBlur={flush} rows={rows} style={fieldStyle} />
      {hint && <div style={{ fontSize: 10.5, color: "#7c869c", marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

function ApplyAll({ label, keys, onApplyAll }: { label: string; keys: (keyof Card)[]; onApplyAll?: (keys: (keyof Card)[]) => void }) {
  return onApplyAll ? (
    <button onClick={() => onApplyAll(keys)} title="Aplica este ajuste em TODOS os cards do carrossel"
      style={{ marginTop: 12, fontSize: 11.5, background: "#16201f", color: "#7fd0c0", border: "1px solid #2c4c48", borderRadius: 7, padding: "7px 12px", cursor: "pointer", display: "block", width: "100%" }}>
      🔁 {label}
    </button>
  ) : null;
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 10px" }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4a5168", textTransform: "uppercase", letterSpacing: 1.2, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
    </div>
  );
}

function SelLabel({ children }: { children: ReactNode }) {
  return <label style={{ fontSize: 12, color: "#9aa0b2", display: "block", marginBottom: 6, marginTop: 10 }}>{children}</label>;
}

type CropRect = { x: number; y: number; w: number; h: number };
function CropModal({ src, initial, onConfirm, onCancel }: { src: string; initial?: CropRect | null; onConfirm: (crop: CropRect | null) => void; onCancel: () => void }) {
  const [crop, setCrop] = useState<CropRect>(initial ?? { x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ type: "move" | "resize"; handle: string; startX: number; startY: number; startCrop: CropRect } | null>(null);
  const cl = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const MIN = 0.05;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - d.startX) / rect.width;
      const dy = (e.clientY - d.startY) / rect.height;
      const c = d.startCrop;
      if (d.type === "move") {
        setCrop({ ...c, x: cl(c.x + dx, 0, 1 - c.w), y: cl(c.y + dy, 0, 1 - c.h) });
      } else {
        if (d.handle === "tl") { const nx = cl(c.x + dx, 0, c.x + c.w - MIN); const ny = cl(c.y + dy, 0, c.y + c.h - MIN); setCrop({ x: nx, y: ny, w: c.x + c.w - nx, h: c.y + c.h - ny }); }
        else if (d.handle === "tr") { const ny = cl(c.y + dy, 0, c.y + c.h - MIN); setCrop({ x: c.x, y: ny, w: cl(c.w + dx, MIN, 1 - c.x), h: c.y + c.h - ny }); }
        else if (d.handle === "bl") { const nx = cl(c.x + dx, 0, c.x + c.w - MIN); setCrop({ x: nx, y: c.y, w: c.x + c.w - nx, h: cl(c.h + dy, MIN, 1 - c.y) }); }
        else if (d.handle === "br") { setCrop({ x: c.x, y: c.y, w: cl(c.w + dx, MIN, 1 - c.x), h: cl(c.h + dy, MIN, 1 - c.y) }); }
      }
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, []);

  const startDrag = (e: React.PointerEvent, type: "move" | "resize", handle = "") => {
    e.preventDefault(); e.stopPropagation();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    dragRef.current = { type, handle, startX: e.clientX, startY: e.clientY, startCrop: { ...crop } };
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10000, touchAction: "none" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ fontSize: 13, color: "#9aa0b0", marginBottom: 12, textAlign: "center" }}>Arraste os cantos para recortar · Esc cancela</div>
      <div ref={containerRef} style={{ position: "relative", display: "inline-block", userSelect: "none", touchAction: "none" }}>
        <img src={src} alt="" style={{ display: "block", maxWidth: "84vw", maxHeight: "62vh", objectFit: "contain" }} />
        <div onPointerDown={(e) => startDrag(e, "move")}
          style={{ position: "absolute", left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%`, boxShadow: "0 0 0 9999px rgba(0,0,0,.6)", border: "2px solid #ef476f", cursor: "move", touchAction: "none" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)", backgroundSize: "33.33% 33.33%", pointerEvents: "none" }} />
          <div onPointerDown={(e) => startDrag(e, "resize", "tl")} style={{ position: "absolute", width: 14, height: 14, top: -6, left: -6, background: "#ef476f", borderRadius: 4, border: "2px solid #fff", cursor: "nwse-resize", touchAction: "none" }} />
          <div onPointerDown={(e) => startDrag(e, "resize", "tr")} style={{ position: "absolute", width: 14, height: 14, top: -6, right: -6, background: "#ef476f", borderRadius: 4, border: "2px solid #fff", cursor: "nesw-resize", touchAction: "none" }} />
          <div onPointerDown={(e) => startDrag(e, "resize", "bl")} style={{ position: "absolute", width: 14, height: 14, bottom: -6, left: -6, background: "#ef476f", borderRadius: 4, border: "2px solid #fff", cursor: "nesw-resize", touchAction: "none" }} />
          <div onPointerDown={(e) => startDrag(e, "resize", "br")} style={{ position: "absolute", width: 14, height: 14, bottom: -6, right: -6, background: "#ef476f", borderRadius: 4, border: "2px solid #fff", cursor: "nwse-resize", touchAction: "none" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => onConfirm(crop)} style={{ background: "#ef476f", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, cursor: "pointer", fontWeight: 700 }}>✓ confirmar corte</button>
        {initial && <button onClick={() => onConfirm(null)} style={{ background: "transparent", color: "#9aa0b0", border: "1px solid #3b3b44", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>remover corte</button>}
        <button onClick={onCancel} style={{ background: "transparent", color: "#9aa0b0", border: "1px solid #3b3b44", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>cancelar</button>
      </div>
    </div>
  );
}

export default function CardEditor({ card, onChange, carousel, index, onReplace, onApplyAll, onApplyKit }: { card: Card; onChange: (patch: Partial<Card>) => void; carousel: Carousel; index: number; onReplace: (card: Card) => void; onApplyAll?: (keys: (keyof Card)[]) => void; onApplyKit?: (style: Partial<Card>, all: boolean) => void }) {
  const editorRef = useRef<HTMLDivElement>(null); // coluna do editor (rola sozinha; o card fica fixo)
  const [regenLoad, setRegenLoad] = useState(false);
  const [instr, setInstr] = useState("");
  async function regen() {
    setRegenLoad(true);
    try {
      const r = await fetch("/api/regen-card", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carousel, index, instruction: instr }) });
      const d = await r.json();
      if (d.card) onReplace(d.card);
    } catch {}
    setRegenLoad(false);
  }
  const [sentiments, setSentiments] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/library").then((r) => r.json()).then((d) => { setSentiments(d.sentiments || []); }).catch(() => {});
  }, []);
  const [logoLib, setLogoLib] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/identity").then((r) => r.json()).then((d) => setLogoLib((d.logos || []).map((l: { url: string }) => l.url))).catch(() => {});
  }, []);
  // cores favoritas (persistem no navegador)
  const [favColors, setFavColors] = useState<string[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setFavColors(JSON.parse(localStorage.getItem("n2_fav_colors") || "[]")); } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const addFav = (hex: string) => setFavColors((prev) => { const next = [hex.toLowerCase(), ...prev.filter((x) => x !== hex.toLowerCase())].slice(0, 14); try { localStorage.setItem("n2_fav_colors", JSON.stringify(next)); } catch {} return next; });

  // KIT DA MARCA (presets de estilo, salvos no navegador)
  const [kits, setKits] = useState<{ name: string; style: Partial<Card> }[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setKits(JSON.parse(localStorage.getItem("n2_brand_kits") || "[]")); } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function persistKits(list: { name: string; style: Partial<Card> }[]) { setKits(list); try { localStorage.setItem("n2_brand_kits", JSON.stringify(list)); } catch {} }
  function saveKit() {
    const name = prompt("Nome do kit (ex: Padrão N², Vinho premium):", "");
    if (!name) return;
    const style: Partial<Card> = {};
    KIT_KEYS.forEach((k) => { if (card[k] !== undefined) (style as Record<string, unknown>)[k] = card[k]; });
    persistKits([{ name, style }, ...kits.filter((x) => x.name !== name)].slice(0, 12));
  }

  // TEMPLATES (look completo: estilo + layout + posições + fundo opcional), salvos no navegador
  const [templates, setTemplates] = useState<{ name: string; style: Partial<Card>; hasImage?: boolean }[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setTemplates(JSON.parse(localStorage.getItem("n2_templates") || "[]")); } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function persistTemplates(list: { name: string; style: Partial<Card>; hasImage?: boolean }[]) {
    setTemplates(list);
    try { localStorage.setItem("n2_templates", JSON.stringify(list)); }
    catch { alert("O template ficou grande demais pra salvar (o fundo pesa). Salva sem incluir a imagem, ou apaga templates antigos."); }
  }
  function saveTemplate() {
    const name = prompt("Nome do template (ex: Darkside, Revista clean, Prova social):", "");
    if (!name) return;
    const incImg = card.image ? confirm("Incluir o FUNDO/imagem atual neste template?\n\nOK = inclui a imagem (aplica o mesmo fundo)\nCancelar = só o visual (cores, layout, posições)") : false;
    const style: Partial<Card> = {};
    TEMPLATE_KEYS.forEach((k) => { if (card[k] !== undefined) (style as Record<string, unknown>)[k] = card[k]; });
    if (incImg) TEMPLATE_IMG_KEYS.forEach((k) => { if (card[k] !== undefined) (style as Record<string, unknown>)[k] = card[k]; });
    persistTemplates([{ name, style, hasImage: incImg }, ...templates.filter((x) => x.name !== name)].slice(0, 20));
  }
  function deleteTemplate(name: string) {
    if (!confirm(`Apagar o template "${name}"?`)) return;
    persistTemplates(templates.filter((t) => t.name !== name));
  }

  const [imgs, setImgs] = useState<string[]>([]);
  const [imgsFor, setImgsFor] = useState("");
  const [lib2, setLib2] = useState<string[]>([]); // biblioteca pra a 2ª foto (image2)
  async function loadLib2(key: string) {
    if (!key) { setLib2([]); return; }
    const r = await fetch("/api/library?sentiment=" + encodeURIComponent(key));
    const d = await r.json();
    setLib2(d.images || []);
  }
  async function loadImages(key: string): Promise<string[]> {
    const r = await fetch("/api/library?sentiment=" + encodeURIComponent(key));
    const d = await r.json();
    const list: string[] = d.images || [];
    setImgs(list); setImgsFor(key);
    return list;
  }
  async function chooseSentiment(key: string) {
    if (!key) { onChange({ imageSentiment: "" }); return; }
    const list = await loadImages(key);
    onChange({ imageSentiment: key, image: list[Math.floor(Math.random() * list.length)] || card.image });
  }
  async function loadCategory(cat: string): Promise<string[]> {
    const r = await fetch("/api/library?category=" + encodeURIComponent(cat));
    const d = await r.json();
    const list: string[] = d.images || [];
    setImgs(list); setImgsFor("cat:" + cat);
    return list;
  }
  async function chooseCategory(cat: string) {
    const list = await loadCategory(cat);
    onChange({ imageSentiment: "cat:" + cat, image: list[Math.floor(Math.random() * list.length)] || card.image });
  }
  // carrega a grade quando abre um card que já tem sentimento/tema
  useEffect(() => {
    const s = card.imageSentiment;
    if (!s || s === imgsFor) return;
    const timer = window.setTimeout(() => {
      if (s.startsWith("cat:")) loadCategory(s.slice(4)); else loadImages(s);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.imageSentiment]);

  const overlays = card.overlays || [];
  function updateOverlay(i: number, patch: Partial<Overlay>) {
    onChange({ overlays: overlays.map((o, idx) => (idx === i ? { ...o, ...patch } : o)) });
  }
  function removeOverlay(i: number) {
    onChange({ overlays: overlays.filter((_, idx) => idx !== i) });
  }

  // Card Images (imagens da biblioteca posicionadas no card)
  const cardImgs = card.cardImages || [];
  function updateCardImg(i: number, patch: Partial<CardImage>) {
    onChange({ cardImages: cardImgs.map((ci, idx) => (idx === i ? { ...ci, ...patch } : ci)) });
  }
  function removeCardImg(i: number) {
    onChange({ cardImages: cardImgs.filter((_, idx) => idx !== i) });
  }
  const [ciLibImgs, setCiLibImgs] = useState<string[]>([]);
  const [ciLibFor, setCiLibFor] = useState("");
  const [cropTarget, setCropTarget] = useState<{ idx: number; src: string } | null>(null);
  async function loadCiLib(cat: string) {
    if (!cat) return;
    try {
      const endpoint = "/api/library?" + (cat.includes(":") ? "category=" + encodeURIComponent(cat.replace(/^.*:/, "")) : "sentiment=" + encodeURIComponent(cat));
      const r = await fetch(endpoint);
      const d = await r.json();
      const list: string[] = d.images || [];
      setCiLibImgs(list);
      setCiLibFor(cat);
    } catch {}
  }
  const [voiceMsg, setVoiceMsg] = useState("");
  async function markVoice() {
    const t = cardText(card);
    if (t.length < 20) { setVoiceMsg("card curto demais"); setTimeout(() => setVoiceMsg(""), 2000); return; }
    try {
      await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t, note: card.layout }) });
      setVoiceMsg("⭐ guardado como tua voz — a IA vai imitar");
    } catch { setVoiceMsg("erro ao guardar"); }
    setTimeout(() => setVoiceMsg(""), 2800);
  }
  const [bgBusy, setBgBusy] = useState<number | null>(null);
  async function removeBg(i: number) {
    setBgBusy(i);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(overlays[i].src);
      const url = await blobToScaledPng(blob, 900);
      updateOverlay(i, { src: url, color: true });
    } catch (e) {
      console.error("removeBg", e);
      alert("Não consegui remover o fundo dessa imagem — tenta de novo ou outra imagem");
    }
    setBgBusy(null);
  }
  const [libOv, setLibOv] = useState<string[]>([]);
  const [showLibOv, setShowLibOv] = useState(false);
  async function openLibOv() {
    if (showLibOv) { setShowLibOv(false); return; }
    try { const r = await fetch("/api/library?overlays=1"); const d = await r.json(); setLibOv(d.images || []); } catch {}
    setShowLibOv(true);
  }
  const fileRef = useRef<HTMLInputElement>(null);
  async function uploadOverlay(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (d.src) onChange({ overlays: [...overlays, { src: d.src, x: 0, y: 0, width: 1, color: true }] });
  }
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [bgUpBusy, setBgUpBusy] = useState(false);
  async function uploadBackground(file: File) {
    setBgUpBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (d.src) onChange({ image: d.src, imageSentiment: "", bw: undefined }); // foto nova entra P&B; toggle abaixo libera cor se quiser
    } catch { alert("Não consegui enviar essa imagem — tenta outra"); }
    setBgUpBusy(false);
  }
  // Fundo gerado por IA (gpt-image-1)
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFormato, setAiFormato] = useState<"retrato" | "quadrado" | "paisagem">("retrato");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  async function gerarFundoIA() {
    if (aiBusy || aiPrompt.trim().length < 4) return;
    setAiBusy(true);
    try {
      const r = await fetch("/api/gen-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, formato: aiFormato }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao gerar");
      if (d.src) onChange({ image: d.src, imageSentiment: "", bw: false });
    } catch (e) { alert(e instanceof Error ? e.message : String(e)); }
    setAiBusy(false);
  }
  // Redesenhar SÓ este card com IA (descreve o visual → aplica no card, mantém o texto)
  const [reText, setReText] = useState("");
  const [reBusy, setReBusy] = useState(false);
  const [reOpen, setReOpen] = useState(false);
  const [rePrev, setRePrev] = useState<Partial<Card> | null>(null);
  async function redesenharCard() {
    if (reBusy || reText.trim().length < 3) return;
    setReBusy(true);
    try {
      const r = await fetch("/api/restyle", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: reText, tema: card.headline || card.kicker || "card", temFoto: !!card.image }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao redesenhar");
      const style = d.style as Partial<Card>;
      // guarda os valores atuais dos campos que vão mudar, pra desfazer
      const prev: Partial<Card> = {};
      (Object.keys(style) as (keyof Card)[]).forEach((k) => { (prev as Record<string, unknown>)[k] = card[k]; });
      setRePrev(prev);
      onChange(style);
    } catch (e) { alert(e instanceof Error ? e.message : String(e)); }
    setReBusy(false);
  }
  // 2ª foto (lado "depois" do l3-antes-depois)
  const bgFile2Ref = useRef<HTMLInputElement>(null);
  const [bgUpBusy2, setBgUpBusy2] = useState(false);
  async function uploadSecond(file: File) {
    setBgUpBusy2(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (d.src) onChange({ image2: d.src });
    } catch { alert("Não consegui enviar essa imagem — tenta outra"); }
    setBgUpBusy2(false);
  }

  const logo = card.logo;
  function setLogo(patch: Partial<NonNullable<Card["logo"]>>) {
    onChange({ logo: { x: logo?.x ?? 0.06, y: logo?.y ?? 0.05, w: logo?.w ?? 250, hide: logo?.hide ?? false, ...patch } });
  }
  function toggleLogo(url: string) {
    const cur = card.logos ?? [];
    const idx = cur.findIndex((l) => l.src === url);
    if (idx >= 0) onChange({ logos: cur.filter((_, i) => i !== idx) });
    else if (cur.length < 2) onChange({ logos: [...cur, { src: url, x: cur.length === 0 ? 0.05 : 0.62, y: 0.05, w: 200 }] });
  }
  function updateLogo(i: number, patch: Partial<NonNullable<Card["logos"]>[number]>) {
    onChange({ logos: (card.logos ?? []).map((l, idx) => (idx === i ? { ...l, ...patch } : l)) });
  }
  const layoutElements = cardElementDefs(card);
  function updateElement(id: string, patch: Partial<CardElementOverride>) {
    onChange({ elements: { ...(card.elements || {}), [id]: { ...(card.elements?.[id] || {}), ...patch } } });
  }
  function resetElement(id: string) {
    const next = { ...(card.elements || {}) };
    delete next[id];
    onChange({ elements: Object.keys(next).length ? next : undefined });
  }
  const tint = card.tint;
  const hasImage = IMG_LAYOUTS.includes(card.layout);
  const cap = caps(card.layout); // quais campos este layout desenha
  const dual = cap.headline && cap.body && !!card.headline && !!card.body; // tem título E corpo (texto) → move cada um separado

  // ── handlers de "alinhar à página" (estilo Canva) ──
  const MARG = 0.04;
  const alignOffset = (setKey: (ax: "x" | "y", v: number) => void) => (ax: "x" | "y", wh: "start" | "mid" | "end") => {
    const mag = 0.42;
    setKey(ax, wh === "start" ? -mag : wh === "mid" ? 0 : mag);
  };
  const alignBox = (w: number, setKey: (ax: "x" | "y", v: number) => void) => (ax: "x" | "y", wh: "start" | "mid" | "end") => {
    const wf = w / 1080, hf = w / 1350;
    if (ax === "x") setKey("x", wh === "start" ? MARG : wh === "mid" ? (1 - wf) / 2 : 1 - wf - MARG);
    else setKey("y", wh === "start" ? MARG : wh === "mid" ? (1 - hf) / 2 : 1 - hf - MARG);
  };
  const alignNick = (ax: "x" | "y", wh: "start" | "mid" | "end") => {
    const size = card.nickPos?.size ?? 28;
    const txt = ((card.nicks || []).filter(Boolean).length ? card.nicks!.filter(Boolean) : ["@teamnetto", "@n2squad"]).join("  ·  ");
    const wf = (txt.length * size * 0.5) / 1080, hf = (size * 1.5) / 1350;
    const cur = card.nickPos ?? { x: 0.06, y: 0.05, size };
    if (ax === "x") onChange({ nickPos: { ...cur, x: wh === "start" ? MARG : wh === "mid" ? (1 - wf) / 2 : 1 - wf - MARG } });
    else onChange({ nickPos: { ...cur, y: wh === "start" ? MARG : wh === "mid" ? (1 - hf) / 2 : 1 - hf - MARG } });
  };
  const pct = (v: number) => Math.round(v * 100) + "%";
  // acordeão: só uma seção aberta por vez (clicou numa, a anterior fecha)
  const [open, setOpen] = useState("");
  const sec = (id: string) => ({ open: open === id, onToggle: () => setOpen((o) => (o === id ? "" : id)), secId: id });
  const jumpTo = (id: string) => {
    setOpen(id);
    requestAnimationFrame(() => {
      const el = document.getElementById("sec-" + id);
      const box = editorRef.current;
      if (!el) return;
      if (box && getComputedStyle(box).overflowY === "auto") {
        // rola SÓ dentro do editor (o card fica parado)
        box.scrollTo({ top: el.offsetTop - 56, behavior: "smooth" });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  };
  const NAV_GROUPS: { group: string; items: { id: string; label: string; icon: string }[] }[] = [
    { group: "Base", items: [
      { id: "layout", label: "Layout", icon: "▦" }, { id: "titulo", label: "Título", icon: "T" }, { id: "texto", label: "Texto", icon: "Aa" }, { id: "fundo", label: "Foto", icon: "◐" },
    ] },
    { group: "Ajustes", items: [
      { id: "movetexto", label: "Mover", icon: "↕" }, { id: "logo", label: "Logos", icon: "◇" }, { id: "elementos", label: "Itens", icon: "◆" }, { id: "nick", label: "Nick", icon: "@" }, { id: "indice", label: "Índice", icon: "①" }, { id: "cardimages", label: "Imagens", icon: "⊞" },
    ] },
    { group: "Extras", items: [
      { id: "overlays", label: "Overlay", icon: "□" }, { id: "regerar", label: "IA", icon: "AI" }, { id: "kit", label: "Kit", icon: "K" },
    ] },
  ];
  const layoutLabel = LAYOUTS.find((l) => l.v === card.layout)?.n.replace(/^\d+\s·\s/, "") || card.layout;
  const alignBtns = (key: "titleAlign" | "bodyAlign") => {
    const current = card[key] || card.align;
    const opts: [TextAlign, string, string][] = [
      ["left", "esq", "Alinhar à esquerda"],
      ["center", "centro", "Centralizar"],
      ["right", "dir", "Alinhar à direita"],
      ["justify", "just", "Justificar"],
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 7 }}>
        {opts.map(([v, lbl, title]) => {
          const on = current === v;
          return <button key={v} title={title} onClick={() => onChange({ [key]: v } as Partial<Card>)} style={{ fontSize: 12, background: on ? "#3a1424" : "#17171b", color: on ? "#ff6b8f" : "#cfcfcf", border: "1px solid " + (on ? "#ef476f" : "#3b3b44"), borderRadius: 6, padding: "6px 4px", cursor: "pointer", minWidth: 0 }}>{lbl}</button>;
        })}
      </div>
    );
  };

  return (
    <>
    <div ref={editorRef} className="studio-section card-editor-premium dg-edit-scroll" style={{ padding: 16, minWidth: 0, flex: "1 1 380px" }}>
      <div className="card-editor-topbar" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap", paddingBottom: 12, borderBottom: "1px solid var(--dg-line-soft)" }}>
        <div className="card-editor-title-block">
          <span className="card-editor-eyebrow">Editar</span>
          <div className="card-editor-title-line">
            <strong>{card.index || "card"}</strong>
            <span>{layoutLabel}</span>
          </div>
        </div>
        <span className="card-editor-top-spacer" style={{ flex: 1 }} />
        <button className="card-editor-voice" onClick={markVoice} title="Marca este card como a tua voz no ponto — vira exemplo que a IA imita nas próximas gerações"
          style={{ fontSize: 11.5, background: "#241f0e", color: "#e8c860", border: "1px solid #6a5a1e", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>
          ⭐ minha voz
        </button>
      </div>
      {voiceMsg && <div style={{ fontSize: 12, color: voiceMsg.startsWith("⭐") ? "#e8c860" : "#e0738c", marginBottom: 10 }}>{voiceMsg}</div>}

      {/* Redesenhar SÓ este card com IA */}
      <div className={"card-redesign" + (reOpen ? " is-open" : "")}>
        <button type="button" className="card-redesign-toggle" onClick={() => setReOpen((o) => !o)}>
          <span className="card-redesign-main">
            <span className="card-redesign-icon">🎨</span>
            <span>redesenhar este card com IA</span>
          </span>
          <span className="card-redesign-caret">{reOpen ? "▲" : "▼"}</span>
        </button>
        {reOpen && (
          <div className="card-redesign-panel">
            <textarea value={reText} onChange={(e) => setReText(e.target.value)} rows={2}
              placeholder="ex: mais dark e agressivo / clean editorial fundo claro / destaque dourado premium"
              className="card-redesign-textarea" />
            <div className="card-redesign-actions">
              <button type="button" className="card-redesign-apply" onClick={redesenharCard} disabled={reBusy || reText.trim().length < 3}>
                {reBusy ? "redesenhando..." : "✨ aplicar neste card"}
              </button>
              {rePrev && <button type="button" className="card-redesign-undo" onClick={() => { onChange(rePrev); setRePrev(null); }}>↩ desfazer</button>}
            </div>
            <span className="card-redesign-note">muda só o visual deste card: cores, fonte, sombra e alinhamento. O texto continua igual.</span>
          </div>
        )}
      </div>

      <nav className="card-editor-nav" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "8px 10px", marginBottom: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.group} style={{ display: "contents" }}>
              {gi > 0 && <span style={{ width: 1, background: "rgba(255,255,255,.1)", margin: "2px 2px", alignSelf: "stretch", display: "block" }} />}
              {group.items.map((n) => {
                const on = open === n.id;
                return (
                  <button key={n.id} onClick={() => jumpTo(n.id)}
                    style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 48, minHeight: 48, padding: "6px 8px", borderRadius: 10, cursor: "pointer",
                      background: on ? "#ef476f" : "transparent", color: on ? "#fff" : "#8a93a8",
                      border: "none", transition: "background .15s, color .15s", flexShrink: 0 }}>
                    <span style={{ fontSize: 15, lineHeight: 1, fontWeight: 800 }}>{n.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3, lineHeight: 1 }}>{n.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* LAYOUT */}
      <Section title="Layout do card" {...sec("layout")}>
        <select value={card.layout} onChange={(e) => onChange({ layout: e.target.value as Layout })} style={selStyle}>
          {Object.entries(LAYOUTS.reduce((acc, l) => { (acc[l.g] ||= []).push(l); return acc; }, {} as Record<string, typeof LAYOUTS>)).map(([g, items]) => (
            <optgroup key={g} label={g}>
              {items.map((l) => <option key={l.v} value={l.v}>{l.n}</option>)}
            </optgroup>
          ))}
        </select>
      </Section>

      {/* TÍTULO */}
      <Section title="Título" {...sec("titulo")}>
        {cap.headline
          ? <RedField label="Texto do título" value={card.headline || ""} onChange={(v) => onChange({ headline: v })} rows={2} hint="Enter quebra a linha · selecione um trecho + ● rosa pra colorir" />
          : <div style={{ fontSize: 12, color: "#7c869c", padding: "8px 0 4px" }}>Este layout não usa título separado — escreva no campo <b style={{ color: "#cfcfcf" }}>Texto / corpo</b>. Os ajustes abaixo controlam o estilo do texto.</div>}

        <Divider label="Tamanho & fonte" />
        <Slider label="Tamanho" val={card.titleScale ?? 1} min={0.4} max={1.2} step={0.01} on={(v) => onChange({ titleScale: v })} pctEdit />
        <SelLabel>Fonte</SelLabel>
        <select value={card.titleFont || "Anton"} onChange={(e) => onChange({ titleFont: e.target.value })} style={selStyle}>
          {FONT_GROUPS.map((g) => <optgroup key={g.label} label={g.label}>{g.fonts.map((f) => <option key={f} value={f}>{f}</option>)}</optgroup>)}
        </select>

        <Divider label="Cores" />
        <ColorRow label="Cor do título" value={card.titleColor} def="#f5f5f5" onChange={(v) => onChange({ titleColor: v })} favs={favColors} onFav={addFav} />
        <ColorRow label="Destaques (● rosa · caixa · linha · marca · borda)" value={card.highlightColor} def="#ef476f" onChange={(v) => onChange({ highlightColor: v })} favs={favColors} onFav={addFav} />

        <Divider label="Sombra, espaçamento & alinhamento" />
        <Slider label="Sombra" val={card.titleShadow ?? 0.6} min={0} max={1.5} step={0.01} on={(v) => onChange({ titleShadow: v })} pctEdit />
        <Slider label="Espaço letras" val={card.titleTracking ?? 0.5} min={-3} max={20} step={0.5} on={(v) => onChange({ titleTracking: v })} fmt={(v) => v + "px"} />
        <Slider label="Espaço linhas" val={card.titleLeading ?? 1} min={0.7} max={1.6} step={0.01} on={(v) => onChange({ titleLeading: v })} fmt={(v) => v.toFixed(2)} />
        <SelLabel>Alinhamento</SelLabel>
        {alignBtns("titleAlign")}

        <ApplyAll onApplyAll={onApplyAll} label="aplicar fonte, cores, sombra e tamanho a todos" keys={["align", "titleAlign", "bodyAlign", "titleScale", "bodyScale", "titleFont", "bodyFont", "titleShadow", "bodyShadow", "titleColor", "bodyColor", "highlightColor", "titleTracking", "titleLeading", "bodyTracking", "bodyLeading"]} />
      </Section>

      {/* MOVER TEXTO (posição) */}
      <Section title="Mover texto (posição)" {...sec("movetexto")}>
        {cap.kicker && (
          <>
            <Divider label="Kicker (move independente)" />
            <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 8 }}>Move só o kicker, sem arrastar título nem corpo</div>
            <AlignButtons onSet={alignOffset((ax, v) => onChange(ax === "x" ? { kickerX: v } : { kickerY: v }))} />
            <Slider label="◄ horizontal ►" val={card.kickerX ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ kickerX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.kickerY ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ kickerY: v })} fmt={pct} />
            <button onClick={() => onChange({ kickerX: undefined, kickerY: undefined })} style={{ marginTop: 8, fontSize: 12, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>resetar kicker</button>
          </>
        )}
        {dual ? (
          <>
            <Divider label="Título" />
            <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 8 }}>Arraste a alça <b style={{ color: "#cfcfcf" }}>TÍTULO</b> na prévia, ou use os botões</div>
            <AlignButtons onSet={alignOffset((ax, v) => onChange(ax === "x" ? { titleX: v } : { titleY: v }))} />
            <Slider label="◄ horizontal ►" val={card.titleX ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ titleX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.titleY ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ titleY: v })} fmt={pct} />

            <Divider label="Corpo / texto" />
            <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 8 }}>Arraste a alça <b style={{ color: "#cfcfcf" }}>CORPO</b> na prévia, ou use os botões</div>
            <AlignButtons onSet={alignOffset((ax, v) => onChange(ax === "x" ? { bodyX: v } : { bodyY: v }))} />
            <Slider label="◄ horizontal ►" val={card.bodyX ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ bodyX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.bodyY ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ bodyY: v })} fmt={pct} />
            <button onClick={() => onChange({ titleX: undefined, titleY: undefined, bodyX: undefined, bodyY: undefined })} style={{ marginTop: 8, fontSize: 12, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>resetar posições</button>
            <ApplyAll onApplyAll={onApplyAll} label="aplicar posição do título e corpo a todos" keys={["titleX", "titleY", "bodyX", "bodyY"]} />
          </>
        ) : (
          <>
            <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 8 }}>Desloca o bloco de texto — arraste a alça <b style={{ color: "#cfcfcf" }}>TEXTO</b> na prévia, ou use os botões</div>
            <AlignButtons onSet={alignOffset((ax, v) => onChange(ax === "x" ? { textX: v } : { textY: v }))} />
            <Slider label="◄ horizontal ►" val={card.textX ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ textX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.textY ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ textY: v })} fmt={pct} />
            <button onClick={() => onChange({ textX: undefined, textY: undefined })} style={{ marginTop: 8, fontSize: 12, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>centralizar (resetar)</button>
            <ApplyAll onApplyAll={onApplyAll} label="aplicar posição do texto a todos os cards" keys={["textX", "textY"]} />
          </>
        )}
      </Section>

      {/* TEXTO & ELEMENTOS */}
      <Section title="Texto, kicker, bullets & assinatura" {...sec("texto")}>
        {!cap.kicker && !cap.body && !cap.bullets && !cap.signoff && !cap.source && (
          <div style={{ fontSize: 12, color: "#7c869c", padding: "4px 0 6px" }}>Este layout usa só o <b style={{ color: "#cfcfcf" }}>Título</b>. Troque o layout pra usar corpo, kicker, bullets ou assinatura.</div>
        )}

        {cap.kicker && (
          <>
            <Divider label="Kicker (rótulo pequeno)" />
            <RedField label="Texto do kicker" value={card.kicker || ""} onChange={(v) => onChange({ kicker: v })} rows={1} />
            <ColorRow label="Cor (barra + texto)" value={card.kickerColor} def="#9aa0b0" onChange={(v) => onChange({ kickerColor: v })} favs={favColors} onFav={addFav} />
          </>
        )}

        {cap.body && (
          <>
            <Divider label="Corpo do texto" />
            <RedField label="Texto / corpo" value={card.body || ""} onChange={(v) => onChange({ body: v })} rows={6} hint="1 Enter = quebra · 2 Enters = novo parágrafo" />
          </>
        )}

        {cap.bullets && (
          <>
            <Divider label="Bullets / passos" />
            <RedField label="Um item por linha" value={(card.bullets || []).join("\n")} onChange={(v) => onChange({ bullets: v.split("\n").filter((x) => x.trim()) })} rows={5} />
          </>
        )}

        {(cap.body || cap.bullets) && (
          <>
            <Divider label="Estilo do texto" />
            <Slider label="Tamanho" val={card.bodyScale ?? 1} min={0.4} max={1.2} step={0.01} on={(v) => onChange({ bodyScale: v })} pctEdit />
            <SelLabel>Fonte do corpo</SelLabel>
            <select value={card.bodyFont || "Inter"} onChange={(e) => onChange({ bodyFont: e.target.value })} style={selStyle}>
              {FONT_GROUPS.map((g) => <optgroup key={g.label} label={g.label}>{g.fonts.map((f) => <option key={f} value={f}>{f}</option>)}</optgroup>)}
            </select>
            <Slider label="Sombra" val={card.bodyShadow ?? 0.5} min={0} max={1.5} step={0.01} on={(v) => onChange({ bodyShadow: v })} pctEdit />
            <ColorRow label="Cor do texto" value={card.bodyColor} def="#f5f5f5" onChange={(v) => onChange({ bodyColor: v })} favs={favColors} onFav={addFav} />
            <Slider label="Espaço letras" val={card.bodyTracking ?? 0} min={-2} max={16} step={0.5} on={(v) => onChange({ bodyTracking: v })} fmt={(v) => v + "px"} />
            <Slider label="Espaço linhas" val={card.bodyLeading ?? 1} min={1} max={2.2} step={0.01} on={(v) => onChange({ bodyLeading: v })} fmt={(v) => v.toFixed(2)} />
            <SelLabel>Alinhamento</SelLabel>
            {alignBtns("bodyAlign")}
          </>
        )}

        {cap.signoff && (
          <>
            <Divider label="Assinatura / CTA" />
            <RedField label="Texto da assinatura (ex: Tamo junto)" value={card.signoff || ""} onChange={(v) => onChange({ signoff: v })} rows={1} />
            <ColorRow label="Cor" value={card.signoffColor} def="#ef476f" onChange={(v) => onChange({ signoffColor: v })} favs={favColors} onFav={addFav} />
            <Slider label="Tamanho" val={card.signoffScale ?? 1} min={0.35} max={1.6} step={0.01} on={(v) => onChange({ signoffScale: v })} pctEdit />
            <div style={{ fontSize: 11.5, color: "#7c869c", marginTop: 10, marginBottom: 4 }}>Posição — arraste a alça <b style={{ color: "#cfcfcf" }}>CTA</b> na prévia, ou use os botões</div>
            <AlignButtons onSet={alignOffset((ax, v) => onChange(ax === "x" ? { signoffX: v } : { signoffY: v }))} />
            <Slider label="◄ X ►" val={card.signoffX ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ signoffX: v })} fmt={pct} />
            <Slider label="▲ Y ▼" val={card.signoffY ?? 0} min={-0.85} max={0.85} step={0.005} on={(v) => onChange({ signoffY: v })} fmt={pct} />
            <button onClick={() => onChange({ signoffX: undefined, signoffY: undefined, signoffScale: undefined })} style={{ marginTop: 8, fontSize: 12, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>resetar posição</button>
            <ApplyAll onApplyAll={onApplyAll} label="aplicar assinatura/CTA a todos" keys={["signoff", "signoffX", "signoffY", "signoffScale"]} />
          </>
        )}

        {cap.source && (
          <>
            <Divider label="Referência / fonte científica" />
            <RedField label="Ex: Müller et al., 2016" value={card.source || ""} onChange={(v) => onChange({ source: v })} rows={1} />
          </>
        )}
      </Section>

      {/* FUNDO */}
      <Section title={hasImage ? "Fundo (imagem)" : "Fundo (sombra)"} {...sec("fundo")}>
        {/* Gerar fundo com IA (gpt-image-1) */}
        <button onClick={() => setAiOpen(o => !o)}
          style={{ width: "100%", fontSize: 12.5, fontWeight: 600, background: aiOpen ? "rgba(120,170,255,.1)" : "#14161c", color: "#78aaff", border: "1px solid " + (aiOpen ? "#2e4a6a" : "#26303e"), borderRadius: 8, padding: "9px 12px", cursor: "pointer", marginBottom: aiOpen ? 8 : 12, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>🎨 gerar fundo com IA</span><span style={{ fontSize: 10, color: "#5a6378" }}>{aiOpen ? "▲" : "▼"}</span>
        </button>
        {aiOpen && (
          <div style={{ background: "#0c1219", border: "1px solid #26303e", borderRadius: 10, padding: 12, marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={3}
              placeholder="ex: fundo escuro com fumaça e luz lateral vermelha, textura de concreto, clima intenso de academia"
              style={{ width: "100%", fontSize: 13, background: "#121216", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 8, padding: 9, resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 6 }}>
              {(["retrato", "quadrado", "paisagem"] as const).map(f => (
                <button key={f} onClick={() => setAiFormato(f)}
                  style={{ flex: 1, fontSize: 11.5, fontWeight: 600, background: aiFormato === f ? "#1e3350" : "#17171b", color: aiFormato === f ? "#78aaff" : "#7c869c", border: "1px solid " + (aiFormato === f ? "#2e4a6a" : "#2e2e36"), borderRadius: 7, padding: "7px 4px", cursor: "pointer" }}>{f}</button>
              ))}
            </div>
            <button onClick={gerarFundoIA} disabled={aiBusy || aiPrompt.trim().length < 4}
              style={{ fontSize: 13, fontWeight: 700, background: "#ef476f", color: "#fff", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", opacity: (aiBusy || aiPrompt.trim().length < 4) ? 0.55 : 1 }}>
              {aiBusy ? "gerando imagem... (uns segundos)" : "✨ gerar e aplicar no card"}
            </button>
            <span style={{ fontSize: 10.5, color: "#5a6378", lineHeight: 1.4 }}>gpt-image-1 · o fundo entra colorido, sem texto na imagem (o texto é o do card por cima). Você move e ajusta tudo depois.</span>
          </div>
        )}
        {hasImage && (
          <>
            <Divider label="Foto" />
            {/* toggle: encaixar (contain) vs preencher (cover) */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 4 }}>
              {(["cover", "contain"] as const).map((v) => {
                const on = (card.imageFit ?? "cover") === v;
                return (
                  <button key={v} onClick={() => onChange({ imageFit: v })}
                    style={{ flex: 1, fontSize: 13, fontWeight: 600, background: on ? (v === "contain" ? "#ef476f" : "#21212a") : "transparent", color: on ? "#fff" : "#6a7080", border: "none", borderRadius: 7, padding: "9px 8px", cursor: "pointer", transition: "background .15s, color .15s" }}>
                    {v === "cover" ? "⬛ preencher" : "⬜ foto inteira"}
                  </button>
                );
              })}
            </div>
            {(card.imageFit ?? "cover") === "contain" && (
              <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 10, padding: "6px 10px", background: "rgba(239,71,111,.06)", borderRadius: 7, border: "1px solid rgba(239,71,111,.15)" }}>
                A foto aparece inteira no card — o fundo de cor preenche o espaço vazio nas laterais ou topo/base.
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button onClick={() => bgFileRef.current?.click()} disabled={bgUpBusy}
                style={{ fontSize: 13, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 8, padding: "9px 16px", cursor: "pointer", opacity: bgUpBusy ? 0.6 : 1, fontWeight: 600 }}>
                {bgUpBusy ? "enviando…" : "⬆ enviar do arquivo"}
              </button>
              <input ref={bgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBackground(f); e.currentTarget.value = ""; }} />
              <label style={{ fontSize: 13, color: "#cfcfcf", display: "flex", gap: 6, alignItems: "center", cursor: "pointer", background: "#1a1a22", border: "1px solid #3b3b44", borderRadius: 8, padding: "9px 14px" }}>
                <input type="checkbox" checked={card.bw !== false} onChange={(e) => onChange({ bw: e.target.checked ? undefined : false })} />
                P&B
              </label>
            </div>
            <SelLabel>Da biblioteca</SelLabel>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <select value={card.imageSentiment || ""} onChange={(e) => { const v = e.target.value; if (v.startsWith("cat:")) chooseCategory(v.slice(4)); else chooseSentiment(v); }} style={{ ...selStyle, flex: 1 }}>
                <option value="">— escolher tema / sentimento —</option>
                {Object.entries(sentiments.reduce((acc, s) => { const cat = s.split("-")[0]; (acc[cat] ||= []).push(s); return acc; }, {} as Record<string, string[]>)).map(([cat, keys]) => (
                  <optgroup key={cat} label={cat}>
                    {keys.length > 1 && <option value={"cat:" + cat}>★ tudo de {cat}</option>}
                    {keys.map((s) => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                ))}
              </select>
              <button onClick={() => imgs.length && onChange({ image: imgs[Math.floor(Math.random() * imgs.length)] })} title="Sortear outra desse sentimento"
                style={{ fontSize: 16, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 8, padding: "0 14px", cursor: "pointer" }}>🎲</button>
            </div>
            {imgsFor === card.imageSentiment && imgs.length > 0 && (
              <>
                <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 5 }}>Clica na foto exata que quer · {imgs.length} disponíveis</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: 5, maxHeight: 240, overflowY: "auto", padding: 5, background: "#0a0a0e", borderRadius: 10, border: "1px solid #1e1e26" }}>
                  {imgs.map((src) => (
                    <img key={src} src={src} alt="" loading="lazy" onClick={() => onChange({ image: src, imageSentiment: card.imageSentiment })}
                      style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 6, cursor: "pointer", border: "2px solid " + (card.image === src ? "#ef476f" : "transparent"), filter: "grayscale(1) contrast(1.08) brightness(.9)" }} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {hasImage && (
          <>
            <Divider label="Enquadramento" />
            <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 6 }}>Ajuste a posição e o zoom da foto no card — ou arraste direto na prévia</div>
            <Slider label="◄ horizontal ►" val={card.focalX ?? 0.5} min={-4} max={4} step={0.01} on={(v) => onChange({ focalX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.focalY ?? 0.4} min={-4} max={4} step={0.01} on={(v) => onChange({ focalY: v })} fmt={pct} />
            <Slider label="Zoom" val={card.scale ?? 1} min={0.5} max={3} step={0.05} on={(v) => onChange({ scale: v })} fmt={(v) => v.toFixed(2) + "x"} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#9aa0b2" }}>Girar</span>
              <button onClick={() => onChange({ rotate: ((((card.rotate || 0) - 90) % 360) + 360) % 360 })} style={{ fontSize: 13, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>↺ 90°</button>
              <button onClick={() => onChange({ rotate: ((card.rotate || 0) + 90) % 360 })} style={{ fontSize: 13, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>↻ 90°</button>
              <span style={{ fontSize: 12, color: "#6a7080" }}>{card.rotate || 0}°</span>
            </div>
            <button onClick={() => onChange({ focalX: 0.5, focalY: 0.4, scale: 1, rotate: 0 })} style={{ marginTop: 10, fontSize: 12, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>resetar enquadramento</button>
          </>
        )}

        {(card.layout === "l3-antes-depois" || card.layout === "l8-split" || card.layout === "l8-ruptura") && (
          <>
            <Divider label={card.layout === "l3-antes-depois" ? "2a foto — lado DEPOIS" : "2a foto — metade de baixo"} />
            <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 8 }}>{card.layout === "l3-antes-depois" ? "A 1a foto (acima) e o ANTES — esta e o DEPOIS" : "A 1a foto fica em cima; esta fica embaixo"}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              {card.image2 && <img src={card.image2} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, border: "1px solid #2e2e36" }} />}
              <button onClick={() => bgFile2Ref.current?.click()} disabled={bgUpBusy2}
                style={{ fontSize: 13, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 8, padding: "9px 16px", cursor: "pointer", opacity: bgUpBusy2 ? 0.6 : 1, fontWeight: 600 }}>
                {bgUpBusy2 ? "enviando…" : card.image2 ? "trocar foto" : "⬆ enviar foto"}
              </button>
              {card.image2 && <button onClick={() => onChange({ image2: undefined })} style={{ fontSize: 12, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 7, padding: "7px 12px", cursor: "pointer" }}>remover</button>}
              <input ref={bgFile2Ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadSecond(f); e.currentTarget.value = ""; }} />
            </div>
            <SelLabel>Ou da biblioteca</SelLabel>
            <select value="" onChange={(e) => loadLib2(e.target.value)} style={selStyle}>
              <option value="">escolher categoria/sentimento</option>
              {sentiments.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {lib2.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginTop: 6, maxHeight: 200, overflowY: "auto" }}>
                {lib2.map((src) => (
                  <img key={src} src={src} alt="" loading="lazy" onClick={() => onChange({ image2: src })}
                    style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 6, cursor: "pointer", border: card.image2 === src ? "2px solid #ef476f" : "1px solid #2e2e36" }} />
                ))}
              </div>
            )}
          </>
        )}

        <Divider label={hasImage ? "Cor de fundo (atrás da foto)" : "Cor de fundo do card"} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([["#000000", "● Preto"], ["#14213d", "● Azul"], ["#ef476f", "● Rosa"], ["#f5f5f5", "● Branco"]] as const).map(([hex, nm]) => {
            const on = (card.bg || "#000000").toLowerCase() === hex;
            return (
              <button key={hex} onClick={() => onChange({ bg: hex })} style={{ fontSize: 12, background: on ? "#3a1424" : "#17171b", color: on ? "#fff" : "#cfcfcf", border: "2px solid " + (on ? "#ef476f" : "#2e2e36"), borderRadius: 8, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flex: "1 1 auto" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: hex, border: "1px solid #5a6480", flexShrink: 0 }} />{nm.replace("● ", "")}
              </button>
            );
          })}
        </div>

        <Divider label="Sombra / tom de cor sobre a foto" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([["#ef476f", "Rosa", "#ff6b8f", 0.28], ["#14213d", "Azul", "#cfd6e6", 0.35], ["#000000", "Preta", "#f5f5f5", 0.35]] as const).map(([color, label, textColor, defOpacity]) => (
            <button key={color} onClick={() => onChange({ tint: { color, opacity: tint?.opacity ?? defOpacity } })}
              style={{ fontSize: 12, background: tint?.color === color ? "#21212a" : "#17171b", color: textColor, border: "1px solid " + (tint?.color === color ? "#ef476f" : "#2e2e36"), borderRadius: 8, padding: "7px 14px", cursor: "pointer", flex: "1 1 auto", fontWeight: tint?.color === color ? 700 : 400 }}>
              {label}
            </button>
          ))}
          <button onClick={() => onChange({ tint: undefined })} style={{ fontSize: 12, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>Nenhuma</button>
        </div>
        {tint && <Slider label="Opacidade" val={tint.opacity} min={0.05} max={0.9} step={0.05} on={(v) => onChange({ tint: { ...tint, opacity: v } })} fmt={pct} />}

        <Divider label="Sombra nativa do layout (overlay na foto)" />
        <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 8 }}>Cada layout tem uma sombra embutida sobre a foto. Aqui você escolhe a cor dela (opacidade é fixa pelo design do layout).</div>
        {card.overlayColor !== "none" && <ColorRow label="Cor do overlay" value={card.overlayColor} def={card.layout?.startsWith("l7") || card.layout?.startsWith("l8") ? "#07111d" : "#14213d"} onChange={(v) => onChange({ overlayColor: v })} favs={favColors} onFav={addFav} />}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={() => onChange({ overlayColor: card.overlayColor === "none" ? undefined : "none" })}
            style={{ fontSize: 12, background: card.overlayColor === "none" ? "#1a2a1a" : "#17171b", color: card.overlayColor === "none" ? "#5fd38a" : "#9aa0b0", border: "1px solid " + (card.overlayColor === "none" ? "#2c5c3e" : "#2e2e36"), borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
            {card.overlayColor === "none" ? "✓ sem overlay (restaurar)" : "remover overlay"}
          </button>
        </div>

        <ApplyAll onApplyAll={onApplyAll} label="aplicar fundo + sombra a todos os cards" keys={["bg", "tint", "overlayColor"]} />
      </Section>

      {/* LOGOS — escolher da biblioteca (até 2) ou usar a padrão */}
      <Section title="Logos do card" {...sec("logo")}>
        <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 8 }}>Escolhe até <b style={{ color: "#cfcfcf" }}>2 logos</b> da biblioteca, ou deixa a padrão. (gerencie em <b style={{ color: "#cfcfcf" }}>Biblioteca</b>)</div>
        {logoLib.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(50px,1fr))", gap: 6, marginBottom: 10 }}>
            {logoLib.map((url) => {
              const sel = (card.logos || []).some((l) => l.src === url);
              return (
                <div key={url} onClick={() => toggleLogo(url)} title={sel ? "remover do card" : "usar no card"}
                  style={{ position: "relative", height: 50, borderRadius: 6, cursor: "pointer", overflow: "hidden", border: "2px solid " + (sel ? "#ef476f" : "#2e2e36"),
                    backgroundColor: "#8a93a8", backgroundImage: "linear-gradient(45deg,#6b7488 25%,transparent 25%),linear-gradient(-45deg,#6b7488 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#6b7488 75%),linear-gradient(-45deg,transparent 75%,#6b7488 75%)", backgroundSize: "10px 10px", backgroundPosition: "0 0,0 5px,5px -5px,-5px 0" }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
                  {sel && <span style={{ position: "absolute", top: 1, right: 1, background: "#ef476f", color: "#fff", fontSize: 9, fontWeight: 700, padding: "0 4px", borderRadius: 4 }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <button onClick={() => onChange({ logos: undefined })} style={{ fontSize: 11, background: card.logos === undefined ? "#3a1424" : "#17171b", color: card.logos === undefined ? "#ff6b8f" : "#cfcfcf", border: "1px solid " + (card.logos === undefined ? "#ef476f" : "#3b3b44"), borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>usar a logo padrão</button>
          <button onClick={() => onChange({ logos: [] })} style={{ fontSize: 11, background: (card.logos && card.logos.length === 0) ? "#3a1424" : "#17171b", color: "#cfcfcf", border: "1px solid #3b3b44", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>nenhuma logo</button>
        </div>
        {card.logos === undefined ? (
          <>
            <div style={{ fontSize: 10.5, color: "#7c869c", marginBottom: 2 }}>Posição da logo padrão (a &quot;EM USO&quot; da Biblioteca):</div>
            <AlignButtons onSet={alignBox(logo?.w ?? 250, (ax, v) => setLogo(ax === "x" ? { x: v } : { y: v }))} />
            <Slider label="◄ X ►" val={logo?.x ?? 0.06} min={0} max={0.85} step={0.01} on={(v) => setLogo({ x: v })} fmt={pct} />
            <Slider label="▲ Y ▼" val={logo?.y ?? 0.05} min={0} max={0.9} step={0.01} on={(v) => setLogo({ y: v })} fmt={pct} />
            <Slider label="Tamanho" val={logo?.w ?? 250} min={120} max={500} step={5} on={(v) => setLogo({ w: v })} />
            <label style={{ fontSize: 12, color: "#cfcfcf", display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}><input type="checkbox" checked={!!logo?.hide} onChange={(e) => setLogo({ hide: e.target.checked })} /> esconder a logo neste card</label>
          </>
        ) : (
          (card.logos || []).map((l, i) => (
            <div key={i} style={{ background: "#121216", border: "1px solid #2e2e36", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <img src={l.src} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                <span style={{ flex: 1, fontSize: 11, color: "#9aa0b0" }}>logo {i + 1}</span>
                <button onClick={() => toggleLogo(l.src)} style={{ fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>remover</button>
              </div>
              <AlignButtons onSet={alignBox(l.w ?? 200, (ax, v) => updateLogo(i, ax === "x" ? { x: v } : { y: v }))} />
              <Slider label="◄ X ►" val={l.x} min={0} max={0.95} step={0.01} on={(v) => updateLogo(i, { x: v })} fmt={pct} />
              <Slider label="▲ Y ▼" val={l.y} min={0} max={0.95} step={0.01} on={(v) => updateLogo(i, { y: v })} fmt={pct} />
              <Slider label="Tamanho" val={l.w ?? 200} min={80} max={520} step={5} on={(v) => updateLogo(i, { w: v })} />
            </div>
          ))
        )}
        <ApplyAll onApplyAll={onApplyAll} label="aplicar logos a todos os cards" keys={["logo", "logos"]} />
      </Section>

      {/* ELEMENTOS PRÓPRIOS DO LAYOUT — nada fica preso sem controle */}
      <Section title="Elementos do layout" {...sec("elementos")}>
        {layoutElements.length === 0 ? (
          <div style={{ fontSize: 12, color: "#7c869c" }}>Este layout não tem elementos extras travados. O que aparece nele já é texto, foto, logo, nick ou overlay editável</div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 8 }}>Tudo que era fixo neste layout aparece aqui. Desliga, move, muda tamanho/cor ou edita o texto quando existir</div>
            {layoutElements.map((def) => {
              const el = resolveCardElement(card, def);
              const visible = !el.hidden;
              const textValue = def.id === "index" && card.elements?.[def.id]?.text == null ? card.index || "" : el.text || "";
              const mainSize = el.kind === "text" || el.kind === "marker" ? el.size ?? def.size ?? 24 : el.w ?? def.w ?? 120;
              return (
                <div key={def.id} style={{ background: "#121216", border: "1px solid #2e2e36", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#cfcfcf", fontSize: 12, flex: 1 }}>
                      <input type="checkbox" checked={visible} onChange={(e) => updateElement(def.id, { hidden: !e.target.checked })} />
                      <b>{def.label}</b>
                    </label>
                    <span style={{ fontSize: 10, color: "#7c869c", textTransform: "uppercase", letterSpacing: 1 }}>{def.kind}</span>
                    <button onClick={() => resetElement(def.id)} style={{ fontSize: 11, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>reset</button>
                  </div>
                  {visible && (
                    <>
                      {def.editable && <RedField label="Texto do elemento" value={textValue} onChange={(v) => updateElement(def.id, { text: v })} rows={def.id === "brandFooter" || def.id === "galleryBrand" ? 2 : 1} />}
                      {def.movable !== false && (
                        <>
                          <AlignButtons onSet={alignBox(el.w ?? def.w ?? 160, (ax, v) => updateElement(def.id, ax === "x" ? { x: v } : { y: v }))} />
                          <Slider label="◄ X ►" val={el.x} min={0} max={0.98} step={0.01} on={(v) => updateElement(def.id, { x: v })} fmt={pct} />
                          <Slider label="▲ Y ▼" val={el.y} min={0} max={0.98} step={0.01} on={(v) => updateElement(def.id, { y: v })} fmt={pct} />
                        </>
                      )}
                      {def.sizable && (el.kind === "bar" || el.kind === "decor") ? (
                        <>
                          <Slider label="Largura" val={el.w ?? def.w ?? 120} min={20} max={1080} step={5} on={(v) => updateElement(def.id, { w: v })} />
                          <Slider label="Altura" val={el.h ?? def.h ?? 10} min={2} max={1350} step={2} on={(v) => updateElement(def.id, { h: v })} />
                        </>
                      ) : def.sizable ? (
                        <Slider label={el.kind === "text" || el.kind === "marker" ? "Tamanho" : "Tamanho"} val={mainSize} min={8} max={520} step={1} on={(v) => updateElement(def.id, el.kind === "text" || el.kind === "marker" ? { size: v } : { w: v })} />
                      ) : null}
                      {def.colorable && <ColorRow label="Cor do elemento" value={el.color} def={def.color || "#ef476f"} onChange={(v) => updateElement(def.id, { color: v })} favs={favColors} onFav={addFav} />}
                    </>
                  )}
                </div>
              );
            })}
            <ApplyAll onApplyAll={onApplyAll} label="aplicar elementos deste layout a todos" keys={["elements"]} />
          </>
        )}
      </Section>

      {/* NICK INSTAGRAM — handle no topo dos cards Layout 2/3 (até 2) */}
      <Section title="Nick do Instagram" {...sec("nick")} right={
        <label style={{ fontSize: 12, color: "#cfcfcf", display: "flex", gap: 5, alignItems: "center" }}>
          <input type="checkbox" checked={!card.hideNick} onChange={(e) => onChange({ hideNick: !e.target.checked })} /> mostrar
        </label>
      }>
        {card.hideNick ? (
          <div style={{ fontSize: 12, color: "#7c869c" }}>Nick <b style={{ color: "#e0738c" }}>desligado</b> neste card. Marque &quot;mostrar&quot; pra exibir</div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 8 }}>Aparece pequeno no topo dos cards dos <b style={{ color: "#cfcfcf" }}>Layouts 2 a 6</b>. Pode usar 1 ou 2 (ex: <b style={{ color: "#cfcfcf" }}>@teamnetto</b> e <b style={{ color: "#cfcfcf" }}>@n2squad</b>)</div>
            {[0, 1].map((i) => (
              <input key={i} value={card.nicks?.[i] || ""} placeholder={i === 0 ? "@nick principal (ex: @n2squad)" : "@2º nick (opcional)"}
                onChange={(e) => { const arr = [card.nicks?.[0] || "", card.nicks?.[1] || ""]; arr[i] = e.target.value; onChange({ nicks: arr }); }}
                style={{ ...fieldStyle, marginBottom: 8 }} />
            ))}
            <div style={{ borderTop: "1px solid #2e2e36", marginTop: 4, paddingTop: 10 }}>
              <label style={{ fontSize: 12, color: "#cfcfcf", display: "flex", gap: 6, alignItems: "center", marginBottom: card.nickPos ? 8 : 0 }}>
                <input type="checkbox" checked={!!card.nickPos} onChange={(e) => onChange({ nickPos: e.target.checked ? { x: 0.06, y: 0.05, size: 28 } : undefined })} /> mover livre (ou arraste a alça <b style={{ color: "#cfcfcf" }}>NICK</b> na prévia)
              </label>
              <AlignButtons onSet={alignNick} />
              {card.nickPos && (
                <>
                  <Slider label="◄ X ►" val={card.nickPos.x} min={0} max={0.95} step={0.01} on={(v) => onChange({ nickPos: { ...card.nickPos!, x: v } })} fmt={pct} />
                  <Slider label="▲ Y ▼" val={card.nickPos.y} min={0} max={0.95} step={0.01} on={(v) => onChange({ nickPos: { ...card.nickPos!, y: v } })} fmt={pct} />
                  <Slider label="Tamanho" val={card.nickPos.size ?? 28} min={16} max={64} step={1} on={(v) => onChange({ nickPos: { ...card.nickPos!, size: v } })} />
                </>
              )}
            </div>
          </>
        )}
        <ApplyAll onApplyAll={onApplyAll} label="aplicar nick (mostrar/esconder + posição + texto) a todos" keys={["nicks", "hideNick", "nickPos"]} />
      </Section>

      {/* ÍNDICE / NUMERAÇÃO */}
      <Section title="Índice / numeração" {...sec("indice")} right={
        <label style={{ fontSize: 11, color: "#9aa0b0", display: "flex", gap: 5, alignItems: "center" }}>
          <input type="checkbox" checked={!!card.index} onChange={(e) => onChange({ index: e.target.checked ? `${(index ?? 0) + 1} / ${carousel.cards.length}` : undefined })} />
          mostrar
        </label>
      }>
        {!card.index ? (
          <div style={{ fontSize: 12, color: "#7c869c" }}>Marque &quot;mostrar&quot; pra exibir o indicador de página neste card</div>
        ) : (
          <>
            {/* estilos */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 6 }}>Estilo</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {([
                  { id: "texto",     label: "01 / 08",     desc: "numeração padrão" },
                  { id: "seta",      label: "→",            desc: "seta pro próximo" },
                  { id: "continua",  label: "continua →",  desc: "texto + seta" },
                  { id: "swipe",     label: "← swipe →",  desc: "dois lados" },
                  { id: "pontos",    label: "● ○ ○ ○",    desc: "pontos de página" },
                  { id: "tracos",    label: "━ ─ ─ ─",    desc: "traços de progresso" },
                  { id: "barra",     label: "▬▬▬░░",      desc: "barra de progresso" },
                  { id: "pill",      label: "[01/08]",     desc: "badge arredondado" },
                  { id: "minimo",    label: "01·08",       desc: "minimalista" },
                  { id: "grande",    label: "01 /08",      desc: "número em destaque" },
                  { id: "circulo",   label: "①",           desc: "número em círculo" },
                  { id: "pagina",    label: "página 1 de 8", desc: "por extenso" },
                  { id: "seta-dupla", label: "← 01 →",   desc: "navegação dupla" },
                ] as const).map((s) => {
                  const on = (card.indexStyle || "texto") === s.id;
                  return (
                    <button key={s.id} onClick={() => onChange({ indexStyle: s.id })}
                      style={{ padding: "7px 6px", borderRadius: 8, border: "1px solid " + (on ? "#ef476f" : "#2e2e36"), background: on ? "#2a0e16" : "#17171b", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: on ? "#ef476f" : "#cfcfcf", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
                      <div style={{ fontSize: 9.5, color: on ? "#c47080" : "#5a6378" }}>{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* texto do índice */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 4 }}>Conteúdo <span style={{ color: "#5a6378" }}>— edite se quiser texto livre</span></div>
              <input value={card.index} onChange={(e) => onChange({ index: e.target.value })}
                style={{ width: "100%", background: "#17171b", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 7, padding: "6px 10px", fontSize: 13 }} />
            </div>
            <div style={{ fontSize: 10.5, color: "#5a6378", marginBottom: 10 }}>Arraste a alça <b style={{ color: "#cfcfcf" }}>ÍNDICE</b> no preview para reposicionar</div>
            <ApplyAll onApplyAll={onApplyAll} label="aplicar estilo do índice a todos" keys={["indexStyle"]} />
          </>
        )}
      </Section>

      {/* CARD IMAGES */}
      <Section title="Adicionar imagens" {...sec("cardimages")} right={
        <span style={{ fontSize: 11, color: "#6a7080" }}>{cardImgs.length ? `${cardImgs.length} imagem(ns)` : "nenhuma"}</span>
      }>
        {/* picker da biblioteca */}
        <div style={{ marginBottom: 10 }}>
          <SelLabel>Escolher da biblioteca</SelLabel>
          <select value="" onChange={(e) => { if (e.target.value) loadCiLib(e.target.value); }} style={selStyle}>
            <option value="">— escolher categoria / sentimento —</option>
            {Object.entries(sentiments.reduce((acc: Record<string, string[]>, s: string) => { const cat = s.split("-")[0]; (acc[cat] ||= []).push(s); return acc; }, {})).map(([cat, keys]) => (
              <optgroup key={cat} label={cat}>
                {(keys as string[]).length > 1 && <option value={"cat:" + cat}>★ tudo de {cat}</option>}
                {(keys as string[]).map((s) => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        {ciLibImgs.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 5 }}>Clica pra adicionar · {ciLibImgs.length} disponíveis</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px,1fr))", gap: 5, maxHeight: 200, overflowY: "auto", padding: 5, background: "#0a0a0e", borderRadius: 10, border: "1px solid #1e1e26" }}>
              {ciLibImgs.map((src) => (
                <img key={src} src={src} alt="" loading="lazy"
                  onClick={() => onChange({ cardImages: [...cardImgs, { src, x: 0.1, y: 0.1, width: 0.5 }] })}
                  style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 6, cursor: "pointer", border: "1px solid #2e2e36" }} />
              ))}
            </div>
          </div>
        )}
        {!cardImgs.length && <div style={{ fontSize: 12, color: "#7c869c", marginBottom: 8 }}>Escolha uma categoria acima pra ver as fotos disponíveis. Depois você arrasta e ajusta o tamanho diretamente no card</div>}
        {/* lista de imagens adicionadas */}
        {cardImgs.map((ci, i) => (
          <div key={i} style={{ background: "#121216", border: "1px solid #2e2e36", borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <img src={ci.src} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 7, border: "1px solid #2e2e36", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ fontSize: 12, color: "#cfcfcf", display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}>
                  <input type="checkbox" checked={!!ci.bw} onChange={(e) => updateCardImg(i, { bw: e.target.checked })} />
                  P&B
                </label>
                <button onClick={() => setCropTarget({ idx: i, src: ci.src })}
                  style={{ fontSize: 11.5, background: ci.crop ? "#1a2d1a" : "#1a1a22", color: ci.crop ? "#5fd38a" : "#cfcfcf", border: "1px solid " + (ci.crop ? "#2c5c3e" : "#3b3b44"), borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
                  {ci.crop ? "✓ cortado" : "✂️ cortar"}
                </button>
                <button onClick={() => removeCardImg(i)} style={{ background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 6, padding: "4px 9px", cursor: "pointer", fontSize: 13 }}>×</button>
              </div>
            </div>
            <Slider label="Tamanho" val={ci.width} min={0.05} max={1.5} step={0.01} on={(v) => updateCardImg(i, { width: v })} fmt={(v) => Math.round(v * 100) + "%"} />
            <Slider label="Opacidade" val={ci.opacity ?? 1} min={0.05} max={1} step={0.05} on={(v) => updateCardImg(i, { opacity: v })} fmt={(v) => Math.round(v * 100) + "%"} />
            <Slider label="◄ X ►" val={ci.x} min={-4} max={4} step={0.01} on={(v) => updateCardImg(i, { x: v })} fmt={(v) => Math.round(v * 100) + "%"} />
            <Slider label="▲ Y ▼" val={ci.y} min={-4} max={4} step={0.01} on={(v) => updateCardImg(i, { y: v })} fmt={(v) => Math.round(v * 100) + "%"} />
          </div>
        ))}
        {cardImgs.length > 0 && <div style={{ fontSize: 11, color: "#6a7080", marginTop: 4 }}>Arraste a alça <b style={{ color: "#ef476f" }}>IMG</b> na prévia para posicionar com precisão</div>}
      </Section>

      {/* OVERLAYS */}
      <Section title="Imagens por cima (overlay)" {...sec("overlays")} right={
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={openLibOv} style={{ fontSize: 12, background: showLibOv ? "#3a1424" : "#21212a", color: showLibOv ? "#ff6b8f" : "#f5f5f5", border: "1px solid " + (showLibOv ? "#ef476f" : "#3b3b44"), borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>📚 biblioteca</button>
          <button onClick={() => fileRef.current?.click()} style={{ fontSize: 12, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>+ imagem</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadOverlay(f); e.currentTarget.value = ""; }} />
        </div>
      }>
        {showLibOv && (
          <div style={{ marginBottom: 10, padding: 8, background: "#0e0e11", borderRadius: 8, border: "1px solid #2e2e36" }}>
            <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 6 }}>Clica pra adicionar ({libOv.length}) · gerencie em Biblioteca → Overlays</div>
            {libOv.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(54px,1fr))", gap: 5, maxHeight: 180, overflowY: "auto" }}>
                {libOv.map((src) => (
                  <img key={src} src={src} alt="" onClick={() => onChange({ overlays: [...overlays, { src, x: 0, y: 0, width: 1, color: true }] })}
                    style={{ width: "100%", height: 54, objectFit: "contain", cursor: "pointer", borderRadius: 5, padding: 3, backgroundColor: "#8a93a8", backgroundImage: "linear-gradient(45deg,#6b7488 25%,transparent 25%),linear-gradient(-45deg,#6b7488 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#6b7488 75%),linear-gradient(-45deg,transparent 75%,#6b7488 75%)", backgroundSize: "10px 10px", backgroundPosition: "0 0,0 5px,5px -5px,-5px 0" }} />
                ))}
              </div>
            ) : <div style={{ fontSize: 11, color: "#7c869c" }}>Sem overlays na biblioteca. Sobe em <b style={{ color: "#cfcfcf" }}>Biblioteca → Overlays</b></div>}
          </div>
        )}
        {!overlays.length && <div style={{ fontSize: 12, color: "#7c869c" }}>Nenhuma no card. Use <b style={{ color: "#cfcfcf" }}>📚 biblioteca</b> pra pegar uma salva, ou <b style={{ color: "#cfcfcf" }}>+ imagem</b> pra subir na hora. Depois <b style={{ color: "#5fd38a" }}>✂️ fundo</b> recorta</div>}
        {overlays.map((o, i) => (
          <div key={i} style={{ background: "#121216", border: "1px solid #2e2e36", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ flex: 1, fontSize: 12, color: "#cfcfcf" }}>imagem sobreposta</span>
              <label style={{ fontSize: 11, color: "#9aa0b0", display: "flex", gap: 4, alignItems: "center" }}>
                <input type="checkbox" checked={!!o.color} onChange={(e) => updateOverlay(i, { color: e.target.checked })} />cor
              </label>
              <button onClick={() => removeBg(i)} disabled={bgBusy === i} title="Remover o fundo (vira PNG transparente — roda no navegador, sem custo)"
                style={{ fontSize: 11, background: "#16261a", color: "#5fd38a", border: "1px solid #2c5c3e", borderRadius: 6, padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap", opacity: bgBusy === i ? 0.6 : 1 }}>
                {bgBusy === i ? "removendo" : "✂️ fundo"}
              </button>
              <button onClick={() => removeOverlay(i)} style={{ background: "transparent", color: "#e0738c", border: "1px solid #3a2a32", borderRadius: 6, padding: "2px 9px", cursor: "pointer" }}>×</button>
            </div>
            <Slider label="◄ X ►" val={o.x} min={-0.2} max={1} step={0.01} on={(v) => updateOverlay(i, { x: v })} fmt={pct} />
            <Slider label="▲ Y ▼" val={o.y} min={-0.2} max={1} step={0.01} on={(v) => updateOverlay(i, { y: v })} fmt={pct} />
            <Slider label="Tamanho" val={o.width} min={0.1} max={1.5} step={0.01} on={(v) => updateOverlay(i, { width: v })} fmt={pct} />
            <Slider label="Opacidade" val={o.opacity ?? 1} min={0.1} max={1} step={0.05} on={(v) => updateOverlay(i, { opacity: v })} fmt={pct} />
          </div>
        ))}
        {overlays.length > 0 && <ApplyAll onApplyAll={onApplyAll} label="aplicar estas imagens a todos os cards" keys={["overlays"]} />}
      </Section>

      {/* REGERAR IA */}
      <Section title="Regerar este card (IA)" {...sec("regerar")}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="instrução opcional: mais direto, encurta, mais firmeza"
            style={{ flex: 1, background: "#121216", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 8, padding: "9px 11px", fontSize: 13 }} />
          <button onClick={regen} disabled={regenLoad} className="dg-btn-primary" style={{ padding: "0 18px", whiteSpace: "nowrap" }}>
            {regenLoad ? "Regerando" : "🔄 Regerar"}
          </button>
        </div>
      </Section>

      {/* KIT DA MARCA (por último) */}
      <Section title="Kit & Templates" {...sec("kit")}>
        {/* KIT — só estilo */}
        <div style={{ fontSize: 11, color: "var(--dg-faint)", marginBottom: 8 }}><b style={{ color: "#cfcfcf" }}>Kit</b> = só o estilo (fonte, cores, sombras, alinhamento, fundo). Não pega layout nem posições.</div>
        <button onClick={saveKit} style={{ fontSize: 12.5, fontWeight: 600, background: "var(--dg-red-soft)", color: "#ff9fb4", border: "1px solid rgba(239,71,111,0.4)", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>💾 salvar estilo como kit</button>
        {kits.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "var(--dg-faint)", marginTop: 8 }}>Nenhum kit salvo ainda.</div>
        ) : (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {kits.map((k) => (
              <div key={k.name} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--dg-sunken)", border: "1px solid var(--dg-line)", borderRadius: 8, padding: "6px 8px" }}>
                <span style={{ flex: 1, fontSize: 12.5, color: "#e4e4e9", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.name}</span>
                <button onClick={() => onApplyKit?.(k.style, false)} style={{ fontSize: 11, background: "#21212a", color: "#cfcfcf", border: "1px solid #2e2e36", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }}>este card</button>
                <button onClick={() => onApplyKit?.(k.style, true)} style={{ fontSize: 11, background: "#21212a", color: "#cfcfcf", border: "1px solid #2e2e36", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }}>todos</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 1, background: "var(--dg-line)", margin: "16px 0" }} />

        {/* TEMPLATE — look completo */}
        <div style={{ fontSize: 11, color: "var(--dg-faint)", marginBottom: 8 }}><b style={{ color: "#c07bd6" }}>Template</b> = o look COMPLETO: layout, posição do texto, cores, tamanhos e o fundo (opcional). Deixa um card perfeito, salva, e aplica igualzinho em outro.</div>
        <button onClick={saveTemplate} style={{ fontSize: 12.5, fontWeight: 600, background: "rgba(192,123,214,.12)", color: "#d69bea", border: "1px solid rgba(192,123,214,0.4)", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>🎨 salvar este card como template</button>
        {templates.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "var(--dg-faint)", marginTop: 8 }}>Nenhum template salvo. Deixa um card do jeito exato que quer (layout, posições, cores, fundo) e salva.</div>
        ) : (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {templates.map((t) => (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--dg-sunken)", border: "1px solid rgba(192,123,214,.2)", borderRadius: 8, padding: "6px 8px" }}>
                <span style={{ flex: 1, fontSize: 12.5, color: "#e4e4e9", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.name}{t.hasImage ? <span title="inclui o fundo" style={{ marginLeft: 5, fontSize: 10, color: "#c07bd6" }}>🖼</span> : null}
                </span>
                <button onClick={() => onChange(t.style)} style={{ fontSize: 11, background: "#21212a", color: "#d69bea", border: "1px solid #3a2e42", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }}>este card</button>
                <button onClick={() => onApplyKit?.(t.style, true)} style={{ fontSize: 11, background: "#21212a", color: "#d69bea", border: "1px solid #3a2e42", borderRadius: 6, padding: "4px 9px", cursor: "pointer" }}>todos</button>
                <button onClick={() => deleteTemplate(t.name)} title="apagar" style={{ fontSize: 11, background: "transparent", color: "#7a6070", border: "1px solid #3a2e42", borderRadius: 6, padding: "4px 7px", cursor: "pointer" }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
    {cropTarget && (
      <CropModal
        src={cropTarget.src}
        initial={cardImgs[cropTarget.idx]?.crop ?? null}
        onConfirm={(crop) => { updateCardImg(cropTarget.idx, { crop: crop ?? undefined }); setCropTarget(null); }}
        onCancel={() => setCropTarget(null)}
      />
    )}
    </>
  );
}
