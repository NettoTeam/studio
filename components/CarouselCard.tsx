import React from "react";
import type { Card } from "@/lib/types";

const W = 1080, H = 1350;
const RED = "#ef476f", WHITE = "#f5f5f5", GREY = "#9aa0b0", BLACK = "#000", NAVY = "#14213d";
const DEFAULT_NICKS = ["@teamnetto", "@n2squad"]; // nicks padrão exibidos quando o card não define os seus
const INK = "#0b0b0f", PAPER = "#ececec"; // Layout 9: preto profundo / cinza claro
const WINE = "#3a0e1e", GOLD = "#c9a24b", WARMW = "#f3ece6"; // Layout 10: vinho / dourado / branco quente
const TSHIFT = "translate(var(--tx, 0px), var(--ty, 0px))"; // deslocamento do bloco de texto (controlado no editor)
// layouts "clássicos" (Layout 1) — recebem o nick via Decor, pois não têm chrome próprio como os L2–L8
const L1_LAYOUTS = ["cover", "top", "bottom", "full", "moral", "list", "data", "quote", "text", "split", "steps"];

function Rich({ text }: { text: string }) {
  // **rosa** · ==caixa sólida== · __sublinhado__ · ~~marca-texto~~ · ++contorno++
  const HL = "var(--hl-color, #ef476f)";
  const parts = text.split(/(\*\*[^*]+\*\*|==[^=]+==|__[^_]+__|~~[^~]+~~|\+\+[^+]+\+\+)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <span key={i} style={{ color: HL, WebkitTextStrokeColor: HL }}>{p.slice(2, -2)}</span>;
        // caixa sólida: inline-block faz a linha crescer pra caber a caixa — nunca cobre a palavra de cima
        if (p.startsWith("==")) return <span key={i} style={{ display: "inline-block", background: HL, color: "#fff", WebkitTextStrokeColor: "#fff", padding: "0.06em 0.18em", borderRadius: 5, lineHeight: 1.05 }}>{p.slice(2, -2)}</span>;
        if (p.startsWith("__")) return <span key={i} style={{ textDecoration: "underline", textDecorationColor: HL, textDecorationThickness: "0.09em", textUnderlineOffset: "0.12em" }}>{p.slice(2, -2)}</span>;
        if (p.startsWith("~~")) return <span key={i} style={{ display: "inline-block", background: "rgba(239,71,111,.32)", padding: "0 0.1em", borderRadius: 3, lineHeight: 1.05 }}>{p.slice(2, -2)}</span>;
        if (p.startsWith("++")) return <span key={i} style={{ display: "inline-block", border: "2px solid " + HL, color: HL, WebkitTextStrokeColor: HL, padding: "0.03em 0.16em", borderRadius: 5, lineHeight: 1.05 }}>{p.slice(2, -2)}</span>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

const bwFilter = "grayscale(1) contrast(1.15) brightness(0.86)";
const colorFilter = "contrast(1.04) brightness(0.94)";

function Photo({ src, fx = 0.5, fy = 0.4, scale = 1, rotate = 0, bw = true, style }: { src: string; fx?: number; fy?: number; scale?: number; rotate?: number; bw?: boolean; style?: React.CSSProperties }) {
  const rot = ((rotate % 360) + 360) % 360;
  const cover = rot === 90 || rot === 270 ? H / W : 1; // ao girar 90/270 a foto precisa cobrir o card
  const tf = [rot ? `rotate(${rot}deg)` : "", scale * cover !== 1 ? `scale(${scale * cover})` : ""].filter(Boolean).join(" ");
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: `${fx * 100}% ${fy * 100}%`,
        transform: tf || undefined,
        transformOrigin: rot ? "center" : `${fx * 100}% ${fy * 100}%`,
        filter: bw ? bwFilter : colorFilter,
        ...style,
      }}
    />
  );
}

const headlineStyle: React.CSSProperties = {
  fontFamily: "var(--ct-font, 'Anton'), sans-serif",
  textTransform: "uppercase",
  color: "var(--title-color, #f5f5f5)",
  lineHeight: "var(--ct-leading, 0.9)",
  letterSpacing: "var(--ct-tracking, 0.5px)",
  WebkitTextStrokeWidth: "1.1px",                       // faux-bold (Bebas só tem Regular)
  WebkitTextStrokeColor: "var(--title-color, #f5f5f5)", // o contorno acompanha a cor do título
  textShadow: "var(--ct-shadow, 0 3px 14px rgba(0,0,0,0.6))", // sombra do título (controlável)
  whiteSpace: "pre-line",                   // respeita Enter (quebra de linha manual)
  margin: 0,
  position: "relative",
  zIndex: 5,                                // texto acima da sombra/tint
  transform: "var(--title-shift, translate(0px,0px))", // mover título independente (somado ao bloco)
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--cb-font, 'Inter'), sans-serif",
  fontWeight: 500,
  color: "var(--body-color, #f5f5f5)",
  fontSize: 40,
  lineHeight: "var(--cb-leading, 1.34)",
  letterSpacing: "var(--cb-tracking, 0px)",
  margin: 0,
  textShadow: "var(--cb-shadow, 0 2px 8px rgba(0,0,0,0.5))",
  position: "relative",
  zIndex: 5,
  transform: "var(--body-shift, translate(0px,0px))", // mover corpo independente
};

// mantém um elemento (de tamanho wPx×hPx) inteiramente dentro do card (1080×1350)
function clampInside(x: number, y: number, wPx: number, hPx: number) {
  const cx = Math.max(0, Math.min(1 - wPx / W, x));
  const cy = Math.max(0, Math.min(1 - hPx / H, y));
  return { left: `${cx * 100}%`, top: `${cy * 100}%` };
}

function Logos({ card, side = "left" }: { card: Card; side?: "left" | "right" }) {
  const base: React.CSSProperties = { position: "absolute", opacity: 0.9, zIndex: 7, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" };
  // logos escolhidas da biblioteca (até 2)
  if (card.logos !== undefined) {
    return (
      <>
        {card.logos.slice(0, 2).map((l, i) => {
          const w = l.w ?? 200;
          return <img key={i} src={l.src} alt="" style={{ ...base, ...clampInside(l.x, l.y, w, w), width: w }} />;
        })}
      </>
    );
  }
  // logo PADRÃO (a ativa, cn-logo.png) — comportamento legado, posição via card.logo
  if (card.logo?.hide) return null;
  const lg = card.logo;
  const w = lg?.w ?? 220;
  const style: React.CSSProperties = lg
    ? { ...base, ...clampInside(lg.x, lg.y, w, w), width: w }
    : { ...base, top: 56, [side]: 56, width: 200 };
  return <img src="/logo/cn-logo.png" alt="" style={style} />;
}

function Kicker({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14, transform: "var(--title-shift, translate(0px,0px))" }}>
      <span style={{ width: 54, height: 5, background: RED, display: "block" }} />
      <span style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 34, letterSpacing: 2, color: GREY, textTransform: "uppercase", whiteSpace: "pre-line" }}>
        {text}
      </span>
    </div>
  );
}

function Index({ text }: { text: string }) {
  return (
    <span style={{ position: "absolute", right: 64, bottom: 60, zIndex: 6, fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 34, color: "#d2d2d2", letterSpacing: 2, textShadow: "0 2px 4px #000" }}>
      {text}
    </span>
  );
}

