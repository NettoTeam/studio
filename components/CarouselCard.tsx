import React from "react";
import type { Card, TextAlign } from "@/lib/types";
import { cardElement } from "@/lib/card-elements";
import type { CardElementDef } from "@/lib/card-elements";

const W = 1080, H = 1350;
const RED = "#ef476f", WHITE = "#f5f5f5", GREY = "#9aa0b0", BLACK = "#000", NAVY = "#14213d";
const DEFAULT_NICKS = ["@teamnetto", "@n2squad"]; // nicks padrão exibidos quando o card não define os seus
const INK = "#0b0b0f", PAPER = "#ececec"; // Layout 9: preto profundo / cinza claro
const WINE = "#3a0e1e", GOLD = "#c9a24b", WARMW = "#f3ece6"; // Layout 10: vinho / dourado / branco quente
const TSHIFT = "translate(var(--tx, 0px), var(--ty, 0px))"; // deslocamento do bloco de texto (controlado no editor)
const KSYNC  = "translate(calc(-1 * var(--tx, 0px) + var(--ksx, 0px)), calc(-1 * var(--ty, 0px) + var(--ksy, 0px)))"; // kicker independente do bloco de texto
const SSYNC  = "translate(calc(-1 * var(--tx, 0px) + var(--ssx, 0px)), calc(-1 * var(--ty, 0px) + var(--ssy, 0px)))"; // signoff independente do bloco de texto
// Para h1 standalone (não dentro de container TSHIFT): combina TSHIFT (handle TEXTO) + title-shift (handle TÍTULO)
const TITLE_STANDALONE = `${TSHIFT} var(--title-shift, translate(0px,0px))`;
// layouts "clássicos" (Layout 1) — recebem o nick via Decor, pois não têm chrome próprio como os L2–L8
const L1_LAYOUTS = ["cover", "top", "bottom", "full", "moral", "list", "data", "quote", "text", "split", "steps"];

function Rich({ text }: { text: string }) {
  // **rosa** · ==caixa sólida== · __sublinhado__ · ~~marca-texto~~ · ++contorno++
  // cada tipo tem sua própria cor via CSS var (herda --hl-color quando não definida individualmente)
  const HL      = "var(--hl-color, #ef476f)";
  const CAIXA   = "var(--caixa-color, var(--hl-color, #ef476f))";
  const UL      = "var(--ul-color, var(--hl-color, #ef476f))";
  const MARCA   = "var(--marca-color, var(--hl-color, #ef476f))";
  const CONTORNO = "var(--contorno-color, var(--hl-color, #ef476f))";
  const parts = text.split(/(\*\*[^*]+\*\*|==[^=]+==|__[^_]+__|~~[^~]+~~|\+\+[^+]+\+\+)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <span key={i} style={{ color: HL, WebkitTextStrokeColor: HL }}>{p.slice(2, -2)}</span>;
        // caixa sólida: inline-block faz a linha crescer pra caber a caixa — nunca cobre a palavra de cima
        if (p.startsWith("==")) return <span key={i} style={{ display: "inline-block", background: CAIXA, color: "#fff", WebkitTextStrokeColor: "#fff", padding: "0.06em 0.18em", borderRadius: 5, lineHeight: 1.05 }}>{p.slice(2, -2)}</span>;
        if (p.startsWith("__")) return <span key={i} style={{ textDecoration: "underline", textDecorationColor: UL, textDecorationThickness: "0.09em", textUnderlineOffset: "0.12em" }}>{p.slice(2, -2)}</span>;
        if (p.startsWith("~~")) return <span key={i} style={{ display: "inline-block", background: MARCA, opacity: 0.9, padding: "0 0.1em", borderRadius: 3, lineHeight: 1.05 }}>{p.slice(2, -2)}</span>;
        if (p.startsWith("++")) return <span key={i} style={{ display: "inline-block", border: "2px solid " + CONTORNO, color: CONTORNO, WebkitTextStrokeColor: CONTORNO, padding: "0.03em 0.16em", borderRadius: 5, lineHeight: 1.05 }}>{p.slice(2, -2)}</span>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function photoFilter(bw: boolean, contrast = 1.04, brightness = 0.94) {
  return bw ? `grayscale(1) contrast(${contrast}) brightness(${brightness})` : `contrast(${contrast}) brightness(${brightness})`;
}
const bwFilter = photoFilter(true, 1.15, 0.86);
const colorFilter = photoFilter(false);

function Photo({ src, fx = 0.5, fy = 0.4, scale = 1, rotate = 0, bw = true, fit = "cover", rotCover = H / W, panCover = 1, style }: { src: string; fx?: number; fy?: number; scale?: number; rotate?: number; bw?: boolean; fit?: "cover" | "contain"; rotCover?: number; panCover?: number; style?: React.CSSProperties }) {
  const rot = ((rotate % 360) + 360) % 360;
  // no modo contain não forçamos escala para cobrir — o scale do usuário é direto
  const cover = fit === "contain" ? 1 : (rot === 90 || rot === 270 ? rotCover : panCover);
  const totalScale = scale * cover;
  const bgX = rot === 90 || rot === 270 ? fy : fx;
  const bgY = rot === 90 || rot === 270 ? fx : fy;
  const verticalRoom = Math.max(0, totalScale - 1) * 50;
  const verticalShift = fit === "contain" ? 0 : ((0.5 - fy) / 2.5) * verticalRoom;
  const tf = ["translate(-50%, -50%)", rot ? `rotate(${rot}deg)` : "", totalScale !== 1 ? `scale(${totalScale})` : ""].filter(Boolean).join(" ");
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${50 + verticalShift}%`,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${src})`,
          backgroundSize: fit === "contain" ? "contain" : "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: `${bgX * 100}% ${bgY * 100}%`,
          transform: tf,
          transformOrigin: "center",
          filter: bw ? bwFilter : colorFilter,
          ...style,
        }}
      />
    </div>
  );
}

const headlineStyle: React.CSSProperties = {
  fontFamily: "var(--ct-font, 'Anton'), sans-serif",
  textTransform: "uppercase",
  color: "var(--title-color, #f5f5f5)",
  lineHeight: "var(--ct-leading, 1.00)",
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
  lineHeight: "var(--cb-leading, 1.00)",
  letterSpacing: "var(--cb-tracking, 0px)",
  margin: 0,
  textShadow: "var(--cb-shadow, 0 2px 8px rgba(0,0,0,0.5))",
  position: "relative",
  zIndex: 5,
  transform: "var(--body-shift, translate(0px,0px))", // mover corpo independente
};

function alignStyle(align?: TextAlign): Pick<React.CSSProperties, "textAlign"> {
  return align ? { textAlign: align } : {};
}

// mantém um elemento (de tamanho wPx×hPx) inteiramente dentro do card (1080×1350)
function clampInside(x: number, y: number, wPx: number, hPx: number) {
  const cx = Math.max(0, Math.min(1 - wPx / W, x));
  const cy = Math.max(0, Math.min(1 - hPx / H, y));
  return { left: `${cx * 100}%`, top: `${cy * 100}%` };
}

function fixed(card: Card, id: string, fallback: CardElementDef) {
  return cardElement(card, id, fallback);
}

