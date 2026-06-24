"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Post, Stage, Carousel } from "@/lib/types";
import { REGISTROS, type Registro } from "@/lib/vitals";
import { toast } from "@/lib/toast";
import Modal from "@/components/Modal";

const STAGE_NAME: Record<string, string> = { ideia: "Ideias", desenvolvimento: "Em desenvolvimento", agendado: "Agendado", publicado: "Publicado", arquivado: "Arquivado" };

const STAGES: { key: Stage; name: string; color: string }[] = [
  { key: "ideia", name: "Ideias", color: "#8b5cf6" },
  { key: "desenvolvimento", name: "Em desenvolvimento", color: "#6366f1" },
  { key: "agendado", name: "Agendado", color: "#3b82f6" },
  { key: "publicado", name: "Publicado", color: "#22c55e" },
  { key: "arquivado", name: "Arquivado", color: "#6b7280" },
];

const mini: CSSProperties = { fontSize: 11, background: "transparent", color: "#cfcfcf", border: "1px solid #2a3552", borderRadius: 5, padding: "3px 7px", cursor: "pointer" };
const ta = (size: number, weight: number): CSSProperties => ({ width: "100%", background: "var(--dg-sunken)", color: "var(--dg-text)", border: "1px solid var(--dg-line)", borderRadius: 7, padding: "7px 9px", fontSize: size, fontWeight: weight, lineHeight: 1.45, resize: "vertical", fontFamily: "inherit" });
const fieldLbl: CSSProperties = { fontSize: 10, color: "var(--dg-faint)", textTransform: "uppercase", letterSpacing: 1 };

