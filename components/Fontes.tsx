"use client";

import { useEffect, useRef, useState } from "react";

type Src = { id: string; title: string; kind?: string; url?: string; tags?: string; chars: number; chunks?: number; createdAt?: string };

const KIND_ICO: Record<string, string> = { pdf: "PDF", url: "URL", texto: "TXT", livro: "LIV" };
const KIND_LABEL: Record<string, string> = { pdf: "PDF", url: "URL", texto: "Texto", livro: "Livro" };

export default function Fontes() {
  const [sources, setSources] = useState<Src[]>([]);
  const [tab, setTab] = useState<"pdf" | "texto" | "url">("pdf");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const r = await fetch("/api/sources");
    const d = await r.json();
    setSources(d.sources || []);
  }
  useEffect(() => {
    let alive = true;
    async function boot() {
      const r = await fetch("/api/sources");
      const d = await r.json();
      if (alive) setSources(d.sources || []);
    }
    boot().catch(() => {});
    return () => { alive = false; };
  }, []);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function uploadPdf(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      if (title) fd.append("title", title);
      const r = await fetch("/api/sources", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) { flash("⚠ " + (d.error || "erro") + " — " + f.name); }
    }
    setBusy(false); setTitle(""); if (fileRef.current) fileRef.current.value = "";
    flash("Fonte(s) adicionada(s) ✓"); load();
  }

  async function addText() {
    if (!text.trim()) return;
    setBusy(true);
    const r = await fetch("/api/sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, text }) });
    const d = await r.json(); setBusy(false);
    if (!r.ok) return flash("⚠ " + (d.error || "erro"));
    setTitle(""); setText(""); flash("Texto adicionado ✓"); load();
  }

  async function addUrl() {
    if (!url.trim()) return;
    setBusy(true);
    const r = await fetch("/api/sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, url }) });
    const d = await r.json(); setBusy(false);
    if (!r.ok) return flash("⚠ " + (d.error || "erro"));
    setTitle(""); setUrl(""); flash("Artigo importado ✓"); load();
  }

  async function del(id: string) {
    await fetch(`/api/sources?id=${id}`, { method: "DELETE" });
    load();
  }

  const pdfs = sources.filter((s) => s.kind === "pdf").length;
  const urls = sources.filter((s) => s.kind === "url").length;
  const texts = sources.filter((s) => !s.kind || s.kind === "texto").length;
  const indexed = sources.reduce((acc, s) => acc + (s.kind === "livro" ? (s.chunks || 0) : Math.round((s.chars || 0) / 1000)), 0);

  return (
    <div className="studio-page sources-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>Fontes que dão repertório para a IA</h2>
          <p>Livros, estudos, artigos e textos de referência ficam organizados aqui para sustentar as próximas gerações com contexto real</p>
        </div>
        <div className="studio-hero__side">
          <div className="studio-stat"><strong>{sources.length}</strong><span>Fontes</span></div>
          <div className="studio-stat"><strong>{pdfs}</strong><span>PDFs</span></div>
          <div className="studio-stat"><strong>{urls}</strong><span>URLs</span></div>
          <div className="studio-stat"><strong>{indexed.toLocaleString("pt-BR")}</strong><span>Base</span></div>
        </div>
      </section>

      <section className="studio-section studio-section--pad source-ingest">
        <div className="studio-section-head">
          <h3>Adicionar fonte</h3>
          <p>PDF, texto colado ou URL importada para consulta permanente</p>
          <span className="spacer" />
          {msg && <span className={"source-message" + (msg.startsWith("⚠") ? " is-error" : "")}>{msg}</span>}
        </div>

        <div className="source-tabs" role="tablist" aria-label="Tipo de fonte">
          {(["pdf", "texto", "url"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={"source-tab" + (tab === t ? " is-active" : "")}>
              <span>{KIND_ICO[t]}</span>
              {t === "pdf" ? "PDF" : t === "texto" ? "Colar texto" : "Importar URL"}
            </button>
          ))}
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da fonte (opcional)" className="studio-input source-title" />

        {tab === "pdf" && (
          <div
            className="source-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); uploadPdf(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
          >
            <div className="source-drop-mark">PDF</div>
            <strong>{busy ? "Lendo o PDF" : "Arrasta o PDF aqui ou clica para escolher"}</strong>
            <span>Vários arquivos podem entrar de uma vez</span>
            <input ref={fileRef} type="file" accept="application/pdf" multiple hidden onChange={(e) => uploadPdf(e.target.files)} />
          </div>
        )}

        {tab === "texto" && (
          <div className="source-form">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Cola o trecho do estudo, artigo ou anotação" className="studio-textarea source-textarea" />
            <button onClick={addText} disabled={busy} className="dg-btn-primary">{busy ? "Salvando" : "Adicionar texto"}</button>
          </div>
        )}

        {tab === "url" && (
          <div className="source-url-row">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://artigo.com/estudo" className="studio-input" />
            <button onClick={addUrl} disabled={busy} className="dg-btn-primary">{busy ? "Importando" : "Importar"}</button>
          </div>
        )}
      </section>

      <section className="studio-section studio-section--pad">
        <div className="studio-section-head">
          <h3>Base indexada</h3>
          <p>{pdfs} PDFs · {urls} URLs · {texts} textos colados</p>
        </div>

        {!sources.length ? (
          <div className="studio-empty">Base vazia. Sobe um PDF ou cola um texto para começar</div>
        ) : (
          <div className="source-list">
            {sources.map((s) => (
              <article key={s.id} className="source-card">
                <span className="source-kind">{KIND_ICO[s.kind || "texto"]}</span>
                <div className="source-card-main">
                  <strong>{s.title}</strong>
                  <span>
                    {KIND_LABEL[s.kind || "texto"]} · {s.kind === "livro" ? `${(s.chunks || 0).toLocaleString("pt-BR")} trechos indexados` : `${((s.chars || 0) / 1000).toFixed(1)}k caracteres`}
                    {s.createdAt ? " · " + new Date(s.createdAt).toLocaleDateString("pt-BR") : ""}
                  </span>
                </div>
                <button onClick={() => del(s.id)} className="studio-danger-btn">excluir</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
