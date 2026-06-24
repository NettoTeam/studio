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
  { key: "salvamentos", label: "Salvamentos" },
  { key: "compartilhamentos", label: "Compart." },
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
  const [learning, setLearning] = useState(false);
  const [learnings, setLearnings] = useState<{ summary: string; n: number; updatedAt: string; ackAt?: string } | null>(null);
  const [showLearn, setShowLearn] = useState(false); // expandir o aprendizado já integrado pra reler
  const [reading, setReading] = useState(false);
  const [readMsg, setReadMsg] = useState("");
  const [showMedidos, setShowMedidos] = useState(false);
  const printRef = useRef<HTMLInputElement>(null);

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
    const lr = await fetch("/api/learn");
    const ld = await lr.json();
    setLearnings(ld.learnings || null);
  }
  useEffect(() => { load(); }, []);

  async function saveMetrics(p: Post) {
    const updated = { ...p, metrics: { ...p.metrics, ...draft }, feedback: fbDraft };
    await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setOpenId(null); setDraft({}); setFbDraft("");
    await load();
    toast("✓ métricas salvas — o card foi pros Medidos");
  }

  async function runLearn() {
    setLearning(true);
    try {
      const r = await fetch("/api/learn", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const d = await r.json();
      if (d.learnings) { setLearnings(d.learnings); setShowLearn(true); toast("🧠 aprendizado atualizado — revisa e integra"); }
    } catch { toast("erro ao aprender", "err"); }
    setLearning(false);
  }
  // Cândido revisou → integra (recolhe o painel; o aprendizado já alimenta a escrita automaticamente)
  async function integrarLearn() {
    try {
      const r = await fetch("/api/learn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ack: true }) });
      const d = await r.json();
      if (d.learnings) { setLearnings(d.learnings); setShowLearn(false); toast("✓ aprendizado integrado"); }
    } catch { toast("erro ao integrar", "err"); }
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

  if (!posts.length) {
    return <div style={{ color: "#9aa0b0", padding: "40px 0" }}>Vault vazio. Cria um carrossel e clica em <b>Salvar no Quadro</b> — depois publica, volta aqui e loga os números.</div>;
  }

  const scores = performanceScores(posts);
  const nMed = measuredCount(posts);
  const pub = posts.filter((p) => p.stage === "publicado" || p.stage === "arquivado");
  const aMedir = pub.filter((p) => !isMeasured(p));
  const medidos = pub.filter(isMeasured).sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));

  function card(p: Post) {
    const nota = scores[p.id];
    const eligivel = nota != null && nota >= NOTA_MINIMA_OURO && nMed >= MIN_MEDIDOS_OURO;
    const goldWhy = nota == null ? "Loga as métricas primeiro." : nMed < MIN_MEDIDOS_OURO ? `Loga pelo menos ${MIN_MEDIDOS_OURO} posts pra comparação valer (tem ${nMed}).` : (nota < NOTA_MINIMA_OURO ? `Nota ${nota} — só vira ouro acima de ${NOTA_MINIMA_OURO} (top do teu acervo).` : "");
    return (
      <div key={p.id} className="dg-card" style={{ padding: 16, display: "flex", gap: 18, flexWrap: "wrap" }}>
        <div style={{ width: 130, height: 162, overflow: "hidden", borderRadius: 8, border: "1px solid #2a3552", flexShrink: 0 }}>
          <div style={{ transform: "scale(0.12)", transformOrigin: "top left" }}>
            {p.carousel.cards[0] && <CarouselCard card={p.carousel.cards[0]} />}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{p.tema}</div>
          <div style={{ color: "#9aa0b0", fontSize: 13, marginTop: 2 }}>
            {p.carousel.cards.length} cards · {new Date(p.createdAt).toLocaleDateString("pt-BR")}
            {nota != null && <> · <span style={{ color: nota >= NOTA_MINIMA_OURO ? "#7ed957" : "#e8a020", fontWeight: 700 }}>nota {nota}</span></>}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => onOpen(p.carousel)} style={btn}>abrir no editor</button>
            <button onClick={() => { setOpenId(p.id); setDraft(p.metrics || {}); setFbDraft(p.feedback || ""); setReadMsg(""); }} style={btn}>{isMeasured(p) ? "editar métricas" : "logar métricas + feedback"}</button>
            {p.outline && (
              <button onClick={() => eligivel && markStructure(p, nota!)} disabled={!eligivel}
                title={eligivel ? "Guarda o ARCO deste post como estrutura-ouro (a IA usa de molde). Validado por desempenho." : "🔒 " + goldWhy}
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
            {reading ? "Lendo o print..." : "📸 Ler print do Insights"}
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
        <div style={{ fontSize: 11, color: "var(--dg-faint)", marginTop: 8 }}>Pra nota valer, o <b style={{ color: "var(--dg-grey)" }}>Alcance</b> é obrigatório (é a base de tudo). Curtida não entra na nota (sinal fraco).</div>
        <div style={{ marginTop: 12 }}>
          <label style={{ ...lbl, width: "100%" }}>Teu feedback sobre o conteúdo (o que funcionou, o que não, o que sentiu) — vale tanto quanto os números
            <textarea value={fbDraft} onChange={(e) => setFbDraft(e.target.value)} rows={3}
              style={{ ...inp, width: "100%", resize: "vertical", fontFamily: "inherit" }} placeholder="ex: o gancho ficou fraco, mas o card de dado segurou a atenção..." />
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* APRENDIZADO */}
      {(() => {
        const integrado = !!(learnings?.ackAt && learnings.ackAt === learnings.updatedAt);
        const expandido = !!learnings && (!integrado || showLearn);
        return (
          <div className="dg-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                🧠 Aprendizado da IA
                {learning && <span style={{ color: "#ef476f", fontSize: 13 }}>· aprendendo...</span>}
                {integrado && !learning && <span className="dg-chip" style={{ color: "#7ed957", borderColor: "#2c4c28" }}>✓ integrado</span>}
                {!integrado && learnings && !learning && <span className="dg-chip" style={{ color: "#e8c860", borderColor: "#6a5a1e" }}>novo — revisar</span>}
              </span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {learnings && <span style={{ fontSize: 12, color: "var(--dg-faint)" }}>{learnings.n} posts · {new Date(learnings.updatedAt).toLocaleDateString("pt-BR")}</span>}
                {integrado && <button onClick={() => setShowLearn((s) => !s)} className="dg-btn" style={{ fontSize: 12.5, padding: "6px 12px" }}>{showLearn ? "recolher" : "ver"}</button>}
                <button onClick={runLearn} disabled={learning} className="dg-btn-primary" style={{ fontSize: 13, padding: "7px 16px", opacity: learning ? 0.6 : 1 }}>
                  {learning ? "Aprendendo..." : "Aprender agora"}
                </button>
              </div>
            </div>

            {!learnings && (
              <div style={{ fontSize: 13.5, color: "var(--dg-grey)", marginTop: 10 }}>Sem aprendizado ainda. Loga as métricas de um post que a IA começa a achar padrão.</div>
            )}

            {integrado && !showLearn && learnings && (
              <div style={{ fontSize: 13, color: "var(--dg-grey)", marginTop: 8 }}>Integrado e já valendo nas próximas gerações. Clica em <b style={{ color: "var(--dg-text)" }}>ver</b> pra reler, ou <b style={{ color: "var(--dg-text)" }}>Aprender agora</b> pra reanalisar com os dados novos.</div>
            )}

            {expandido && learnings && (
              <>
                <hr className="dg-divider" />
                <Markdown text={learnings.summary} />
                {!integrado && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--dg-line-soft)", flexWrap: "wrap" }}>
                    <button onClick={integrarLearn} className="dg-btn-primary" style={{ fontSize: 13.5, padding: "9px 18px" }}>✓ Integrar aprendizado</button>
                    <span style={{ fontSize: 12, color: "var(--dg-faint)" }}>revisei — pode guardar (já alimenta a escrita automaticamente; some daqui até o próximo &quot;Aprender&quot;)</span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* RANKING por nota composta */}
      {medidos.length > 0 && (
        <div className="dg-panel" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>📊 Ranking de desempenho <span style={{ color: "#7c869c", fontWeight: 400, fontSize: 13 }}>(nota composta)</span></div>
          {medidos.map((p) => {
            const nota = scores[p.id] ?? 0;
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                <div style={{ width: 180, fontSize: 13, color: "#cfcfcf", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.tema}</div>
                <div style={{ flex: 1, background: "#101728", borderRadius: 6, height: 18, overflow: "hidden" }}>
                  <div style={{ width: `${nota}%`, height: "100%", background: "linear-gradient(90deg,#8a2540,#ef476f)" }} />
                </div>
                <div style={{ width: 40, textAlign: "right", color: "#ef476f", fontSize: 13, fontWeight: 700 }}>{nota}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* A MEDIR — a fila de ação (publicados sem números) */}
      <div style={{ fontWeight: 700, fontSize: 13, color: "#9aa0b0", textTransform: "uppercase", letterSpacing: 1 }}>📥 A medir ({aMedir.length})</div>
      {aMedir.length === 0
        ? <div style={{ color: "#5e8a5e", fontSize: 13 }}>✓ tudo medido — nada na fila.</div>
        : aMedir.map(card)}

      {/* MEDIDOS — recolhido; o card vem pra cá quando você loga (sai da fila de cima) */}
      {medidos.length > 0 && (
        <div>
          <button onClick={() => setShowMedidos((s) => !s)} style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", color: "#9aa0b0", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, padding: "6px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ transform: showMedidos ? "rotate(90deg)" : "none", transition: "transform .15s", color: "#7c869c" }}>▶</span>
            ✅ Medidos / aprendidos ({medidos.length})
          </button>
          {showMedidos && <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 10 }}>{medidos.map(card)}</div>}
        </div>
      )}

      {metricsModal()}
    </div>
  );
}

const btn: React.CSSProperties = { fontSize: 13, background: "transparent", color: "#cfcfcf", border: "1px solid #2a3552", borderRadius: 6, padding: "6px 12px", cursor: "pointer" };
const lbl: React.CSSProperties = { display: "flex", flexDirection: "column", fontSize: 11, color: "#9aa0b0", gap: 4 };
const inp: React.CSSProperties = { width: 92, background: "#101728", color: "#f5f5f5", border: "1px solid #2a3552", borderRadius: 6, padding: "6px 8px" };