export default function Board({ onOpen, onCreate }: { onOpen: (c: Carousel) => void; onCreate?: (post: Post) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => { if (alive) setPosts(d.posts || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // salva por trás SEM recarregar a lista (tela já reagiu) — fluidez
  function persist(updated: Post) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) }).catch(() => {});
  }
  function setDate(p: Post, d: string) {
    const stage = d && (p.stage === "ideia" || p.stage === "desenvolvimento" || !p.stage) ? "agendado" : p.stage;
    persist({ ...p, scheduledAt: d || undefined, stage });
    if (d) toast(`📅 agendado pra ${d.slice(5)}`);
  }
  function del(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/posts?id=${id}`, { method: "DELETE" }).catch(() => {});
    toast("Removido do Quadro");
  }
  function setRegistro(p: Post, r: Registro) {
    persist({ ...p, registro: p.registro === r ? undefined : r });
  }
  // PRÉVIA/EDIÇÃO da ideia: expande o card pra ver o gancho completo + contexto antes de decidir
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ed, setEd] = useState({ content: "", capa: "", abertura: "" });
  function toggleExpand(p: Post) {
    if (expandedId === p.id) { setExpandedId(null); return; }
    setExpandedId(p.id);
    setEd({ content: p.content || "", capa: p.savedHook?.capa || "", abertura: p.savedHook?.abertura || "" });
  }
  function saveEdits(p: Post) {
    const hasHook = ed.capa.trim() || ed.abertura.trim();
    persist({ ...p, content: ed.content.trim() || undefined, savedHook: hasHook ? { capa: ed.capa, abertura: ed.abertura } : p.savedHook });
    toast("✓ alterações salvas");
  }

  // ---- arrastar e soltar ----
  const dragId = useRef<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  function dropOn(stage: Stage) {
    const id = dragId.current; dragId.current = null; setOver(null);
    if (!id) return;
    const p = posts.find((x) => x.id === id);
    if (!p || (p.stage || "ideia") === stage) return;
    persist({ ...p, stage });
    toast(`Movido pra ${STAGE_NAME[stage] || stage}`);
  }

  const [ideaText, setIdeaText] = useState("");
  async function addIdea() {
    const t = ideaText.trim(); if (!t) return;
    setIdeaText("");
    const r = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tema: t, stage: "ideia", type: "carrossel", carousel: { tema: t, cards: [] } }) });
    const d = await r.json();
    if (d.post) { setPosts((prev) => [d.post, ...prev]); toast("💡 ideia adicionada ao Quadro"); }
  }

  const totalPosts = posts.length;
  const totalAgendados = posts.filter((p) => p.stage === "agendado" || p.scheduledAt).length;
  const totalPublicados = posts.filter((p) => p.stage === "publicado").length;

  return (
    <div className="studio-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>Quadro vivo do conteúdo</h2>
          <p>Ideias, roteiros, agendamentos e publicados em uma esteira visual para decidir o próximo movimento sem perder contexto</p>
        </div>
        <div className="studio-hero__side" aria-hidden="true">
          <div className="studio-stat"><strong>{totalPosts}</strong><span>Total</span></div>
          <div className="studio-stat"><strong>{totalAgendados}</strong><span>Agendados</span></div>
          <div className="studio-stat"><strong>{totalPublicados}</strong><span>Publicados</span></div>
          <div className="studio-stat"><strong>{STAGES.length}</strong><span>Etapas</span></div>
        </div>
      </section>

    <div className="studio-section board-quick-add">
      <input value={ideaText} onChange={(e) => setIdeaText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addIdea()}
        placeholder="Joga uma ideia rapida" className="studio-input" style={{ flex: 1 }} />
      <button className="dg-btn-primary" onClick={addIdea} style={{ padding: "0 18px" }}>+ Ideia</button>
    </div>
    <div className="board-columns">
      {STAGES.map((st) => {
        const items = posts.filter((p) => (p.stage || "ideia") === st.key);
        const isOver = over === st.key;
        return (
          <section key={st.key} className="board-column" style={{ ["--stage-color" as string]: st.color }}
            onDragOver={(e) => { e.preventDefault(); if (over !== st.key) setOver(st.key); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver((o) => (o === st.key ? null : o)); }}
            onDrop={() => dropOn(st.key)}>
            <div className="board-column-head">
              <span className="board-column-name">{st.name}</span>
              <span className="board-count">{String(items.length).padStart(2, "0")}</span>
            </div>
            <div className={"board-dropzone" + (isOver ? " is-over" : "")}>
              {items.map((p) => (
                <div key={p.id} draggable
                  onDragStart={(e) => { dragId.current = p.id; e.dataTransfer.effectAllowed = "move"; }}
                  onDragEnd={() => { dragId.current = null; setOver(null); }}
                  className="dg-card board-card">
                  <div onClick={() => toggleExpand(p)} title="ver gancho + contexto" className="board-card-title">
                    <span className="board-expand">⤢</span>
                    <span>{(p.carousel.cards[0]?.headline || p.tema || "").replace(/\*\*/g, "").slice(0, 80)}</span>
                  </div>
                  <div className="board-tags">
                    <span className="board-tag">{p.type || "carrossel"}</span>
                    {p.savedHook && <span className="board-tag board-tag--gold" title="ideia com gancho salvo">gancho</span>}
                    {p.scheduledAt && <span className="board-tag board-tag--blue">{p.scheduledAt.slice(5)}</span>}
                    {p.metrics?.salvamentos ? <span className="board-tag board-tag--green">{p.metrics.salvamentos} salv</span> : null}
                  </div>
                  {/* SINAIS VITAIS — registro do post */}
                  <div className="board-vitals" title="o registro emocional do post (Sinais Vitais)">
                    {REGISTROS.map((r) => {
                      const on = p.registro === r.id;
                      return (
                        <button key={r.id} onClick={() => setRegistro(p, r.id)} title={r.label + " — " + r.o_que}
                          style={{ fontSize: 10, lineHeight: 1.4, padding: "2px 7px", borderRadius: 11, cursor: "pointer",
                            background: on ? r.color + "26" : "transparent", color: on ? r.color : "#7c869c",
                            border: "1px solid " + (on ? r.color : "#2a3552"), fontWeight: on ? 700 : 400 }}>
                          {r.emoji} {on ? r.label : ""}
                        </button>
                      );
                    })}
                  </div>
                  <div className="board-actions">
                    {p.carousel.cards.length === 0 ? (
                      <button onClick={() => onCreate?.(p)} style={{ ...mini, color: "#ef476f", borderColor: "#5a1c2c" }} title={p.savedHook ? "abre no Criar com o gancho salvo travado" : "abre no Criar pra escrever o roteiro na voz da marca"}>{p.savedHook ? "✍️ escrever (gancho)" : "✍️ escrever"}</button>
                    ) : (
                      <button onClick={() => onOpen(p.carousel)} style={mini}>abrir</button>
                    )}
                    <input type="date" value={p.scheduledAt || ""} onChange={(e) => setDate(p, e.target.value)}
                      onClick={(e) => { try { (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.(); } catch {} }}
                      style={{ ...mini, padding: "2px 6px", cursor: "pointer" }} title="agendar dia (clica pra abrir o calendário)" />
                    <button onClick={() => del(p.id)} style={{ ...mini, color: "#e0738c" }}>×</button>
                  </div>
                </div>
              ))}
              {!items.length && <div className="studio-empty">{isOver ? "Soltar aqui" : "Vazio"}</div>}
            </div>
          </section>
        );
      })}
    </div>
    {(() => {
      const p = posts.find((x) => x.id === expandedId);
      if (!p) return null;
      return (
        <Modal title="🎣 Prévia da ideia" onClose={() => setExpandedId(null)} maxWidth={580}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--dg-white)", lineHeight: 1.35, marginBottom: 2 }}>{(p.tema || "").replace(/\*\*/g, "")}</div>
            {(p.savedHook || ed.capa || ed.abertura) && (
              <>
                <div style={fieldLbl}>🎣 Capa do gancho <span style={{ textTransform: "none", letterSpacing: 0 }}>(** = rosa)</span></div>
                <textarea value={ed.capa} onChange={(e) => setEd({ ...ed, capa: e.target.value })} rows={2} style={ta(14, 700)} placeholder="a capa que soca" />
                <div style={fieldLbl}>Abertura do roteiro</div>
                <textarea value={ed.abertura} onChange={(e) => setEd({ ...ed, abertura: e.target.value })} rows={4} style={ta(13.5, 400)} placeholder="a primeira fala do roteiro" />
              </>
            )}
            <div style={fieldLbl}>Contexto / ideia</div>
            <textarea value={ed.content} onChange={(e) => setEd({ ...ed, content: e.target.value })} rows={4} style={ta(13.5, 400)} placeholder="o tema / ângulo que você salvou — pra lembrar do que se trata" />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--dg-line-soft)" }}>
              <button onClick={() => saveEdits(p)} className="dg-btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>salvar alterações</button>
              <button onClick={() => { if (p.carousel.cards.length === 0) onCreate?.(p); else onOpen(p.carousel); setExpandedId(null); }} className="dg-btn" style={{ fontSize: 13 }}>{p.carousel.cards.length === 0 ? "✍️ escrever" : "abrir no editor"}</button>
              <span style={{ flex: 1 }} />
              <button onClick={() => { del(p.id); setExpandedId(null); }} style={{ ...mini, color: "#e0738c", borderColor: "#3a1c28", fontSize: 12.5, padding: "6px 12px" }}>excluir ideia</button>
            </div>
          </div>
        </Modal>
      );
    })()}
    </div>
  );
}
