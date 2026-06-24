"use client";

import { useEffect, useRef, useState } from "react";

type Src = { id: string; title: string; kind?: string; url?: string; tags?: string; chars: number; chunks?: number; createdAt?: string };

const KIND_ICO: Record<string, string> = { pdf: "📄", url: "🔗", texto: "✍️", livro: "📚" };

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
  useEffect(() => { load(); }, []);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ color: "#9aa0b0", fontSize: 14, maxWidth: 720, lineHeight: 1.5 }}>
        Sua <b style={{ color: "#cfcfcf" }}>biblioteca</b> — livros, estudos, material completo. Isto vira <b style={{ color: "#ef476f" }}>conhecimento de fundo da IA</b>: ela usa de repertório em tudo que gera, sem você precisar selecionar nada. <span style={{ color: "#7c869c" }}>(Pra embasar UM conteúdo específico num artigo, use o campo "Fonte deste conteúdo" lá na tela Criar.)</span>
      </div>

      <div className="dg-panel" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {(["pdf", "texto", "url"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ background: tab === t ? "#ef476f" : "transparent", color: tab === t ? "#fff" : "#9aa0b0", border: "1px solid " + (tab === t ? "#ef476f" : "#3d4d6d"), borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              {KIND_ICO[t]} {t === "pdf" ? "PDF" : t === "texto" ? "Colar texto" : "Importar URL"}
            </button>
          ))}
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da fonte (opcional)"
          className="dg-input" style={{ width: "100%", marginBottom: 10 }} />

        {tab === "pdf" && (
          <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); uploadPdf(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            style={{ border: "1.5px dashed #2a3552", borderRadius: 12, padding: "34px 16px", textAlign: "center", cursor: "pointer", color: "#9aa0b0", background: "#101728" }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>📄</div>
            {busy ? "Lendo o PDF..." : "Arrasta o PDF aqui ou clica pra escolher"}
            <input ref={fileRef} type="file" accept="application/pdf" multiple hidden onChange={(e) => uploadPdf(e.target.files)} />
          </div>
        )}

        {tab === "texto" && (
          <div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Cola o trecho do estudo/artigo..."
              className="dg-input" style={{ width: "100%", height: 150, resize: "vertical", fontSize: 14 }} />
            <button onClick={addText} disabled={busy} className="dg-btn-primary" style={{ marginTop: 10, padding: "9px 20px" }}>{busy ? "Salvando..." : "Adicionar texto"}</button>
          </div>
        )}

        {tab === "url" && (
          <div style={{ display: "flex", gap: 10 }}>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://artigo.com/estudo..." className="dg-input" style={{ flex: 1 }} />
            <button onClick={addUrl} disabled={busy} className="dg-btn-primary" style={{ padding: "9px 20px", whiteSpace: "nowrap" }}>{busy ? "Importando..." : "Importar"}</button>
          </div>
        )}

        {msg && <div style={{ marginTop: 10, color: msg.startsWith("⚠") ? "#e08" : "#4caf50", fontSize: 13 }}>{msg}</div>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="dg-kicker">{sources.length} fonte(s) na base</div>
        {!sources.length && <div style={{ color: "#56607c", fontSize: 13 }}>Base vazia. Sobe um PDF que ela aparece aqui.</div>}
        {sources.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#101728", border: "1px solid #2a3552", borderRadius: 10, padding: "12px 14px" }}>
            <span style={{ fontSize: 20 }}>{KIND_ICO[s.kind || "texto"]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
              <div style={{ color: "#7c869c", fontSize: 12 }}>{s.kind === "livro" ? `${(s.chunks || 0).toLocaleString("pt-BR")} trechos indexados` : `${(s.chars / 1000).toFixed(1)}k caracteres`}{s.createdAt ? " · " + new Date(s.createdAt).toLocaleDateString("pt-BR") : ""}</div>
            </div>
            <button onClick={() => del(s.id)} style={{ background: "transparent", color: "#e0738c", border: "1px solid #2a3552", borderRadius: 6, padding: "5px 11px", cursor: "pointer", fontSize: 12 }}>excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}