const Body = ({ text, scale = 1, align }: { text: string; scale?: number; align?: "left" | "center" }) => (
  <div data-mv="body" style={{ ...bodyStyle, fontSize: 40 * scale, whiteSpace: "pre-line", textAlign: align }}><Rich text={text} /></div>
);

function Decor({ card }: { card: Card }) {
  const nick = L1_LAYOUTS.includes(card.layout) ? nicksOf(card) : []; // nick PADRÃO central (só nos clássicos, e só se não estiver em posição livre)
  // nick em POSIÇÃO LIVRE (arrastável) — vale pra qualquer layout, clampado dentro do card
  const movedNicks = !card.hideNick && card.nickPos ? nickStrings(card) : [];
  const np = card.nickPos;
  const nf = np?.size ?? 28;
  const nText = movedNicks.join("  ·  ");
  const npPos = np ? clampInside(np.x, np.y, nText.length * nf * 0.5, nf * 1.5) : null;
  return (
    <>
      {nick.length > 0 && (
        <div style={{ position: "absolute", top: 44, left: 0, right: 0, textAlign: "center", zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 600, fontSize: 26, color: "#f5f5f5", letterSpacing: 0.5, textShadow: "0 2px 8px rgba(0,0,0,.55)" }}>{nick.join("  ·  ")}</div>
      )}
      {movedNicks.length > 0 && npPos && (
        <div style={{ position: "absolute", ...npPos, zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 600, fontSize: nf, color: "#f5f5f5", letterSpacing: 0.5, textShadow: "0 2px 8px rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>{nText}</div>
      )}
      {card.tint && card.tint.opacity > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", opacity: card.tint.opacity,
          background: `linear-gradient(to top, ${card.tint.color} 0%, ${card.tint.color}cc 24%, transparent 62%)` }} />
      )}
      {(card.overlays || []).map((o, i) => (
        // overlay POR CIMA DA FOTO, mas ABAIXO do texto/título (z 5) e do logo (z 7)
        <img key={i} src={o.src} alt="" style={{ position: "absolute", zIndex: 3, left: `${o.x * 100}%`, top: `${o.y * 100}%`, width: `${o.width * 100}%`, opacity: o.opacity ?? 1, filter: o.color ? "none" : "grayscale(1) contrast(1.05)" }} />
      ))}
    </>
  );
}

// ── Layout 2 (editorial premium): barra rosa fina + nick(s) no topo ──
// lista crua de nicks (respeita só o "esconder")
function nickStrings(card: Card): string[] {
  if (card.hideNick) return [];
  const list = (card.nicks || []).map((n) => n.trim()).filter(Boolean);
  return (list.length ? list : DEFAULT_NICKS).slice(0, 2);
}
// nicks nas posições PADRÃO do layout — somem quando o nick está em posição livre (nickPos) ou escondido
function nicksOf(card: Card): string[] {
  if (card.nickPos) return [];
  return nickStrings(card);
}
function L2Chrome({ card }: { card: Card }) {
  const list = nicksOf(card);
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 9, background: RED, zIndex: 9 }} />
      {list.map((n, i) => (
        <span key={i} style={{ position: "absolute", top: 40, [i === 1 ? "right" : "left"]: 64, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 30, color: WHITE, letterSpacing: 0.5, textShadow: "0 2px 8px rgba(0,0,0,.5)" }}>{n}</span>
      ))}
    </>
  );
}
// ── Layout 3 (storytelling): handle pequeno/discreto nos cantos + barra de acento só nos slides escuros ──
function L3Chrome({ card, light = false }: { card: Card; light?: boolean }) {
  const list = nicksOf(card);
  const color = light ? "#14213d" : "#f5f5f5";
  return (
    <>
      {!light && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: RED, zIndex: 9 }} />}
      {list.map((n, i) => (
        <span key={i} style={{ position: "absolute", top: 42, [i === 1 ? "right" : "left"]: 56, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 600, fontSize: 24, color, opacity: 0.85, letterSpacing: 0.3 }}>{n}</span>
      ))}
    </>
  );
}
// tag rosa (ex: "PROBLEMA 01")
const l2Tag: React.CSSProperties = {
  alignSelf: "flex-start", display: "inline-block", background: RED, color: "#fff",
  fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 26,
  letterSpacing: 2, textTransform: "uppercase", padding: "7px 16px", borderRadius: 6,
};

