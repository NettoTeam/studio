"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Markdown from "@/components/Markdown";
import Modal from "@/components/Modal";
import { toast } from "@/lib/toast";

type Media = {
  id: string; caption?: string; mediaType?: string; productType?: string;
  timestamp?: string; permalink?: string; thumbnail?: string;
  likes: number; comments: number; reach?: number; saved?: number; shares?: number; interactions?: number; views?: number;
};
type Snapshot = {
  username?: string; followers?: number; mediaCount?: number; profilePic?: string;
  periods?: {
    last30Days?: { since: string; until: string };
    previous30Days?: { since: string; until: string };
    last7Days?: { since: string; until: string };
  };
  reachTotal?: number; reachLast30Days?: number; reachLast7Days?: number;
  reachPrevious30Days?: number;
  viewsLast30Days?: number; viewsLast7Days?: number;
  viewsPrevious30Days?: number;
  profileViewsLast30Days?: number; profileViewsLast7Days?: number; profileViewsPrevious30Days?: number;
  profileLinksTapsLast30Days?: number; profileLinksTapsLast7Days?: number;
  newFollowersLast30Days?: number; unfollowsLast30Days?: number;
  newFollowersLast7Days?: number; unfollowsLast7Days?: number;
  mediaReachTotal?: number; mediaViewsTotal?: number; media: Media[]; fetchedAt: string;
};
type Conn = { connected: boolean; username?: string; tokenExpires?: string; connectedAt?: string };

const TIPO_LABEL: Record<string, { label: string; color: string }> = {
  REELS: { label: "Reels", color: "#78aaff" },
  FEED: { label: "Feed", color: "#5fd38a" },
  CAROUSEL_ALBUM: { label: "Carrossel", color: "#f59e0b" },
  IMAGE: { label: "Foto", color: "#5fd38a" },
  VIDEO: { label: "Vídeo", color: "#78aaff" },
  STORY: { label: "Story", color: "#a873ff" },
};

function fmt(n?: number) {
  if (n == null) return "—";
  return new Intl.NumberFormat("pt-BR").format(n);
}

function rate(part?: number, total?: number) {
  if (part == null || total == null || total <= 0) return undefined;
  return (part / total) * 100;
}

