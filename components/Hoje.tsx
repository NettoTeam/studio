"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/types";
import { computeDose, sequenceAlerts, REG_MAP, type Registro } from "@/lib/vitals";

export default function Hoje({ onNovo, onResume, onPede, onHook, onGoto, hasDraft, draftLabel }: {
  onNovo: () => void;
  onResume: () => void;
  onPede: (r: Registro) => void;
  onHook: (p: Post) => void;
  onGoto: (v: string) => void;
  hasDraft: boolean;
  draftLabel: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [week, setWeek] = useState<(Registro | "")[]>(["", "", "", "", "", "", ""]);
  useEffect(() => { fetch("/api/posts").then((r) => r.json()).then((d) => setPosts(d.posts || [])); }, []);
  useEffect(() => { fetch("/api/weekplan").then((r) => r.json()).then((d) => { if (Array.isArray(d.plan)) setWeek(d.plan); }); }, []);
  const hojeReg = week[new Date().getDay()] || "";

  const ym = new Date().toISOString().slice(0, 7);
  const hojeStr = new Date().toISOString().slice(0, 10);
  const ymOf = (p: Post) => (p.metrics?.postedAt || p.scheduledAt || p.createdAt || "").slice(0, 7);

  const realPosts = posts.filter((p) => p.stage === "publicado" && ymOf(p) === ym);
  const dose = computeDose(realPosts.map((p) => p.registro));
  const ordered = [...realPosts].sort((a, b) => (a.metrics?.postedAt || a.scheduledAt || a.createdAt || "").localeCompare(b.metrics?.postedAt || b.scheduledAt || b.createdAt || ""));
  const seq = sequenceAlerts(ordered.map((p) => p.registro));

  const ganchos = posts.filter((p) => p.savedHook && (p.stage === "ideia" || !p.stage));
  const agendados = posts.filter((p) => p.scheduledAt && p.scheduledAt >= hojeStr).sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || "")).slice(0, 5);

  const card: React.CSSProperties = { padding: 18, marginBottom: 14 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 920 }}>
      {/* HERO */}
      <div className="dg-panel" style={{ ...card, padding: 22 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#fff", letterSpacing: 1, lineHeight: 1 }}>O QUE VOCÊ VAI POSTAR HOJE?</div>
        <div style={{ color: "#9aa0b0", fontSize: 14, margin: "8px 0 18px" }}>Começa do zero ou pega uma ideia que já te acendeu. A escrita sai na voz da marca.</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onNovo} className="dg-btn-primary" style={{ padding: "12px 24px", fontSize: 15 }}>✍️ Criar do zero</button>
          <button onClick={() => onGoto("marca")} className="dg-btn" style={{ padding: "12px 20px" }}>✦ Ver pautas</button>
          <button onClick={() => onGoto("quadro")} className="dg-btn" style={{ padding: "12px 20px" }}>▦ Abrir o Quadro</button>
        </div>
      </div>

      {/* DIRETRIZ DE HOJE (plano da semana) */}
      {hojeReg && (
        <div className="dg-box" style={{ ...card, borderLeft: `3px solid ${REG_MAP[hojeReg].color}` }}>
          <div className="dg-kicker" style={{ marginBottom: 6 }}>📋 A diretriz de hoje</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, color: "#cfcfcf" }}>O plano pede <b style={{ color: REG_MAP[hojeReg].color }}>{REG_MAP[hojeReg].emoji} {REG_MAP[hojeReg].label}</b> — {REG_MAP[hojeReg].o_que}.</span>
            <button onClick={() => onPede(hojeReg)} className="dg-btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>criar {REG_MAP[hojeReg].emoji} {REG_MAP[hojeReg].label} →</button>
          </div>
        </div>
      )}

      {/* CONTINUE DE ONDE PAROU */}
      {hasDraft && (
        <div className="dg-box" style={{ ...card, borderLeft: "3px solid #ef476f" }}>
          <div className="dg-kicker" style={{ marginBottom: 6 }}>↻ Continue de onde parou</div>
          <div style={{ color: "#cfcfcf", fontSize: 13.5, lineHeight: 1.5, marginBottom: 12, maxHeight: 60, overflow: "hidden" }}>{draftLabel || "Você tem um rascunho em aberto."}</div>
          <button onClick={onResume} className="dg-btn-primary" style={{ padding: "9px 18px", fontSize: 14 }}>abrir esse rascunho →</button>
        </div>
      )}

      {/* O RITMO PEDE (Dose) */}
      <div className="dg-box" style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span className="dg-kicker">🔥 O ritmo da marca</span>
          <span style={{ fontSize: 11.5, color: "#7c869c" }}>publicados de {ym.slice(5)} · {dose.total} marcados</span>
          <span style={{ flex: 1 }} />
          <button onClick={() => onGoto("calendario")} className="dg-btn" style={{ fontSize: 11.5, padding: "4px 11px" }}>ver A Dose →</button>
        </div>
        {dose.pede ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "#cfcfcf" }}>O ritmo pede <b style={{ color: REG_MAP[dose.pede].color }}>{REG_MAP[dose.pede].emoji} {REG_MAP[dose.pede].label}</b> — {REG_MAP[dose.pede].o_que}.</span>
            <button onClick={() => onPede(dose.pede!)} className="dg-btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>criar {REG_MAP[dose.pede].emoji} {REG_MAP[dose.pede].label} →</button>
          </div>
        ) : dose.total >= 3 ? (
          <div style={{ fontSize: 13.5, color: "#5e8a5e" }}>✓ ritmo equilibrado este mês.</div>
        ) : (
          <div style={{ fontSize: 13, color: "#7c869c" }}>Marca o registro dos teus posts publicados (no Quadro) pra eu ler o ritmo.</div>
        )}
        {seq.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
            {seq.map((a, i) => <div key={i} style={{ fontSize: 12.5, color: "#cfcfcf" }}><span style={{ color: "#e8a020" }}>⚠</span> {a.msg}</div>)}
          </div>
        )}
      </div>

      {/* GANCHOS SALVOS */}
      {ganchos.length > 0 && (
        <div className="dg-box" style={card}>
          <div className="dg-kicker" style={{ marginBottom: 10 }}>🎣 Ganchos salvos ({ganchos.length}) — prontos pra virar carrossel</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ganchos.map((p) => (
              <div key={p.id} style={{ background: "#101728", border: "1px solid #2a3552", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1, fontSize: 13.5, color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>{(p.savedHook?.capa || p.tema || "").replace(/\*\*/g, "")}</div>
                <button onClick={() => onHook(p)} className="dg-btn-primary" style={{ fontSize: 12.5, padding: "7px 14px", whiteSpace: "nowrap" }}>virar carrossel →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRÓXIMOS AGENDADOS */}
      {agendados.length > 0 && (
        <div className="dg-box" style={card}>
          <div className="dg-kicker" style={{ marginBottom: 10 }}>◷ Próximos agendados</div>
          {agendados.map((p) => (
            <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "5px 0", fontSize: 13.5, color: "#cfcfcf" }}>
              <span style={{ color: "#5b8def", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, width: 54 }}>{p.scheduledAt?.slice(5)}</span>
              {p.registro && <span title={REG_MAP[p.registro].label}>{REG_MAP[p.registro].emoji}</span>}
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(p.carousel?.cards?.[0]?.headline || p.tema || "").replace(/\*\*/g, "")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
