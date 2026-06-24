"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";

type Cat = { key: string; images: string[] };
type Identity = { logos: { file: string; url: string }[]; active: string | null; palette: { name: string; hex: string }[]; fonts: { primaria: string; secundaria: string; apoio: string } };

export default function Biblioteca() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [newCat, setNewCat] = useState("");
  const [logoV, setLogoV] = useState(0); // cache-bust do preview do logo
  const [busy, setBusy] = useState("");
  const [dragCat, setDragCat] = useState(""); // categoria sob o arrasto (highlight)
  const [editing, setEditing] = useState(""); // categoria sendo renomeada
  const [editName, setEditName] = useState("");
  const logoAddRef = useRef<HTMLInputElement | null>(null);
  const upRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    const [lib, id] = await Promise.all([
      fetch("/api/library?all=1").then((r) => r.json()),
      fetch("/api/identity").then((r) => r.json()),
    ]);
    setCats(lib.library || []);
    setIdentity(id);
  }
  useEffect(() => { load(); }, []);

  async function uploadLogos(files: File[]) {
    if (!files.length) return;
    setBusy("logo");
    try {
      const fd = new FormData(); files.forEach((f) => fd.append("file", f));
      const r = await fetch("/api/identity", { method: "POST", body: fd });
      if (!r.ok) throw new Error();
      setLogoV((v) => v + 1);
      toast(`✓ ${files.length} logo(s) adicionada(s)`);
      await load();
    } catch { toast("erro ao enviar a logo", "err"); }
    setBusy("");
  }
  async function selectLogo(url: string) {
    const r = await fetch("/api/identity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "select", url }) });
    if (r.ok) { setLogoV((v) => v + 1); toast("✓ logo padrão definida — aparece na sidebar e nos cards"); await load(); }
    else toast("erro ao selecionar", "err");
  }
  async function deleteLogo(url: string) {
    await fetch("/api/identity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", url }) });
    setLogoV((v) => v + 1); toast("logo removida"); await load();
  }

  async function createCat() {
    const name = newCat.trim();
    if (!name) return;
    const r = await fetch("/api/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", name }) });
    const d = await r.json();
    if (d.ok) { setNewCat(""); toast(`✓ categoria "${d.key}" criada`); load(); }
    else toast("nome inválido", "err");
  }
  async function delCat(key: string) {
    if (!confirm(`Apagar a categoria "${key}" do catálogo? (os arquivos no disco não são apagados)`)) return;
    await fetch(`/api/library?category=${encodeURIComponent(key)}`, { method: "DELETE" });
    toast("categoria removida"); load();
  }
  async function renameCat(from: string) {
    const name = editName.trim();
    if (!name || name === from) { setEditing(""); return; }
    const r = await fetch("/api/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "rename", from, name }) });
    const d = await r.json();
    if (d.ok) { toast(`✓ renomeada pra "${d.key}"`); setEditing(""); load(); }
    else toast(d.error || "erro ao renomear", "err");
  }
  async function uploadImages(key: string, fileList: FileList | File[] | null) {
    const files = (fileList ? Array.from(fileList) : []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setBusy(key);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("file", f)); // TODOS os arquivos numa requisição só
      fd.append("category", key);
      const r = await fetch("/api/library", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      const n = Array.isArray(d.urls) ? d.urls.length : files.length;
      toast(r.ok ? `✓ ${n} foto(s) em "${key}"` : (d.error || "erro ao enviar"), r.ok ? "ok" : "err");
    } catch { toast("erro ao enviar", "err"); }
    setBusy("");
    load();
  }
  async function delImage(key: string, url: string) {
    await fetch(`/api/library?category=${encodeURIComponent(key)}&image=${encodeURIComponent(url)}`, { method: "DELETE" });
    load();
  }

  const overlays = cats.find((c) => c.key === "overlays")?.images || [];
  const displayCats = cats.filter((c) => c.key !== "overlays");
  const total = displayCats.reduce((a, c) => a + c.images.length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ color: "#9aa0b0", fontSize: 14, maxWidth: 760, lineHeight: 1.5 }}>
        Aqui você gerencia as <b style={{ color: "#cfcfcf" }}>fotos por categoria</b> que a IA usa de fundo nos cards (ela escolhe a categoria pela emoção do texto) e a <b style={{ color: "#cfcfcf" }}>identidade visual</b>. {cats.length} categorias · {total} fotos.
      </div>

      {/* IDENTIDADE VISUAL */}
      <div className="dg-panel" style={{ padding: 18 }}>
        <div className="dg-kicker" style={{ marginBottom: 14 }}>🎨 Identidade visual</div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* LOGOS — quantas quiser; escolhe a PADRÃO (ativa) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1 }}>Logos <span style={{ textTransform: "none", letterSpacing: 0, color: "#7c869c" }}>— a &quot;EM USO&quot; é a padrão (sidebar + cards)</span></div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
              {(identity?.logos || []).map((lg) => {
                const isActive = identity?.active === lg.url;
                return (
                  <div key={lg.url} style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}>
                    <div style={{ position: "relative", width: 84, height: 84, borderRadius: 14, overflow: "hidden", boxShadow: isActive ? "0 0 0 3px #ef476f" : "0 2px 10px rgba(0,0,0,.3)",
                      backgroundColor: "#8a93a8",
                      backgroundImage: "linear-gradient(45deg,#6b7488 25%,transparent 25%),linear-gradient(-45deg,#6b7488 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#6b7488 75%),linear-gradient(-45deg,transparent 75%,#6b7488 75%)",
                      backgroundSize: "14px 14px", backgroundPosition: "0 0,0 7px,7px -7px,-7px 0" }}>
                      <img src={`${lg.url}?v=${logoV}`} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      {isActive && <span style={{ position: "absolute", bottom: 3, right: 3, background: "#ef476f", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4 }}>EM USO</span>}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {!isActive && <button onClick={() => selectLogo(lg.url)} className="dg-btn-primary" style={{ fontSize: 10.5, padding: "4px 8px" }}>usar</button>}
                      <button onClick={() => deleteLogo(lg.url)} title="remover" style={{ fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>×</button>
                    </div>
                  </div>
                );
              })}
              {/* adicionar nova logo */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}>
                <button onClick={() => logoAddRef.current?.click()} disabled={busy === "logo"} title="adicionar logo"
                  style={{ width: 84, height: 84, borderRadius: 14, border: "1.5px dashed #4a5a7a", background: "transparent", color: "#8a93a8", fontSize: 30, cursor: "pointer" }}>{busy === "logo" ? "…" : "+"}</button>
                <span style={{ fontSize: 10, color: "#7c869c" }}>adicionar</span>
                <input ref={logoAddRef} type="file" accept="image/png,image/*" multiple hidden onChange={(e) => { uploadLogos(Array.from(e.target.files || [])); e.currentTarget.value = ""; }} />
              </div>
            </div>
            <span style={{ fontSize: 10.5, color: "#7c869c" }}>PNG com fundo transparente é o ideal (sem fundo branco)</span>
          </div>
          {/* PALETA */}
          <div>
            <div style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Paleta</div>
            <div style={{ display: "flex", gap: 10 }}>
              {(identity?.palette || []).map((c) => (
                <div key={c.hex} style={{ textAlign: "center" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: c.hex, border: "1px solid var(--dg-line)" }} />
                  <div style={{ fontSize: 10.5, color: "#9aa0b0", marginTop: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 9.5, color: "#66718f" }}>{c.hex}</div>
                </div>
              ))}
            </div>
          </div>
          {/* FONTES */}
          <div>
            <div style={{ fontSize: 11.5, color: "#b0b6c4", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Fontes</div>
            {identity && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#cfcfcf" }}>
                <span><b style={{ fontFamily: "'Anton',sans-serif", fontSize: 18, letterSpacing: 0.5 }}>ANTON</b> <span style={{ color: "#7c869c" }}>— títulos</span></span>
                <span style={{ fontFamily: "'Inter',sans-serif" }}>Inter <span style={{ color: "#7c869c" }}>— corpo</span></span>
                <span style={{ fontFamily: "'Montserrat',sans-serif" }}>Montserrat <span style={{ color: "#7c869c" }}>— apoio</span></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAYS — figuras por cima dos cards */}
      <div className="dg-panel"
        onDragOver={(e) => { e.preventDefault(); if (dragCat !== "overlays") setDragCat("overlays"); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragCat((d) => (d === "overlays" ? "" : d)); }}
        onDrop={(e) => { e.preventDefault(); setDragCat(""); uploadImages("overlays", Array.from(e.dataTransfer.files)); }}
        style={{ padding: 14, outline: dragCat === "overlays" ? "2px dashed #ef476f" : "none", outlineOffset: -2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <span className="dg-kicker">🧩 Overlays — imagens por cima</span>
          <span style={{ fontSize: 12, color: "#7c869c" }}>{overlays.length} figura(s)</span>
          <span style={{ fontSize: 11, color: "#5a6378" }}>{dragCat === "overlays" ? "solta que eu subo 👇" : "PNG transparente — recortes que vão por cima dos cards"}</span>
          <span style={{ flex: 1 }} />
          <button onClick={() => upRefs.current["overlays"]?.click()} disabled={busy === "overlays"} className="dg-btn" style={{ fontSize: 12, padding: "6px 12px" }}>{busy === "overlays" ? "enviando…" : "⬆ subir overlays"}</button>
          <input ref={(el) => { upRefs.current["overlays"] = el; }} type="file" accept="image/png,image/*" multiple hidden onChange={(e) => { uploadImages("overlays", Array.from(e.target.files || [])); e.currentTarget.value = ""; }} />
        </div>
        {overlays.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6 }}>
            {overlays.map((src) => (
              <div key={src} style={{ position: "relative", aspectRatio: "1", borderRadius: 6, overflow: "hidden",
                backgroundColor: "#8a93a8", backgroundImage: "linear-gradient(45deg,#6b7488 25%,transparent 25%),linear-gradient(-45deg,#6b7488 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#6b7488 75%),linear-gradient(-45deg,transparent 75%,#6b7488 75%)", backgroundSize: "12px 12px", backgroundPosition: "0 0,0 6px,6px -6px,-6px 0" }}>
                <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                <button onClick={() => delImage("overlays", src)} title="remover" style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: 5, background: "rgba(0,0,0,.7)", color: "#ff7a9a", border: "none", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#7c869c", padding: "14px 0", textAlign: "center", border: "1.5px dashed #2e2e36", borderRadius: 8 }}>🖱️ Arraste PNGs transparentes aqui — depois no Criar, em "Imagens por cima → 📚 biblioteca", você seleciona</div>
        )}
      </div>

      {/* CRIAR CATEGORIA */}
      <div className="dg-panel" style={{ padding: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span className="dg-kicker">📁 Nova categoria de fotos</span>
        <input value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createCat()}
          placeholder="ex: foco, treino-pesado, antes-depois, bastidores…" className="dg-input" style={{ flex: 1, minWidth: 220 }} />
        <button onClick={createCat} className="dg-btn-primary" style={{ padding: "9px 16px" }}>+ criar</button>
      </div>

      {/* CATEGORIAS */}
      {!displayCats.length && <div style={{ color: "#7c869c", fontSize: 13 }}>Nenhuma categoria ainda. Cria uma acima e sobe fotos.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {displayCats.map((c) => (
          <div key={c.key} className="dg-box"
            onDragOver={(e) => { e.preventDefault(); if (dragCat !== c.key) setDragCat(c.key); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragCat((d) => (d === c.key ? "" : d)); }}
            onDrop={(e) => { e.preventDefault(); setDragCat(""); uploadImages(c.key, Array.from(e.dataTransfer.files)); }}
            style={{ padding: 14, transition: "background .12s, outline .12s", outline: dragCat === c.key ? "2px dashed #ef476f" : "none", outlineOffset: -2, background: dragCat === c.key ? "#241420" : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              {editing === c.key ? (
                <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") renameCat(c.key); if (e.key === "Escape") setEditing(""); }}
                    className="dg-input" style={{ fontSize: 14, padding: "4px 8px", width: 180 }} />
                  <button onClick={() => renameCat(c.key)} className="dg-btn-primary" style={{ fontSize: 11, padding: "5px 10px" }}>✓ salvar</button>
                  <button onClick={() => setEditing("")} className="dg-btn" style={{ fontSize: 11, padding: "5px 9px" }}>✕</button>
                </span>
              ) : (
                <span style={{ display: "flex", gap: 7, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#fff", letterSpacing: 0.5 }}>{c.key}</span>
                  <button onClick={() => { setEditing(c.key); setEditName(c.key); }} title="renomear categoria" style={{ fontSize: 12, background: "transparent", color: "#7c869c", border: "1px solid #2e2e36", borderRadius: 6, padding: "2px 7px", cursor: "pointer" }}>✎</button>
                </span>
              )}
              {c.key.startsWith("coach") && <span className="dg-chip" style={{ color: "#e8c860", borderColor: "#6a5a1e" }}>capa</span>}
              <span style={{ fontSize: 12, color: "#7c869c" }}>{c.images.length} foto(s)</span>
              <span style={{ fontSize: 11, color: "#5a6378" }}>{dragCat === c.key ? "solta que eu subo 👇" : "ou arraste as fotos aqui"}</span>
              <span style={{ flex: 1 }} />
              <button onClick={() => upRefs.current[c.key]?.click()} disabled={busy === c.key} className="dg-btn" style={{ fontSize: 12, padding: "6px 12px" }}>
                {busy === c.key ? "enviando…" : "⬆ subir fotos"}
              </button>
              <input ref={(el) => { upRefs.current[c.key] = el; }} type="file" accept="image/*" multiple hidden onChange={(e) => { uploadImages(c.key, Array.from(e.target.files || [])); e.currentTarget.value = ""; }} />
              <button onClick={() => delCat(c.key)} style={{ fontSize: 12, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 7, padding: "6px 11px", cursor: "pointer" }}>apagar categoria</button>
            </div>
            {c.images.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6 }}>
                {c.images.map((src) => (
                  <div key={src} style={{ position: "relative", aspectRatio: "1", borderRadius: 6, overflow: "hidden", border: "1px solid #2e2e36" }}>
                    <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => delImage(c.key, src)} title="remover foto"
                      style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: 5, background: "rgba(0,0,0,.7)", color: "#ff7a9a", border: "none", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#7c869c", padding: "14px 0", textAlign: "center", border: "1.5px dashed #2e2e36", borderRadius: 8 }}>🖱️ Arraste as fotos pra cá — ou clica em <b style={{ color: "#cfcfcf" }}>subir fotos</b></div>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11.5, color: "#66718f", lineHeight: 1.5, maxWidth: 760, marginTop: 4 }}>
        💡 A categoria <b style={{ color: "#9aa0b0" }}>coach</b> (e qualquer uma que comece com <b style={{ color: "#9aa0b0" }}>coach</b>) é usada pra <b style={{ color: "#9aa0b0" }}>foto de capa</b> do carrossel. As outras são os "sentimentos" que a IA escolhe pelo clima do texto. Organize por <b style={{ color: "#9aa0b0" }}>emoção</b>, não por assunto.
      </div>
    </div>
  );
}