function fmtRate(n?: number) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(n >= 10 ? 1 : 2).replace(".", ",")}%`;
}

export default function PerfilPage() {
  const router = useRouter();
  const autoReportRef = useRef(false);
  const [conn, setConn] = useState<Conn | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [analysis, setAnalysis] = useState<{ summary: string; updatedAt: string } | null>(null);

  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [shortToken, setShortToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [ordenar, setOrdenar] = useState<"recentes" | "alcance" | "engajamento">("recentes");
  const [ajudaOpen, setAjudaOpen] = useState(false);
  const [printFiles, setPrintFiles] = useState<File[]>([]);
  const [printBusy, setPrintBusy] = useState(false);
  const [expandedAnalyses, setExpandedAnalyses] = useState<Record<string, boolean>>({});
  const [reporting, setReporting] = useState(false);
  const [reachInfoOpen, setReachInfoOpen] = useState(false);
  const [funnelInfoOpen, setFunnelInfoOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    fetch("/api/instagram/connect").then(r => r.json()).then(setConn).catch(() => setConn({ connected: false }));
    fetch("/api/instagram/insights").then(r => r.json()).then(d => { if (d.snapshot) setSnap(d.snapshot); }).catch(() => {});
    fetch("/api/instagram/analyze").then(r => r.json()).then(d => { if (d.analysis) setAnalysis(d.analysis); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (autoReportRef.current || !conn?.connected || !snap) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("relatorio") !== "1") return;
    autoReportRef.current = true;
    window.history.replaceState(null, "", "/perfil");
    criarRelatorio();
  }, [conn?.connected, snap]);

  async function conectar() {
    if (connecting) return;
    setConnecting(true);
    try {
      const r = await fetch("/api/instagram/connect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, appSecret, shortToken }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao conectar");
      setConn({ connected: true, username: d.username, tokenExpires: d.tokenExpires });
      setAppId(""); setAppSecret(""); setShortToken("");
      toast("Instagram conectado ✓");
      atualizar();
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setConnecting(false); }
  }

  async function atualizar() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const r = await fetch("/api/instagram/insights", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao atualizar");
      setSnap(d.snapshot);
      toast("Insights atualizados ✓");
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setRefreshing(false); }
  }

  async function analisar() {
    if (analyzing) return;
    setAnalyzing(true);
    try {
      const r = await fetch("/api/instagram/analyze", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao analisar");
      setAnalysis(d.analysis);
      toast("Análise pronta ✓");
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setAnalyzing(false); }
  }

  const [learningWin, setLearningWin] = useState(false);
  const [winner, setWinner] = useState<{ summary: string; updatedAt: string; n: number } | null>(null);
  useEffect(() => {
    fetch("/api/instagram/learn-winners").then(r => r.json()).then(d => { if (d.learnings) setWinner(d.learnings); }).catch(() => {});
  }, []);
  async function aprenderCampeoes() {
    if (learningWin) return;
    setLearningWin(true);
    try {
      const r = await fetch("/api/instagram/learn-winners", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao aprender");
      setWinner(d.learnings);
      toast("⭐ a IA aprendeu com teus campeões — agora aplica nas gerações");
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setLearningWin(false); }
  }

  async function analisarPrints() {
    if (printBusy || !printFiles.length) return;
    setPrintBusy(true);
    try {
      const fd = new FormData();
      printFiles.forEach(f => fd.append("files", f));
      const r = await fetch("/api/instagram/print", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao analisar");
      setAnalysis(d.analysis);
      setPrintFiles([]);
      toast("Análise pronta ✓");
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setPrintBusy(false); }
  }

  async function criarRelatorio() {
    if (reporting) return;
    setReporting(true);
    try {
      const r = await fetch("/api/instagram/report", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao criar relatório");
      toast("Relatório salvo ✓");
      router.push(`/perfil/relatorios/${d.report.id}`);
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setReporting(false); }
  }

  async function desconectar() {
    if (!confirm("Desconectar o Instagram? Os insights em cache serão apagados.")) return;
    await fetch("/api/instagram/connect", { method: "DELETE" });
    setConn({ connected: false }); setSnap(null); setAnalysis(null);
  }

  const media = [...(snap?.media || [])].sort((a, b) => {
    if (ordenar === "alcance") return (b.reach || 0) - (a.reach || 0);
    if (ordenar === "engajamento") return ((b.likes + b.comments + (b.saved || 0) + (b.shares || 0)) - (a.likes + a.comments + (a.saved || 0) + (a.shares || 0)));
    return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
  });
  const analysisOpen = analysis ? !!expandedAnalyses[analysis.updatedAt] : false;
  const funnelReach30 = snap?.reachLast30Days ?? snap?.reachTotal;
  const funnelProfileViews30 = snap?.profileViewsLast30Days;
  const funnelNewFollowers30 = snap?.newFollowersLast30Days;
  const funnelProfileRate30 = rate(funnelProfileViews30, funnelReach30);
  const funnelFollowerRate30 = funnelProfileViews30 != null
    ? rate(funnelNewFollowers30, funnelProfileViews30)
    : rate(funnelNewFollowers30, funnelReach30);

  function toggleAnalysis(updatedAt: string) {
    setExpandedAnalyses(cur => ({ ...cur, [updatedAt]: !cur[updatedAt] }));
  }

  function getMediaType(mediaItem: Media) {
    const tipoKey = mediaItem.mediaType === "CAROUSEL_ALBUM" ? mediaItem.mediaType : (mediaItem.productType || mediaItem.mediaType || "");
    return TIPO_LABEL[tipoKey] || { label: mediaItem.productType || mediaItem.mediaType || "post", color: "#7c869c" };
  }

  function getEngagement(mediaItem: Media) {
    return mediaItem.likes + mediaItem.comments + (mediaItem.saved || 0) + (mediaItem.shares || 0);
  }

  function postReading(mediaItem: Media) {
    const eng = getEngagement(mediaItem);
    const base = mediaItem.reach || mediaItem.views || 0;
    const engagementRate = base > 0 ? (eng / base) * 100 : undefined;
    const savesRate = base > 0 && mediaItem.saved != null ? (mediaItem.saved / base) * 100 : undefined;
    const sharesRate = base > 0 && mediaItem.shares != null ? (mediaItem.shares / base) * 100 : undefined;
    const repeats = mediaItem.views != null && mediaItem.reach != null && mediaItem.reach > 0 ? mediaItem.views / mediaItem.reach : undefined;
    const caption = (mediaItem.caption || "").trim();
    const captionStart = caption ? caption.replace(/\s+/g, " ").slice(0, 180) : "Legenda não disponível pela API.";
    const insights: string[] = [];

    if (engagementRate != null) insights.push(`Engajamento estimado: ${fmtRate(engagementRate)} sobre ${mediaItem.reach ? "alcance" : "visualizações"}.`);
    else insights.push("A API não trouxe alcance/visualizações suficientes para calcular taxa de engajamento.");
    if (repeats != null) insights.push(repeats >= 1.8 ? `Repetição forte: ${repeats.toFixed(2).replace(".", ",")} visualizações por conta alcançada.` : `Repetição moderada: ${repeats.toFixed(2).replace(".", ",")} visualizações por conta alcançada.`);
    if (savesRate != null) insights.push(`Salvamentos: ${fmtRate(savesRate)} da base medida.`);
    if (sharesRate != null) insights.push(`Compartilhamentos: ${fmtRate(sharesRate)} da base medida.`);
    if (caption) insights.push(caption.length > 140 ? "Legenda com contexto suficiente para sustentar argumento e CTA." : "Legenda curta: tende a depender mais da capa/primeiros segundos.");

    return { engagementRate, captionStart, insights };
  }

  const selectedType = selectedMedia ? getMediaType(selectedMedia) : null;
  const selectedEngagement = selectedMedia ? getEngagement(selectedMedia) : 0;
  const selectedReading = selectedMedia ? postReading(selectedMedia) : null;

  return (
    <div className="studio-page perfil-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>insights atualizados direto da Meta</h2>
        </div>
        {conn?.connected && snap && (
          <div className="studio-hero__side">
            <div className="studio-stat"><strong>{fmt(snap.followers)}</strong><span>Seguidores</span></div>
            <div className="studio-stat"><strong>{fmt(snap.viewsLast30Days)}</strong><span>visualizações 30 dias</span></div>
          </div>
        )}
      </section>

      {/* ── NÃO CONECTADO ── */}
      {conn && !conn.connected && (
        <section className="studio-section studio-section--pad perfil-connect">
          <div className="studio-section-head">
            <div>
              <h3>Conectar o Instagram</h3>
              <p>Precisa de conta Profissional (Criador/Empresa) ligada a uma Página do Facebook, e um app na Meta. Segue o passo a passo.</p>
            </div>
          </div>

          <button type="button" className="perfil-ajuda-toggle" onClick={() => setAjudaOpen(o => !o)}>
            {ajudaOpen ? "▲" : "▼"} passo a passo pra pegar as 3 chaves abaixo
          </button>
          {ajudaOpen && (
            <ol className="perfil-ajuda">
              <li>Acesse <b>developers.facebook.com</b> → Criar app → tipo <b>Empresa</b>.</li>
              <li>No painel do app, adicione o produto <b>Instagram Graph API</b> (ou &quot;Instagram&quot;).</li>
              <li>Em <b>Configurações → Básico</b>: copie o <b>ID do app</b> e a <b>Chave secreta</b>.</li>
              <li>Abra a <b>Graph API Explorer</b> (developers.facebook.com/tools/explorer). Selecione seu app, adicione as permissões <b>instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement, business_management</b> e clique em <b>Generate Access Token</b> (autorize sua conta).</li>
              <li>Copie esse token (é o &quot;token curto&quot;) e cole abaixo junto com o ID e a chave. Eu troco por um token de 60 dias e renovo sozinho.</li>
            </ol>
          )}

          <div className="perfil-form">
            <label className="stories-field">
              <span>ID do app (App ID)</span>
              <input value={appId} onChange={e => setAppId(e.target.value)} className="studio-input" placeholder="ex: 1234567890123456" />
            </label>
            <label className="stories-field">
              <span>Chave secreta (App Secret)</span>
              <input value={appSecret} onChange={e => setAppSecret(e.target.value)} type="password" className="studio-input" placeholder="a chave secreta do app" />
            </label>
            <label className="stories-field">
              <span>Token de acesso (do Graph API Explorer)</span>
              <textarea value={shortToken} onChange={e => setShortToken(e.target.value)} rows={3} className="studio-textarea" placeholder="cola aqui o token gerado" />
            </label>
            <button onClick={conectar} disabled={connecting} className="dg-btn-primary stories-primary-btn">
              {connecting ? "conectando..." : "Conectar Instagram"}
            </button>
            <p className="perfil-seguro">🔒 as chaves ficam no teu Supabase, ninguém mais acessa. Só você usa esse app.</p>
          </div>
        </section>
      )}

      {/* ── PLANO B: ANÁLISE POR PRINT (sempre disponível se não conectado) ── */}
      {conn && !conn.connected && (
        <section className="studio-section studio-section--pad">
          <div className="studio-section-head">
            <div>
              <h3>Ou: análise por print (funciona já)</h3>
              <p>Sem configurar nada na Meta. Sobe prints dos teus Insights do Instagram e a IA lê os números e te dá o diagnóstico.</p>
            </div>
          </div>
          <div className="perfil-print-box">
            <label className="perfil-print-drop">
              <input type="file" accept="image/*" multiple hidden
                onChange={e => setPrintFiles(Array.from(e.target.files || []))} />
              <span className="perfil-print-icon">📸</span>
              <span>{printFiles.length ? `${printFiles.length} print(s) selecionado(s)` : "clica pra escolher os prints dos Insights"}</span>
              <small>pode mandar vários: contas alcançadas, engajamento, melhores posts, seguidores...</small>
            </label>
            <button onClick={analisarPrints} disabled={printBusy || !printFiles.length} className="dg-btn-primary stories-primary-btn">
              {printBusy ? "lendo e analisando..." : "⚡ analisar os prints"}
            </button>
          </div>
          {analysis && (
            <div className={`perfil-analysis${analysisOpen ? "" : " is-collapsed"}`} style={{ marginTop: 16 }}>
              <div className="perfil-analysis-top">
                <span className="perfil-analysis-date">análise de {new Date(analysis.updatedAt).toLocaleString("pt-BR")}</span>
                <button type="button" onClick={() => toggleAnalysis(analysis.updatedAt)} className="dg-btn">
                  {analysisOpen ? "minimizar" : "expandir"}
                </button>
              </div>
              {analysisOpen && <Markdown text={analysis.summary} />}
            </div>
          )}
        </section>
      )}

      {/* ── CONECTADO ── */}
      {conn?.connected && (
        <>
          <section className="studio-section studio-section--pad">
            <div className="perfil-conn-head">
              <div className="perfil-conn-info">
                {snap?.profilePic && <img src={snap.profilePic} alt="" className="perfil-avatar" />}
                <div>
                  <strong className="perfil-username">@{snap?.username || conn.username}</strong>
                  <span className="perfil-updated">
                    {snap ? `insights de ${new Date(snap.fetchedAt).toLocaleString("pt-BR")}` : "sem dados ainda — clica em atualizar"}
                  </span>
                </div>
              </div>
              <div className="perfil-conn-actions">
                <button onClick={atualizar} disabled={refreshing} className="dg-btn-primary stories-primary-btn">
                  {refreshing ? "puxando..." : "↻ atualizar insights"}
                </button>
                <button onClick={criarRelatorio} disabled={reporting || !snap} className="dg-btn-primary stories-primary-btn">
                  {reporting ? "criando..." : "criar relatório"}
                </button>
                <Link href="/perfil/relatorios" className="dg-btn">meus relatórios</Link>
                <button onClick={desconectar} className="dg-btn perfil-disconnect">desconectar</button>
              </div>
            </div>

            {snap && (
              <div className="perfil-stats-row">
                <div className="perfil-stat"><strong>{fmt(snap.followers)}</strong><span>seguidores</span></div>
                <div className="perfil-stat"><strong>{fmt(snap.mediaCount)}</strong><span>posts</span></div>
                <div className="perfil-stat"><strong>{fmt(snap.viewsLast30Days)}</strong><span>visualizações 30 dias</span></div>
                <div className="perfil-stat"><strong>{fmt(snap.viewsLast7Days)}</strong><span>visualizações 7 dias</span></div>
                <button type="button" className="perfil-stat perfil-stat-btn" onClick={() => setReachInfoOpen(true)}><strong>{fmt(snap.reachLast30Days ?? snap.reachTotal)}</strong><span>alcance 30 dias</span></button>
                <button type="button" className="perfil-stat perfil-stat-btn" onClick={() => setReachInfoOpen(true)}><strong>{fmt(snap.reachLast7Days)}</strong><span>alcance 7 dias</span></button>
                <div className="perfil-stat"><strong>{fmt(snap.newFollowersLast30Days)}</strong><span>novos seguidores 30 dias</span></div>
                <button type="button" className="perfil-stat perfil-stat-btn perfil-funnel-stat" onClick={() => setFunnelInfoOpen(true)}>
                  <strong>{fmtRate(funnelFollowerRate30)}</strong>
                  <span>funil do perfil</span>
                  <small>{funnelProfileViews30 != null ? `${fmt(funnelProfileViews30)} visitas ao perfil` : `${fmt(funnelNewFollowers30)} novos seguidores`}</small>
                </button>
                <div className="perfil-stat"><strong>{fmt(snap.unfollowsLast30Days)}</strong><span>deixaram de seguir 30 dias</span></div>
                <div className="perfil-stat"><strong>{fmt(snap.newFollowersLast7Days)}</strong><span>novos seguidores 7 dias</span></div>
                <div className="perfil-stat"><strong>{fmt(snap.unfollowsLast7Days)}</strong><span>deixaram de seguir 7 dias</span></div>
                <div className="perfil-stat"><strong>{snap.media.length}</strong><span>posts lidos</span></div>
              </div>
            )}
          </section>

          {/* Análise da IA */}
          <section className="studio-section studio-section--pad">
            <div className="studio-section-head">
              <div>
                <h3>Diagnóstico da IA</h3>
                <p>A IA lê teus números e cruza com teu estilo pra dizer o que funciona, o que cortar e o que postar.</p>
              </div>
              <div className="perfil-analysis-actions">
                <button onClick={analisar} disabled={analyzing || !snap} className="dg-btn-primary stories-primary-btn">
                  {analyzing ? "analisando..." : analysis ? "↻ analisar de novo" : "⚡ analisar meu perfil"}
                </button>
              </div>
            </div>
            {analysis ? (
              <div className={`perfil-analysis${analysisOpen ? "" : " is-collapsed"}`}>
                <div className="perfil-analysis-top">
                  <span className="perfil-analysis-date">análise de {new Date(analysis.updatedAt).toLocaleString("pt-BR")}</span>
                  <button type="button" onClick={() => toggleAnalysis(analysis.updatedAt)} className="dg-btn">
                    {analysisOpen ? "minimizar" : "expandir"}
                  </button>
                </div>
                {analysisOpen && <Markdown text={analysis.summary} />}
              </div>
            ) : (
              <p className="stories-empty">{snap ? "Clica em analisar meu perfil pra ver o diagnóstico." : "Atualiza os insights primeiro."}</p>
            )}
          </section>

          {/* Aprender com os campeões */}
          <section className="studio-section studio-section--pad">
            <div className="studio-section-head">
              <div>
                <h3>Aprender com o que bombou</h3>
                <p>A IA olha teus posts campeões (alcance, salvos, compartilhamentos), extrai o padrão do que funciona, e passa a gerar carrossel/reel/stories mais parecido com isso. Fica mais afiada a cada vez.</p>
              </div>
              <div className="perfil-analysis-actions">
                <button onClick={aprenderCampeoes} disabled={learningWin || !snap} className="dg-btn-primary stories-primary-btn">
                  {learningWin ? "aprendendo..." : winner ? "↻ aprender de novo" : "⚡ aprender com meus campeões"}
                </button>
              </div>
            </div>
            {winner ? (
              <div className="perfil-analysis">
                <span className="perfil-analysis-date">aprendido de {winner.n} posts · {new Date(winner.updatedAt).toLocaleString("pt-BR")} · já aplicando nas gerações ✓</span>
                <Markdown text={winner.summary} />
              </div>
            ) : (
              <p className="stories-empty">{snap ? "Clica pra IA aprender com teus melhores posts." : "Atualiza os insights primeiro."}</p>
            )}
          </section>

          {/* Posts */}
          {snap && snap.media.length > 0 && (
            <section className="studio-section studio-section--pad">
              <div className="studio-section-head">
                <div>
                  <h3>Posts</h3>
                  <p>Ordena por alcance ou engajamento pra ver o que mais performou.</p>
                </div>
                <div className="perfil-sort">
                  {([["recentes", "recentes"], ["alcance", "alcance"], ["engajamento", "engajamento"]] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setOrdenar(k)} className={`perfil-sort-btn${ordenar === k ? " is-on" : ""}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="perfil-posts-grid">
                {media.map(m => {
                  const tipo = getMediaType(m);
                  const eng = getEngagement(m);
                  return (
                    <button key={m.id} type="button" onClick={() => setSelectedMedia(m)} className="perfil-post">
                      {m.thumbnail ? <img src={m.thumbnail} alt="" className="perfil-post-thumb" /> : <div className="perfil-post-thumb perfil-post-noimg">sem capa</div>}
                      <div className="perfil-post-body">
                        <div className="perfil-post-top">
                          <span className="perfil-post-tipo" style={{ color: tipo.color, background: tipo.color + "1e" }}>{tipo.label}</span>
                          <span className="perfil-post-date">{m.timestamp ? new Date(m.timestamp).toLocaleDateString("pt-BR") : ""}</span>
                        </div>
                        {m.caption && <p className="perfil-post-cap">{m.caption.slice(0, 80)}</p>}
                        <div className="perfil-post-metrics">
                          {m.views != null && <span title="visualizações">👁 {fmt(m.views)}</span>}
                          {m.reach != null && <span title="contas alcançadas">📊 {fmt(m.reach)}</span>}
                          <span title="curtidas">❤ {fmt(m.likes)}</span>
                          <span title="comentários">💬 {fmt(m.comments)}</span>
                          {m.saved != null && <span title="salvos">🔖 {fmt(m.saved)}</span>}
                          {m.shares != null && <span title="compartilhamentos">✈ {fmt(m.shares)}</span>}
                          <span className="perfil-post-eng" title="engajamento total">Σ {fmt(eng)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
      {selectedMedia && selectedType && selectedReading && (
        <Modal title="Resumo do post" onClose={() => setSelectedMedia(null)} maxWidth={760}>
          <div className="perfil-post-summary">
            <div className="perfil-post-summary-head">
              {selectedMedia.thumbnail ? <img src={selectedMedia.thumbnail} alt="" /> : <div className="perfil-post-noimg">sem capa</div>}
              <div>
                <span className="perfil-post-tipo" style={{ color: selectedType.color, background: selectedType.color + "1e" }}>{selectedType.label}</span>
                <h3>{selectedReading.captionStart}</h3>
                <p>{selectedMedia.timestamp ? `Publicado em ${new Date(selectedMedia.timestamp).toLocaleDateString("pt-BR")}` : "Data não disponível pela API."}</p>
              </div>
            </div>

            <div className="perfil-post-summary-grid">
              <div><span>visualizações</span><strong>{fmt(selectedMedia.views)}</strong></div>
              <div><span>contas alcançadas</span><strong>{fmt(selectedMedia.reach)}</strong></div>
              <div><span>curtidas</span><strong>{fmt(selectedMedia.likes)}</strong></div>
              <div><span>comentários</span><strong>{fmt(selectedMedia.comments)}</strong></div>
              <div><span>salvos</span><strong>{fmt(selectedMedia.saved)}</strong></div>
              <div><span>compartilhamentos</span><strong>{fmt(selectedMedia.shares)}</strong></div>
              <div><span>engajamento total</span><strong>{fmt(selectedEngagement)}</strong></div>
              <div><span>taxa estimada</span><strong>{fmtRate(selectedReading.engagementRate)}</strong></div>
            </div>

            <div className="perfil-post-summary-copy">
              <h4>Leitura do que foi recolhido</h4>
              {selectedReading.insights.map((item) => <p key={item}>{item}</p>)}
              <small>Nada aqui é inventado: quando uma métrica falta, eu marco como não disponível e calculo só com o que veio da Meta.</small>
            </div>

            <div className="perfil-post-summary-actions">
              {selectedMedia.permalink && <a href={selectedMedia.permalink} target="_blank" rel="noreferrer" className="dg-btn-primary stories-primary-btn">abrir post no Instagram</a>}
              <button type="button" className="dg-btn" onClick={() => setSelectedMedia(null)}>fechar resumo</button>
            </div>
          </div>
        </Modal>
      )}
      {reachInfoOpen && (
        <Modal title="Como ler alcance" onClose={() => setReachInfoOpen(false)}>
          <div className="perfil-modal-copy">
            <p><b>Alcance</b> é o número de contas únicas que viram algum conteúdo teu no período.</p>
            <p><b>Visualizações</b> contam exibições. Se a mesma pessoa viu mais de uma vez, pode contar mais de uma visualização.</p>
            <p>Os períodos usam dias fechados no fuso de São Paulo, igual ao Instagram: 30 dias e 7 dias completos até ontem.</p>
            <p>Hoje: alcance 30 dias = <b>{fmt(snap?.reachLast30Days ?? snap?.reachTotal)}</b>, alcance 7 dias = <b>{fmt(snap?.reachLast7Days)}</b>.</p>
          </div>
        </Modal>
      )}
      {funnelInfoOpen && (
        <Modal title="Funil do Perfil" onClose={() => setFunnelInfoOpen(false)}>
          <div className="perfil-modal-copy perfil-funnel-modal">
            <p><b>Funil do Perfil</b> mostra quantas pessoas passam de audiência para interesse real e depois viram seguidoras.</p>

            <div className="perfil-funnel-steps">
              <div className="perfil-funnel-step">
                <span>1. visualizações</span>
                <strong>{fmt(snap?.viewsLast30Days)}</strong>
                <small>quantas vezes seus conteúdos foram exibidos nos últimos 30 dias.</small>
              </div>
              <div className="perfil-funnel-step">
                <span>2. alcance</span>
                <strong>{fmt(funnelReach30)}</strong>
                <small>quantas contas únicas foram alcançadas.</small>
              </div>
              <div className="perfil-funnel-step">
                <span>3. visitas ao perfil</span>
                <strong>{fmt(funnelProfileViews30)}</strong>
                <small>{funnelProfileViews30 == null ? "a Meta não retornou essa métrica neste token/período." : `${fmtRate(funnelProfileRate30)} das contas alcançadas abriram o perfil.`}</small>
              </div>
              <div className="perfil-funnel-step">
                <span>4. cliques no link</span>
                <strong>{fmt(snap?.profileLinksTapsLast30Days)}</strong>
                <small>quando disponível, mostra quantas ações saíram do perfil para o link.</small>
              </div>
              <div className="perfil-funnel-step is-final">
                <span>5. novos seguidores</span>
                <strong>{fmt(funnelNewFollowers30)}</strong>
                <small>{funnelProfileViews30 != null ? `${fmtRate(funnelFollowerRate30)} das visitas viraram seguidores.` : `${fmtRate(funnelFollowerRate30)} das contas alcançadas viraram seguidores.`}</small>
              </div>
            </div>

            <p><b>Como interpretar:</b> se o alcance está alto e as visitas ao perfil estão baixas, o conteúdo chamou atenção mas não deu motivo para conhecer você. Se as visitas estão boas e os novos seguidores estão baixos, o problema tende a estar na bio, fixados, promessa do perfil ou clareza da oferta.</p>
            <p>Os números usam os últimos 30 dias completos. Ao clicar em <b>atualizar insights</b>, o card tenta buscar de novo as métricas de visitas ao perfil e cliques no link.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