function FixedLogo({ card, id, label, x, y, w, z = 9, circle = false, opacity = 0.95 }: { card: Card; id: string; label: string; x: number; y: number; w: number; z?: number; circle?: boolean; opacity?: number }) {
  const e = fixed(card, id, { id, label, kind: "logo", x, y, w, movable: true, sizable: true });
  if (e.hidden) return null;
  const size = e.w ?? w;
  return (
    <div style={{ position: "absolute", ...clampInside(e.x, e.y, size, size), width: size, height: circle ? size : "auto", borderRadius: circle ? "50%" : undefined, overflow: circle ? "hidden" : undefined, background: circle ? "#fff" : undefined, boxShadow: circle ? "0 6px 18px rgba(0,0,0,.18)" : undefined, zIndex: z, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src="/logo/cn-logo.png" alt="" style={{ width: circle ? "76%" : "100%", height: circle ? "76%" : "auto", objectFit: "contain", opacity, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" }} />
    </div>
  );
}

function FixedText({ card, id, label, x, y, text, size, color, z = 9, style, rich = false }: { card: Card; id: string; label: string; x: number; y: number; text: string; size: number; color: string; z?: number; style?: React.CSSProperties; rich?: boolean }) {
  const e = fixed(card, id, { id, label, kind: "text", x, y, text, size, color, movable: true, sizable: true, editable: true, colorable: true });
  const content = e.text ?? text;
  if (e.hidden || !content) return null;
  return (
    <div style={{ position: "absolute", left: `${e.x * 100}%`, top: `${e.y * 100}%`, zIndex: z, color: e.color || color, fontSize: e.size ?? size, whiteSpace: "pre-line", ...style }}>
      {rich ? <Rich text={content} /> : content}
    </div>
  );
}

function FixedBar({ card, id = "topBar", label = "Barra superior", x = 0, y = 0, w = W, h = 6, color = RED, z = 9, style }: { card: Card; id?: string; label?: string; x?: number; y?: number; w?: number; h?: number; color?: string; z?: number; style?: React.CSSProperties }) {
  const e = fixed(card, id, { id, label, kind: "bar", x, y, w, h, color, movable: true, sizable: true, colorable: true });
  if (e.hidden) return null;
  return <div style={{ position: "absolute", left: `${e.x * 100}%`, top: `${e.y * 100}%`, width: e.w ?? w, height: e.h ?? h, background: e.color || color, zIndex: z, ...style }} />;
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
  // Cancela o TSHIFT do bloco pai (--tx/--ty) e aplica só o offset próprio (--ksx/--ksy)
  // Isso torna o kicker completamente independente de mover TEXTO/CORPO
  return (
    <div data-mv="kicker" style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14, transform: KSYNC }}>
      <span style={{ width: 54, height: 5, background: "var(--kicker-color, " + RED + ")", display: "block", flexShrink: 0 }} />
      <span style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 34, letterSpacing: 2, color: "var(--kicker-color, " + GREY + ")", textTransform: "uppercase", whiteSpace: "pre-line" }}>
        <Rich text={text} />
      </span>
    </div>
  );
}

function Index({ card, text }: { card: Card; text: string }) {
  const e = fixed(card, "index", { id: "index", label: "Índice / numeração", kind: "text", x: 0.86, y: 0.93, text, size: 34, color: "#d2d2d2", movable: true, sizable: true, editable: true, colorable: true });
  if (e.hidden) return null;
  const st = card.indexStyle || "texto";
  const m = text.match(/(\d+)\s*[/·]\s*(\d+)/);
  const cur = m ? parseInt(m[1], 10) : 1;
  const tot = m ? parseInt(m[2], 10) : 8;
  const c = e.color || "#d2d2d2";
  const sz = e.size ?? 34;
  const pos: React.CSSProperties = { position: "absolute", left: `${e.x * 100}%`, top: `${e.y * 100}%`, zIndex: 6, whiteSpace: "nowrap" };
  const shadow = "0 2px 4px rgba(0,0,0,.6)";
  if (st === "seta") return (
    <span style={{ ...pos, fontFamily: "var(--ct-font,'Anton'),sans-serif", fontSize: sz * 1.4, color: c, textShadow: shadow, lineHeight: 1 }}>→</span>
  );
  if (st === "continua") return (
    <span style={{ ...pos, fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.7, color: c, letterSpacing: 1, textShadow: shadow }}>continua →</span>
  );
  if (st === "swipe") return (
    <span style={{ ...pos, fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.65, color: c, letterSpacing: 1, textShadow: shadow }}>← swipe →</span>
  );
  if (st === "pontos") return (
    <div style={{ ...pos, display: "flex", gap: sz * 0.22, alignItems: "center" }}>
      {Array.from({ length: Math.min(tot, 12) }).map((_, i) => (
        <span key={i} style={{ width: sz * 0.28, height: sz * 0.28, borderRadius: "50%", background: i + 1 === cur ? c : "transparent", border: `1.5px solid ${c}`, boxShadow: shadow, display: "block", opacity: i + 1 === cur ? 1 : 0.55, flexShrink: 0 }} />
      ))}
    </div>
  );
  if (st === "tracos") return (
    <div style={{ ...pos, display: "flex", gap: sz * 0.15, alignItems: "center" }}>
      {Array.from({ length: Math.min(tot, 12) }).map((_, i) => (
        <span key={i} style={{ width: sz * 0.7, height: sz * 0.12, borderRadius: 2, background: c, opacity: i + 1 <= cur ? 1 : 0.22, display: "block", boxShadow: shadow, flexShrink: 0 }} />
      ))}
    </div>
  );
  if (st === "barra") return (
    <div style={{ ...pos, display: "flex", flexDirection: "column", gap: sz * 0.12 }}>
      <div style={{ width: sz * 3.2, height: sz * 0.12, background: `${c}33`, borderRadius: 4, overflow: "hidden", boxShadow: shadow }}>
        <div style={{ width: `${(cur / Math.max(tot, 1)) * 100}%`, height: "100%", background: c, borderRadius: 4 }} />
      </div>
      <span style={{ fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.5, color: c, letterSpacing: 1 }}>{String(cur).padStart(2,"0")} / {String(tot).padStart(2,"0")}</span>
    </div>
  );
  if (st === "pill") return (
    <span style={{ ...pos, fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.6, color: c, background: `${c}22`, border: `1px solid ${c}55`, borderRadius: sz * 0.5, padding: `${sz * 0.18}px ${sz * 0.42}px`, letterSpacing: 1, boxShadow: shadow }}>
      {String(cur).padStart(2,"0")} / {String(tot).padStart(2,"0")}
    </span>
  );
  if (st === "minimo") return (
    <span style={{ ...pos, fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.65, color: c, letterSpacing: 2, textShadow: shadow, opacity: 0.8 }}>
      {String(cur).padStart(2,"0")}·{String(tot).padStart(2,"0")}
    </span>
  );
  if (st === "grande") return (
    <div style={{ ...pos, display: "flex", alignItems: "baseline", gap: sz * 0.12 }}>
      <span style={{ fontFamily: "var(--ct-font,'Anton'),sans-serif", fontSize: sz * 1.6, color: c, lineHeight: 1, textShadow: shadow }}>{String(cur).padStart(2,"0")}</span>
      <span style={{ fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.55, color: c, opacity: 0.55 }}>/{String(tot).padStart(2,"0")}</span>
    </div>
  );
  if (st === "circulo") return (
    <span style={{ ...pos, fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.9, color: c, width: sz * 1.15, height: sz * 1.15, borderRadius: "50%", border: `2px solid ${c}`, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: shadow, fontWeight: 700 }}>
      {cur}
    </span>
  );
  if (st === "pagina") return (
    <span style={{ ...pos, fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.55, color: c, letterSpacing: 0.5, textShadow: shadow, textTransform: "lowercase" }}>
      página {cur} de {tot}
    </span>
  );
  if (st === "seta-dupla") return (
    <span style={{ ...pos, fontFamily: "var(--cb-font,'Inter'),sans-serif", fontSize: sz * 0.65, color: c, textShadow: shadow, display: "flex", alignItems: "center", gap: sz * 0.25 }}>
      <span style={{ opacity: cur > 1 ? 0.7 : 0.2 }}>←</span>
      <span style={{ fontFamily: "var(--ct-font,'Anton'),sans-serif", fontSize: sz * 0.85, letterSpacing: 1 }}>{String(cur).padStart(2,"0")}</span>
      <span style={{ opacity: cur < tot ? 0.7 : 0.2 }}>→</span>
    </span>
  );
  // default "texto"
  const display = e.text === "índice" ? text : e.text || text;
  return (
    <span style={{ ...pos, fontFamily: "var(--ct-font,'Anton'),sans-serif", fontSize: sz, color: c, letterSpacing: 2, textShadow: shadow }}>
      {display}
    </span>
  );
}