// ── estilos flexíveis de título/corpo (Layouts 4/5/6: revista, minimalista, manifesto) ──
function headStyle(size: number, ts: number, o: { color?: string; mont?: boolean; serif?: boolean; leading?: string; align?: "left" | "center"; stroke?: boolean } = {}): React.CSSProperties {
  const fam = o.serif ? "Georgia, 'Times New Roman', serif" : o.mont ? "var(--ct-font, 'Montserrat'), sans-serif" : "var(--ct-font, 'Anton'), sans-serif";
  const color = o.color || "var(--title-color, #f5f5f5)";
  return {
    fontFamily: fam, fontWeight: o.mont ? 800 : o.serif ? 600 : 400,
    textTransform: o.serif ? "none" : "uppercase", color,
    WebkitTextStrokeWidth: o.stroke ? "1px" : "0px", WebkitTextStrokeColor: color,
    lineHeight: `var(--ct-leading, ${o.leading || (o.serif ? "1.12" : "0.92")})`,
    letterSpacing: o.serif ? "0px" : "var(--ct-tracking, 0.5px)",
    fontSize: size * ts, textAlign: (`var(--align, ${o.align || "left"})` as React.CSSProperties["textAlign"]), margin: 0, whiteSpace: "pre-line",
    textShadow: "var(--ct-shadow, 0 3px 14px rgba(0,0,0,0.55))", position: "relative", transform: "var(--title-shift, translate(0px,0px))",
  };
}
function bodyOn(size: number, bs: number, def: string, o: { serif?: boolean; align?: "left" | "center"; weight?: number } = {}): React.CSSProperties {
  return { ...bodyStyle, fontFamily: o.serif ? "Georgia, 'Times New Roman', serif" : "var(--cb-font, 'Inter'), sans-serif", fontWeight: o.weight ?? 500, color: `var(--body-color, ${def})`, fontSize: size * bs, textAlign: (`var(--align, ${o.align || "left"})` as React.CSSProperties["textAlign"]), whiteSpace: "pre-line" };
}
// vinheta + linhas curvas finas rosa nos cantos (Layout 6 — manifesto)
function L6Decor() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.6) 100%)" }} />
      <svg viewBox="0 0 1080 1350" width="100%" height="100%" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        <path d="M 1080 110 Q 870 110 870 320" fill="none" stroke={RED} strokeWidth="3" opacity="0.85" />
        <path d="M 0 1240 Q 210 1240 210 1030" fill="none" stroke={RED} strokeWidth="3" opacity="0.85" />
      </svg>
    </>
  );
}
// chrome do Layout 7: barra de acento + logo central + nick + barra de progresso (lê o card.index "03 / 09")
function L7Chrome({ card, footerDark = false }: { card: Card; footerDark?: boolean }) {
  const m = (card.index || "").match(/(\d+)\s*\/\s*(\d+)/);
  const cur = m ? parseInt(m[1], 10) : 0, total = m ? parseInt(m[2], 10) : 0;
  const fc = footerDark ? "#07111d" : "#f5f5f5";
  const seg = footerDark ? "rgba(7,17,29,.18)" : "rgba(255,255,255,.25)";
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: RED, zIndex: 9 }} />
      <img src="/logo/cn-logo.png" alt="" style={{ position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)", width: 116, opacity: 0.95, zIndex: 9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />
      {nicksOf(card)[0] && <span style={{ position: "absolute", top: 34, right: 64, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 22, color: "#f5f5f5", opacity: 0.85 }}>{nicksOf(card).join("  ·  ")}</span>}
      {total > 0 && (
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 40, display: "flex", alignItems: "center", gap: 16, zIndex: 9 }}>
          <span style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 26, color: fc, letterSpacing: 1, whiteSpace: "nowrap" }}>{String(cur).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <span style={{ flex: 1, display: "flex", gap: 5 }}>
            {Array.from({ length: total }).map((_, i) => <span key={i} style={{ flex: 1, height: 3, background: i < cur ? RED : seg }} />)}
          </span>
        </div>
      )}
    </>
  );
}
// chrome do Layout 9: cabeçalho discreto nos cantos + rodapé técnico (código de barras + numeração)
function L9Chrome({ card, dark = true }: { card: Card; dark?: boolean }) {
  const c = dark ? "rgba(245,245,245,.7)" : "rgba(11,11,15,.6)";
  const m = (card.index || "").match(/(\d+)\s*\/\s*(\d+)/);
  const bar = `repeating-linear-gradient(90deg, ${c} 0 2px, transparent 2px 5px, ${c} 5px 8px, transparent 8px 10px, ${c} 10px 11px, transparent 11px 14px)`;
  return (
    <>
      {nicksOf(card)[0] && <span style={{ position: "absolute", top: 40, left: 56, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 20, letterSpacing: 1, color: c, textTransform: "uppercase" }}>{nicksOf(card)[0]}</span>}
      <span style={{ position: "absolute", top: 40, right: 56, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 20, letterSpacing: 1, color: c }}>{(card.index || "").replace(/\s/g, "")}</span>
      <div style={{ position: "absolute", bottom: 44, left: 56, right: 56, display: "flex", alignItems: "flex-end", justifyContent: "space-between", zIndex: 9 }}>
        <span style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 15, letterSpacing: 2, color: c, textTransform: "uppercase" }}>editorial premium · n² squad</span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ width: 150, height: 26, background: bar }} />
          <span style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 13, letterSpacing: 3, color: c }}>{m ? `0${m[1]}-${m[2]}` : ""}</span>
        </div>
      </div>
    </>
  );
}
// chrome do Layout 10: cabeçalho (nick) + numeração dourada + monograma no rodapé
function L10Chrome({ card }: { card: Card }) {
  const m = (card.index || "").match(/(\d+)\s*\/\s*(\d+)/);
  return (
    <>
      {nicksOf(card)[0] && <span style={{ position: "absolute", top: 44, left: 56, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 19, letterSpacing: 3, color: WARMW, opacity: 0.75, textTransform: "uppercase" }}>{nicksOf(card)[0]}</span>}
      {m && <span style={{ position: "absolute", top: 44, right: 56, zIndex: 9, fontFamily: "Georgia, serif", fontSize: 20, color: GOLD, letterSpacing: 2 }}>{m[1]} / {m[2]}</span>}
      <img src="/logo/cn-logo.png" alt="" style={{ position: "absolute", bottom: 42, left: "50%", transform: "translateX(-50%)", width: 78, opacity: 0.8, zIndex: 9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />
    </>
  );
}
// assinatura da marca no rodapé (Layout 6)
function BrandFooter({ align = "center" }: { align?: "center" | "left" | "right" }) {
  return (
    <div style={{ position: "absolute", bottom: 54, left: 64, right: 64, textAlign: align, zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif" }}>
      <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 3, color: "#f5f5f5" }}>CÂNDIDO NETTO</div>
      <div style={{ fontSize: 18, letterSpacing: 4, color: RED, marginTop: 2 }}>CONSULTORIA FITNESS · N² SQUAD</div>
    </div>
  );
}

function CarouselCard({ card, grain = true }: { card: Card; grain?: boolean }) {
  const fx = card.focalX ?? 0.5, fy = card.focalY ?? 0.4;
  const grainCls = grain ? "dg-grain" : undefined;
  const zoom = card.scale ?? 1;            // zoom da imagem de fundo
  const ts = card.titleScale ?? 1;         // escala do título
  const bs = card.bodyScale ?? 1;          // escala do corpo/bullets
  const al = card.align;                   // alinhamento (left|center)

  // fontes e sombras (controladas no editor) viram variáveis CSS que os textos herdam
  const titleFont = card.titleFont ? `'${card.titleFont}', sans-serif` : "'Anton', sans-serif";
  const bodyFont = card.bodyFont ? `'${card.bodyFont}', sans-serif` : "'Inter', sans-serif";
  const tSh = card.titleShadow ?? 0.6, bSh = card.bodyShadow ?? 0.5;
  const ctShadow = tSh > 0 ? `0 ${Math.round(2 + tSh * 3)}px ${Math.round(8 + tSh * 16)}px rgba(0,0,0,${Math.min(1, tSh)})` : "none";
  const cbShadow = bSh > 0 ? `0 2px ${Math.round(6 + bSh * 12)}px rgba(0,0,0,${Math.min(1, bSh)})` : "none";

  // cor e espaçamento (controlados no editor) — só viram variável quando você define algo;
  // se não, cada layout mantém seu padrão (o fallback do var() em cada estilo)
  const vars: Record<string, string> = { "--ct-font": titleFont, "--cb-font": bodyFont, "--ct-shadow": ctShadow, "--cb-shadow": cbShadow };
  if (card.titleColor) vars["--title-color"] = card.titleColor;
  if (card.bodyColor) vars["--body-color"] = card.bodyColor;
  if (card.highlightColor) vars["--hl-color"] = card.highlightColor;
  if (card.titleTracking != null) vars["--ct-tracking"] = `${card.titleTracking}px`;
  if (card.bodyTracking != null) vars["--cb-tracking"] = `${card.bodyTracking}px`;
  if (card.titleLeading != null) vars["--ct-leading"] = String(card.titleLeading);
  if (card.bodyLeading != null) vars["--cb-leading"] = String(card.bodyLeading);
  if (card.align) vars["--align"] = card.align;
  if (card.titleX != null || card.titleY != null) vars["--title-shift"] = `translate(${Math.round((card.titleX || 0) * W)}px, ${Math.round((card.titleY || 0) * H)}px)`;
  if (card.bodyX != null || card.bodyY != null) vars["--body-shift"] = `translate(${Math.round((card.bodyX || 0) * W)}px, ${Math.round((card.bodyY || 0) * H)}px)`;
  if (card.textX != null) vars["--tx"] = `${Math.round(card.textX * W)}px`;
  if (card.textY != null) vars["--ty"] = `${Math.round(card.textY * H)}px`;

  const canvas = {
    position: "relative", width: W, height: H, background: card.bg || BLACK, overflow: "hidden",
    ...vars,
  } as React.CSSProperties;
  const MARGIN = 64;

  // ---- COVER ----
  if (card.layout === "cover") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={card.bw !== false} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 4%, rgba(0,0,0,.55) 26%, transparent 52%)" }} />
        <Logos card={card} side="right" />
        <h1 style={{ ...headlineStyle, position: "absolute", left: 0, right: 0, bottom: 150, textAlign: al || "center", fontSize: 118 * ts, padding: "0 50px", WebkitTextStrokeWidth: "2.1px", textShadow: "var(--ct-shadow, 0 6px 22px rgba(0,0,0,.92))", transform: TSHIFT }}>
          {card.headline && <Rich text={card.headline} />}
        </h1>
        <Decor card={card} />
      </div>
    );
  }

  // ---- TOP / BOTTOM / FULL / MORAL (com foto) ----
  if (card.layout === "top" || card.layout === "bottom" || card.layout === "full" || card.layout === "moral") {
    const isBottom = card.layout === "bottom";
    const isBand = card.layout === "top" || card.layout === "bottom";
    const bandH = 0.6;
    return (
      <div style={canvas} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", left: 0, right: 0, height: isBand ? `${bandH * 100}%` : "100%", top: isBottom ? "auto" : 0, bottom: isBottom ? 0 : "auto" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={card.bw !== false} />
            <div style={{ position: "absolute", inset: 0, background: isBottom
              ? "linear-gradient(to top, transparent 55%, #000 100%)"
              : isBand
              ? "linear-gradient(to bottom, transparent 55%, #000 100%)"
              : "linear-gradient(to top, #000 18%, rgba(0,0,0,.65) 42%, transparent 72%)" }} />
          </div>
        )}
        {card.layout !== "moral" && <Logos card={card} side={isBottom ? "right" : "left"} />}

        <div style={{
          position: "absolute", left: MARGIN, right: MARGIN, zIndex: 5, transform: TSHIFT,
          top: card.layout === "top" ? "auto" : isBottom ? 150 : "auto",
          bottom: card.layout === "top" || card.layout === "full" || card.layout === "moral" ? 150 : "auto",
        }}>
          {card.kicker && <Kicker text={card.kicker} />}
          {card.headline && (
            <h2 style={{ ...headlineStyle, fontSize: 92 * ts, marginBottom: 26, textAlign: al }}><Rich text={card.headline} /></h2>
          )}
          {card.body && <Body text={card.body} scale={bs} align={al} />}
          {card.signoff && (
            <div style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", color: RED, fontSize: 78, marginTop: 22, letterSpacing: 1, whiteSpace: "pre-line" }}>{card.signoff}</div>
          )}
          {card.layout === "moral" && (
            <img src="/logo/cn-logo.png" alt="" style={{ width: 200, marginTop: 26, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" }} />
          )}
        </div>
        <Decor card={card} />
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // ---- LIST (bullets) ----
  if (card.layout === "list") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image ? (
          <>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} style={{ filter: "grayscale(1) contrast(1.1) brightness(0.5)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 0%, rgba(0,0,0,.4) 60%, transparent 100%)" }} />
          </>
        ) : null}
        <Logos card={card} side="right" />
        <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 150, zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <Kicker text={card.kicker} />}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 96 * ts, marginBottom: 40, textAlign: al }}><Rich text={card.headline} /></h2>}
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            {card.bullets?.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
                <span style={{ width: 34, height: 6, background: RED, display: "inline-block", flexShrink: 0, transform: "translateY(-10px)" }} />
                <span style={{ ...bodyStyle, fontSize: 44 * bs }}><Rich text={b} /></span>
              </div>
            ))}
          </div>
        </div>
        <Decor card={card} />
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // ---- DATA (números gigantes) ----
  if (card.layout === "data") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image ? (
          <>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} style={{ filter: "grayscale(1) contrast(1.15) brightness(0.42)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 0%, rgba(0,0,0,.55) 55%, transparent 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 6%, transparent 45%)" }} />
          </>
        ) : null}
        <Logos card={card} side="right" />
        <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 150, zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <Kicker text={card.kicker} />}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 90 * ts, marginBottom: 28, textAlign: al }}><Rich text={card.headline} /></h2>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {card.stats?.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 36, borderBottom: "2px solid #303848", padding: "6px 0" }}>
                <span style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", color: RED, fontSize: 130, lineHeight: 1, WebkitTextStroke: "1.5px #ef476f" }}>{s.value}</span>
                <span style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", color: WHITE, fontSize: 50, letterSpacing: 1 }}>{s.label}</span>
              </div>
            ))}
          </div>
          {card.source && <div style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", color: GREY, fontSize: 28, marginTop: 18 }}>{card.source}</div>}
          {card.body && <div style={{ marginTop: 24 }}><Body text={card.body} scale={bs} align={al} /></div>}
        </div>
        <Decor card={card} />
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // ---- A. QUOTE (citação gigante) ----
  if (card.layout === "quote") {
    return (
      <div style={canvas} className={grainCls}>
        <Logos card={card} side="left" />
        <div style={{ position: "absolute", left: 70, top: 130, color: RED, fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 200, lineHeight: 0.6 }}>“</div>
        <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 90px", transform: TSHIFT }}>
          <h1 style={{ ...headlineStyle, fontSize: 128 * ts, textAlign: al || "center", lineHeight: "var(--ct-leading, 0.95)" }}>
            {card.headline && <Rich text={card.headline} />}
          </h1>
        </div>
        <Decor card={card} />
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // ---- B. TEXT (parágrafo pleno) ----
  if (card.layout === "text") {
    return (
      <div style={canvas} className={grainCls}>
        <Logos card={card} side="left" />
        <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 0, bottom: 0, zIndex: 5, display: "flex", flexDirection: "column", justifyContent: "center", transform: TSHIFT }}>
          {card.kicker && <Kicker text={card.kicker} />}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 88 * ts, marginBottom: 26, textAlign: al }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 52 * bs, lineHeight: "var(--cb-leading, 1.3)", whiteSpace: "pre-line", textAlign: al }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // ---- C. SPLIT (metade foto / metade texto) ----
  if (card.layout === "split") {
    return (
      <div style={canvas} className={grainCls}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%" }}>
          {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={card.bw !== false} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 72%, #000 100%)" }} />
        </div>
        <Logos card={card} side="right" />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", zIndex: 5, padding: "0 56px", display: "flex", flexDirection: "column", justifyContent: "center", transform: TSHIFT }}>
          {card.kicker && <Kicker text={card.kicker} />}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 74 * ts, marginBottom: 22, textAlign: al }}><Rich text={card.headline} /></h2>}
          {card.body && <Body text={card.body} scale={bs} align={al} />}
        </div>
        <Decor card={card} />
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // ---- H. STEPS (passo a passo numerado) ----
  if (card.layout === "steps") {
    const steps = card.bullets || [];
    return (
      <div style={canvas} className={grainCls}>
        <Logos card={card} side="right" />
        <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 140, zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <Kicker text={card.kicker} />}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 82 * ts, marginBottom: 36, textAlign: al }}><Rich text={card.headline} /></h2>}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {steps.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <span style={{ width: 66, height: 66, borderRadius: "50%", border: "3px solid " + RED, color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 42, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ ...bodyStyle, fontSize: 42 * bs }}><Rich text={s} /></span>
                </div>
                {i < steps.length - 1 && <div style={{ width: 3, height: 34, background: RED, marginLeft: 31 }} />}
              </div>
            ))}
          </div>
        </div>
        <Decor card={card} />
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // ════════ LAYOUT 2 — editorial premium ════════
  const showChosenLogos = card.logos !== undefined; // no L2 só mostra logos se você escolheu explicitamente (o handle é o elemento de marca)

  // Card 1 — CAPA: foto full + overlay azul + headline grande à esquerda (use ==palavra== p/ caixa rosa)
  if (card.layout === "l2-capa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />}
        <div style={{ position: "absolute", inset: 0, background: NAVY, opacity: 0.5, zIndex: 1 }} />
        <L2Chrome card={card} />
        <h1 style={{ ...headlineStyle, position: "absolute", left: 64, right: 80, bottom: 130, textAlign: al || "left", fontSize: 116 * ts, lineHeight: "var(--ct-leading, 0.95)", transform: TSHIFT }}>
          {card.headline && <Rich text={card.headline} />}
        </h1>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // Cards 2/3/4 — DOR: fundo azul + foto numa metade + conteúdo na outra (tag rosa + headline + apoio)
  if (card.layout === "l2-dor-dir" || card.layout === "l2-dor-esq") {
    const photoRight = card.layout === "l2-dor-dir";
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "54%", [photoRight ? "right" : "left"]: 0 }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
            <div style={{ position: "absolute", inset: 0, background: NAVY, opacity: 0.4 }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to ${photoRight ? "left" : "right"}, transparent 38%, ${card.bg || NAVY} 96%)` }} />
          </div>
        )}
        <L2Chrome card={card} />
        <div style={{ position: "absolute", top: 110, bottom: 90, width: "50%", [photoRight ? "left" : "right"]: 0, padding: photoRight ? "0 26px 0 64px" : "0 64px 0 26px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <span style={l2Tag}>{card.kicker}</span>}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 72 * ts, textAlign: al || "left", marginTop: 16, lineHeight: "var(--ct-leading, 0.96)" }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 36 * bs, textAlign: al || "left", marginTop: 22, whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // Card 5 — IMPACTO EMOCIONAL: fundo azul sólido, sem foto, frase central (branco + rosa)
  if (card.layout === "l2-emocional") {
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        <L2Chrome card={card} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <span style={{ ...l2Tag, marginBottom: 24 }}>{card.kicker}</span>}
          {card.headline && <h1 style={{ ...headlineStyle, fontSize: 104 * ts, textAlign: al || "left", lineHeight: "var(--ct-leading, 0.98)" }}><Rich text={card.headline} /></h1>}
        </div>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // Card 6 — VIRADA: foto ~60% no topo + overlay azul + tag/headline/apoio embaixo
  if (card.layout === "l2-virada") {
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
            <div style={{ position: "absolute", inset: 0, background: NAVY, opacity: 0.38 }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 52%, ${card.bg || NAVY} 98%)` }} />
          </div>
        )}
        <L2Chrome card={card} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 120, zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <span style={l2Tag}>{card.kicker}</span>}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 80 * ts, textAlign: al || "left", marginTop: 16, lineHeight: "var(--ct-leading, 0.96)" }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 38 * bs, textAlign: al || "left", marginTop: 18, whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // Card 7 — CTA: foto full + overlay + headline multi-linha (branco/rosa) + botão CTA (signoff)
  if (card.layout === "l2-cta") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />}
        <div style={{ position: "absolute", inset: 0, background: NAVY, opacity: 0.6, zIndex: 1 }} />
        <L2Chrome card={card} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 120, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 96 * ts, textAlign: al || "left", lineHeight: "var(--ct-leading, 0.95)" }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 42 * bs, textAlign: al || "left", marginTop: 20, whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
          {card.signoff && <div style={{ display: "inline-block", marginTop: 28, background: RED, color: "#fff", fontFamily: "var(--ct-font, 'Anton'), sans-serif", textTransform: "uppercase", fontSize: 46, letterSpacing: 1, padding: "14px 30px", borderRadius: 8 }}>{card.signoff}</div>}
        </div>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // ════════ LAYOUT 3 — storytelling / caso (editorial premium) ════════
  // Card 1 — CAPA DO CASO: imagem ~40% em container arredondado + texto corrido (última frase em rosa)
  if (card.layout === "l3-capa" || card.layout === "l3-educacional") {
    const isEdu = card.layout === "l3-educacional";
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        <L3Chrome card={card} />
        {card.image && (
          <div style={{ position: "absolute", [isEdu ? "right" : "left"]: 70, top: 235, width: 360, height: 745, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.45)", zIndex: 4 }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
          </div>
        )}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: isEdu ? 80 : card.image ? 470 : 80, right: isEdu ? (card.image ? 470 : 80) : 70, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 26, letterSpacing: 3, textTransform: "uppercase", color: "var(--hl-color, #ef476f)", marginBottom: 22, fontWeight: 700 }}>{card.kicker}</div>}
          {isEdu
            ? card.headline && <h1 style={{ ...headlineStyle, fontSize: 96 * ts, textAlign: al || "left", lineHeight: "var(--ct-leading, 0.95)" }}><Rich text={card.headline} /></h1>
            : card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 40 * bs, lineHeight: "var(--cb-leading, 1.5)", whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
          {isEdu && card.signoff && <div style={{ marginTop: 30, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 32, color: "var(--body-color, #f5f5f5)", opacity: 0.9 }}>{/→\s*$/.test(card.signoff) ? card.signoff : card.signoff + " →"}</div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // Card 2 — PROVA SOCIAL: screenshot do depoimento + comentário em rosa + complemento
  if (card.layout === "l3-prova") {
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        <L3Chrome card={card} />
        {card.image && (
          <div style={{ position: "absolute", left: 90, right: 90, top: 130, height: 600, borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,.4)", zIndex: 4, background: "#fff" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
          </div>
        )}
        <div style={{ position: "absolute", left: 90, right: 90, top: card.image ? 790 : 220, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <div style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 56 * ts, lineHeight: "var(--ct-leading, 1.04)", color: "var(--hl-color, #ef476f)", textTransform: "uppercase", marginBottom: 18 }}><Rich text={card.headline} /></div>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 36 * bs, lineHeight: "var(--cb-leading, 1.5)", whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // Card 3 — DESENVOLVIMENTO: só texto (contexto / virada em rosa / resultado) + seta no rodapé
  if (card.layout === "l3-historia") {
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        <L3Chrome card={card} />
        <div style={{ position: "absolute", left: 90, right: 90, top: 180, bottom: 200, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 26, letterSpacing: 3, textTransform: "uppercase", color: "var(--hl-color, #ef476f)", marginBottom: 24, fontWeight: 700 }}>{card.kicker}</div>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 42 * bs, lineHeight: "var(--cb-leading, 1.55)", whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
        </div>
        {card.signoff && <div style={{ position: "absolute", left: 90, right: 90, bottom: 110, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 34, color: "var(--hl-color, #ef476f)", fontWeight: 700, zIndex: 5, transform: TSHIFT }}>{/→\s*$/.test(card.signoff) ? card.signoff : card.signoff + " →"}</div>}
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
        {card.index && <Index text={card.index} />}
      </div>
    );
  }

  // Card 4 — ANTES E DEPOIS: fundo claro, 2 fotos lado a lado + marca circular centralizada acima
  if (card.layout === "l3-antes-depois") {
    return (
      <div style={{ ...canvas, background: card.bg || "#f5f5f5" }} className={grainCls}>
        <L3Chrome card={card} light />
        <div style={{ position: "absolute", top: 150, left: "50%", transform: "translateX(-50%)", width: 92, height: 92, borderRadius: "50%", overflow: "hidden", background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,.18)", zIndex: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/logo/cn-logo.png" alt="" style={{ width: "76%", height: "76%", objectFit: "contain" }} />
        </div>
        <div style={{ position: "absolute", top: 290, bottom: 210, left: 70, right: 70, display: "flex", gap: 24, zIndex: 4 }}>
          {[card.image, card.image2].map((src, i) => (
            <div key={i} style={{ flex: 1, position: "relative", borderRadius: 18, overflow: "hidden", background: "#e3e6ec", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}>
              {src && <Photo src={src} fx={i === 0 ? fx : 0.5} fy={i === 0 ? fy : 0.4} scale={i === 0 ? zoom : 1} rotate={i === 0 ? card.rotate : 0} bw={false} />}
              <span style={{ position: "absolute", left: 16, top: 14, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: 1, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>{i === 0 ? "ANTES" : "DEPOIS"}</span>
            </div>
          ))}
        </div>
        {card.signoff && <div style={{ position: "absolute", bottom: 100, left: 70, right: 70, textAlign: "center", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 32, color: "#14213d", fontWeight: 600, zIndex: 5, transform: TSHIFT }}><Rich text={card.signoff} /></div>}
        <Decor card={card} />
      </div>
    );
  }

  // ════════ LAYOUT 4 — revista premium de negócios ════════
  if (card.layout === "l4-capa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, #14213d 0%, rgba(20,33,61,.82) 32%, rgba(20,33,61,.35) 100%)" }} />
        <div style={{ position: "absolute", left: 64, right: "32%", bottom: 150, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(118, ts, { color: "var(--title-color, #ef476f)" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(38, bs, "#f5f5f5"), marginTop: 22 }}><Rich text={card.body} /></div>}
        </div>
        <img src="/logo/cn-logo.png" alt="" style={{ position: "absolute", right: 40, bottom: 40, width: 120, opacity: 0.92, zIndex: 7, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
        {card.index && <Index text={card.index} />}
      </div>
    );
  }
  if (card.layout === "l4-split") {
    return (
      <div style={{ ...canvas, background: card.bg || "#ffffff" }}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "40%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />
            <div style={{ position: "absolute", inset: 0, background: "rgba(20,33,61,.16)" }} />
          </div>
        )}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "60%", padding: "0 56px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(24, 1, "#14213d", { weight: 700 }), letterSpacing: 2, textTransform: "uppercase", opacity: 0.65, marginBottom: 14 }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(86, ts, { color: "var(--title-color, #ef476f)" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(36, bs, "#14213d"), marginTop: 22 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l4-horizontal") {
    return (
      <div style={{ ...canvas, background: card.bg || "#ffffff" }}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "42%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />
            <div style={{ position: "absolute", inset: 0, background: "rgba(20,33,61,.16)" }} />
          </div>
        )}
        <div style={{ position: "absolute", top: "42%", bottom: 0, left: 0, right: 0, padding: "0 90px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(80, ts, { color: "var(--title-color, #ef476f)", align: "center" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#14213d", { align: "center" }), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l4-faixa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.12)", zIndex: 1 }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "46%", background: "rgba(20,33,61,.95)", zIndex: 4 }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "46%", padding: "0 48px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(24, 1, "#ef476f", { weight: 700 }), letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(72, ts, { color: "var(--title-color, #ef476f)" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(31, bs, "#f5f5f5"), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l4-final") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, rgba(11,11,15,.92), rgba(11,11,15,.6))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(98, ts, { color: "var(--title-color, #ef476f)", align: "center" })}><Rich text={card.headline} /></h1>}
          <div style={{ marginTop: 46, width: "80%", border: "2px solid #2f4368", borderRadius: 10, padding: "20px 24px", color: "#aeb6c8", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 30 }}>{card.kicker || "Comente aqui"}</div>
          {card.signoff && <div style={{ marginTop: 22, color: "#f5f5f5", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 27, opacity: 0.92 }}>{card.signoff}</div>}
        </div>
        <img src="/logo/cn-logo.png" alt="" style={{ position: "absolute", right: 44, bottom: 44, width: 168, opacity: 0.95, zIndex: 7, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }

  // ════════ LAYOUT 5 — editorial minimalista premium ════════
  if (card.layout === "l5-capa") {
    return (
      <div style={{ ...canvas, background: card.bg || "#0b0b0f" }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "60%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />
            <div style={{ position: "absolute", inset: 0, background: "rgba(20,33,61,.22)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0b0b0f 0%, transparent 28%)" }} />
          </div>
        )}
        <div style={{ position: "absolute", top: 54, left: 56, zIndex: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <img src="/logo/cn-logo.png" alt="" style={{ width: 118, opacity: 0.95, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />
          {nicksOf(card)[0] && <span style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 22, color: "#cfd6e6", letterSpacing: 0.5 }}>{nicksOf(card).join("  ·  ")}</span>}
        </div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "48%", padding: "0 24px 0 56px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(86, ts, { mont: true, leading: "1.02" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cfd6e6"), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l5-split") {
    return (
      <div style={{ ...canvas, background: card.bg || "#ffffff" }}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "50%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />
            <div style={{ position: "absolute", inset: 0, background: "rgba(20,33,61,.14)" }} />
          </div>
        )}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "50%", padding: "0 56px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(24, 1, "#ef476f", { weight: 700 }), letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(74, ts, { mont: true, color: "var(--title-color, #14213d)", leading: "1.02" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(33, bs, "#14213d", { serif: true }), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l5-caixa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,15,.85), rgba(11,11,15,.25))", zIndex: 1 }} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 230, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <div style={{ ...headStyle(74, ts, { mont: true, color: "#fff" }), display: "inline-block", background: "var(--hl-color, #ef476f)", padding: "14px 26px", borderRadius: 6 }}><Rich text={card.headline} /></div>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#f5f5f5"), marginTop: 22 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l5-texto") {
    return (
      <div style={{ ...canvas, background: card.bg || "#ffffff" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 110px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(70, ts, { serif: true, color: "var(--title-color, #14213d)", align: "center", leading: "1.16" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#5a6276", { serif: true, align: "center" }), marginTop: 26 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l5-solucao") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "68%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, #0b0b0f 100%)" }} />
          </div>
        )}
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(78, ts, { mont: true, align: "center" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cfd6e6", { serif: true, align: "center" }), marginTop: 18 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l5-galeria") {
    return (
      <div style={{ ...canvas, background: card.bg || "#f5f5f5" }}>
        {card.image && (
          <div style={{ position: "absolute", top: 150, left: 130, right: 130, height: 720, border: "1px solid #c7ccd8", overflow: "hidden" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />
          </div>
        )}
        <div style={{ position: "absolute", left: 130, right: 130, top: 905, textAlign: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <div style={headStyle(40, ts, { serif: true, color: "var(--title-color, #14213d)", align: "center", leading: "1.2" })}><Rich text={card.headline} /></div>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(28, bs, "#5a6276", { serif: true, align: "center" }), marginTop: 14 }}><Rich text={card.body} /></div>}
        </div>
        <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif" }}>
          <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: 2, color: "#14213d" }}>CÂNDIDO NETTO</span>
          <span style={{ fontSize: 18, color: "#ef476f", marginLeft: 10 }}>· N² SQUAD</span>
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }

  // ════════ LAYOUT 6 — manifesto fitness premium ════════
  if (card.layout === "l6-capa" || card.layout === "l6-fecho") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,15,.92) 0%, rgba(11,11,15,.55) 55%, rgba(11,11,15,.4) 100%)", zIndex: 1 }} />
        <L6Decor />
        {nicksOf(card)[0] && <span style={{ position: "absolute", top: 48, left: 64, zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 28, color: "#f5f5f5", letterSpacing: 0.5 }}>{nicksOf(card).join("  ·  ")}</span>}
        <div style={{ position: "absolute", left: 64, right: 80, bottom: 210, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(132, ts, { leading: "0.9" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#cfd6e6"), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        <BrandFooter align="center" />
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l6-historia") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,15,.95) 0%, rgba(11,11,15,.4) 42%, rgba(11,11,15,.5) 100%)", zIndex: 1 }} />
        <L6Decor />
        {nicksOf(card)[0] && <span style={{ position: "absolute", top: 48, left: 64, zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 28, color: "#f5f5f5" }}>{nicksOf(card).join("  ·  ")}</span>}
        <div style={{ position: "absolute", left: 64, right: 80, bottom: 130, zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <span style={l2Tag}>{card.kicker}</span>}
          {card.headline && <h2 style={{ ...headStyle(70, ts, { leading: "0.95" }), marginTop: 14 }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#cfd6e6"), marginTop: 18 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l6-manifesto") {
    return (
      <div style={{ ...canvas, background: card.bg || "#0b0b0f" }} className={grainCls}>
        <L6Decor />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(104, ts, { align: "center", leading: "0.95" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#cfd6e6", { align: "center" }), marginTop: 24 }}><Rich text={card.body} /></div>}
        </div>
        <BrandFooter align="center" />
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l6-lifestyle") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,15,.8) 0%, rgba(11,11,15,.2) 50%)", zIndex: 1 }} />
        <L6Decor />
        <div style={{ position: "absolute", left: 64, right: 80, bottom: 150, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(70, ts, { leading: "0.95" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cfd6e6"), marginTop: 16 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }

  // ════════ LAYOUT 7 — científico / autoridade ════════
  if (card.layout === "l7-capa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 1 }} />
        <L7Chrome card={card} />
        <div style={{ position: "absolute", left: 80, right: "40%", bottom: 150, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(108, ts, { leading: "0.9" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#f5f5f5"), marginTop: 16 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l7-problema") {
    return (
      <div style={{ ...canvas, background: card.bg || "#07111d" }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "60%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 30%, #07111d 78%)" }} />
          </div>
        )}
        <L7Chrome card={card} />
        <div style={{ position: "absolute", top: 150, bottom: 110, right: 0, width: "52%", padding: "0 80px 0 20px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(24, 1, "#ef476f", { weight: 700 }), letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(64, ts, { color: "var(--title-color, #ef476f)" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#f5f5f5"), marginTop: 18 }}><Rich text={card.body} /></div>}
          {card.bullets && card.bullets.length > 0 && (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {card.bullets.map((b, i) => (<div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline" }}><span style={{ width: 18, height: 4, background: RED, flexShrink: 0, transform: "translateY(-6px)" }} /><span style={bodyOn(30, bs, "#cfd6e6")}><Rich text={b} /></span></div>))}
            </div>
          )}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l7-ciencia") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />}
        <div style={{ position: "absolute", inset: 0, background: "rgba(7,17,29,.7)", zIndex: 1 }} />
        <L7Chrome card={card} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 220, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(80, ts, { leading: "0.95" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#f5f5f5"), marginTop: 22, maxWidth: "66%" }}><Rich text={card.body} /></div>}
        </div>
        {card.source && <div style={{ position: "absolute", left: 80, bottom: 96, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontStyle: "italic", fontSize: 22, color: "rgba(245,245,245,.55)", zIndex: 6 }}>{card.source}</div>}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l7-prova") {
    return (
      <div style={{ ...canvas, background: card.bg || "#f5f5f5" }}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
          </div>
        )}
        <L7Chrome card={card} footerDark />
        <div style={{ position: "absolute", top: "50%", bottom: 0, left: 0, right: 0, padding: "0 120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(64, ts, { color: "var(--title-color, #14213d)", align: "center", leading: "0.98" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#14213d", { align: "center" }), marginTop: 18 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l7-virada") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, background: "rgba(7,17,29,.3)", zIndex: 1 }} />
        <L7Chrome card={card} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 230, maxWidth: "70%", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(88, ts, { color: "var(--title-color, #ef476f)", leading: "0.92" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#f5f5f5"), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l7-cta") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw />}
        <div style={{ position: "absolute", inset: 0, background: "rgba(7,17,29,.74)", zIndex: 1 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: RED, zIndex: 9 }} />
        <img src="/logo/cn-logo.png" alt="" style={{ position: "absolute", top: 44, left: "50%", transform: "translateX(-50%)", width: 172, opacity: 0.96, zIndex: 9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />
        <div style={{ position: "absolute", inset: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 90px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(76, ts, { color: "var(--title-color, #ef476f)", align: "center", leading: "0.95" })}><Rich text={card.headline} /></h1>}
          <div style={{ marginTop: 40, border: "2px solid #fff", borderRadius: 8, padding: "20px 40px", color: "#fff", fontFamily: "var(--ct-font, 'Anton'), sans-serif", textTransform: "uppercase", fontSize: 46, letterSpacing: 1 }}>{card.signoff || "Comente “GUIA”"}</div>
          {card.body && <div data-mv="body" style={{ ...bodyOn(28, bs, "#f5f5f5", { align: "center" }), marginTop: 24, opacity: 0.85 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }

  // ════════ LAYOUT 8 — 80/20 lifestyle (só fotos e números) ════════
  if (card.layout === "l8-split") {
    const halves: [string | undefined, string | undefined, number, number, number, number][] = [
      [card.image, card.headline, fx, fy, zoom, card.rotate || 0],
      [card.image2, card.body, 0.5, 0.4, 1, 0],
    ];
    return (
      <div style={{ ...canvas, background: card.bg || "#0b0b0f" }}>
        {halves.map(([src, txt, ffx, ffy, fsc, frot], i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i === 0 ? 0 : "50%", height: "50%", overflow: "hidden" }}>
            {src && <Photo src={src} fx={ffx} fy={ffy} scale={fsc} rotate={frot} bw={false} />}
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.18)" }} />
            {txt && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={headStyle(150, ts, { mont: true, color: "#fff", align: "center" })}><Rich text={txt} /></span></div>}
          </div>
        ))}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l8-ruptura") {
    return (
      <div style={{ ...canvas, background: card.bg || "#0b0b0f" }} className={grainCls}>
        {card.image && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}><Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} /></div>}
        {card.image2 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}><Photo src={card.image2} fx={0.5} fy={0.4} bw={false} /></div>}
        <div style={{ position: "absolute", inset: 0, background: "rgba(7,11,15,.55)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 90px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(92, ts, { mont: true, color: "#fff", align: "center", leading: "0.98" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#f5f5f5", { align: "center" }), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l8-cta") {
    return (
      <div style={{ ...canvas, background: card.bg || "radial-gradient(ellipse at center, #15151c 0%, #0b0b0f 75%)" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(104, ts, { mont: true, color: "#fff", align: "center", leading: "0.98" })}><Rich text={card.headline} /></h1>}
          {nicksOf(card)[0] && <div style={{ marginTop: 36, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 30, color: "#f5f5f5", opacity: 0.8 }}>{nicksOf(card).join("  ·  ")}</div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }

  // ════════ LAYOUT 9 — editorial minimalista (preto/cinza) ════════
  if (card.layout === "l9-capa") {
    return (
      <div style={{ ...canvas, background: card.bg || INK }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "62%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, transparent 55%, ${card.bg || INK} 100%)` }} />
          </div>
        )}
        <L9Chrome card={card} />
        <div style={{ position: "absolute", top: 150, left: 64, right: 64, textAlign: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(128, ts, { align: "center", leading: "0.9" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#cfd0d4", { align: "center" }), marginTop: 18 }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }
  if (card.layout === "l9-intro") {
    return (
      <div style={{ ...canvas, background: card.bg || INK }} className={grainCls}>
        <L9Chrome card={card} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 64, width: "62%", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(24, 1, "#9aa0b0", { weight: 700 }), letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{card.kicker}</div>}
          {card.headline && <h1 style={headStyle(148, ts, { leading: "0.88" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(36, bs, "#cfd0d4"), marginTop: 20 }}><Rich text={card.body} /></div>}
          {card.signoff && <div style={{ alignSelf: "flex-start", marginTop: 24, border: "2px solid #f5f5f5", color: "#f5f5f5", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 26, padding: "10px 22px", borderRadius: 30 }}>{card.signoff}</div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }
  if (card.layout === "l9-conteudo") {
    return (
      <div style={{ ...canvas, background: card.bg || PAPER }}>
        <L9Chrome card={card} dark={false} />
        <div style={{ position: "absolute", top: 150, left: 80, right: 80, textAlign: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div style={{ display: "inline-block", background: "#0b0b0f", color: "#fff", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: 1, padding: "10px 22px", borderRadius: 14, marginBottom: 24 }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(58, ts, { color: "var(--title-color, #0b0b0f)", align: "center", leading: "1.0" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#3a3d44", { align: "center" }), marginTop: 16 }}><Rich text={card.body} /></div>}
        </div>
        {card.image && (
          <div style={{ position: "absolute", bottom: 130, left: 120, right: 120, height: 380, borderRadius: 18, overflow: "hidden", boxShadow: "0 14px 40px rgba(0,0,0,.18)" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
          </div>
        )}
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }
  if (card.layout === "l9-final") {
    return (
      <div style={{ ...canvas, background: card.bg || INK }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "58%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${card.bg || INK} 4%, transparent 46%)` }} />
          </div>
        )}
        <L9Chrome card={card} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 64, width: "44%", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(24, 1, "#9aa0b0", { weight: 700 }), letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(76, ts, { leading: "0.92" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cfd0d4"), marginTop: 18 }}><Rich text={card.body} /></div>}
          {card.signoff && <div style={{ alignSelf: "flex-start", marginTop: 22, border: "2px solid #f5f5f5", color: "#f5f5f5", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 26, padding: "10px 22px", borderRadius: 30 }}>{card.signoff}</div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }

  // ════════ LAYOUT 10 — editorial vinho premium (serifada + dourado) ════════
  if (card.layout === "l10-capa") {
    return (
      <div style={{ ...canvas, background: card.bg || WINE }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 150, left: "50%", transform: "translateX(-50%)", width: 440, height: 560, borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD}`, boxShadow: "0 20px 50px rgba(0,0,0,.45)" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={false} />
          </div>
        )}
        <L10Chrome card={card} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, textAlign: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(24, 1, GOLD, { align: "center" }), letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>{card.kicker}</div>}
          {card.headline && <h1 style={headStyle(94, ts, { serif: true, color: `var(--title-color, ${WARMW})`, align: "center", leading: "1.0" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(30, bs, "#cbb9b0", { serif: true, align: "center" }), marginTop: 14 }}><Rich text={card.body} /></div>}
          {card.signoff && <div style={{ marginTop: 24, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 22, letterSpacing: 3, color: GOLD, textTransform: "uppercase" }}>{card.signoff} →</div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }
  if (card.layout === "l10-texto") {
    return (
      <div style={{ ...canvas, background: card.bg || WINE }} className={grainCls}>
        <L10Chrome card={card} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 80, right: 80, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(22, 1, GOLD, { align: al || "left" }), letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(70, ts, { serif: true, color: `var(--title-color, ${WARMW})`, align: al || "left", leading: "1.08" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cbb9b0", { serif: true, align: al || "left" }), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }
  if (card.layout === "l10-regra") {
    return (
      <div style={{ ...canvas, background: card.bg || WINE }} className={grainCls}>
        <L10Chrome card={card} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 90px", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="body" style={{ ...bodyOn(24, 1, GOLD, { align: "center" }), letterSpacing: 4, textTransform: "uppercase", marginBottom: 24 }}>{card.kicker}</div>}
          {card.headline && <h1 style={{ ...headStyle(60, ts, { serif: true, color: `var(--title-color, ${WARMW})`, align: "center", leading: "1.08" }), border: `1px solid ${GOLD}`, padding: "40px 48px", borderRadius: 6 }}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(28, bs, "#cbb9b0", { serif: true, align: "center" }), marginTop: 22 }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }
  if (card.layout === "l10-resumo") {
    return (
      <div style={{ ...canvas, background: card.bg || WINE }} className={grainCls}>
        <L10Chrome card={card} />
        <div style={{ position: "absolute", top: 200, left: 90, right: 90, bottom: 160, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(56, ts, { serif: true, color: `var(--title-color, ${WARMW})`, leading: "1.05" })}><Rich text={card.headline} /></h2>}
          {card.bullets && card.bullets.length > 0 && (
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 20 }}>
              {card.bullets.map((b, i) => (<div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline" }}><span style={{ color: GOLD, fontFamily: "Georgia, serif", fontSize: 30 }}>✓</span><span style={bodyOn(30, bs, WARMW, { serif: true })}><Rich text={b} /></span></div>))}
            </div>
          )}
          {card.body && <div data-mv="body" style={{ ...bodyOn(30, bs, "#cbb9b0", { serif: true }), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }
  if (card.layout === "l10-cta") {
    return (
      <div style={{ ...canvas, background: card.bg || WINE }} className={grainCls}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 90px", zIndex: 5, transform: TSHIFT }}>
          <img src="/logo/cn-logo.png" alt="" style={{ width: 90, opacity: 0.9, marginBottom: 34, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }} />
          {card.headline && <h1 style={headStyle(70, ts, { serif: true, color: `var(--title-color, ${WARMW})`, align: "center", leading: "1.05" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(30, bs, "#cbb9b0", { serif: true, align: "center" }), marginTop: 18 }}><Rich text={card.body} /></div>}
          {card.signoff && <div style={{ marginTop: 26, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 22, letterSpacing: 3, color: GOLD, textTransform: "uppercase" }}>{card.signoff}</div>}
          {nicksOf(card)[0] && <div style={{ marginTop: 18, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 24, color: WARMW, opacity: 0.7 }}>{nicksOf(card).join("  ·  ")}</div>}
        </div>
        <Decor card={card} />
      </div>
    );
  }

  return <div style={canvas} />;
}

// memo: digitar/editar um card não re-renderiza os outros (prévia, filmstrip, export)
export default React.memo(CarouselCard);
