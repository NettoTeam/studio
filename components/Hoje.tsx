"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/types";
import { computeDose, sequenceAlerts, REG_MAP, type Registro } from "@/lib/vitals";

function ActionIcon({ name }: { name: "pen" | "plus" | "grid" | "refresh" | "wave" | "calendar" | "hook" }) {
  const c = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "pen": return <svg {...c}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>;
    case "plus": return <svg {...c}><path d="M12 5v14M5 12h14" /></svg>;
    case "grid": return <svg {...c}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 4v16" /></svg>;
    case "refresh": return <svg {...c}><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v6h-6" /></svg>;
    case "wave": return <svg {...c}><path d="M4 12h2M8 8v8M12 5v14M16 9v6M20 12h-2" /></svg>;
    case "calendar": return <svg {...c}><rect x="3" y="4.5" width="18" height="16.5" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>;
    case "hook": return <svg {...c}><path d="M8 5a4 4 0 0 1 8 0v8a5 5 0 0 1-10 0" /><path d="M12 3v10" /></svg>;
  }
}

function Arrow() {
  return <span className="hoje-arrow">→</span>;
}

function DraftMark() {
  return (
    <div className="hoje-draft-mark" aria-hidden="true">
      <ActionIcon name="pen" />
    </div>
  );
}

function RhythmOrb() {
  return (
    <div className="hoje-rhythm-orb" aria-hidden="true">
      <ActionIcon name="wave" />
    </div>
  );
}

function MiniTrend() {
  return (
    <svg className="hoje-mini-trend" viewBox="0 0 260 96" aria-hidden="true">
      <defs>
        <linearGradient id="trendLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ef476f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff6f99" />
        </linearGradient>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ef476f" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ef476f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M8 82 L38 70 L72 72 L112 45 L154 43 L198 54 L246 14 L246 96 L8 96 Z" fill="url(#trendFill)" />
      <path d="M8 82 L38 70 L72 72 L112 45 L154 43 L198 54 L246 14" fill="none" stroke="url(#trendLine)" strokeWidth="2.4" />
      {[8, 38, 72, 112, 154, 198, 246].map((x, i) => {
        const y = [82, 70, 72, 45, 43, 54, 14][i];
        return <circle key={x} cx={x} cy={y} r={3.2} fill="#ff6f99" />;
      })}
    </svg>
  );
}

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

  return (
    <div className="hoje-stack">
      <section className="dg-hero hoje-hero">
        <div className="hoje-hero__media" aria-hidden="true">
          <div className="hoje-hero__image" />
          <div className="hoje-hero__blend" />
          <div className="hoje-hero__mesh" />
        </div>
        <div className="hoje-hero__content">
          <h2 className="hoje-hero-title">
            <span>O QUE VOCÊ VAI</span>
            <strong>POSTAR HOJE?</strong>
          </h2>
          <p>Começa do zero ou pega uma ideia que já te acendeu. A escrita sai na voz da marca</p>
          <div className="hoje-actions">
            <button onClick={onNovo} className="hoje-action hoje-action--primary" type="button"><ActionIcon name="pen" />Criar do zero <Arrow /></button>
            <button onClick={() => onGoto("marca")} className="hoje-action" type="button"><ActionIcon name="plus" />Ver pautas</button>
            <button onClick={() => onGoto("quadro")} className="hoje-action" type="button"><ActionIcon name="grid" />Abrir o Quadro</button>
          </div>
        </div>
      </section>

      {hasDraft && (
        <section className="hoje-card hoje-draft-card">
          <div className="hoje-card-copy">
            <div className="hoje-kicker"><ActionIcon name="refresh" />CONTINUE DE ONDE PAROU</div>
            <p>{draftLabel || "Você tem um rascunho em aberto"}</p>
            <button onClick={onResume} className="hoje-action hoje-action--ghost" type="button">Abrir esse rascunho <Arrow /></button>
          </div>
          <div className="hoje-draft-side">
            <span>Retomar último rascunho</span>
            <DraftMark />
          </div>
        </section>
      )}

      {hojeReg && (
        <section className="hoje-card hoje-directive-card" style={{ ["--today-color" as string]: REG_MAP[hojeReg].color }}>
          <div>
            <div className="hoje-kicker">A DIRETRIZ DE HOJE</div>
            <p>O plano pede <b>{REG_MAP[hojeReg].emoji} {REG_MAP[hojeReg].label}</b> — {REG_MAP[hojeReg].o_que}</p>
          </div>
          <button onClick={() => onPede(hojeReg)} className="hoje-action hoje-action--ghost" type="button">Criar {REG_MAP[hojeReg].label} <Arrow /></button>
        </section>
      )}

      <section className="hoje-card hoje-rhythm-card">
        <RhythmOrb />
        <div className="hoje-rhythm-copy">
          <div className="hoje-kicker">O RITMO DA MARCA <span>publicados de {ym.slice(5)} · {dose.total} marcados</span></div>
          {dose.pede ? (
            <p>O ritmo pede <b style={{ color: REG_MAP[dose.pede].color }}>{REG_MAP[dose.pede].emoji} {REG_MAP[dose.pede].label}</b> — {REG_MAP[dose.pede].o_que}</p>
          ) : dose.total >= 3 ? (
            <p>Ritmo equilibrado este mês</p>
          ) : (
            <p>Marca o registro dos teus posts publicados (no Quadro) pra eu ler o ritmo</p>
          )}
          {seq.length > 0 && <div className="hoje-alerts">{seq.map((a, i) => <span key={i}>{a.msg}</span>)}</div>}
        </div>
        <button onClick={() => onGoto("calendario")} className="hoje-action hoje-action--ghost hoje-dose-btn" type="button">Ver a Dose <Arrow /></button>
        <MiniTrend />
      </section>

      {ganchos.length > 0 && (
        <section className="hoje-card hoje-list-card">
          <div className="hoje-kicker"><ActionIcon name="hook" />Ganchos salvos ({ganchos.length}) — prontos pra virar carrossel</div>
          <div className="hoje-list">
            {ganchos.map((p) => (
              <div key={p.id} className="hoje-list-row">
                <div>{(p.savedHook?.capa || p.tema || "").replace(/\*\*/g, "")}</div>
                <button onClick={() => onHook(p)} className="hoje-action hoje-action--mini" type="button">Virar carrossel <Arrow /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      {agendados.length > 0 && (
        <section className="hoje-card hoje-list-card">
          <div className="hoje-kicker"><ActionIcon name="calendar" />Próximos agendados</div>
          <div className="hoje-list">
            {agendados.map((p) => (
              <div key={p.id} className="hoje-list-row">
                <span className="hoje-date">{p.scheduledAt?.slice(5)}</span>
                {p.registro && <span title={REG_MAP[p.registro].label}>{REG_MAP[p.registro].emoji}</span>}
                <div>{(p.carousel?.cards?.[0]?.headline || p.tema || "").replace(/\*\*/g, "")}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
