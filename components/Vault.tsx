"use client";

import { useEffect, useRef, useState } from "react";
import CarouselCard from "@/components/CarouselCard";
import Markdown from "@/components/Markdown";
import Modal from "@/components/Modal";
import type { Post, Metrics, Carousel } from "@/lib/types";
import { performanceScores, measuredCount, isMeasured, NOTA_MINIMA_OURO, MIN_MEDIDOS_OURO } from "@/lib/score";
import { toast } from "@/lib/toast";

const METRIC_FIELDS: { key: keyof Metrics; label: string }[] = [
  { key: "alcance", label: "Alcance" },
  { key: "visualizacoes", label: "Visualizações" },
  { key: "salvamentos", label: "Salvamentos" },
  { key: "compartilhamentos", label: "Compart" },
  { key: "encaminhamentos", label: "Encaminh ✈" },
  { key: "comentarios", label: "Comentários" },
  { key: "curtidas", label: "Curtidas" },
  { key: "visitasPerfil", label: "Visitas perfil" },
  { key: "seguidores", label: "Seguidores +" },
  { key: "dms", label: "DMs" },
  { key: "vendas", label: "Vendas" },
];

export default function Vault({ onOpen }: { onOpen: (c: Carousel) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Metrics>({});
  const [fbDraft, setFbDraft] = useState("");
  const [reading, setReading] = useState(false);
  const [readMsg, setReadMsg] = useState("");
  const [showMedidos, setShowMedidos] = useState(false);
  const printRef = useRef<HTMLInputElement>(null);

  // Instagram — todos os posts com dados reais
  type IgMedia = { id: string; caption?: string; mediaType?: string; productType?: string; timestamp?: string; permalink?: string; thumbnail?: string; likes: number; comments: number; reach?: number; saved?: number; shares?: number; views?: number };
  type IgSnap = { username?: string; followers?: number; mediaCount?: number; media: IgMedia[]; fetchedAt: string };
  const [ig, setIg] = useState<IgSnap | null>(null);
  const [igBusy, setIgBusy] = useState(false);
  const [igOrder, setIgOrder] = useState<"recentes" | "alcance" | "engajamento">("alcance");
  const [igShow, setIgShow] = useState(true);
  useEffect(() => {
    fetch("/api/instagram/insights").then(r => r.json()).then(d => { if (d.snapshot) setIg(d.snapshot); }).catch(() => {});
  }, []);
  async function atualizarIg() {
    if (igBusy) return;
    setIgBusy(true);
    try {
      const r = await fetch("/api/instagram/insights", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setIg(d.snapshot);
      toast("Instagram atualizado ✓");
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setIgBusy(false); }
  }
  const fmtN = (n?: number) => n == null ? "--" : n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n);
  const igMedia = [...(ig?.media || [])].sort((a, b) => {
    if (igOrder === "alcance") return (b.reach || 0) - (a.reach || 0);
    if (igOrder === "engajamento") return ((b.likes + b.comments + (b.saved || 0) + (b.shares || 0)) - (a.likes + a.comments + (a.saved || 0) + (a.shares || 0)));
    return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
  });
  const IG_TIPO: Record<string, { label: string; color: string }> = {
    REELS: { label: "Reels", color: "#78aaff" }, FEED: { label: "Feed", color: "#5fd38a" },
    CAROUSEL_ALBUM: { label: "Carrossel", color: "#f59e0b" }, IMAGE: { label: "Foto", color: "#5fd38a" }, VIDEO: { label: "Vídeo", color: "#78aaff" },
  };
  // nota de performance real (mesma lógica do "aprender com o que bombou")
  function igScore(m: IgMedia): number {
    const reach = m.reach || 0, saves = m.saved || 0, shares = m.shares || 0;
    const eng = m.likes + m.comments + saves + shares;
    const engRate = reach > 0 ? eng / reach : 0;
    return reach + saves * 15 + shares * 20 + engRate * 5000;
  }
  const igRanked = [...(ig?.media || [])].sort((a, b) => igScore(b) - igScore(a));
  const igTopScore = igRanked.length ? igScore(igRanked[0]) : 1;

  // Aprendizado dos CAMPEÕES do Instagram (aprende com TODOS os posts reais)
  const [winner, setWinner] = useState<{ summary: string; updatedAt: string; n: number } | null>(null);
  const [winBusy, setWinBusy] = useState(false);
  const [winShow, setWinShow] = useState(false);
  useEffect(() => {
    fetch("/api/instagram/learn-winners").then(r => r.json()).then(d => { if (d.learnings) setWinner(d.learnings); }).catch(() => {});
  }, []);
  async function aprenderCampeoes() {
    if (winBusy) return;
    setWinBusy(true);
    try {
      const r = await fetch("/api/instagram/learn-winners", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setWinner(d.learnings); setWinShow(true);
      toast("⭐ a IA aprendeu com teus campeões — já aplica nas gerações");
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setWinBusy(false); }
  }

  async function readPrint(files: FileList | null) {
    if (!files?.length) return;
    setReading(true); setReadMsg("");
    try {
      const fd = new FormData(); fd.append("file", files[0]);
      const r = await fetch("/api/read-metrics", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "erro");
      const got = d.metrics || {};
      setDraft((prev) => ({ ...prev, ...got }));
      const n = Object.keys(got).length;
      setReadMsg(n ? `Li ${n} métrica(s) do print ✓ confere os números` : "Não achei número no print");
    } catch (e) {
      setReadMsg("⚠ " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setReading(false);
      if (printRef.current) printRef.current.value = "";
    }
  }

  async function load() {
    const r = await fetch("/api/posts");
    const d = await r.json();
    setPosts(d.posts || []);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  async function saveMetrics(p: Post) {
    const updated = { ...p, metrics: { ...p.metrics, ...draft }, feedback: fbDraft };
    await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setOpenId(null); setDraft({}); setFbDraft("");
    await load();
    toast("✓ métricas salvas — o card foi pros Medidos");
  }

  async function del(id: string) {
    await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    await load();
    toast("Removido do Vault");
  }
  async function markStructure(p: Post, score: number) {
    try {
      await fetch("/api/structures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outline: p.outline, hook: p.hook, emotions: p.emotions, tema: p.tema, score: score / 100, note: p.feedback, registro: p.registro }) });
      toast("🏆 estrutura-ouro guardada — validada por desempenho");
    } catch { toast("erro ao guardar", "err"); }
  }

  const scores = performanceScores(posts);
  const nMed = measuredCount(posts);

  function card(p: Post) {
    const nota = scores[p.id];
    const eligivel = nota != null && nota >= NOTA_MINIMA_OURO && nMed >= MIN_MEDIDOS_OURO;
    const goldWhy = nota == null ? "Loga as métricas primeiro" : nMed < MIN_MEDIDOS_OURO ? `Loga pelo menos ${MIN_MEDIDOS_OURO} posts pra comparação valer (tem ${nMed})` : (nota < NOTA_MINIMA_OURO ? `Nota ${nota} — só vira ouro acima de ${NOTA_MINIMA_OURO} (top do teu acervo)` : "");
    return (
      <div key={p.id} className="vault-card">
        <div className="vault-thumb">
          <div style={{ transform: "scale(0.12)", transformOrigin: "top left" }}>
            {p.carousel.cards[0] && <CarouselCard card={p.carousel.cards[0]} />}
          </div>
        </div>
        <div className="vault-card-main">
          <div className="vault-card-title">{p.tema}</div>
          <div className="vault-card-meta">
            {p.carousel.cards.length} cards · {new Date(p.createdAt).toLocaleDateString("pt-BR")}
            {nota != null && <> · <span style={{ color: nota >= NOTA_MINIMA_OURO ? "#7ed957" : "#e8a020", fontWeight: 700 }}>nota {nota}</span></>}
          </div>
          <div className="vault-actions">
            <button onClick={() => onOpen(p.carousel)} style={btn}>abrir no editor</button>
            <button onClick={() => { setOpenId(p.id); setDraft(p.metrics || {}); setFbDraft(p.feedback || ""); setReadMsg(""); }} style={btn}>{isMeasured(p) ? "editar métricas" : "logar métricas + feedback"}</button>
            {p.outline && (
              <button onClick={() => eligivel && markStructure(p, nota!)} disabled={!eligivel}
                title={eligivel ? "Guarda o ARCO deste post como estrutura-ouro (a IA usa de molde) — validado por desempenho" : "🔒 " + goldWhy}
                style={{ ...btn, color: eligivel ? "#e8c860" : "#56607c", borderColor: eligivel ? "#6a5a1e" : "#2a3552", cursor: eligivel ? "pointer" : "not-allowed", opacity: eligivel ? 1 : 0.65 }}>
                {eligivel ? "🏆 estrutura-ouro" : "🔒 estrutura-ouro"}
              </button>
            )}
            <button onClick={() => del(p.id)} style={{ ...btn, color: "#e0738c" }}>excluir</button>
          </div>
        </div>
      </div>
    );
  }

  // ficha de métricas (modal) — salta na tela focada, sem empurrar a lista
  function metricsModal() {
    const p = posts.find((x) => x.id === openId);
    if (!p) return null;
    return (
      <Modal title={<>📊 Métricas — {p.tema}</>} onClose={() => setOpenId(null)} maxWidth={620}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <button onClick={() => printRef.current?.click()} disabled={reading} className="dg-btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
            {reading ? "Lendo o print" : "📸 Ler print do Insights"}
          </button>
          <input ref={printRef} type="file" accept="image/*" hidden onChange={(e) => readPrint(e.target.files)} />
          <span style={{ fontSize: 12, color: "var(--dg-faint)" }}>sobe o screenshot que eu preencho os campos — você só confere</span>
          {readMsg && <span style={{ fontSize: 12, color: readMsg.startsWith("⚠") ? "#e08" : "#4caf50" }}>{readMsg}</span>}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={lbl}>Postado em
            <input type="date" value={draft.postedAt || ""} onChange={(e) => setDraft({ ...draft, postedAt: e.target.value })}
              onClick={(e) => { try { (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.(); } catch {} }}
              style={{ ...inp, cursor: "pointer" }} />
          </label>
          {METRIC_FIELDS.map((f) => (
            <label key={f.key} style={lbl}>{f.label}
              <input type="number" value={(draft[f.key] as number | undefined) ?? ""} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value === "" ? undefined : Number(e.target.value) })} style={inp} />
            </label>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--dg-faint)", marginTop: 8 }}>Pra nota valer, o <b style={{ color: "var(--dg-grey)" }}>Alcance</b> é obrigatório (é a base de tudo). Curtida não entra na nota (sinal fraco)</div>
        <div style={{ marginTop: 12 }}>
          <label style={{ ...lbl, width: "100%" }}>Teu feedback sobre o conteúdo (o que funcionou, o que não, o que sentiu) — vale tanto quanto os números
            <textarea value={fbDraft} onChange={(e) => setFbDraft(e.target.value)} rows={3}
              style={{ ...inp, width: "100%", resize: "vertical", fontFamily: "inherit" }} placeholder="ex: o gancho ficou fraco, mas o card de dado segurou a atenção" />
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--dg-line-soft)" }}>
          <button onClick={() => saveMetrics(p)} className="dg-btn-primary" style={{ fontSize: 13.5, padding: "9px 18px" }}>salvar métricas + feedback</button>
          <button onClick={() => setOpenId(null)} className="dg-btn" style={{ fontSize: 13 }}>cancelar</button>
        </div>
      </Modal>
    );
  }

  return (
    <div className="studio-page vault-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>O cofre que transforma resultado em direção</h2>
          <p>Registre métricas, feedback e padrões para a IA aprender o que performa melhor no teu próprio acervo</p>
        </div>
        <div className="studio-hero__side">
          <div className="studio-stat"><strong>{ig ? fmtN(ig.followers) : "--"}</strong><span>Seguidores</span></div>
          <div className="studio-stat"><strong>{ig ? fmtN(ig.mediaCount) : "--"}</strong><span>Posts</span></div>
          <div className="studio-stat"><strong>{ig ? ig.media.length : "--"}</strong><span>Analisados</span></div>
          <div className="studio-stat"><strong>{winner ? "✓" : "--"}</strong><span>Aprendido</span></div>
        </div>
      </section>

      {/* APRENDIZADO — aprende com TODOS os posts do Instagram */}
      <section className="studio-section studio-section--pad vault-learn">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            🧠 Aprendizado da IA
            {winBusy && <span style={{ color: "#ef476f", fontSize: 13 }}>· aprendendo</span>}
            {winner && !winBusy && <span className="dg-chip" style={{ color: "#7ed957", borderColor: "#2c4c28" }}>✓ aplicando nas gerações</span>}
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {winner && <span style={{ fontSize: 12, color: "var(--dg-faint)" }}>{winner.n} posts · {new Date(winner.updatedAt).toLocaleDateString("pt-BR")}</span>}
            {winner && <button onClick={() => setWinShow(s => !s)} className="dg-btn" style={{ fontSize: 12.5, padding: "6px 12px" }}>{winShow ? "recolher" : "ver"}</button>}
            <button onClick={aprenderCampeoes} disabled={winBusy || !ig} className="dg-btn-primary" style={{ fontSize: 13, padding: "7px 16px", opacity: (winBusy || !ig) ? 0.6 : 1 }}>
              {winBusy ? "Aprendendo" : winner ? "Aprender de novo" : "Aprender com todos"}
            </button>
          </div>
        </div>
        {!winner && (
          <div style={{ fontSize: 13.5, color: "var(--dg-grey)", marginTop: 10 }}>{ig ? "A IA olha teus posts campeões (alcance, salvos, compartilhamentos), extrai o padrão do que funciona e passa a gerar carrossel/reel/stories mais parecido. Clica em aprender." : "Puxa o Instagram abaixo pra IA aprender com teus posts."}</div>
        )}
        {winner && !winShow && (
          <div style={{ fontSize: 13, color: "var(--dg-grey)", marginTop: 8 }}>Já valendo nas próximas gerações. Clica em <b style={{ color: "var(--dg-text)" }}>ver</b> pra reler, ou <b style={{ color: "var(--dg-text)" }}>Aprender de novo</b> pra reanalisar com os dados novos.</div>
        )}
        {winner && winShow && (<><hr className="dg-divider" /><Markdown text={winner.summary} /></>)}
      </section>

      {/* RANKING — posts reais do Instagram por performance */}
      {igRanked.length > 0 && (
        <section className="studio-section studio-section--pad">
          <div className="studio-section-head">
            <h3>Ranking</h3>
            <p>teus posts do Instagram por performance real (alcance + salvos + compartilhamentos + engajamento)</p>
          </div>
          {igRanked.slice(0, 12).map((m) => {
            const nota = Math.round((igScore(m) / igTopScore) * 100);
            const titulo = (m.caption || "").replace(/\s+/g, " ").slice(0, 70) || (IG_TIPO[m.productType || ""]?.label || "post");
            return (
              <div key={m.id} className="vault-rank-row">
                <div className="vault-rank-title">{titulo}</div>
                <div className="vault-rank-track"><div style={{ width: `${nota}%` }} /></div>
                <div className="vault-rank-score">{nota}</div>
              </div>
            );
          })}
        </section>
      )}

      {/* INSTAGRAM — todos os posts com dados reais */}
      <section className="studio-section studio-section--pad">
        <div className="studio-section-head">
          <div>
            <h3>📸 Instagram {ig?.username ? `· @${ig.username}` : ""}</h3>
            <p>{ig ? `${ig.media.length} posts lidos · dados reais da Meta · atualizado ${new Date(ig.fetchedAt).toLocaleString("pt-BR")}` : "Conecta o Instagram na aba Perfil pra puxar todos os posts com os números reais aqui."}</p>
          </div>
          <div className="perfil-analysis-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {ig && <button onClick={() => setIgShow(s => !s)} className="dg-btn" style={{ fontSize: 12.5, padding: "6px 12px" }}>{igShow ? "recolher" : "ver"}</button>}
            <button onClick={atualizarIg} disabled={igBusy} className="dg-btn-primary" style={{ fontSize: 13, padding: "7px 16px", opacity: igBusy ? 0.6 : 1 }}>
              {igBusy ? "puxando..." : ig ? "↻ atualizar" : "puxar do Instagram"}
            </button>
          </div>
        </div>

        {ig && igShow && (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <div className="studio-stat"><strong>{fmtN(ig.followers)}</strong><span>Seguidores</span></div>
              <div className="studio-stat"><strong>{fmtN(ig.mediaCount)}</strong><span>Posts no perfil</span></div>
              <div className="studio-stat"><strong>{ig.media.length}</strong><span>Lidos aqui</span></div>
              <div className="studio-stat"><strong>{fmtN(ig.media.reduce((s, m) => s + (m.reach || 0), 0))}</strong><span>Alcance somado</span></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--dg-faint)" }}>ordenar:</span>
              {([["alcance", "alcance"], ["engajamento", "engajamento"], ["recentes", "recentes"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setIgOrder(k)}
                  style={{ ...btn, fontSize: 12, padding: "5px 12px", color: igOrder === k ? "#ff9fb4" : "#cfcfcf", borderColor: igOrder === k ? "rgba(239,71,111,0.5)" : "#2a3552", background: igOrder === k ? "rgba(239,71,111,0.1)" : "transparent" }}>{l}</button>
              ))}
            </div>
            <div className="vault-card-list">
              {igMedia.map(m => {
                const tipo = IG_TIPO[m.productType || m.mediaType || ""] || { label: m.productType || "post", color: "#7c869c" };
                const eng = m.likes + m.comments + (m.saved || 0) + (m.shares || 0);
                return (
                  <div key={m.id} className="vault-card">
                    <div className="vault-thumb">
                      {m.thumbnail
                        ? <img src={m.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#56607c" }}>sem capa</div>}
                    </div>
                    <div className="vault-card-main">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".4px", padding: "2px 9px", borderRadius: 20, color: tipo.color, background: tipo.color + "1e" }}>{tipo.label}</span>
                        <span className="vault-card-meta" style={{ margin: 0 }}>{m.timestamp ? new Date(m.timestamp).toLocaleDateString("pt-BR") : ""}</span>
                        {m.permalink && <a href={m.permalink} target="_blank" rel="noreferrer" style={{ ...btn, fontSize: 11.5, padding: "3px 10px", marginLeft: "auto", textDecoration: "none" }}>ver no IG ↗</a>}
                      </div>
                      {m.caption && <div className="vault-card-title" style={{ fontSize: 14.5, fontWeight: 600, marginTop: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.caption.slice(0, 120)}</div>}
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, fontSize: 13, color: "#c8cfe0" }}>
                        {m.reach != null && <span title="alcance">👁 <b style={{ color: "#fff" }}>{fmtN(m.reach)}</b> alcance</span>}
                        {m.views != null && <span title="visualizações">▶ <b style={{ color: "#fff" }}>{fmtN(m.views)}</b> views</span>}
                        <span title="curtidas">❤ {fmtN(m.likes)}</span>
                        <span title="comentários">💬 {fmtN(m.comments)}</span>
                        {m.saved != null && <span title="salvos">🔖 {fmtN(m.saved)}</span>}
                        {m.shares != null && <span title="compartilhamentos">✈ {fmtN(m.shares)}</span>}
                        <span title="engajamento total" style={{ color: "#7ed957", fontWeight: 700 }}>Σ {fmtN(eng)} eng</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* CARROSSÉIS CRIADOS NO APP (recolhido) */}
      {posts.length > 0 && (
        <section className="studio-section studio-section--pad">
          <button onClick={() => setShowMedidos((s) => !s)} className="vault-toggle">
            <span className={showMedidos ? "is-open" : ""}>▶</span>
            Carrosséis criados no app ({posts.length})
          </button>
          {showMedidos && <div className="vault-card-list" style={{ marginTop: 12 }}>{posts.map(card)}</div>}
        </section>
      )}

      {metricsModal()}
    </div>
  );
}

const btn: React.CSSProperties = { fontSize: 13, background: "transparent", color: "#cfcfcf", border: "1px solid #2a3552", borderRadius: 6, padding: "6px 12px", cursor: "pointer" };
const lbl: React.CSSProperties = { display: "flex", flexDirection: "column", fontSize: 11, color: "#9aa0b0", gap: 4 };
const inp: React.CSSProperties = { width: 92, background: "#101728", color: "#f5f5f5", border: "1px solid #2a3552", borderRadius: 6, padding: "6px 8px" };
