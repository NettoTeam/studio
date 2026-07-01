"use client";

import { useState, useEffect } from "react";
import { REGISTROS, type Registro } from "@/lib/vitals";

type ReelFormato = "falado" | "conversa" | "pov_trend";
type ReelStage = "novo" | "rascunho" | "gravado" | "publicado" | "descartado";
type Funil = "topo" | "meio" | "fundo";

interface ReelIdea {
  id: string;
  titulo: string;
  descricao: string;
  formato: ReelFormato;
  angulo: string;
  dicaGravacao: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  stage: ReelStage;
  isBase?: boolean;
  feedback?: string;
  engajamento?: string;
}

interface GeneratedIdea {
  titulo: string;
  descricao: string;
  formato: ReelFormato;
  angulo: string;
  dicaGravacao: string;
  tags?: string[];
}

const FORMATO_INFO: Record<ReelFormato, { label: string; color: string; bg: string; emoji: string; desc: string }> = {
  falado:    { label: "Vídeo Falado",  color: "#f59e0b", bg: "rgba(245,158,11,.12)", emoji: "🎙",  desc: "câmera + B-roll de exercícios" },
  conversa:  { label: "Conversa",      color: "#5fd38a", bg: "rgba(95,211,138,.12)",  emoji: "🏋",  desc: "academia, natural, com ou sem alguém" },
  pov_trend: { label: "POV / Trend",   color: "#78aaff", bg: "rgba(120,170,255,.12)", emoji: "🎬",  desc: "visual, legenda, trending" },
};

const STAGE_LABELS: Record<ReelStage, string> = {
  novo:       "novo",
  rascunho:   "rascunho",
  gravado:    "gravado",
  publicado:  "publicado",
  descartado: "descartado",
};

