"use client";

import { useEffect, useState } from "react";
import Markdown from "@/components/Markdown";
import { toast } from "@/lib/toast";

type Media = {
  id: string; caption?: string; mediaType?: string; productType?: string;
  timestamp?: string; permalink?: string; thumbnail?: string;
  likes: number; comments: number; reach?: number; saved?: number; shares?: number; interactions?: number; views?: number;
};
type Snapshot = {
  username?: string; followers?: number; mediaCount?: number; profilePic?: string;
  reachTotal?: number; media: Media[]; fetchedAt: string;
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
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}

export default function PerfilPage() {
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

  useEffect(() => {
    fetch("/api/instagram/connect").then(r => r.json()).then(setConn).catch(() => setConn({ connected: false }));
    fetch("/api/instagram/insights").then(r => r.json()).then(d => { if (d.snapshot) setSnap(d.snapshot); }).catch(() => {});
    fetch("/api/instagram/analyze").then(r => r.json()).then(d => { if (d.analysis) setAnalysis(d.analysis); }).catch(() => {});
  }, []);

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

  return (
    <div className="studio-page perfil-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>Seu Instagram, lido de verdade</h2>
          <p>Puxa os insights atualizados direto da Meta e deixa a IA cruzar os números com o teu estilo pra dizer o que melhorar.</p>
        </div>
        {conn?.connected && snap && (
          <div className="studio-hero__side">
            <div className="studio-stat"><strong>{fmt(snap.followers)}</strong><span>Seguidores</span></div>
            <div className="studio-stat"><strong>{fmt(snap.mediaCount)}</strong><span>Posts</span></div>
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
              <li>No painel do app, adicione o produto <b>Instagram Graph API</b> (ou "Instagram").</li>
              <li>Em <b>Configurações → Básico</b>: copie o <b>ID do app</b> e a <b>Chave secreta</b>.</li>
              <li>Abra a <b>Graph API Explorer</b> (developers.facebook.com/tools/explorer). Selecione seu app, adicione as permissões <b>instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement, business_management</b> e clique em <b>Generate Access Token</b> (autorize sua conta).</li>
              <li>Copie esse token (é o "token curto") e cole abaixo junto com o ID e a chave. Eu troco por um token de 60 dias e renovo sozinho.</li>
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
            <div className="perfil-analysis" style={{ marginTop: 16 }}>
              <span className="perfil-analysis-date">análise de {new Date(analysis.updatedAt).toLocaleString("pt-BR")}</span>
              <Markdown text={analysis.summary} />
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
                <button onClick={desconectar} className="dg-btn perfil-disconnect">desconectar</button>
              </div>
            </div>

            {snap && (
              <div className="perfil-stats-row">
                <div className="perfil-stat"><strong>{fmt(snap.followers)}</strong><span>seguidores</span></div>
                <div className="perfil-stat"><strong>{fmt(snap.mediaCount)}</strong><span>posts</span></div>
                <div className="perfil-stat"><strong>{fmt(snap.reachTotal)}</strong><span>alcance (últimos)</span></div>
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
              <button onClick={analisar} disabled={analyzing || !snap} className="dg-btn-primary stories-primary-btn">
                {analyzing ? "analisando..." : analysis ? "↻ analisar de novo" : "⚡ analisar meu perfil"}
              </button>
            </div>
            {analysis ? (
              <div className="perfil-analysis">
                <span className="perfil-analysis-date">análise de {new Date(analysis.updatedAt).toLocaleString("pt-BR")}</span>
                <Markdown text={analysis.summary} />
              </div>
            ) : (
              <p className="stories-empty">{snap ? "Clica em analisar meu perfil pra ver o diagnóstico." : "Atualiza os insights primeiro."}</p>
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
                  const tipo = TIPO_LABEL[m.productType || m.mediaType || ""] || { label: m.productType || "post", color: "#7c869c" };
                  const eng = m.likes + m.comments + (m.saved || 0) + (m.shares || 0);
                  return (
                    <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer" className="perfil-post">
                      {m.thumbnail ? <img src={m.thumbnail} alt="" className="perfil-post-thumb" /> : <div className="perfil-post-thumb perfil-post-noimg">sem capa</div>}
                      <div className="perfil-post-body">
                        <div className="perfil-post-top">
                          <span className="perfil-post-tipo" style={{ color: tipo.color, background: tipo.color + "1e" }}>{tipo.label}</span>
                          <span className="perfil-post-date">{m.timestamp ? new Date(m.timestamp).toLocaleDateString("pt-BR") : ""}</span>
                        </div>
                        {m.caption && <p className="perfil-post-cap">{m.caption.slice(0, 80)}</p>}
                        <div className="perfil-post-metrics">
                          {m.reach != null && <span title="alcance">👁 {fmt(m.reach)}</span>}
                          {m.views != null && <span title="views">▶ {fmt(m.views)}</span>}
                          <span title="curtidas">❤ {fmt(m.likes)}</span>
                          <span title="comentários">💬 {fmt(m.comments)}</span>
                          {m.saved != null && <span title="salvos">🔖 {fmt(m.saved)}</span>}
                          {m.shares != null && <span title="compartilhamentos">✈ {fmt(m.shares)}</span>}
                          <span className="perfil-post-eng" title="engajamento total">Σ {fmt(eng)}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