const Body = ({ text, scale = 1, align }: { text: string; scale?: number; align?: TextAlign }) => (
  <div data-mv="body" style={{ ...bodyStyle, fontSize: 40 * scale, whiteSpace: "pre-line", ...alignStyle(align) }}><Rich text={text} /></div>
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
      {(card.cardImages || []).map((ci, i) => (
        <img key={`ci-${i}`} src={ci.src} alt=""
          style={{
            position: "absolute", zIndex: 4,
            left: `${ci.x * 100}%`, top: `${ci.y * 100}%`,
            width: `${ci.width * 100}%`, height: "auto",
            opacity: ci.opacity ?? 1,
            filter: ci.bw ? "grayscale(1) contrast(1.05)" : "none",
            clipPath: ci.crop
              ? `inset(${ci.crop.y * 100}% ${(1 - ci.crop.x - ci.crop.w) * 100}% ${(1 - ci.crop.y - ci.crop.h) * 100}% ${ci.crop.x * 100}%)`
              : undefined,
            pointerEvents: "none",
          }}
        />
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
      <FixedBar card={card} h={9} />
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
      {!light && <FixedBar card={card} h={5} />}
      {list.map((n, i) => (
        <span key={i} style={{ position: "absolute", top: 42, [i === 1 ? "right" : "left"]: 56, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 600, fontSize: 24, color, opacity: 0.85, letterSpacing: 0.3 }}>{n}</span>
      ))}
    </>
  );
}
// tag kicker (ex: "PROBLEMA 01") — cor controlável via --kicker-color
const l2Tag: React.CSSProperties = {
  alignSelf: "flex-start", display: "inline-block", background: "var(--kicker-color, " + RED + ")", color: "#fff",
  fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 26,
  letterSpacing: 2, textTransform: "uppercase", padding: "7px 16px", borderRadius: 6,
};

// ── estilos flexíveis de título/corpo (Layouts 4/5/6: revista, minimalista, manifesto) ──
function headStyle(size: number, ts: number, o: { color?: string; mont?: boolean; serif?: boolean; leading?: string; align?: TextAlign; stroke?: boolean } = {}): React.CSSProperties {
  const fam = o.serif ? "Georgia, 'Times New Roman', serif" : o.mont ? "var(--ct-font, 'Montserrat'), sans-serif" : "var(--ct-font, 'Anton'), sans-serif";
  const color = o.color || "var(--title-color, #f5f5f5)";
  return {
    fontFamily: fam, fontWeight: o.mont ? 800 : o.serif ? 600 : 400,
    textTransform: o.serif ? "none" : "uppercase", color,
    WebkitTextStrokeWidth: o.stroke ? "1px" : "0px", WebkitTextStrokeColor: color,
    lineHeight: "var(--ct-leading, 1.00)",
    letterSpacing: o.serif ? "0px" : "var(--ct-tracking, 0.5px)",
    fontSize: size * ts, textAlign: (`var(--title-align, ${o.align || "left"})` as React.CSSProperties["textAlign"]), margin: 0, whiteSpace: "pre-line",
    alignSelf: "stretch",
    textShadow: "var(--ct-shadow, 0 3px 14px rgba(0,0,0,0.55))", position: "relative", transform: "var(--title-shift, translate(0px,0px))",
  };
}
function bodyOn(size: number, bs: number, def: string, o: { serif?: boolean; align?: TextAlign; weight?: number } = {}): React.CSSProperties {
  return { ...bodyStyle, fontFamily: o.serif ? "Georgia, 'Times New Roman', serif" : "var(--cb-font, 'Inter'), sans-serif", fontWeight: o.weight ?? 500, color: `var(--body-color, ${def})`, fontSize: size * bs, textAlign: (`var(--body-align, ${o.align || "left"})` as React.CSSProperties["textAlign"]), alignSelf: "stretch", whiteSpace: "pre-line" };
}
// vinheta + linhas curvas finas rosa nos cantos (Layout 6 — manifesto)
function L6Decor({ card }: { card: Card }) {
  const e = fixed(card, "l6Decor", { id: "l6Decor", label: "Moldura / vinheta", kind: "decor", x: 0, y: 0, w: 1080, h: 1350, color: RED, colorable: true });
  if (e.hidden) return null;
  const c = e.color || RED;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.6) 100%)" }} />
      <svg viewBox="0 0 1080 1350" width="100%" height="100%" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        <path d="M 1080 110 Q 870 110 870 320" fill="none" stroke={c} strokeWidth="3" opacity="0.85" />
        <path d="M 0 1240 Q 210 1240 210 1030" fill="none" stroke={c} strokeWidth="3" opacity="0.85" />
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
      <FixedBar card={card} h={6} />
      <FixedLogo card={card} id="l7Logo" label="Logo superior" x={0.446} y={0.022} w={116} />
      {nicksOf(card)[0] && <span style={{ position: "absolute", top: 34, right: 64, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 22, color: "#f5f5f5", opacity: 0.85 }}>{nicksOf(card).join("  ·  ")}</span>}
      {total > 0 && (() => {
          const e = fixed(card, "l7Progress", { id: "l7Progress", label: "Progresso inferior", kind: "decor", x: 0.059, y: 0.941, w: 952, h: 32, color: RED, movable: true, sizable: true, colorable: true });
          if (e.hidden) return null;
          return <div style={{ position: "absolute", left: `${e.x * 100}%`, top: `${e.y * 100}%`, width: e.w ?? 952, height: e.h ?? 32, display: "flex", alignItems: "center", gap: 16, zIndex: 9 }}>
          <span style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 26, color: fc, letterSpacing: 1, whiteSpace: "nowrap" }}>{String(cur).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <span style={{ flex: 1, display: "flex", gap: 5 }}>
            {Array.from({ length: total }).map((_, i) => <span key={i} style={{ flex: 1, height: 3, background: i < cur ? (e.color || RED) : seg }} />)}
          </span>
        </div>;
        })()}
    </>
  );
}
// chrome do Layout 9: cabeçalho discreto nos cantos + rodapé técnico (código de barras + numeração)
function L9Chrome({ card, dark = true }: { card: Card; dark?: boolean }) {
  const c = dark ? "rgba(245,245,245,.7)" : "rgba(11,11,15,.6)";
  const m = (card.index || "").match(/(\d+)\s*\/\s*(\d+)/);
  return (
    <>
      {nicksOf(card)[0] && <span style={{ position: "absolute", top: 40, left: 56, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 20, letterSpacing: 1, color: c, textTransform: "uppercase" }}>{nicksOf(card)[0]}</span>}
      <FixedText card={card} id="index" label="Índice / numeração" x={0.86} y={0.03} text={(card.index || "").replace(/\s/g, "")} size={20} color={c} style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", letterSpacing: 1, whiteSpace: "nowrap" }} />
      <FixedText card={card} id="l9Footer" label="Rodapé editorial" x={0.052} y={0.957} text="editorial premium · n² squad" size={15} color={c} style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", letterSpacing: 2, textTransform: "uppercase" }} />
      {(() => {
        const e = fixed(card, "l9Barcode", { id: "l9Barcode", label: "Código de barras", kind: "decor", x: 0.809, y: 0.931, w: 150, h: 26, color: c, movable: true, sizable: true, colorable: true });
        if (e.hidden) return null;
        const bc = e.color || c;
        const bg = `repeating-linear-gradient(90deg, ${bc} 0 2px, transparent 2px 5px, ${bc} 5px 8px, transparent 8px 10px, ${bc} 10px 11px, transparent 11px 14px)`;
        return <div style={{ position: "absolute", left: `${e.x * 100}%`, top: `${e.y * 100}%`, zIndex: 9, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ width: e.w ?? 150, height: e.h ?? 26, background: bg }} />
          <span style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 13, letterSpacing: 3, color: bc }}>{m ? `0${m[1]}-${m[2]}` : ""}</span>
        </div>;
      })()}
    </>
  );
}
// chrome do Layout 10: cabeçalho (nick) + numeração dourada + monograma no rodapé
function L10Chrome({ card }: { card: Card }) {
  const m = (card.index || "").match(/(\d+)\s*\/\s*(\d+)/);
  return (
    <>
      {nicksOf(card)[0] && <span style={{ position: "absolute", top: 44, left: 56, zIndex: 9, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 19, letterSpacing: 3, color: WARMW, opacity: 0.75, textTransform: "uppercase" }}>{nicksOf(card)[0]}</span>}
      {m && <FixedText card={card} id="index" label="Índice / numeração" x={0.86} y={0.033} text={`${m[1]} / ${m[2]}`} size={20} color={GOLD} style={{ fontFamily: "Georgia, serif", letterSpacing: 2, whiteSpace: "nowrap" }} />}
      <FixedLogo card={card} id="l10Logo" label="Logo inferior" x={0.464} y={0.911} w={78} opacity={0.8} />
    </>
  );
}
// assinatura da marca no rodapé (Layout 6)
function BrandFooter({ card, align = "center" }: { card: Card; align?: "center" | "left" | "right" }) {
  const e = fixed(card, "brandFooter", { id: "brandFooter", label: "Assinatura do rodapé", kind: "text", x: 0.5, y: 0.92, text: "CÂNDIDO NETTO\nCONSULTORIA FITNESS · N² SQUAD", size: 28, color: "#f5f5f5", movable: true, sizable: true, editable: true, colorable: true });
  if (e.hidden) return null;
  const lines = (e.text || "").split("\n");
  return (
    <div style={{ position: "absolute", left: `${e.x * 100}%`, top: `${e.y * 100}%`, transform: align === "center" ? "translateX(-50%)" : undefined, textAlign: align, zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif", whiteSpace: "pre-line" }}>
      <div style={{ fontWeight: 800, fontSize: e.size ?? 28, letterSpacing: 3, color: e.color || "#f5f5f5" }}>{lines[0]}</div>
      {lines.slice(1).join("\n") && <div style={{ fontSize: Math.max(12, (e.size ?? 28) * 0.64), letterSpacing: 4, color: RED, marginTop: 2 }}>{lines.slice(1).join("\n")}</div>}
    </div>
  );
}

function CarouselCard({ card, grain = true }: { card: Card; grain?: boolean }) {
  const fx = card.focalX ?? 0.5, fy = card.focalY ?? 0.4;
  const grainCls = grain ? "dg-grain" : undefined;
  const zoom = card.scale ?? 1;            // zoom da imagem de fundo
  const ts = card.titleScale ?? 1;         // escala do título
  const bs = card.bodyScale ?? 1;          // escala do corpo/bullets
  const titleAl = card.titleAlign || card.align; // alinhamento do título (legado cai em align)
  const bodyAl = card.bodyAlign || card.align;   // alinhamento do corpo/bullets
  const al = titleAl;
  const photoBw = card.bw !== false;
  const photoFit = card.imageFit ?? "cover";

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
  if (card.caixaColor) vars["--caixa-color"] = card.caixaColor;
  if (card.sublinhColor) vars["--ul-color"] = card.sublinhColor;
  if (card.marcaColor) vars["--marca-color"] = card.marcaColor;
  if (card.contornoColor) vars["--contorno-color"] = card.contornoColor;
  if (card.kickerColor) vars["--kicker-color"] = card.kickerColor;
  if (card.signoffColor) vars["--signoff-color"] = card.signoffColor;
  vars["--ksx"] = `${Math.round((card.kickerX || 0) * W)}px`;
  vars["--ksy"] = `${Math.round((card.kickerY || 0) * H)}px`;
  vars["--ssx"] = `${Math.round((card.signoffX || 0) * W)}px`;
  vars["--ssy"] = `${Math.round((card.signoffY || 0) * H)}px`;
  if (card.titleTracking != null) vars["--ct-tracking"] = `${card.titleTracking}px`;
  if (card.bodyTracking != null) vars["--cb-tracking"] = `${card.bodyTracking}px`;
  if (card.titleLeading != null) vars["--ct-leading"] = String(card.titleLeading);
  if (card.bodyLeading != null) vars["--cb-leading"] = String(card.bodyLeading);
  if (titleAl) vars["--title-align"] = titleAl;
  if (bodyAl) vars["--body-align"] = bodyAl;
  if (card.titleX != null || card.titleY != null) vars["--title-shift"] = `translate(${Math.round((card.titleX || 0) * W)}px, ${Math.round((card.titleY || 0) * H)}px)`;
  if (card.bodyX != null || card.bodyY != null) vars["--body-shift"] = `translate(${Math.round((card.bodyX || 0) * W)}px, ${Math.round((card.bodyY || 0) * H)}px)`;
  if (card.textX != null) vars["--tx"] = `${Math.round(card.textX * W)}px`;
  if (card.textY != null) vars["--ty"] = `${Math.round(card.textY * H)}px`;
  const resolvedOv = card.overlayColor === "none" ? "transparent" : card.overlayColor;
  const signoffScale = card.signoffScale ?? 1;
  const signoffMove = card.signoffX != null || card.signoffY != null
    ? `translate(${Math.round((card.signoffX || 0) * W)}px, ${Math.round((card.signoffY || 0) * H)}px)`
    : "";
  const signoffTransform = (base?: string) => [base, signoffMove].filter(Boolean).join(" ") || undefined;

  const canvas = {
    position: "relative", width: W, height: H, background: card.bg || BLACK, overflow: "hidden",
    ...vars,
  } as React.CSSProperties;
  const MARGIN = 64;
  const sideRotCover = 2.35;
  const halfRotCover = 2.65;
  const narrowRotCover = 3.2;
  const bandRotCover = 2.15;
  const sidePanCover = 1.18;
  const halfPanCover = 1.24;
  const narrowPanCover = 1.34;
  const bandPanCover = 1.16;

  // ---- COVER ----
  if (card.layout === "cover") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000 4%, rgba(0,0,0,.55) 26%, transparent 52%)" }} />
        <Logos card={card} side="right" />
        <h1 style={{ ...headlineStyle, position: "absolute", left: 0, right: 0, bottom: 150, textAlign: al || "center", fontSize: 118 * ts, padding: "0 50px", WebkitTextStrokeWidth: "2.1px", textShadow: "var(--ct-shadow, 0 6px 22px rgba(0,0,0,.92))", transform: TITLE_STANDALONE, zIndex: 5 }}>
          {card.headline && <Rich text={card.headline} />}
        </h1>
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
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
          <div style={{ position: "absolute", left: 0, right: 0, height: isBand ? `${bandH * 100}%` : "100%", top: isBottom ? "auto" : 0, bottom: isBottom ? 0 : "auto", overflow: "hidden" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />
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
          {card.body && <Body text={card.body} scale={bs} align={bodyAl} />}
          {card.signoff && (
            <div data-mv="signoff" style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", color: "var(--signoff-color, " + RED + ")", fontSize: 78 * signoffScale, marginTop: 22, letterSpacing: 1, whiteSpace: "pre-line", display: "inline-block", transform: SSYNC, transformOrigin: "left center" }}>{card.signoff}</div>
          )}
        </div>
        {card.layout === "moral" && <FixedLogo card={card} id="moralLogo" label="Logo do fecho" x={0.06} y={0.82} w={200} z={7} />}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ---- LIST (bullets) ----
  if (card.layout === "list") {
    const marker = fixed(card, "listMarker", { id: "listMarker", label: "Marcador dos bullets", kind: "marker", x: 0, y: 0, w: 34, h: 6, color: RED, sizable: true, colorable: true });
    return (
      <div style={canvas} className={grainCls}>
        {card.image ? (
          <>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} style={{ filter: photoFilter(photoBw, 1.1, 0.5) }} />
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
                {!marker.hidden && <span style={{ width: marker.w ?? 34, height: marker.h ?? 6, background: marker.color || RED, display: "inline-block", flexShrink: 0, transform: "translateY(-10px)" }} />}
                <span style={{ ...bodyStyle, fontSize: 44 * bs, flex: 1, ...alignStyle(bodyAl) }}><Rich text={b} /></span>
              </div>
            ))}
          </div>
        </div>
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ---- DATA (números gigantes) ----
  if (card.layout === "data") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image ? (
          <>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} style={{ filter: photoFilter(photoBw, 1.15, 0.42) }} />
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
          {card.body && <div style={{ marginTop: 24 }}><Body text={card.body} scale={bs} align={bodyAl} /></div>}
        </div>
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ---- A. QUOTE (citação gigante) ----
  if (card.layout === "quote") {
    return (
      <div style={canvas} className={grainCls}>
        <Logos card={card} side="left" />
        <FixedText card={card} id="quoteMark" label="Aspas decorativa" x={0.065} y={0.096} text="“" size={200} color={RED} style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", lineHeight: 0.6 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 90px", transform: TSHIFT }}>
          <h1 style={{ ...headlineStyle, fontSize: 128 * ts, textAlign: al || "center", lineHeight: "var(--ct-leading, 1.00)" }}>
            {card.headline && <Rich text={card.headline} />}
          </h1>
        </div>
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
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
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 52 * bs, lineHeight: "var(--cb-leading, 1.00)", whiteSpace: "pre-line", ...alignStyle(bodyAl) }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ---- C. SPLIT (metade foto / metade texto) ----
  if (card.layout === "split") {
    return (
      <div style={canvas} className={grainCls}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%", overflow: "hidden" }}>
          {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 72%, #000 100%)" }} />
        </div>
        <Logos card={card} side="right" />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", zIndex: 5, padding: "0 56px", display: "flex", flexDirection: "column", justifyContent: "center", transform: TSHIFT }}>
          {card.kicker && <Kicker text={card.kicker} />}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 74 * ts, marginBottom: 22, textAlign: al }}><Rich text={card.headline} /></h2>}
          {card.body && <Body text={card.body} scale={bs} align={bodyAl} />}
        </div>
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ---- H. STEPS (passo a passo numerado) ----
  if (card.layout === "steps") {
    const steps = card.bullets || [];
    const marker = fixed(card, "stepMarker", { id: "stepMarker", label: "Marcador dos passos", kind: "marker", x: 0, y: 0, w: 66, h: 66, size: 42, color: RED, text: "número", sizable: true, editable: true, colorable: true });
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
                  {!marker.hidden && <span style={{ width: marker.w ?? 66, height: marker.h ?? marker.w ?? 66, borderRadius: "50%", border: "3px solid " + (marker.color || RED), color: marker.color || RED, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: marker.size ?? 42, flexShrink: 0 }}>{marker.text && marker.text !== "número" ? marker.text : i + 1}</span>}
                  <span style={{ ...bodyStyle, fontSize: 42 * bs, flex: 1, ...alignStyle(bodyAl) }}><Rich text={s} /></span>
                </div>
                {i < steps.length - 1 && !marker.hidden && <div style={{ width: 3, height: 34, background: marker.color || RED, marginLeft: 31 }} />}
              </div>
            ))}
          </div>
        </div>
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ════════ LAYOUT 2 — editorial premium ════════
  const showChosenLogos = card.logos !== undefined; // no L2 só mostra logos se você escolheu explicitamente (o handle é o elemento de marca)

  // Card 1 — CAPA: foto full + overlay azul + headline grande à esquerda (use ==palavra== p/ caixa rosa)
  if (card.layout === "l2-capa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: resolvedOv || NAVY, opacity: 0.5, zIndex: 1 }} />
        <L2Chrome card={card} />
        <h1 style={{ ...headlineStyle, position: "absolute", left: 64, right: 80, bottom: 130, textAlign: al || "left", fontSize: 116 * ts, lineHeight: "var(--ct-leading, 1.00)", transform: TITLE_STANDALONE, zIndex: 5 }}>
          {card.headline && <Rich text={card.headline} />}
        </h1>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index card={card} text={card.index} />}
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={halfRotCover} panCover={halfPanCover} />
            <div style={{ position: "absolute", inset: 0, background: resolvedOv || NAVY, opacity: 0.4 }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to ${photoRight ? "left" : "right"}, transparent 38%, ${card.bg || NAVY} 96%)` }} />
          </div>
        )}
        <L2Chrome card={card} />
        <div style={{ position: "absolute", top: 110, bottom: 90, width: "50%", [photoRight ? "left" : "right"]: 0, padding: photoRight ? "0 26px 0 64px" : "0 64px 0 26px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <span data-mv="kicker" style={{ ...l2Tag, transform: KSYNC }}>{card.kicker}</span>}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 72 * ts, textAlign: al || "left", marginTop: 16, lineHeight: "var(--ct-leading, 1.00)" }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 36 * bs, textAlign: bodyAl || "left", marginTop: 22, whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // Card 5 — IMPACTO EMOCIONAL: fundo azul sólido, sem foto, frase central (branco + rosa)
  if (card.layout === "l2-emocional") {
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        <L2Chrome card={card} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <span data-mv="kicker" style={{ ...l2Tag, marginBottom: 24, transform: KSYNC}}>{card.kicker}</span>}
          {card.headline && <h1 style={{ ...headlineStyle, fontSize: 104 * ts, textAlign: al || "left", lineHeight: "var(--ct-leading, 1.00)" }}><Rich text={card.headline} /></h1>}
        </div>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // Card 6 — VIRADA: foto ~60% no topo + overlay azul + tag/headline/apoio embaixo
  if (card.layout === "l2-virada") {
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={bandRotCover} panCover={bandPanCover} />
            <div style={{ position: "absolute", inset: 0, background: resolvedOv || NAVY, opacity: 0.38 }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 52%, ${card.bg || NAVY} 98%)` }} />
          </div>
        )}
        <L2Chrome card={card} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 120, zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <span data-mv="kicker" style={{ ...l2Tag, transform: KSYNC }}>{card.kicker}</span>}
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 80 * ts, textAlign: al || "left", marginTop: 16, lineHeight: "var(--ct-leading, 1.00)" }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 38 * bs, textAlign: bodyAl || "left", marginTop: 18, whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // Card 7 — CTA: foto full + overlay + headline multi-linha (branco/rosa) + botão CTA (signoff)
  if (card.layout === "l2-cta") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: resolvedOv || NAVY, opacity: 0.6, zIndex: 1 }} />
        <L2Chrome card={card} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 120, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={{ ...headlineStyle, fontSize: 96 * ts, textAlign: al || "left", lineHeight: "var(--ct-leading, 1.00)" }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 42 * bs, textAlign: bodyAl || "left", marginTop: 20, whiteSpace: "pre-line" }}><Rich text={card.body} /></div>}
          {card.signoff && <div data-mv="signoff" style={{ display: "inline-block", marginTop: 28, background: RED, color: "#fff", fontFamily: "var(--ct-font, 'Anton'), sans-serif", textTransform: "uppercase", fontSize: 46 * signoffScale, letterSpacing: 1, padding: "14px 30px", borderRadius: 8, transform: SSYNC, transformOrigin: "left center" }}>{card.signoff}</div>}
        </div>
        <Decor card={card} />
        {showChosenLogos && <Logos card={card} />}
        {card.index && <Index card={card} text={card.index} />}
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={bandRotCover} panCover={bandPanCover} />
          </div>
        )}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: isEdu ? 80 : card.image ? 470 : 80, right: isEdu ? (card.image ? 470 : 80) : 70, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="kicker" style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 26, letterSpacing: 3, textTransform: "uppercase", color: "var(--kicker-color, #ef476f)", marginBottom: 22, fontWeight: 700, transform: KSYNC}}>{card.kicker}</div>}
          {isEdu
            ? card.headline && <h1 style={{ ...headlineStyle, fontSize: 96 * ts, textAlign: al || "left", lineHeight: "var(--ct-leading, 1.00)" }}><Rich text={card.headline} /></h1>
            : card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 40 * bs, lineHeight: "var(--cb-leading, 1.00)", whiteSpace: "pre-line", ...alignStyle(bodyAl) }}><Rich text={card.body} /></div>}
          {isEdu && card.signoff && <div data-mv="signoff" style={{ marginTop: 30, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 32 * signoffScale, color: "var(--body-color, #f5f5f5)", opacity: 0.9, display: "inline-block", transform: SSYNC, transformOrigin: "left center" }}>{card.signoff}</div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
        {card.index && <Index card={card} text={card.index} />}
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />
          </div>
        )}
        <div style={{ position: "absolute", left: 90, right: 90, top: card.image ? 790 : 220, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <div style={{ fontFamily: "var(--ct-font, 'Anton'), sans-serif", fontSize: 56 * ts, lineHeight: "var(--ct-leading, 1.00)", color: "var(--hl-color, #ef476f)", textTransform: "uppercase", marginBottom: 18 }}><Rich text={card.headline} /></div>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 36 * bs, lineHeight: "var(--cb-leading, 1.00)", whiteSpace: "pre-line", ...alignStyle(bodyAl) }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // Card 3 — DESENVOLVIMENTO: só texto (contexto / virada em rosa / resultado) + seta no rodapé
  if (card.layout === "l3-historia") {
    return (
      <div style={{ ...canvas, background: card.bg || NAVY }} className={grainCls}>
        <L3Chrome card={card} />
        <div style={{ position: "absolute", left: 90, right: 90, top: 180, bottom: 200, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="kicker" style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 26, letterSpacing: 3, textTransform: "uppercase", color: "var(--kicker-color, #ef476f)", marginBottom: 24, fontWeight: 700, transform: KSYNC}}>{card.kicker}</div>}
          {card.body && <div data-mv="body" style={{ ...bodyStyle, fontSize: 42 * bs, lineHeight: "var(--cb-leading, 1.00)", whiteSpace: "pre-line", ...alignStyle(bodyAl) }}><Rich text={card.body} /></div>}
        </div>
        {card.signoff && <div data-mv="signoff" style={{ position: "absolute", left: 90, right: 90, bottom: 110, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 34 * signoffScale, color: "var(--hl-color, #ef476f)", fontWeight: 700, zIndex: 5, transform: signoffMove || undefined, transformOrigin: "left center" }}>{card.signoff}</div>}
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // Card 4 — ANTES E DEPOIS: fundo claro, 2 fotos lado a lado + marca circular centralizada acima
  if (card.layout === "l3-antes-depois") {
    return (
      <div style={{ ...canvas, background: card.bg || "#f5f5f5" }} className={grainCls}>
        <L3Chrome card={card} light />
        <FixedLogo card={card} id="beforeAfterLogo" label="Logo central" x={0.457} y={0.111} w={92} z={6} circle />
        <div style={{ position: "absolute", top: 290, bottom: 210, left: 70, right: 70, display: "flex", gap: 24, zIndex: 4 }}>
          {[card.image, card.image2].map((src, i) => (
            <div key={i} style={{ flex: 1, position: "relative", borderRadius: 18, overflow: "hidden", background: "#e3e6ec", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}>
              {src && <Photo src={src} fx={i === 0 ? fx : 0.5} fy={i === 0 ? fy : 0.4} scale={i === 0 ? zoom : 1} rotate={i === 0 ? card.rotate : 0} bw={photoBw} fit={photoFit} rotCover={narrowRotCover} panCover={narrowPanCover} />}
            </div>
          ))}
        </div>
        <FixedText card={card} id="beforeLabel" label="Texto ANTES" x={0.08} y={0.225} text="ANTES" size={26} color="#ffffff" style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 800, letterSpacing: 1, textShadow: "0 2px 8px rgba(0,0,0,.6)" }} />
        <FixedText card={card} id="afterLabel" label="Texto DEPOIS" x={0.526} y={0.225} text="DEPOIS" size={26} color="#ffffff" style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 800, letterSpacing: 1, textShadow: "0 2px 8px rgba(0,0,0,.6)" }} />
        {card.signoff && <div data-mv="signoff" style={{ position: "absolute", bottom: 100, left: 70, right: 70, textAlign: "center", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 32 * signoffScale, color: "#14213d", fontWeight: 600, zIndex: 5, transform: signoffMove || undefined, transformOrigin: "center" }}><Rich text={card.signoff} /></div>}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ════════ LAYOUT 4 — revista premium de negócios ════════
  if (card.layout === "l4-capa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, #14213d 0%, rgba(20,33,61,.82) 32%, rgba(20,33,61,.35) 100%)" }} />
        <div style={{ position: "absolute", left: 64, right: "32%", bottom: 150, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(118, ts, { color: "var(--title-color, #ef476f)" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(38, bs, "#f5f5f5"), marginTop: 22 }}><Rich text={card.body} /></div>}
        </div>
        <FixedLogo card={card} id="l4Logo" label="Logo da capa" x={0.852} y={0.881} w={120} z={7} opacity={0.92} />
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }
  if (card.layout === "l4-split") {
    return (
      <div style={{ ...canvas, background: card.bg || "#ffffff" }}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "40%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={narrowRotCover} panCover={narrowPanCover} />
            <div style={{ position: "absolute", inset: 0, background: resolvedOv || NAVY, opacity: 0.16 }} />
          </div>
        )}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "60%", padding: "0 56px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(24, 1, "#14213d", { weight: 700 }), color: "var(--kicker-color, #14213d)", letterSpacing: 2, textTransform: "uppercase", opacity: 0.65, marginBottom: 14, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(86, ts, { color: "var(--title-color, #ef476f)" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(36, bs, "#14213d"), marginTop: 22 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }
  if (card.layout === "l4-horizontal") {
    return (
      <div style={{ ...canvas, background: card.bg || "#ffffff" }}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "42%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={bandRotCover} panCover={bandPanCover} />
            <div style={{ position: "absolute", inset: 0, background: resolvedOv || NAVY, opacity: 0.16 }} />
          </div>
        )}
        <div style={{ position: "absolute", top: "42%", bottom: 0, left: 0, right: 0, padding: "0 90px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(80, ts, { color: "var(--title-color, #ef476f)", align: "center" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#14213d", { align: "center" }), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }
  if (card.layout === "l4-faixa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.12)", zIndex: 1 }} />
        {(() => {
          const band = fixed(card, "sideBand", { id: "sideBand", label: "Faixa azul lateral", kind: "decor", x: 0, y: 0, w: 497, h: 1350, color: "rgba(20,33,61,.95)", movable: true, sizable: true, colorable: true });
          if (band.hidden) return null;
          return <div style={{ position: "absolute", left: `${band.x * 100}%`, top: `${band.y * 100}%`, width: band.w ?? 497, height: band.h ?? 1350, background: band.color || "rgba(20,33,61,.95)", zIndex: 4 }} />;
        })()}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "46%", padding: "0 48px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(24, 1, "#ef476f", { weight: 700 }), color: "var(--kicker-color, #ef476f)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(72, ts, { color: "var(--title-color, #ef476f)" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(31, bs, "#f5f5f5"), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index card={card} text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l4-final") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, rgba(11,11,15,.92), rgba(11,11,15,.6))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(98, ts, { color: "var(--title-color, #ef476f)", align: "center" })}><Rich text={card.headline} /></h1>}
          {card.kicker && <div data-mv="kicker" style={{ marginTop: 46, width: "80%", border: "2px solid var(--kicker-color, #2f4368)", borderRadius: 10, padding: "20px 24px", color: "var(--kicker-color, #aeb6c8)", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 30, transform: KSYNC}}>{card.kicker}</div>}
          {card.signoff && <div data-mv="signoff" style={{ marginTop: 22, color: "#f5f5f5", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 27 * signoffScale, opacity: 0.92, display: "inline-block", transform: SSYNC, transformOrigin: "center" }}>{card.signoff}</div>}
        </div>
        <FixedLogo card={card} id="l4Logo" label="Logo final" x={0.804} y={0.843} w={168} z={7} />
        {card.index && <Index card={card} text={card.index} />}
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={narrowRotCover} panCover={narrowPanCover} />
            <div style={{ position: "absolute", inset: 0, background: resolvedOv || NAVY, opacity: 0.22 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0b0b0f 0%, transparent 28%)" }} />
          </div>
        )}
        <div style={{ position: "absolute", top: 182, left: 56, zIndex: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {nicksOf(card)[0] && <span style={{ fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 22, color: "#cfd6e6", letterSpacing: 0.5 }}>{nicksOf(card).join("  ·  ")}</span>}
        </div>
        <FixedLogo card={card} id="l5Logo" label="Logo da capa" x={0.052} y={0.04} w={118} z={8} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "48%", padding: "0 24px 0 56px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(86, ts, { mont: true, leading: "1.02" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cfd6e6"), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index card={card} text={card.index} />}
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={halfRotCover} panCover={halfPanCover} />
            <div style={{ position: "absolute", inset: 0, background: resolvedOv || NAVY, opacity: 0.14 }} />
          </div>
        )}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "50%", padding: "0 56px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(24, 1, "#ef476f", { weight: 700 }), color: "var(--kicker-color, #ef476f)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(74, ts, { mont: true, color: "var(--title-color, #14213d)", leading: "1.02" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(33, bs, "#14213d", { serif: true }), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }
  if (card.layout === "l5-caixa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,15,.85), rgba(11,11,15,.25))", zIndex: 1 }} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 230, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <div style={{ ...headStyle(74, ts, { mont: true, color: "#fff" }), display: "inline-block", background: "var(--hl-color, #ef476f)", padding: "14px 26px", borderRadius: 6 }}><Rich text={card.headline} /></div>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#f5f5f5"), marginTop: 22 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index card={card} text={card.index} />}
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
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }
  if (card.layout === "l5-solucao") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "68%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, #0b0b0f 100%)" }} />
          </div>
        )}
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(78, ts, { mont: true, align: "center" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cfd6e6", { serif: true, align: "center" }), marginTop: 18 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index card={card} text={card.index} />}
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={2.2} panCover={sidePanCover} />
          </div>
        )}
        <div style={{ position: "absolute", left: 130, right: 130, top: 905, textAlign: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <div style={headStyle(40, ts, { serif: true, color: "var(--title-color, #14213d)", align: "center", leading: "1.2" })}><Rich text={card.headline} /></div>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(28, bs, "#5a6276", { serif: true, align: "center" }), marginTop: 14 }}><Rich text={card.body} /></div>}
        </div>
        {(() => {
          const e = fixed(card, "galleryBrand", { id: "galleryBrand", label: "Rodapé da galeria", kind: "text", x: 0.5, y: 0.944, text: "CÂNDIDO NETTO\n· N² SQUAD", size: 24, color: "#14213d", movable: true, sizable: true, editable: true, colorable: true });
          if (e.hidden) return null;
          const lines = (e.text || "").split("\n");
          return <div style={{ position: "absolute", left: `${e.x * 100}%`, top: `${e.y * 100}%`, transform: "translateX(-50%)", textAlign: "center", zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif", whiteSpace: "pre-line" }}>
            <span style={{ fontWeight: 800, fontSize: e.size ?? 24, letterSpacing: 2, color: e.color || "#14213d" }}>{lines[0]}</span>
            {lines.slice(1).join("\n") && <span style={{ fontSize: Math.max(12, (e.size ?? 24) * 0.75), color: "#ef476f", marginLeft: 10 }}>{lines.slice(1).join("\n")}</span>}
          </div>;
        })()}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ════════ LAYOUT 6 — manifesto fitness premium ════════
  if (card.layout === "l6-capa" || card.layout === "l6-fecho") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,15,.92) 0%, rgba(11,11,15,.55) 55%, rgba(11,11,15,.4) 100%)", zIndex: 1 }} />
        <L6Decor card={card} />
        {nicksOf(card)[0] && <span style={{ position: "absolute", top: 48, left: 64, zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 28, color: "#f5f5f5", letterSpacing: 0.5 }}>{nicksOf(card).join("  ·  ")}</span>}
        <div style={{ position: "absolute", left: 64, right: 80, bottom: 210, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(132, ts, { leading: "0.9" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#cfd6e6"), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        <BrandFooter card={card} align="center" />
        {card.index && <Index card={card} text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l6-historia") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,15,.95) 0%, rgba(11,11,15,.4) 42%, rgba(11,11,15,.5) 100%)", zIndex: 1 }} />
        <L6Decor card={card} />
        {nicksOf(card)[0] && <span style={{ position: "absolute", top: 48, left: 64, zIndex: 8, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 28, color: "#f5f5f5" }}>{nicksOf(card).join("  ·  ")}</span>}
        <div style={{ position: "absolute", left: 64, right: 80, bottom: 130, zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <span data-mv="kicker" style={{ ...l2Tag, transform: KSYNC }}>{card.kicker}</span>}
          {card.headline && <h2 style={{ ...headStyle(70, ts, { leading: "0.95" }), marginTop: 14 }}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#cfd6e6"), marginTop: 18 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index card={card} text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l6-manifesto") {
    return (
      <div style={{ ...canvas, background: card.bg || "#0b0b0f" }} className={grainCls}>
        <L6Decor card={card} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(104, ts, { align: "center", leading: "0.95" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#cfd6e6", { align: "center" }), marginTop: 24 }}><Rich text={card.body} /></div>}
        </div>
        <BrandFooter card={card} align="center" />
        {card.index && <Index card={card} text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }
  if (card.layout === "l6-lifestyle") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,15,.8) 0%, rgba(11,11,15,.2) 50%)", zIndex: 1 }} />
        <L6Decor card={card} />
        <div style={{ position: "absolute", left: 64, right: 80, bottom: 150, zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(70, ts, { leading: "0.95" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cfd6e6"), marginTop: 16 }}><Rich text={card.body} /></div>}
        </div>
        {card.index && <Index card={card} text={card.index} />}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
      </div>
    );
  }

  // ════════ LAYOUT 7 — científico / autoridade ════════
  if (card.layout === "l7-capa") {
    return (
      <div style={canvas} className={grainCls}>
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: resolvedOv || "#000000", opacity: 0.3, zIndex: 1 }} />
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
    const bulletMarker = fixed(card, "l7Bullet", { id: "l7Bullet", label: "Marcador dos bullets", kind: "marker", x: 0, y: 0, w: 18, h: 4, color: RED, sizable: true, colorable: true });
    return (
      <div style={{ ...canvas, background: card.bg || "#07111d" }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "60%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={narrowRotCover} panCover={narrowPanCover} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 30%, #07111d 78%)" }} />
          </div>
        )}
        <L7Chrome card={card} />
        <div style={{ position: "absolute", top: 150, bottom: 110, right: 0, width: "52%", padding: "0 80px 0 20px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(24, 1, "#ef476f", { weight: 700 }), color: "var(--kicker-color, #ef476f)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(64, ts, { color: "var(--title-color, #ef476f)" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#f5f5f5"), marginTop: 18 }}><Rich text={card.body} /></div>}
          {card.bullets && card.bullets.length > 0 && (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {card.bullets.map((b, i) => (<div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>{!bulletMarker.hidden && <span style={{ width: bulletMarker.w ?? 18, height: bulletMarker.h ?? 4, background: bulletMarker.color || RED, flexShrink: 0, transform: "translateY(-6px)" }} />}<span style={bodyOn(30, bs, "#cfd6e6")}><Rich text={b} /></span></div>))}
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
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: resolvedOv || "#07111d", opacity: 0.7, zIndex: 1 }} />
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />
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
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: resolvedOv || "#07111d", opacity: 0.3, zIndex: 1 }} />
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
        {card.image && <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />}
        <div style={{ position: "absolute", inset: 0, background: resolvedOv || "#07111d", opacity: 0.74, zIndex: 1 }} />
        <FixedBar card={card} h={6} />
        <FixedLogo card={card} id="l7Logo" label="Logo superior" x={0.42} y={0.033} w={172} />
        <div style={{ position: "absolute", inset: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 90px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(76, ts, { color: "var(--title-color, #ef476f)", align: "center", leading: "0.95" })}><Rich text={card.headline} /></h1>}
          {card.signoff && <div data-mv="signoff" style={{ marginTop: 40, border: "2px solid #fff", borderRadius: 8, padding: "20px 40px", color: "#fff", fontFamily: "var(--ct-font, 'Anton'), sans-serif", textTransform: "uppercase", fontSize: 46 * signoffScale, letterSpacing: 1, transform: SSYNC, transformOrigin: "center" }}>{card.signoff}</div>}
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
            {src && <Photo src={src} fx={ffx} fy={ffy} scale={fsc} rotate={frot} bw={photoBw} fit={photoFit} />}
            <div style={{ position: "absolute", inset: 0, background: resolvedOv || "#000000", opacity: 0.18 }} />
            {txt && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={headStyle(150, ts, { mont: true, color: "#fff", align: "center" })}><Rich text={txt} /></span></div>}
          </div>
        ))}
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }
  if (card.layout === "l8-ruptura") {
    return (
      <div style={{ ...canvas, background: card.bg || "#0b0b0f" }} className={grainCls}>
        {card.image && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}><Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} /></div>}
        {card.image2 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}><Photo src={card.image2} fx={0.5} fy={0.4} bw={photoBw} fit={photoFit} /></div>}
        <div style={{ position: "absolute", inset: 0, background: resolvedOv || "#07111d", opacity: 0.55, zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 90px", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h1 style={headStyle(92, ts, { mont: true, color: "#fff", align: "center", leading: "0.98" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(34, bs, "#f5f5f5", { align: "center" }), marginTop: 20 }}><Rich text={card.body} /></div>}
        </div>
        {card.logos !== undefined && <Logos card={card} />}
        <Decor card={card} />
        {card.index && <Index card={card} text={card.index} />}
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
        {card.index && <Index card={card} text={card.index} />}
      </div>
    );
  }

  // ════════ LAYOUT 9 — editorial minimalista (preto/cinza) ════════
  if (card.layout === "l9-capa") {
    return (
      <div style={{ ...canvas, background: card.bg || INK }} className={grainCls}>
        {card.image && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "62%" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />
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
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(24, 1, "#9aa0b0", { weight: 700 }), color: "var(--kicker-color, #9aa0b0)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h1 style={headStyle(148, ts, { leading: "0.88" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(36, bs, "#cfd0d4"), marginTop: 20 }}><Rich text={card.body} /></div>}
          {card.signoff && <div data-mv="signoff" style={{ alignSelf: "flex-start", marginTop: 24, border: "2px solid #f5f5f5", color: "#f5f5f5", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 26 * signoffScale, padding: "10px 22px", borderRadius: 30, transform: SSYNC, transformOrigin: "left center" }}>{card.signoff}</div>}
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
          {card.kicker && <div data-mv="kicker" style={{ display: "inline-block", background: "var(--kicker-color, #0b0b0f)", color: "#fff", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: 1, padding: "10px 22px", borderRadius: 14, marginBottom: 24, transform: KSYNC}}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(58, ts, { color: "var(--title-color, #0b0b0f)", align: "center", leading: "1.0" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#3a3d44", { align: "center" }), marginTop: 16 }}><Rich text={card.body} /></div>}
        </div>
        {card.image && (
          <div style={{ position: "absolute", bottom: 130, left: 120, right: 120, height: 380, borderRadius: 18, overflow: "hidden", boxShadow: "0 14px 40px rgba(0,0,0,.18)" }}>
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={sideRotCover} panCover={sidePanCover} />
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} rotCover={narrowRotCover} panCover={narrowPanCover} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${card.bg || INK} 4%, transparent 46%)` }} />
          </div>
        )}
        <L9Chrome card={card} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 64, width: "44%", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(24, 1, "#9aa0b0", { weight: 700 }), color: "var(--kicker-color, #9aa0b0)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(76, ts, { leading: "0.92" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cfd0d4"), marginTop: 18 }}><Rich text={card.body} /></div>}
          {card.signoff && <div data-mv="signoff" style={{ alignSelf: "flex-start", marginTop: 22, border: "2px solid #f5f5f5", color: "#f5f5f5", fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 26 * signoffScale, padding: "10px 22px", borderRadius: 30, transform: SSYNC, transformOrigin: "left center" }}>{card.signoff}</div>}
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
            <Photo src={card.image} fx={fx} fy={fy} scale={zoom} rotate={card.rotate} bw={photoBw} fit={photoFit} />
          </div>
        )}
        <L10Chrome card={card} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, textAlign: "center", zIndex: 5, transform: TSHIFT }}>
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(24, 1, GOLD, { align: "center" }), color: "var(--kicker-color, " + GOLD + ")", letterSpacing: 4, textTransform: "uppercase", marginBottom: 12, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h1 style={headStyle(94, ts, { serif: true, color: `var(--title-color, ${WARMW})`, align: "center", leading: "1.0" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(30, bs, "#cbb9b0", { serif: true, align: "center" }), marginTop: 14 }}><Rich text={card.body} /></div>}
          {card.signoff && <div data-mv="signoff" style={{ marginTop: 24, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 22 * signoffScale, letterSpacing: 3, color: GOLD, textTransform: "uppercase", display: "inline-block", transform: SSYNC, transformOrigin: "center" }}>{card.signoff}</div>}
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
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(22, 1, GOLD, { align: bodyAl || "left" }), color: "var(--kicker-color, " + GOLD + ")", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h2 style={headStyle(70, ts, { serif: true, color: `var(--title-color, ${WARMW})`, align: al || "left", leading: "1.08" })}><Rich text={card.headline} /></h2>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(32, bs, "#cbb9b0", { serif: true, align: bodyAl || "left" }), marginTop: 20 }}><Rich text={card.body} /></div>}
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
          {card.kicker && <div data-mv="kicker" style={{ ...bodyOn(24, 1, GOLD, { align: "center" }), color: "var(--kicker-color, " + GOLD + ")", letterSpacing: 4, textTransform: "uppercase", marginBottom: 24, transform: KSYNC }}>{card.kicker}</div>}
          {card.headline && <h1 style={{ ...headStyle(60, ts, { serif: true, color: `var(--title-color, ${WARMW})`, align: "center", leading: "1.08" }), border: `1px solid ${GOLD}`, padding: "40px 48px", borderRadius: 6 }}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(28, bs, "#cbb9b0", { serif: true, align: "center" }), marginTop: 22 }}><Rich text={card.body} /></div>}
        </div>
        <Decor card={card} />
        {card.logos !== undefined && <Logos card={card} />}
      </div>
    );
  }
  if (card.layout === "l10-resumo") {
    const check = fixed(card, "l10Check", { id: "l10Check", label: "Ícone do checklist", kind: "marker", x: 0, y: 0, text: "✓", size: 30, color: GOLD, sizable: true, editable: true, colorable: true });
    return (
      <div style={{ ...canvas, background: card.bg || WINE }} className={grainCls}>
        <L10Chrome card={card} />
        <div style={{ position: "absolute", top: 200, left: 90, right: 90, bottom: 160, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 5, transform: TSHIFT }}>
          {card.headline && <h2 style={headStyle(56, ts, { serif: true, color: `var(--title-color, ${WARMW})`, leading: "1.05" })}><Rich text={card.headline} /></h2>}
          {card.bullets && card.bullets.length > 0 && (
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 20 }}>
              {card.bullets.map((b, i) => (<div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline" }}>{!check.hidden && <span style={{ color: check.color || GOLD, fontFamily: "Georgia, serif", fontSize: check.size ?? 30 }}>{check.text || "✓"}</span>}<span style={bodyOn(30, bs, WARMW, { serif: true })}><Rich text={b} /></span></div>))}
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
          <FixedLogo card={card} id="l10Logo" label="Logo CTA" x={0.458} y={0.305} w={90} opacity={0.9} />
          {card.headline && <h1 style={headStyle(70, ts, { serif: true, color: `var(--title-color, ${WARMW})`, align: "center", leading: "1.05" })}><Rich text={card.headline} /></h1>}
          {card.body && <div data-mv="body" style={{ ...bodyOn(30, bs, "#cbb9b0", { serif: true, align: "center" }), marginTop: 18 }}><Rich text={card.body} /></div>}
          {card.signoff && <div data-mv="signoff" style={{ marginTop: 26, fontFamily: "var(--cb-font, 'Inter'), sans-serif", fontSize: 22 * signoffScale, letterSpacing: 3, color: GOLD, textTransform: "uppercase", display: "inline-block", transform: SSYNC, transformOrigin: "center" }}>{card.signoff}</div>}
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
