"use client";

import { useEffect, useRef, useState } from "react";
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
    <div className="studio-page">
      <section className="studio-hero calendar-hero">
        <div className="studio-hero__copy">
          <h2>Ritmo, dose e agenda no mesmo mapa</h2>
          <p>Visualize o mês, ajuste a cadência dos registros e reorganize conteúdos agendados com clareza</p>
        </div>
        <div className="studio-hero__side calendar-register-legend" aria-label="Legenda dos registros">
          {REGISTROS.map((r) => (
            <div key={r.id} className="calendar-register-item" style={{ ["--reg-color" as string]: r.color }}>
              <span className="calendar-register-copy">
                <strong>{r.emoji} {r.label}</strong>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-section studio-section--pad calendar-toolbar">
        <button onClick={() => shift(-1)} className="calendar-nav-btn" type="button">‹</button>
        <span className="calendar-month-title">{MES[cur.m]} {cur.y}</span>
        <button onClick={() => shift(1)} className="calendar-nav-btn" type="button">›</button>
        <span className="studio-muted">Arraste conteúdos entre dias para reagendar</span>
      </section>

      {/* A DOSE — como o mês tá dividido (Sinais Vitais) */}
      <section className="studio-section studio-section--pad">
        <div className="studio-section-head">
          <h3>A Dose</h3>
          <p>{dose.total} {dose.total === 1 ? "post" : "posts"} em {MES[cur.m].toLowerCase()}</p>
          <span className="spacer" />
          <div style={{ display: "flex", gap: 2, background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 9, padding: 2 }}>
            {([["real", "Real (publicado)"], ["plan", "Planejado (agendado)"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setScope(v)} style={{ fontSize: 11.5, padding: "4px 11px", borderRadius: 6, cursor: "pointer", border: "none", background: scope === v ? "#3a1424" : "transparent", color: scope === v ? "#ff6b8f" : "#9aa0b0", fontWeight: scope === v ? 700 : 400 }}>{l}</button>
            ))}
          </div>
        </div>
        {dose.total === 0 ? (
          <div className="studio-empty">Nenhum post {scope === "real" ? "publicado" : "agendado"} e marcado com registro em {MES[cur.m].toLowerCase()}</div>
        ) : (
          <>
            <div className="dose-bars">
              {dose.rows.map((row) => (
                <div key={row.info.id} className="dose-row">
                  <span className="dose-label">{row.info.emoji} {row.info.label}</span>
                  <div className="dose-track">
                    <div className="dose-fill" style={{ width: `${Math.round(row.pct * 100)}%`, background: row.info.color, opacity: row.status === "ok" ? 0.85 : 1 }} />
                    {/* marca da meta */}
                    <div className="dose-goal" title={`meta ~${Math.round(row.info.target * 100)}%`} style={{ left: `${Math.round(row.info.target * 100)}%` }} />
                  </div>
                  <span style={{ textAlign: "right", fontSize: 12, color: "#cfcfcf" }}>{Math.round(row.pct * 100)}%</span>
                  <span className="dose-note" style={{ fontSize: 11.5, color: row.status === "ok" ? "#6bd482" : row.status === "alto" ? "#ff6f99" : "#d0a541" }}>{row.nota}</span>
                </div>
              ))}
            </div>
            {dose.alarme ? (
              <div className="studio-row studio-row--wrap" style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 13, color: "#e8c860" }}>⚠ {dose.alarme}</span>
                {dose.pede && <span style={{ fontSize: 13, color: "#cfcfcf" }}>O ritmo pede <b style={{ color: REG_MAP[dose.pede].color }}>{REG_MAP[dose.pede].emoji} {REG_MAP[dose.pede].label}</b></span>}
                {dose.pede && onPede && (
                  <button onClick={() => onPede(dose.pede!)} className="dg-btn-primary" style={{ fontSize: 12, padding: "6px 13px" }}>
                    criar {REG_MAP[dose.pede].emoji} {REG_MAP[dose.pede].label} →
                  </button>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "#6bd482" }}>✓ ritmo equilibrado{dose.total < 3 ? " (poucos posts ainda)" : ""}</div>
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
            <div className="studio-row studio-row--wrap" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: 12.5, color: REG_MAP.convocacao.color, flexShrink: 0 }}>⚔️ o pedido</span>
              {conv.pede ? (
                <>
                  <span style={{ fontSize: 12.5, color: "#cfcfcf" }}>
                    {conv.never
                      ? `${conv.n} posts e nenhuma convocação no mês — só entregou, nunca chamou pra dentro; já mereceu pedir`
                      : `${conv.desde} posts desde a última convocação — entregou bastante, hora de chamar pra dentro`}
                  </span>
                  {onPede && (
                    <button onClick={() => onPede("convocacao")} className="dg-btn-primary" style={{ fontSize: 12, padding: "6px 13px" }}>
                      criar ⚔️ Convocação →
                    </button>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 12.5, color: "#5e8a5e" }}>
                  {conv.never ? "ainda cedo no mês — entrega antes de chamar" : `✓ já chamou há ${conv.desde} ${conv.desde === 1 ? "post" : "posts"} — segue entregando`}
                </span>
              )}
            </div>
          </>
        )}
      </section>

      {/* PLANO DA SEMANA — diretriz proativa: qual registro em cada dia (Sinais Vitais) */}
      <section className="studio-section studio-section--pad">
        <div className="studio-section-head">
          <h3>Plano da semana</h3>
          <p>registro de cada dia</p>
          <span className="spacer" />
          {weekDirty && <button onClick={saveWeek} className="dg-btn-primary" style={{ fontSize: 12, padding: "5px 13px" }}>salvar plano</button>}
        </div>
        <div className="week-grid">
          {DOW.map((d, dow) => (
            <div key={d} className={"week-day" + (dow === todayDow ? " is-today" : "")}>
              <div className="week-name">{d}</div>
              <div className="week-options">
                {REGISTROS.map((r) => {
                  const on = week[dow] === r.id;
                  return (
                    <button key={r.id} onClick={() => setDay(dow, r.id)} title={r.label}
                      className={"week-reg-btn" + (on ? " is-on" : "")}
                      style={{ ["--reg-color" as string]: r.color }}>
                      {r.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-section studio-section--pad">
      <div className="calendar-grid">
        {DOW.map((d) => <div key={d} className="calendar-dow">{d}</div>)}
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
              className={"calendar-day" + (isToday ? " is-today" : "") + (isOver ? " is-over" : "")}>
              <div className="calendar-day-num">{d}</div>
              {list.map((p) => (
                <div key={p.id} draggable
                  onDragStart={(e) => { dragId.current = p.id; e.dataTransfer.effectAllowed = "move"; }}
                  onDragEnd={() => { dragId.current = null; setOverDay(null); }}
                  onClick={() => onOpen(p.carousel)} title={p.tema + (p.registro ? ` · ${REG_MAP[p.registro].label}` : "")}
                  className="calendar-event"
                  style={{ ["--event-color" as string]: p.registro ? REG_MAP[p.registro].color : "#ef476f" }}>
                  {p.registro ? REG_MAP[p.registro].emoji + " " : ""}{(p.carousel.cards[0]?.headline || p.tema).replace(/\*\*/g, "")}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      </section>
      <div className="studio-note">Para agendar um conteúdo novo, use a data no card do Quadro. Aqui a grade serve para reagendar e abrir o editor</div>
    </div>
  );
}