export default function ReelsPage() {
  // Tab
  const [tab, setTab] = useState<"gerar" | "rascunhos">("gerar");

  // Geração
  const [nIdeas, setNIdeas] = useState(15);
  const [formatos, setFormatos] = useState<Set<ReelFormato>>(new Set(["falado", "conversa", "pov_trend"]));
  const [funil, setFunil] = useState<Funil | "">("");
  const [registro, setRegistro] = useState<Registro | "">("");
  const [contexto, setContexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);

  // Seleção e ações em lote
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expandedDica, setExpandedDica] = useState<number | null>(null);
  const [savedIdxs, setSavedIdxs] = useState<Set<number>>(new Set());
  const [saveMsg, setSaveMsg] = useState("");

  const [tomOpen, setTomOpen] = useState(false);

  // Rascunhos
  const [drafts, setDrafts] = useState<ReelIdea[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftFilter, setDraftFilter] = useState<"todos" | ReelStage | "base">("todos");
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [draftFeedback, setDraftFeedback] = useState<Record<string, string>>({});
  const [draftEngaj, setDraftEngaj] = useState<Record<string, string>>({});
  const [learnMsg, setLearnMsg] = useState("");
  const [learnLoading, setLearnLoading] = useState(false);
  const [learnings, setLearnings] = useState<{ summary: string; updatedAt: string; n: number } | null>(null);
  const [learningsOpen, setLearningsOpen] = useState(false);

  useEffect(() => {
    if (tab === "rascunhos" && drafts.length === 0 && !draftsLoading) {
      setDraftsLoading(true);
      fetch("/api/reel-ideas")
        .then(r => r.json())
        .then(d => { setDrafts(d.ideas || []); setDraftsLoading(false); })
        .catch(() => setDraftsLoading(false));
      fetch("/api/reel-learn")
        .then(r => r.json())
        .then(d => { if (d.learnings) setLearnings(d.learnings); })
        .catch(() => {});
    }
  }, [tab]);

  async function gerar() {
    if (loading) return;
    setLoading(true);
    setErr("");
    setIdeas([]);
    setSelected(new Set());
    setSavedIdxs(new Set());
    try {
      const r = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nIdeas, formatos: Array.from(formatos), contexto, funil: funil || undefined, registro: registro || undefined }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao gerar");
      setIdeas(d.ideias || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  }

  function toggleFormato(f: ReelFormato) {
    setFormatos(prev => {
      const next = new Set(prev);
      if (next.has(f) && next.size > 1) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  function toggleSelect(idx: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  function selectAll() { setSelected(new Set(ideas.map((_, i) => i))); }
  function clearSelect() { setSelected(new Set()); }

  async function salvarSelecionados(opts: { isBase?: boolean } = {}) {
    const toSave = Array.from(selected).map(i => ideas[i]).filter(Boolean);
    if (!toSave.length) return;
    const now = new Date().toISOString();
    const base = Date.now();
    const saved: ReelIdea[] = [];
    await Promise.all(toSave.map(async (idea, i) => {
      const post: ReelIdea = {
        id: `ri_${base}_${i}`,
        titulo: idea.titulo,
        descricao: idea.descricao,
        formato: idea.formato,
        angulo: idea.angulo,
        dicaGravacao: idea.dicaGravacao,
        tags: idea.tags,
        stage: "rascunho",
        isBase: opts.isBase || false,
        createdAt: now,
        updatedAt: now,
      };
      const r = await fetch("/api/reel-ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(post) });
      const d = await r.json();
      if (d.idea) saved.push(d.idea);
    }));
    setDrafts(prev => [...saved, ...prev.filter(p => !saved.find(s => s.id === p.id))]);
    setSavedIdxs(prev => { const next = new Set(prev); selected.forEach(i => next.add(i)); return next; });
    setSaveMsg(opts.isBase ? `${saved.length} salvos como base ⭐` : `${saved.length} salvos em rascunhos ✓`);
    setSelected(new Set());
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function descartarSelecionados() {
    const toRemove = Array.from(selected);
    setIdeas(prev => prev.filter((_, i) => !toRemove.includes(i)));
    setSelected(new Set());
    setSavedIdxs(prev => {
      const next = new Set<number>();
      prev.forEach(i => { const newI = i - toRemove.filter(r => r < i).length; if (newI >= 0) next.add(newI); });
      return next;
    });
  }

  async function salvarIdeia(idea: GeneratedIdea, idx: number, opts: { isBase?: boolean } = {}) {
    const now = new Date().toISOString();
    const post: ReelIdea = {
      id: `ri_${Date.now()}_${idx}`,
      titulo: idea.titulo,
      descricao: idea.descricao,
      formato: idea.formato,
      angulo: idea.angulo,
      dicaGravacao: idea.dicaGravacao,
      tags: idea.tags,
      stage: "rascunho",
      isBase: opts.isBase || false,
      createdAt: now,
      updatedAt: now,
    };
    const r = await fetch("/api/reel-ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(post) });
    const d = await r.json();
    if (d.idea) {
      setDrafts(prev => [d.idea, ...prev.filter(p => p.id !== d.idea.id)]);
      setSavedIdxs(prev => new Set([...prev, idx]));
      setSaveMsg(opts.isBase ? "salvo como base ⭐" : "rascunho salvo ✓");
      setTimeout(() => setSaveMsg(""), 2500);
    }
  }

  async function atualizarDraft(id: string, patch: Partial<ReelIdea>) {
    const existing = drafts.find(p => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await fetch("/api/reel-ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setDrafts(prev => prev.map(p => p.id === id ? updated : p));
  }

  async function deletarDraft(id: string) {
    await fetch(`/api/reel-ideas?id=${id}`, { method: "DELETE" });
    setDrafts(prev => prev.filter(p => p.id !== id));
    if (expandedDraft === id) setExpandedDraft(null);
  }

  async function aprenderComReels() {
    setLearnLoading(true); setLearnMsg("");
    const r = await fetch("/api/reel-learn", { method: "POST" });
    const d = await r.json();
    if (d.learnings) { setLearnings(d.learnings); setLearningsOpen(true); setLearnMsg("aprendizado atualizado ✓"); }
    else setLearnMsg(d.error || "Erro");
    setLearnLoading(false);
    setTimeout(() => setLearnMsg(""), 3000);
  }

  const filteredDrafts = drafts.filter(d => {
    if (draftFilter === "todos") return d.stage !== "descartado";
    if (draftFilter === "base") return d.isBase;
    return d.stage === draftFilter;
  });

  const rascunhosCount = drafts.filter(d => d.stage !== "descartado").length;

  return (
    <div className="studio-page reels-page">
      <section className="studio-hero reels-hero">
        <div className="studio-hero__copy">
          <h2>Banco de ideias de Reels</h2>
          <p>Gera temas pensados no seu estilo e história. Salva os que curtir, descarta o resto, e a IA aprende com o que performa.</p>
        </div>
      </section>

      <section className="studio-section studio-section--pad">
        {/* Tabs */}
        <div className="stories-mode-tabs">
          <button type="button" onClick={() => setTab("gerar")} className={tab === "gerar" ? "is-active" : ""}>
            Gerar ideias
          </button>
          <button type="button" onClick={() => { setTab("rascunhos"); }} className={tab === "rascunhos" ? "is-active" : ""}>
            Banco salvo
            {rascunhosCount > 0 && <span className="stories-tab-badge">{rascunhosCount}</span>}
          </button>
        </div>

        {/* ── ABA GERAR ── */}
        {tab === "gerar" && (
          <div className="reels-form">
            <div className="studio-section-head">
              <div>
                <h3>Gerar ideias</h3>
                <p>Escolhe quantas ideias, quais formatos e adiciona contexto se quiser. Depois seleciona o que presta.</p>
              </div>
            </div>

            <div className="reels-form-body">
              {/* Quantidade */}
              <div className="stories-field">
                <span>Quantas ideias?</span>
                <div className="reels-n-chips">
                  {[10, 15, 20, 25, 30].map(n => (
                    <button key={n} type="button" onClick={() => setNIdeas(n)} className={`reels-n-chip${nIdeas === n ? " is-on" : ""}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formatos */}
              <div className="stories-field">
                <span>Formatos</span>
                <div className="reels-format-chips">
                  {(["falado", "conversa", "pov_trend"] as ReelFormato[]).map(f => {
                    const info = FORMATO_INFO[f];
                    const on = formatos.has(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFormato(f)}
                        className={`reels-format-chip${on ? " is-on" : ""}`}
                        style={on ? { borderColor: info.color, color: info.color, background: info.bg } : {}}
                      >
                        <span className="reels-format-chip-emoji">{info.emoji}</span>
                        <span>
                          <strong>{info.label}</strong>
                          <small>{info.desc}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Funil */}
              <div className="stories-field">
                <span>Etapa do funil <small style={{ color: "#5b6480", fontWeight: 400 }}>— a IA adapta o objetivo das ideias</small></span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                  {([
                    { id: "topo",  emoji: "🔍", label: "Topo",  desc: "atrair atenção",       detail: "Descoberta · alcance · curiosidade · viral", color: "#22c55e" },
                    { id: "meio",  emoji: "📚", label: "Meio",  desc: "construir autoridade",  detail: "Educação · confiança · método · profundidade", color: "#3b82f6" },
                    { id: "fundo", emoji: "🎯", label: "Fundo", desc: "gerar conversão",       detail: "Decisão · provas · quebra de objeções · CTA",  color: "#ef476f" },
                  ] as const).map(f => {
                    const on = funil === f.id;
                    return (
                      <button key={f.id} type="button" onClick={() => setFunil(on ? "" : f.id)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, fontSize: 13,
                          padding: "8px 14px", borderRadius: 9, cursor: "pointer", flex: "1 1 140px",
                          background: on ? f.color + "18" : "var(--dg-sunken)", color: on ? f.color : "#9aa0b0",
                          border: "1px solid " + (on ? f.color : "var(--dg-line)"), fontWeight: on ? 700 : 500 }}>
                        <span>{f.emoji} {f.label}{on ? " ✓" : ""} <span style={{ fontWeight: 400, fontSize: 11.5 }}>— {f.desc}</span></span>
                        <span style={{ fontSize: 10.5, color: on ? f.color + "cc" : "#5a6378", fontWeight: 400 }}>{f.detail}</span>
                      </button>
                    );
                  })}
                </div>
                {!funil && <div style={{ fontSize: 10.5, color: "#5b6480", marginTop: 5 }}>sem etapa = a IA decide o foco pelo conteúdo</div>}
              </div>

              {/* Tom / Registro (colapsável) */}
              {(() => {
                const regAtual = REGISTROS.find(r => r.id === registro) ?? null;
                return (
                  <div className={`stories-field reels-tom-field${tomOpen ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className={`reels-tom-toggle${tomOpen ? " is-open" : ""}`}
                      onClick={() => setTomOpen(o => !o)}
                      aria-expanded={tomOpen}
                      aria-controls="reels-tom-panel"
                    >
                      <span className="reels-tom-toggle-left">
                        <span className="reels-tom-toggle-title">
                          <span className="reels-tom-toggle-label">TOM DO REEL</span>
                          <small>— A IA ESCREVE NAS IDEIAS NESTE REGISTRO</small>
                        </span>
                        {regAtual ? (
                          <span className="reels-tom-active-pill" style={{ color: regAtual.color, background: regAtual.color + "22", borderColor: regAtual.color + "55" }}>
                            {regAtual.emoji} {regAtual.label}
                          </span>
                        ) : (
                          <span className="reels-tom-auto-pill">automático · 6 tons mistos</span>
                        )}
                      </span>
                      <span className="reels-tom-arrow">{tomOpen ? "▲" : "▼"}</span>
                    </button>

                    {tomOpen && (
                      <div id="reels-tom-panel" className="reels-tom-body">
                        <p className="reels-tom-hint">Seleciona um tom específico ou mantém automático (mescla todos)</p>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 6 }}>
                          {/* Botão Automático */}
                          <button
                            type="button"
                            onClick={() => setRegistro("")}
                            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, fontSize: 13,
                              padding: "7px 12px", borderRadius: 9, cursor: "pointer", minWidth: 110,
                              background: !registro ? "rgba(90,99,120,.2)" : "var(--dg-sunken)",
                              color: !registro ? "#c8cfe0" : "#9aa0b0",
                              border: "1px solid " + (!registro ? "rgba(90,99,120,.5)" : "var(--dg-line)"),
                              fontWeight: !registro ? 700 : 500 }}
                          >
                            <span>✦ Automático{!registro ? " ✓" : ""}</span>
                            <span style={{ fontSize: 10.5, color: !registro ? "#9aa0b0" : "#5b6480", fontWeight: 400 }}>mescla os 6 tons</span>
                          </button>

                          {REGISTROS.map(r => {
                            const on = registro === r.id;
                            return (
                              <button key={r.id} type="button" title={r.o_que} onClick={() => setRegistro(r.id)}
                                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, fontSize: 13,
                                  padding: "7px 12px", borderRadius: 9, cursor: "pointer", minWidth: 110,
                                  background: on ? r.color + "22" : "var(--dg-sunken)", color: on ? r.color : "#9aa0b0",
                                  border: "1px solid " + (on ? r.color : "var(--dg-line)"), fontWeight: on ? 700 : 500 }}>
                                <span>{r.emoji} {r.label}{on ? " ✓" : ""}</span>
                                <span style={{ fontSize: 10.5, color: on ? r.color : "#5b6480", fontWeight: 400 }}>{r.o_que}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Contexto */}
              <div className="stories-field">
                <span>Contexto do momento <small style={{ color: "#5b6480", fontWeight: 400 }}>(opcional)</small></span>
                <textarea
                  value={contexto}
                  onChange={e => setContexto(e.target.value)}
                  rows={2}
                  placeholder="ex: foco em glúteo esse mês / Nath começou novo ciclo / quero falar mais de mentalidade"
                  className="studio-textarea"
                />
              </div>

              <button
                onClick={gerar}
                disabled={loading}
                className="dg-btn-primary stories-primary-btn reels-gerar-btn"
              >
                {loading ? "gerando ideias..." : `Gerar ${nIdeas} ideias`}
              </button>
            </div>

            {err && <div className="stories-error">⚠ {err}</div>}

            {/* Barra de ação em lote */}
            {selected.size > 0 && (
              <div className="reels-batch-bar">
                <span className="reels-batch-count">{selected.size} selecionadas</span>
                <button onClick={() => salvarSelecionados()} className="dg-btn-primary reels-batch-btn">
                  salvar rascunho
                </button>
                <button onClick={() => salvarSelecionados({ isBase: true })} className="dg-btn reels-batch-btn">
                  ⭐ salvar base
                </button>
                <button onClick={descartarSelecionados} className="dg-btn reels-batch-discard">
                  descartar
                </button>
                <button onClick={clearSelect} className="reels-batch-clear">limpar seleção</button>
              </div>
            )}
            {saveMsg && !selected.size && <p className="rotina-autosave-msg">{saveMsg}</p>}

            {/* Grid de resultados */}
            {ideas.length > 0 && (
              <>
                <div className="reels-results-head">
                  <span className="reels-results-count">{ideas.length} ideias geradas</span>
                  <button type="button" onClick={selectAll} className="reels-select-all">selecionar tudo</button>
                </div>

                <div className="reels-grid">
                  {ideas.map((idea, idx) => {
                    const info = FORMATO_INFO[idea.formato];
                    const isSel = selected.has(idx);
                    const isSaved = savedIdxs.has(idx);
                    const dicaOpen = expandedDica === idx;
                    return (
                      <div
                        key={idx}
                        className={`reels-card${isSel ? " is-selected" : ""}${isSaved ? " is-saved" : ""}`}
                        onClick={() => toggleSelect(idx)}
                      >
                        {/* Checkbox visual */}
                        <div className={`reels-card-check${isSel ? " is-on" : ""}`}>
                          {isSel ? "✓" : ""}
                        </div>

                        {/* Header */}
                        <div className="reels-card-head">
                          <span
                            className="reel-formato-badge"
                            style={{ color: info.color, background: info.bg }}
                          >
                            {info.emoji} {info.label}
                          </span>
                          {isSaved && <span className="reel-saved-pill">salvo ✓</span>}
                        </div>

                        <h4 className="reels-card-titulo">{idea.titulo}</h4>
                        <p className="reels-card-descricao">{idea.descricao}</p>

                        <div className="reels-card-angulo">
                          <span className="reels-card-angulo-label">Ângulo</span>
                          <span>{idea.angulo}</span>
                        </div>

                        {/* Dica de gravação (expansível) */}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setExpandedDica(dicaOpen ? null : idx); }}
                          className="reels-dica-toggle"
                        >
                          {dicaOpen ? "▲" : "▼"} dica de gravação
                        </button>
                        {dicaOpen && (
                          <div className="reels-dica-body" onClick={e => e.stopPropagation()}>
                            {idea.dicaGravacao}
                          </div>
                        )}

                        {/* Tags */}
                        {idea.tags && idea.tags.length > 0 && (
                          <div className="reel-tags">
                            {idea.tags.map((t, ti) => <span key={ti} className="reel-tag">{t}</span>)}
                          </div>
                        )}

                        {/* Ações individuais */}
                        <div className="reels-card-actions" onClick={e => e.stopPropagation()}>
                          {!isSaved && (
                            <>
                              <button onClick={() => salvarIdeia(idea, idx)} className="dg-btn reels-card-btn">
                                salvar rascunho
                              </button>
                              <button onClick={() => salvarIdeia(idea, idx, { isBase: true })} className="dg-btn reels-card-btn">
                                ⭐ base
                              </button>
                            </>
                          )}
                          {isSaved && <span className="reels-card-saved-msg">salvo ✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ABA RASCUNHOS ── */}
        {tab === "rascunhos" && (
          <div className="drafts-section reels-drafts">
            <div className="studio-section-head">
              <div>
                <h3>Banco de ideias salvas</h3>
                <p>Adiciona feedback depois de gravar ou publicar — a IA aprende com o que funciona.</p>
              </div>
              <div className="reels-draft-head-actions">
                <button onClick={aprenderComReels} disabled={learnLoading} className="dg-btn reels-learn-btn">
                  {learnLoading ? "analisando..." : "⚡ aprender com esses reels"}
                </button>
                {learnMsg && <span className="stories-saved">{learnMsg}</span>}
              </div>
            </div>

            {/* Learnings accordion */}
            {learnings && (
              <div className="drafts-learn-card">
                <button type="button" onClick={() => setLearningsOpen(o => !o)} className="drafts-learn-toggle">
                  <span>O que a IA aprendeu ({learnings.n} reels analisados — {new Date(learnings.updatedAt).toLocaleDateString("pt-BR")})</span>
                  <span>{learningsOpen ? "▲" : "▼"}</span>
                </button>
                {learningsOpen && <p className="drafts-learn-body">{learnings.summary}</p>}
              </div>
            )}

            {/* Filtros */}
            <div className="drafts-filter">
              {([
                ["todos", "Todos"],
                ["rascunho", "Rascunho"],
                ["gravado", "Gravado"],
                ["publicado", "Publicado"],
                ["base", "⭐ Base"],
              ] as const).map(([k, l]) => (
                <button key={k} type="button" onClick={() => setDraftFilter(k)} className={`drafts-filter-btn${draftFilter === k ? " is-on" : ""}`}>
                  {l}
                  {k === "todos" && ` (${drafts.filter(d => d.stage !== "descartado").length})`}
                </button>
              ))}
            </div>

            {draftsLoading && <div className="rotina-skeleton" style={{ marginTop: 16 }}><div /><div /><div /></div>}

            {!draftsLoading && filteredDrafts.length === 0 && (
              <p className="stories-empty">Nenhuma ideia salva nessa categoria ainda.</p>
            )}

            <div className="reels-grid">
              {filteredDrafts.map(idea => {
                const info = FORMATO_INFO[idea.formato as ReelFormato] || FORMATO_INFO.falado;
                const isExpanded = expandedDraft === idea.id;
                return (
                  <div key={idea.id} className={`reels-card reels-card--draft${idea.isBase ? " is-base" : ""}`}>
                    <div className="reels-card-head">
                      <span className="reel-formato-badge" style={{ color: info.color, background: info.bg }}>
                        {info.emoji} {info.label}
                      </span>
                      {idea.isBase && <span className="draft-badge--base">⭐ base</span>}
                      <span className={`draft-badge--${idea.stage}`}>{STAGE_LABELS[idea.stage as ReelStage] || idea.stage}</span>
                    </div>

                    <h4 className="reels-card-titulo">{idea.titulo}</h4>
                    <p className="reels-card-descricao">{idea.descricao}</p>

                    <div className="reels-card-angulo">
                      <span className="reels-card-angulo-label">Ângulo</span>
                      <span>{idea.angulo}</span>
                    </div>

                    {idea.tags && idea.tags.length > 0 && (
                      <div className="reel-tags">
                        {idea.tags.map((t, ti) => <span key={ti} className="reel-tag">{t}</span>)}
                      </div>
                    )}

                    {/* Ações do rascunho */}
                    <div className="reels-card-actions" style={{ justifyContent: "space-between" }}>
                      <select
                        value={idea.stage}
                        onChange={e => atualizarDraft(idea.id, { stage: e.target.value as ReelStage })}
                        className="studio-input reel-stage-select"
                        onClick={e => e.stopPropagation()}
                      >
                        {(["rascunho", "gravado", "publicado", "descartado"] as ReelStage[]).map(s => (
                          <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => atualizarDraft(idea.id, { isBase: !idea.isBase })}
                        className={`dg-btn reels-card-btn${idea.isBase ? " is-base-on" : ""}`}
                        title={idea.isBase ? "Remover da base" : "Marcar como base"}
                      >
                        ⭐
                      </button>
                      <button
                        onClick={() => setExpandedDraft(isExpanded ? null : idea.id)}
                        className="dg-btn reels-card-btn"
                        title="Adicionar feedback"
                      >
                        {isExpanded ? "fechar" : "+ feedback"}
                      </button>
                      <button onClick={() => deletarDraft(idea.id)} className="draft-delete-btn" title="Apagar">✕</button>
                    </div>

                    {/* Painel de feedback */}
                    {isExpanded && (
                      <div className="draft-feedback-panel">
                        <label className="stories-field">
                          <span>Como foi gravar / o que achei</span>
                          <textarea
                            value={draftFeedback[idea.id] ?? (idea.feedback || "")}
                            onChange={e => setDraftFeedback(prev => ({ ...prev, [idea.id]: e.target.value }))}
                            rows={2}
                            placeholder="ex: ângulo ficou fraco, mudaria o gancho..."
                            className="studio-textarea"
                          />
                        </label>
                        <label className="stories-field">
                          <span>Engajamento / resultado</span>
                          <textarea
                            value={draftEngaj[idea.id] ?? (idea.engajamento || "")}
                            onChange={e => setDraftEngaj(prev => ({ ...prev, [idea.id]: e.target.value }))}
                            rows={1}
                            placeholder="ex: 4k views, 30 seguidores novos, 8 DMs"
                            className="studio-textarea"
                          />
                        </label>
                        <button
                          onClick={() => {
                            atualizarDraft(idea.id, {
                              feedback: draftFeedback[idea.id] ?? idea.feedback,
                              engajamento: draftEngaj[idea.id] ?? idea.engajamento,
                            });
                            setExpandedDraft(null);
                          }}
                          className="dg-btn-primary stories-primary-btn"
                        >
                          salvar feedback
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
