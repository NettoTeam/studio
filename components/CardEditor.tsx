"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import type { Card, Layout, Overlay, Carousel } from "@/lib/types";

function Section({ title, children, right, open, onToggle, secId }: { title: string; children: ReactNode; right?: ReactNode; open?: boolean; onToggle?: () => void; secId?: string }) {
  const collapsible = onToggle != null;
  const isOpen = collapsible ? !!open : true;
  return (
    <div className="dg-box" id={secId ? "sec-" + secId : undefined} style={{ marginBottom: 9, overflow: "hidden", borderColor: isOpen ? "var(--dg-line)" : "var(--dg-line-soft)", scrollMarginTop: 80 }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: isOpen ? "12px 14px 10px" : "11px 14px", cursor: collapsible ? "pointer" : "default", userSelect: "none", background: isOpen ? "rgba(255,255,255,0.035)" : "transparent", transition: "background .15s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ width: 4, height: 16, background: isOpen ? "var(--dg-red)" : "var(--dg-line-strong)", borderRadius: 2, display: "block", flexShrink: 0, transition: "background .15s" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1.4, fontSize: 16.5, color: isOpen ? "#fff" : "var(--dg-grey)", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {right && <div onClick={(e) => e.stopPropagation()}>{right}</div>}
          {collapsible && <span style={{ color: "var(--dg-faint)", fontSize: 10, display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .18s" }}>▶</span>}
        </div>
      </div>
      {isOpen && <div style={{ padding: "0 14px 14px" }}>{children}</div>}
    </div>
  );
}

function Slider({ label, val, min, max, step, on, fmt, pctEdit }: { label: string; val: number; min: number; max: number; step: number; on: (v: number) => void; fmt?: (v: number) => string; pctEdit?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
      <span style={{ width: 92, fontSize: 11, color: "#b0b6c4", letterSpacing: 0.3 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => on(Number(e.target.value))} style={{ flex: 1, accentColor: "#ef476f" }} />
      {pctEdit ? (
        <span style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <input type="number" value={Math.round(val * 100)} min={Math.round(min * 100)} max={Math.round(max * 100)}
            onChange={(e) => { const n = Number(e.target.value); if (Number.isFinite(n)) on(Math.min(max, Math.max(min, n / 100))); }}
            style={{ width: 40, fontSize: 11, color: "#cfcfcf", textAlign: "right", background: "#121216", border: "1px solid #2e2e36", borderRadius: 5, padding: "2px 3px", MozAppearance: "textfield" }} />
          <span style={{ fontSize: 10, color: "#8a93a8" }}>%</span>
        </span>
      ) : (
        <span style={{ width: 40, fontSize: 11, color: "#8a93a8", textAlign: "right" }}>{fmt ? fmt(val) : val}</span>
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
const KIT_KEYS: (keyof Card)[] = ["titleFont", "bodyFont", "titleColor", "bodyColor", "highlightColor", "titleScale", "bodyScale", "titleShadow", "bodyShadow", "titleTracking", "titleLeading", "bodyTracking", "bodyLeading", "align", "bg", "tint", "nicks", "hideNick"];

// fontes disponíveis (auto-hospedadas) — Anton (display), Montserrat, Inter
const FONTS = ["Anton", "Montserrat", "Inter"];

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
  useEffect(() => { setLocal(value); }, [value]); // sincroniza quando o valor muda de fora (trocar card, undo, regerar)
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
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <label style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
        <span style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => wrap("**")} title="Texto rosa — selecione um trecho"
            style={{ fontSize: 11, background: "#3a1424", color: "#ff6b8f", border: "1px solid #ef476f", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>
            ● rosa
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => wrap("==")} title="Caixa sólida rosa (com fundo)"
            style={{ fontSize: 11, background: "#ef476f", color: "#fff", border: "1px solid #ef476f", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>
            ▢ caixa
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => wrap("__")} title="Sublinhado rosa"
            style={{ fontSize: 11, background: "#2a1018", color: "#ff6b8f", border: "1px solid #ef476f", borderRadius: 5, padding: "3px 8px", cursor: "pointer", textDecoration: "underline" }}>
            _ sublinhar
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => wrap("~~")} title="Marca-texto (rosa translúcido)"
            style={{ fontSize: 11, background: "rgba(239,71,111,.35)", color: "#fff", border: "1px solid #ef476f", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>
            ▒ marca
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => wrap("++")} title="Contorno rosa (caixa vazada)"
            style={{ fontSize: 11, background: "transparent", color: "#ff6b8f", border: "1px solid #ef476f", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>
            ▢ contorno
          </button>
        </span>
      </div>
      <textarea ref={ref} value={local} onChange={(e) => onType(e.target.value)} onBlur={flush} rows={rows} style={fieldStyle} />
      {hint && <div style={{ fontSize: 10.5, color: "#7c869c", marginTop: 3 }}>{hint}</div>}
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
  useEffect(() => { try { setFavColors(JSON.parse(localStorage.getItem("n2_fav_colors") || "[]")); } catch {} }, []);
  const addFav = (hex: string) => setFavColors((prev) => { const next = [hex.toLowerCase(), ...prev.filter((x) => x !== hex.toLowerCase())].slice(0, 14); try { localStorage.setItem("n2_fav_colors", JSON.stringify(next)); } catch {} return next; });

  // KIT DA MARCA (presets de estilo, salvos no navegador)
  const [kits, setKits] = useState<{ name: string; style: Partial<Card> }[]>([]);
  useEffect(() => { try { setKits(JSON.parse(localStorage.getItem("n2_brand_kits") || "[]")); } catch {} }, []);
  function persistKits(list: { name: string; style: Partial<Card> }[]) { setKits(list); try { localStorage.setItem("n2_brand_kits", JSON.stringify(list)); } catch {} }
  function saveKit() {
    const name = prompt("Nome do kit (ex: Padrão N², Vinho premium):", "");
    if (!name) return;
    const style: Partial<Card> = {};
    KIT_KEYS.forEach((k) => { if (card[k] !== undefined) (style as Record<string, unknown>)[k] = card[k]; });
    persistKits([{ name, style }, ...kits.filter((x) => x.name !== name)].slice(0, 12));
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
    if (s.startsWith("cat:")) loadCategory(s.slice(4)); else loadImages(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.imageSentiment]);

  const overlays = card.overlays || [];
  function updateOverlay(i: number, patch: Partial<Overlay>) {
    onChange({ overlays: overlays.map((o, idx) => (idx === i ? { ...o, ...patch } : o)) });
  }
  function removeOverlay(i: number) {
    onChange({ overlays: overlays.filter((_, idx) => idx !== i) });
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
      alert("Não consegui remover o fundo dessa imagem. Tenta de novo ou outra imagem.");
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
      if (d.src) onChange({ image: d.src, imageSentiment: "", bw: false }); // foto sua entra COLORIDA; toggle P&B abaixo
    } catch { alert("Não consegui enviar essa imagem. Tenta outra."); }
    setBgUpBusy(false);
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
    } catch { alert("Não consegui enviar essa imagem. Tenta outra."); }
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
  const tint = card.tint;
  const hasImage = IMG_LAYOUTS.includes(card.layout);
  const cap = caps(card.layout); // quais campos este layout desenha
  const dual = cap.headline && cap.body && !!card.headline && !!card.body; // tem título E corpo (texto) → move cada um separado

  // ── handlers de "alinhar à página" (estilo Canva) ──
  const MARG = 0.04;
  const alignOffset = (setKey: (ax: "x" | "y", v: number) => void) => (ax: "x" | "y", wh: "start" | "mid" | "end") => {
    const mag = ax === "x" ? 0.08 : 0.4; // horizontal curto (texto é largo); vertical com alcance até as bordas
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
  const [open, setOpen] = useState("titulo");
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
  // atalhos rápidos pras seções (abre direto a que você quer)
  const NAV: { id: string; label: string }[] = [
    { id: "layout", label: "Layout" }, { id: "titulo", label: "Título" }, { id: "texto", label: "Texto" },
    { id: "movetexto", label: "Mover" }, { id: "fundo", label: "Fundo" }, { id: "logo", label: "Logos" },
    { id: "nick", label: "Nick" }, { id: "overlays", label: "Overlay" }, { id: "regerar", label: "IA" }, { id: "kit", label: "Kit" },
  ];
  const ApplyAll = ({ label, keys }: { label: string; keys: (keyof Card)[] }) =>
    onApplyAll ? (
      <button onClick={() => onApplyAll(keys)} title="Aplica este ajuste em TODOS os cards do carrossel"
        style={{ marginTop: 8, fontSize: 11, background: "#16201f", color: "#7fd0c0", border: "1px solid #2c4c48", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
        🔁 {label}
      </button>
    ) : null;
  const alignBtns = (
    <div style={{ display: "flex", gap: 8 }}>
      {([["left", "⬅ esquerda"], ["center", "↔ centro"]] as const).map(([v, lbl]) => {
        const on = (card.align || "left") === v;
        return <button key={v} onClick={() => onChange({ align: v })} style={{ flex: 1, fontSize: 12, background: on ? "#3a1424" : "#17171b", color: on ? "#ff6b8f" : "#cfcfcf", border: "1px solid " + (on ? "#ef476f" : "#3b3b44"), borderRadius: 6, padding: "6px", cursor: "pointer" }}>{lbl}</button>;
      })}
    </div>
  );

  return (
    <div ref={editorRef} className="dg-panel dg-edit-scroll" style={{ padding: 16, minWidth: 380, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap", paddingBottom: 12, borderBottom: "1px solid var(--dg-line-soft)" }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#fff", letterSpacing: 1 }}>EDITAR</span>
        <span className="dg-chip" style={{ background: "var(--dg-red-soft)", borderColor: "rgba(239,71,111,0.4)", color: "#ff9fb4", fontWeight: 700 }}>{card.index}</span>
        <span className="dg-chip">{card.layout}</span>
        <span style={{ flex: 1 }} />
        <button onClick={markVoice} title="Marca este card como a tua voz no ponto — vira exemplo que a IA imita nas próximas gerações"
          style={{ fontSize: 11.5, background: "#241f0e", color: "#e8c860", border: "1px solid #6a5a1e", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>
          ⭐ minha voz
        </button>
      </div>
      {voiceMsg && <div style={{ fontSize: 12, color: voiceMsg.startsWith("⭐") ? "#e8c860" : "#e0738c", marginBottom: 10 }}>{voiceMsg}</div>}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {NAV.map((n) => {
          const on = open === n.id;
          return (
            <button key={n.id} onClick={() => jumpTo(n.id)}
              style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 0.3, padding: "5px 11px", borderRadius: 999, cursor: "pointer",
                background: on ? "var(--dg-red)" : "var(--dg-raised-2)", color: on ? "#fff" : "var(--dg-grey)",
                border: "1px solid " + (on ? "var(--dg-red)" : "var(--dg-line-soft)"), transition: "background .14s, color .14s" }}>{n.label}</button>
          );
        })}
      </div>

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

      {/* TÍTULO — texto + tamanho + cor + alinhamento, tudo junto */}
      <Section title="Título" {...sec("titulo")} right={<span style={{ fontSize: 10.5, color: "#7c869c" }}>seleciona → ● rosa = cor</span>}>
        {cap.headline
          ? <RedField label="Texto do título" value={card.headline || ""} onChange={(v) => onChange({ headline: v })} rows={2} hint="Enter quebra a linha. Selecione um trecho + ● rosa pra colorir." />
          : <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 10 }}>Este layout não usa título — escreva no campo <b style={{ color: "#cfcfcf" }}>Texto / corpo</b> (seção abaixo). Os controles abaixo ajustam o estilo do texto.</div>}
        <Slider label="Tamanho" val={card.titleScale ?? 1} min={0.4} max={1.2} step={0.01} on={(v) => onChange({ titleScale: v })} pctEdit />
        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: 11, color: "#b0b6c4", display: "block", marginBottom: 5 }}>Fonte do título</label>
          <select value={card.titleFont || "Anton"} onChange={(e) => onChange({ titleFont: e.target.value })} style={selStyle}>
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <Slider label="Sombra do título" val={card.titleShadow ?? 0.6} min={0} max={1.5} step={0.01} on={(v) => onChange({ titleShadow: v })} pctEdit />
        <ColorRow label="Cor do título" value={card.titleColor} def="#f5f5f5" onChange={(v) => onChange({ titleColor: v })} favs={favColors} onFav={addFav} />
        <ColorRow label="Cor do destaque (●/▢)" value={card.highlightColor} def="#ef476f" onChange={(v) => onChange({ highlightColor: v })} favs={favColors} onFav={addFav} />
        <Slider label="Espaço letras" val={card.titleTracking ?? 0.5} min={-3} max={20} step={0.5} on={(v) => onChange({ titleTracking: v })} fmt={(v) => v + "px"} />
        <Slider label="Espaço linhas" val={card.titleLeading ?? 0.9} min={0.7} max={1.6} step={0.01} on={(v) => onChange({ titleLeading: v })} fmt={(v) => v.toFixed(2)} />
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, color: "#b0b6c4", display: "block", marginBottom: 5 }}>Alinhamento (título e corpo)</label>
          {alignBtns}
        </div>
        <ApplyAll label="aplicar estilo (fontes, cores, sombras, tamanhos, espaçamento, alinhamento) a todos" keys={["align", "titleScale", "bodyScale", "titleFont", "bodyFont", "titleShadow", "bodyShadow", "titleColor", "bodyColor", "highlightColor", "titleTracking", "titleLeading", "bodyTracking", "bodyLeading"]} />
      </Section>

      {/* MOVER TEXTO (posição) */}
      <Section title="Mover texto (posição)" {...sec("movetexto")}>
        {dual ? (
          <>
            <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 6 }}>Título e corpo movem <b style={{ color: "#cfcfcf" }}>separados</b> — arraste as alças <b style={{ color: "#cfcfcf" }}>TÍTULO</b> e <b style={{ color: "#cfcfcf" }}>CORPO</b> na prévia, ou use os botões.</div>
            <label style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1, display: "block", marginTop: 4 }}>Título</label>
            <AlignButtons onSet={alignOffset((ax, v) => onChange(ax === "x" ? { titleX: v } : { titleY: v }))} />
            <Slider label="◄ horizontal ►" val={card.titleX ?? 0} min={-0.1} max={0.1} step={0.005} on={(v) => onChange({ titleX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.titleY ?? 0} min={-0.45} max={0.45} step={0.005} on={(v) => onChange({ titleY: v })} fmt={pct} />
            <label style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1, display: "block", marginTop: 12 }}>Corpo / texto</label>
            <AlignButtons onSet={alignOffset((ax, v) => onChange(ax === "x" ? { bodyX: v } : { bodyY: v }))} />
            <Slider label="◄ horizontal ►" val={card.bodyX ?? 0} min={-0.1} max={0.1} step={0.005} on={(v) => onChange({ bodyX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.bodyY ?? 0} min={-0.45} max={0.45} step={0.005} on={(v) => onChange({ bodyY: v })} fmt={pct} />
            <button onClick={() => onChange({ titleX: undefined, titleY: undefined, bodyX: undefined, bodyY: undefined })} style={{ marginTop: 8, fontSize: 11, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>resetar posições</button>
            <ApplyAll label="aplicar posição do título e corpo a todos" keys={["titleX", "titleY", "bodyX", "bodyY"]} />
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 6 }}>Desloca o texto — arraste a alça <b style={{ color: "#cfcfcf" }}>TEXTO</b> na prévia, ou use os botões.</div>
            <AlignButtons onSet={alignOffset((ax, v) => onChange(ax === "x" ? { textX: v } : { textY: v }))} />
            <Slider label="◄ horizontal ►" val={card.textX ?? 0} min={-0.1} max={0.1} step={0.005} on={(v) => onChange({ textX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.textY ?? 0} min={-0.45} max={0.45} step={0.005} on={(v) => onChange({ textY: v })} fmt={pct} />
            <button onClick={() => onChange({ textX: undefined, textY: undefined })} style={{ marginTop: 8, fontSize: 11, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>centralizar (resetar)</button>
            <ApplyAll label="aplicar posição do texto a todos os cards" keys={["textX", "textY"]} />
          </>
        )}
      </Section>

      {/* TEXTO & ELEMENTOS */}
      <Section title="Texto, kicker, bullets & assinatura" {...sec("texto")}>
        {cap.kicker && <RedField label="Kicker (rótulo pequeno)" value={card.kicker || ""} onChange={(v) => onChange({ kicker: v })} rows={1} />}
        {cap.body && <RedField label="Texto / corpo" value={card.body || ""} onChange={(v) => onChange({ body: v })} rows={6} hint="1 Enter = quebra · 2 Enters = novo parágrafo." />}
        {cap.bullets && <RedField label="Bullets / passos (um por linha)" value={(card.bullets || []).join("\n")} onChange={(v) => onChange({ bullets: v.split("\n").filter((x) => x.trim()) })} rows={5} />}
        {(cap.body || cap.bullets) && (
          <>
            <Slider label="Tamanho do texto" val={card.bodyScale ?? 1} min={0.4} max={1.2} step={0.01} on={(v) => onChange({ bodyScale: v })} pctEdit />
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 11, color: "#b0b6c4", display: "block", marginBottom: 5 }}>Fonte do corpo</label>
              <select value={card.bodyFont || "Inter"} onChange={(e) => onChange({ bodyFont: e.target.value })} style={selStyle}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <Slider label="Sombra do texto" val={card.bodyShadow ?? 0.5} min={0} max={1.5} step={0.01} on={(v) => onChange({ bodyShadow: v })} pctEdit />
            <ColorRow label="Cor do texto" value={card.bodyColor} def="#f5f5f5" onChange={(v) => onChange({ bodyColor: v })} favs={favColors} onFav={addFav} />
            <Slider label="Espaço letras" val={card.bodyTracking ?? 0} min={-2} max={16} step={0.5} on={(v) => onChange({ bodyTracking: v })} fmt={(v) => v + "px"} />
            <Slider label="Espaço linhas" val={card.bodyLeading ?? 1.34} min={1} max={2.2} step={0.01} on={(v) => onChange({ bodyLeading: v })} fmt={(v) => v.toFixed(2)} />
          </>
        )}
        {cap.signoff && (<><div style={{ height: 12 }} /><RedField label="Assinatura / CTA (ex: Tamo junto.)" value={card.signoff || ""} onChange={(v) => onChange({ signoff: v })} rows={1} /></>)}
        {cap.source && <RedField label="Referência / fonte (ex: Müller et al., 2016)" value={card.source || ""} onChange={(v) => onChange({ source: v })} rows={1} />}
        {!cap.kicker && !cap.body && !cap.bullets && !cap.signoff && !cap.source && <div style={{ fontSize: 12, color: "#7c869c" }}>Este layout usa só o <b style={{ color: "#cfcfcf" }}>Título</b> (seção acima). Troque o layout pra usar corpo, kicker, bullets ou assinatura.</div>}
      </Section>

      {/* FUNDO — imagem + posição + zoom + sombra, tudo junto */}
      <Section title={hasImage ? "Fundo (imagem)" : "Fundo (sombra)"} {...sec("fundo")}>
        {hasImage && (
          <>
            {/* upload do meu arquivo + P&B — vale pra qualquer card com foto, inclusive a CAPA */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <button onClick={() => bgFileRef.current?.click()} disabled={bgUpBusy}
                style={{ fontSize: 12.5, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 7, padding: "7px 13px", cursor: "pointer", opacity: bgUpBusy ? 0.6 : 1 }}>
                {bgUpBusy ? "enviando…" : "⬆ enviar foto do meu arquivo"}
              </button>
              <input ref={bgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBackground(f); e.currentTarget.value = ""; }} />
              <label style={{ fontSize: 12.5, color: "#cfcfcf", display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                <input type="checkbox" checked={card.bw !== false} onChange={(e) => onChange({ bw: e.target.checked ? undefined : false })} /> preto e branco
              </label>
            </div>
          </>
        )}
        {hasImage && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, color: "#7c869c", marginBottom: 6 }}>{card.layout === "cover" ? "ou escolhe uma foto da biblioteca:" : ""}</div>
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
                style={{ fontSize: 15, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 8, padding: "0 14px", cursor: "pointer", whiteSpace: "nowrap" }}>🎲</button>
            </div>
            {imgsFor === card.imageSentiment && imgs.length > 0 && (
              <>
                <div style={{ fontSize: 10.5, color: "#7c869c", marginBottom: 5 }}>clica na imagem exata que você quer ({imgs.length})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))", gap: 6, maxHeight: 240, overflowY: "auto", padding: 5, background: "#0e0e11", borderRadius: 8, border: "1px solid #2e2e36" }}>
                  {imgs.map((src) => (
                    <img key={src} src={src} alt="" loading="lazy" onClick={() => onChange({ image: src, imageSentiment: card.imageSentiment })}
                      style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 5, cursor: "pointer", border: "2px solid " + (card.image === src ? "#ef476f" : "#2e2e36"), filter: "grayscale(1) contrast(1.08) brightness(.9)" }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {hasImage && (
          <>
            <div style={{ fontSize: 11, color: "#b0b6c4", marginBottom: 2 }}>📍 Posição <span style={{ color: "#7c869c" }}>— ou arraste na prévia</span></div>
            <Slider label="◄ horizontal ►" val={card.focalX ?? 0.5} min={0} max={1} step={0.01} on={(v) => onChange({ focalX: v })} fmt={pct} />
            <Slider label="▲ vertical ▼" val={card.focalY ?? 0.4} min={0} max={1} step={0.01} on={(v) => onChange({ focalY: v })} fmt={pct} />
            <Slider label="🔍 zoom" val={card.scale ?? 1} min={1} max={3} step={0.05} on={(v) => onChange({ scale: v })} fmt={(v) => v.toFixed(2) + "x"} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ width: 92, fontSize: 11, color: "#b0b6c4" }}>↻ Girar foto</span>
              <button onClick={() => onChange({ rotate: ((((card.rotate || 0) - 90) % 360) + 360) % 360 })} style={{ fontSize: 13, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>↺ 90°</button>
              <button onClick={() => onChange({ rotate: ((card.rotate || 0) + 90) % 360 })} style={{ fontSize: 13, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>↻ 90°</button>
              <span style={{ fontSize: 11, color: "#8a93a8" }}>{card.rotate || 0}°</span>
            </div>
            <button onClick={() => onChange({ focalX: 0.5, focalY: 0.4, scale: 1, rotate: 0 })} style={{ marginTop: 8, marginBottom: 14, fontSize: 11, background: "transparent", color: "#9aa0b0", border: "1px solid #2e2e36", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>resetar enquadramento</button>
          </>
        )}
        {(card.layout === "l3-antes-depois" || card.layout === "l8-split" || card.layout === "l8-ruptura") && (
          <div style={{ marginTop: 4, marginBottom: 14, paddingTop: 12, borderTop: "1px solid #2e2e36" }}>
            <div style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>2ª foto — {card.layout === "l3-antes-depois" ? "lado “DEPOIS”" : "metade de baixo"}</div>
            <div style={{ fontSize: 10.5, color: "#7c869c", marginBottom: 8 }}>{card.layout === "l3-antes-depois" ? "A 1ª foto (acima) é o “ANTES”. Esta é o “DEPOIS”." : "A 1ª foto fica em cima; esta fica embaixo."}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {card.image2 && <img src={card.image2} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, border: "1px solid #2e2e36" }} />}
              <button onClick={() => bgFile2Ref.current?.click()} disabled={bgUpBusy2}
                style={{ fontSize: 12.5, background: "#21212a", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 7, padding: "7px 13px", cursor: "pointer", opacity: bgUpBusy2 ? 0.6 : 1 }}>
                {bgUpBusy2 ? "enviando…" : card.image2 ? "trocar foto" : "⬆ enviar foto do 'depois'"}
              </button>
              {card.image2 && <button onClick={() => onChange({ image2: undefined })} style={{ fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}>remover</button>}
              <input ref={bgFile2Ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadSecond(f); e.currentTarget.value = ""; }} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 10.5, color: "#7c869c", display: "block", marginBottom: 4 }}>📚 ou pegar da biblioteca:</label>
              <select value="" onChange={(e) => loadLib2(e.target.value)} style={{ ...selStyle, fontSize: 12 }}>
                <option value="">escolher categoria/sentimento…</option>
                {sentiments.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {lib2.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginTop: 6, maxHeight: 200, overflowY: "auto" }}>
                  {lib2.map((src) => (
                    <img key={src} src={src} alt="" loading="lazy" onClick={() => onChange({ image2: src })}
                      style={{ width: "100%", height: 56, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: card.image2 === src ? "2px solid #ef476f" : "1px solid #2e2e36" }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <label style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Cor de fundo {hasImage ? "(atrás da foto)" : "(do card)"}</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {([["#000000", "preto"], ["#14213d", "azul"], ["#ef476f", "rosa"], ["#f5f5f5", "branco"]] as const).map(([hex, nm]) => {
            const on = (card.bg || "#000000").toLowerCase() === hex;
            return (
              <button key={hex} onClick={() => onChange({ bg: hex })} style={{ fontSize: 12, background: on ? "#3a1424" : "#17171b", color: "#cfcfcf", border: "2px solid " + (on ? "#ef476f" : "#3b3b44"), borderRadius: 6, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: hex, border: "1px solid #5a6480" }} />{nm}
              </button>
            );
          })}
        </div>
        <label style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Sombra / tom de cor (gradiente)</label>
        <div style={{ display: "flex", gap: 8, marginBottom: tint ? 8 : 0 }}>
          <button onClick={() => onChange({ tint: { color: "#ef476f", opacity: tint?.opacity ?? 0.28 } })} style={{ fontSize: 12, background: tint?.color === "#ef476f" ? "#3a1424" : "#2a1018", color: "#ff6b8f", border: "1px solid #ef476f", borderRadius: 6, padding: "5px 14px", cursor: "pointer" }}>rosa</button>
          <button onClick={() => onChange({ tint: { color: "#14213d", opacity: tint?.opacity ?? 0.35 } })} style={{ fontSize: 12, background: tint?.color === "#14213d" ? "#21212a" : "#17171b", color: "#cfd6e6", border: "1px solid #3b3b44", borderRadius: 6, padding: "5px 14px", cursor: "pointer" }}>azul</button>
          <button onClick={() => onChange({ tint: { color: "#000000", opacity: tint?.opacity ?? 0.35 } })} style={{ fontSize: 12, background: tint?.color === "#000000" ? "#21212a" : "#17171b", color: "#f5f5f5", border: "1px solid #3b3b44", borderRadius: 6, padding: "5px 14px", cursor: "pointer" }}>preta</button>
          <button onClick={() => onChange({ tint: undefined })} style={{ fontSize: 12, background: "transparent", color: "#9aa0b0", border: "1px solid #3b3b44", borderRadius: 6, padding: "5px 14px", cursor: "pointer" }}>nenhuma</button>
        </div>
        {tint && <Slider label="Opacidade" val={tint.opacity} min={0.05} max={0.9} step={0.05} on={(v) => onChange({ tint: { ...tint, opacity: v } })} fmt={pct} />}
        <div><ApplyAll label="aplicar fundo + sombra a todos os cards" keys={["bg", "tint"]} /></div>
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
        <ApplyAll label="aplicar logos a todos os cards" keys={["logo", "logos"]} />
      </Section>

      {/* NICK INSTAGRAM — handle no topo dos cards Layout 2/3 (até 2) */}
      <Section title="Nick do Instagram" {...sec("nick")} right={
        <label style={{ fontSize: 12, color: "#cfcfcf", display: "flex", gap: 5, alignItems: "center" }}>
          <input type="checkbox" checked={!card.hideNick} onChange={(e) => onChange({ hideNick: !e.target.checked })} /> mostrar
        </label>
      }>
        {card.hideNick ? (
          <div style={{ fontSize: 12, color: "#7c869c" }}>Nick <b style={{ color: "#e0738c" }}>desligado</b> neste card. Marque “mostrar” pra exibir.</div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "#7c869c", marginBottom: 8 }}>Aparece pequeno no topo dos cards dos <b style={{ color: "#cfcfcf" }}>Layouts 2 a 6</b>. Pode usar 1 ou 2 (ex: <b style={{ color: "#cfcfcf" }}>@teamnetto</b> e <b style={{ color: "#cfcfcf" }}>@n2squad</b>).</div>
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
        <ApplyAll label="aplicar nick (mostrar/esconder + posição + texto) a todos" keys={["nicks", "hideNick", "nickPos"]} />
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
            ) : <div style={{ fontSize: 11, color: "#7c869c" }}>Sem overlays na biblioteca. Sobe em <b style={{ color: "#cfcfcf" }}>Biblioteca → Overlays</b>.</div>}
          </div>
        )}
        {!overlays.length && <div style={{ fontSize: 12, color: "#7c869c" }}>Nenhuma no card. Use <b style={{ color: "#cfcfcf" }}>📚 biblioteca</b> pra pegar uma salva, ou <b style={{ color: "#cfcfcf" }}>+ imagem</b> pra subir na hora. Depois <b style={{ color: "#5fd38a" }}>✂️ fundo</b> recorta.</div>}
        {overlays.map((o, i) => (
          <div key={i} style={{ background: "#121216", border: "1px solid #2e2e36", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ flex: 1, fontSize: 12, color: "#cfcfcf" }}>imagem sobreposta</span>
              <label style={{ fontSize: 11, color: "#9aa0b0", display: "flex", gap: 4, alignItems: "center" }}>
                <input type="checkbox" checked={!!o.color} onChange={(e) => updateOverlay(i, { color: e.target.checked })} />cor
              </label>
              <button onClick={() => removeBg(i)} disabled={bgBusy === i} title="Remover o fundo (vira PNG transparente — roda no navegador, sem custo)"
                style={{ fontSize: 11, background: "#16261a", color: "#5fd38a", border: "1px solid #2c5c3e", borderRadius: 6, padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap", opacity: bgBusy === i ? 0.6 : 1 }}>
                {bgBusy === i ? "removendo…" : "✂️ fundo"}
              </button>
              <button onClick={() => removeOverlay(i)} style={{ background: "transparent", color: "#e0738c", border: "1px solid #3a2a32", borderRadius: 6, padding: "2px 9px", cursor: "pointer" }}>×</button>
            </div>
            <Slider label="◄ X ►" val={o.x} min={-0.2} max={1} step={0.01} on={(v) => updateOverlay(i, { x: v })} fmt={pct} />
            <Slider label="▲ Y ▼" val={o.y} min={-0.2} max={1} step={0.01} on={(v) => updateOverlay(i, { y: v })} fmt={pct} />
            <Slider label="Tamanho" val={o.width} min={0.1} max={1.5} step={0.01} on={(v) => updateOverlay(i, { width: v })} fmt={pct} />
            <Slider label="Opacidade" val={o.opacity ?? 1} min={0.1} max={1} step={0.05} on={(v) => updateOverlay(i, { opacity: v })} fmt={pct} />
          </div>
        ))}
        {overlays.length > 0 && <ApplyAll label="aplicar estas imagens a todos os cards" keys={["overlays"]} />}
      </Section>

      {/* REGERAR IA */}
      <Section title="Regerar este card (IA)" {...sec("regerar")}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="instrução opcional: mais direto, encurta, mais firmeza..."
            style={{ flex: 1, background: "#121216", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 8, padding: "9px 11px", fontSize: 13 }} />
          <button onClick={regen} disabled={regenLoad} className="dg-btn-primary" style={{ padding: "0 18px", whiteSpace: "nowrap" }}>
            {regenLoad ? "Regerando..." : "🔄 Regerar"}
          </button>
        </div>
      </Section>

      {/* KIT DA MARCA (por último) */}
      <Section title="Kit da marca (estilo)" {...sec("kit")}>
        <div style={{ fontSize: 11, color: "var(--dg-faint)", marginBottom: 8 }}>Salva fonte, cores, sombras, espaçamento, alinhamento, fundo e nick como um kit — e aplica num clique. Pra ver/renomear/excluir todos, abra <b style={{ color: "#cfcfcf" }}>Kit</b> no menu lateral.</div>
        <button onClick={saveKit} style={{ fontSize: 12.5, fontWeight: 600, background: "var(--dg-red-soft)", color: "#ff9fb4", border: "1px solid rgba(239,71,111,0.4)", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>💾 salvar estilo atual como kit</button>
        {kits.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "var(--dg-faint)", marginTop: 8 }}>Nenhum kit salvo ainda. Deixa um card do jeito que quer e salva.</div>
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
      </Section>
    </div>
  );
}
