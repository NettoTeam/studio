"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Post, Carousel } from "@/lib/types";
import { computeDose, sequenceAlerts, convocacaoStatus, REGISTROS, REG_MAP, type Registro } from "@/lib/vitals";

const MES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendar({ onOpen, onPede }: { onOpen: (c: Carousel) => void; onPede?: (r: Registro) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cur, setCur] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [scope, setScope] = useState<"real" | "plan">("real"); // Dose: Real (publicado) × Planejado (agendado)
  const [week, setWeek] = useState<(Registro | "")[]>(["", "", "", "", "", "", ""]); // plano da semana (índice = getDay)
  const [weekDirty, setWeekDirty] = useState(false);

  useEffect(() => { fetch("/api/posts").then((r) => r.json()).then((d) => setPosts(d.posts || [])); }, []);
  useEffect(() => { fetch("/api/weekplan").then((r) => r.json()).then((d) => { if (Array.isArray(d.plan)) setWeek(d.plan); }); }, []);
  function setDay(i: number, r: Registro) { setWeek((w) => w.map((x, idx) => (idx === i ? (x === r ? "" : r) : x))); setWeekDirty(true); }
  async function saveWeek() { await fetch("/api/weekplan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: week }) }); setWeekDirty(false); }
  const todayDow = new Date().getDay();

  const startDow = new Date(cur.y, cur.m, 1).getDay();
  const days = new Date(cur.y, cur.m + 1, 0).getDate();
  const ym = `${cur.y}-${String(cur.m + 1).padStart(2, "0")}`;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  function postsOn(d: number) {
    const ds = `${ym}-${String(d).padStart(2, "0")}`;
    return posts.filter((p) => p.scheduledAt === ds);
  }
  function shift(n: number) {
    let m = cur.m + n, y = cur.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setCur({ y, m });
  }

  // arrastar conteúdo pra outro dia — instantâneo, salva por trás
  const dragId = useRef<string | null>(null);
  const [overDay, setOverDay] = useState<string | null>(null);
  function dropOn(ds: string) {
    const id = dragId.current; dragId.current = null; setOverDay(null);
    if (!id) return;
    const p = posts.find((x) => x.id === id);
    if (!p || p.scheduledAt === ds) return;
    const stage = (p.stage === "ideia" || p.stage === "desenvolvimento" || !p.stage) ? "agendado" : p.stage;
    const updated = { ...p, scheduledAt: ds, stage };
    setPosts((prev) => prev.map((x) => (x.id === id ? updated : x)));
    fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) }).catch(() => {});
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // SINAIS VITAIS — A Dose pelo PIPELINE (não só pela data agendada).
  // "Real" = o que FOI publicado; "Planejado" = o que está agendado. Mês = melhor data disponível.
  const ymOf = (p: Post) => (p.metrics?.postedAt || p.scheduledAt || p.createdAt || "").slice(0, 7);
  const scopePosts = posts.filter((p) =>
    scope === "real"
      ? p.stage === "publicado" && ymOf(p) === ym
      : (p.stage === "agendado" || (!!p.scheduledAt && p.stage !== "publicado")) && p.scheduledAt?.startsWith(ym)
  );
  const dose = computeDose(scopePosts.map((p) => p.registro));
  // sequência: ordena do mais antigo pro mais novo e olha a ORDEM
  const dateKey = (p: Post) => p.metrics?.postedAt || p.scheduledAt || p.createdAt || "";
  const ordered = [...scopePosts].sort((a, b) => dateKey(a).localeCompare(dateKey(b)));
  const seqAlerts = sequenceAlerts(ordered.map((p) => p.registro));
  const conv = convocacaoStatus(ordered.map((p) => p.registro)); // cadência do "pedido"

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <button onClick={() => shift(-1)} style={navb}>◄</button>
        <span style={{ fontWeight: 700, fontSize: 20 }}>{MES[cur.m]} {cur.y}</span>
        <button onClick={() => shift(1)} style={navb}>►</button>
        <span style={{ color: "#7c869c", fontSize: 12, marginLeft: 8 }}>arrasta um conteúdo pra outro dia pra reagendar 🖱️</span>
      </div>

      {/* A DOSE — como o mês tá dividido (Sinais Vitais) */}
      <div className="dg-panel" style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#fff", letterSpacing: 1 }}>🔥 A DOSE</span>
          <div style={{ display: "flex", gap: 2, background: "#101728", border: "1px solid #2a3552", borderRadius: 8, padding: 2 }}>
            {([["real", "Real (publicado)"], ["plan", "Planejado (agendado)"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setScope(v)} style={{ fontSize: 11.5, padding: "4px 11px", borderRadius: 6, cursor: "pointer", border: "none", background: scope === v ? "#3a1424" : "transparent", color: scope === v ? "#ff6b8f" : "#9aa0b0", fontWeight: scope === v ? 700 : 400 }}>{l}</button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#8a93a8" }}>{dose.total} {dose.total === 1 ? "post" : "posts"} · {MES[cur.m].toLowerCase()}</span>
        </div>
        {dose.total === 0 ? (
          <div style={{ fontSize: 13, color: "#7c869c" }}>Nenhum post {scope === "real" ? "publicado" : "agendado"} e <b style={{ color: "#cfcfcf" }}>marcado com registro</b> em {MES[cur.m].toLowerCase()}. No <b style={{ color: "#cfcfcf" }}>Quadro</b>, marca o registro (🩷 🔥 🧠 ⚔️) e {scope === "real" ? "move pra Publicado" : "agenda uma data"} — aí o ritmo aparece aqui.</div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dose.rows.map((row) => (
                <div key={row.info.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 108, fontSize: 13, color: "#cfcfcf", flexShrink: 0 }}>{row.info.emoji} {row.info.label}</span>
                  <div style={{ flex: 1, height: 14, background: "#101728", borderRadius: 7, overflow: "hidden", position: "relative", border: "1px solid #2a3552" }}>
                    <div style={{ width: `${Math.round(row.pct * 100)}%`, height: "100%", background: row.info.color, opacity: row.status === "ok" ? 0.85 : 1, transition: "width .2s" }} />
                    {/* marca da meta */}
                    <div title={`meta ~${Math.round(row.info.target * 100)}%`} style={{ position: "absolute", left: `${Math.round(row.info.target * 100)}%`, top: -2, bottom: -2, width: 2, background: "#fff", opacity: 0.25 }} />
                  </div>
                  <span style={{ width: 42, textAlign: "right", fontSize: 12, color: "#cfcfcf", flexShrink: 0 }}>{Math.round(row.pct * 100)}%</span>
                  <span style={{ width: 130, fontSize: 11.5, flexShrink: 0, color: row.status === "ok" ? "#5e8a5e" : row.status === "alto" ? "#e08" : "#c99020" }}>{row.nota}</span>
                </div>
              ))}
            </div>
            {dose.alarme ? (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #2a3552", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#e8c860" }}>⚠ {dose.alarme}</span>
                {dose.pede && <span style={{ fontSize: 13, color: "#cfcfcf" }}>O ritmo pede <b style={{ color: REG_MAP[dose.pede].color }}>{REG_MAP[dose.pede].emoji} {REG_MAP[dose.pede].label}</b>.</span>}
                {dose.pede && onPede && (
                  <button onClick={() => onPede(dose.pede!)} className="dg-btn-primary" style={{ fontSize: 12, padding: "6px 13px" }}>
                    criar {REG_MAP[dose.pede].emoji} {REG_MAP[dose.pede].label} →
                  </button>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #2a3552", fontSize: 13, color: "#5e8a5e" }}>✓ ritmo equilibrado{dose.total < 3 ? " (poucos posts ainda — marca mais pra afinar a leitura)" : ""}.</div>
            )}
            {seqAlerts.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {seqAlerts.map((a, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: "#cfcfcf", display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ color: "#e8a020", flexShrink: 0 }}>⚠ sequência</span>
                    <span>{a.msg}</span>
                  </div>
                ))}
              </div>
            )}
            {/* CONVOCAÇÃO — o pedido, por cadência (não por proporção) */}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #2a3552", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: REG_MAP.convocacao.color, flexShrink: 0 }}>⚔️ o pedido</span>
              {conv.pede ? (
                <>
                  <span style={{ fontSize: 12.5, color: "#cfcfcf" }}>
                    {conv.never
                      ? `${conv.n} posts e nenhuma convocação no mês — só entregou, nunca chamou pra dentro. Já mereceu pedir.`
                      : `${conv.desde} posts desde a última convocação — entregou bastante, hora de chamar pra dentro.`}
                  </span>
                  {onPede && (
                    <button onClick={() => onPede("convocacao")} className="dg-btn-primary" style={{ fontSize: 12, padding: "6px 13px" }}>
                      criar ⚔️ Convocação →
                    </button>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 12.5, color: "#5e8a5e" }}>
                  {conv.never ? "ainda cedo no mês — entrega antes de chamar." : `✓ já chamou há ${conv.desde} ${conv.desde === 1 ? "post" : "posts"} — segue entregando.`}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* PLANO DA SEMANA — diretriz proativa: qual registro em cada dia (Sinais Vitais) */}
      <div className="dg-panel" style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#fff", letterSpacing: 1 }}>📋 PLANO DA SEMANA</span>
          <span style={{ fontSize: 11.5, color: "#7c869c" }}>o registro de cada dia — vira a diretriz &quot;hoje é dia de X&quot; na tela Hoje</span>
          <span style={{ flex: 1 }} />
          {weekDirty && <button onClick={saveWeek} className="dg-btn-primary" style={{ fontSize: 12, padding: "5px 13px" }}>salvar plano</button>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 10 }}>
          {DOW.map((d, dow) => (
            <div key={d} style={{ background: dow === todayDow ? "#1a1424" : "#101728", border: "1px solid " + (dow === todayDow ? "#5a1c2c" : "#2a3552"), borderRadius: 8, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: dow === todayDow ? "#ef476f" : "#8a93a8", fontWeight: 700, marginBottom: 7 }}>{d}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {REGISTROS.map((r) => {
                  const on = week[dow] === r.id;
                  return (
                    <button key={r.id} onClick={() => setDay(dow, r.id)} title={r.label}
                      style={{ fontSize: 13, padding: "3px 0", borderRadius: 6, cursor: "pointer", lineHeight: 1.1,
                        background: on ? r.color + "26" : "transparent", color: on ? r.color : "#56607c",
                        border: "1px solid " + (on ? r.color : "#2a3552"), fontWeight: on ? 700 : 400 }}>
                      {r.emoji}{on ? " " + r.label.slice(0, 3) : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {DOW.map((d) => <div key={d} style={{ color: "#7c869c", fontSize: 12, textAlign: "center", paddingBottom: 4 }}>{d}</div>)}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const ds = `${ym}-${String(d).padStart(2, "0")}`;
          const list = postsOn(d);
          const isToday = ds === todayStr;
          const isOver = overDay === ds;
          return (
            <div key={i}
              onDragOver={(e) => { e.preventDefault(); if (overDay !== ds) setOverDay(ds); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverDay((o) => (o === ds ? null : o)); }}
              onDrop={() => dropOn(ds)}
              style={{ minWidth: 0, minHeight: 96, background: isOver ? "#1a1424" : "#101728", border: "1px solid " + (isOver ? "#ef476f" : isToday ? "#ef476f" : "#2a3552"), outline: isOver ? "2px dashed #ef476f" : "none", borderRadius: 8, padding: 6, transition: "background .12s" }}>
              <div style={{ fontSize: 12, color: isToday ? "#ef476f" : "#8a93a8", fontWeight: isToday ? 700 : 400, marginBottom: 4 }}>{d}</div>
              {list.map((p) => (
                <div key={p.id} draggable
                  onDragStart={(e) => { dragId.current = p.id; e.dataTransfer.effectAllowed = "move"; }}
                  onDragEnd={() => { dragId.current = null; setOverDay(null); }}
                  onClick={() => onOpen(p.carousel)} title={p.tema + (p.registro ? ` · ${REG_MAP[p.registro].label}` : "")}
                  style={{ background: "#241420", border: "1px solid " + (p.registro ? REG_MAP[p.registro].color + "88" : "#5a1c2c"), borderLeft: p.registro ? `3px solid ${REG_MAP[p.registro].color}` : "1px solid #5a1c2c", color: "#f0c4d0", fontSize: 10, borderRadius: 4, padding: "3px 5px", marginBottom: 3, cursor: "grab", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.registro ? REG_MAP[p.registro].emoji + " " : ""}{(p.carousel.cards[0]?.headline || p.tema).replace(/\*\*/g, "")}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ color: "#7c869c", fontSize: 13, marginTop: 14 }}>Pra agendar um conteúdo novo: vá no <b style={{ color: "#cfcfcf" }}>Quadro</b> e escolha a data no card. Aqui você <b style={{ color: "#cfcfcf" }}>arrasta entre os dias</b> pra reagendar e clica pra abrir no editor.</div>
    </div>
  );
}

const navb: CSSProperties = { background: "#1b2a4a", color: "#f5f5f5", border: "1px solid #2a3552", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 16 };
