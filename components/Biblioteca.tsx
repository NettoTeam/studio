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
  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/library?all=1").then((r) => r.json()),
      fetch("/api/identity").then((r) => r.json()),
    ])
      .then(([lib, id]) => {
        if (!alive) return;
        setCats(lib.library || []);
        setIdentity(id);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

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
    <div className="studio-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>Assets organizados para a IA criar com identidade</h2>
          <p>Fotos por categoria, overlays, logos, paleta e fontes ficam reunidos aqui como materia-prima dos cards</p>
        </div>
        <div className="studio-hero__side" aria-hidden="true">
          <div className="studio-stat"><strong>{displayCats.length}</strong><span>Categorias</span></div>
          <div className="studio-stat"><strong>{total}</strong><span>Fotos</span></div>
          <div className="studio-stat"><strong>{overlays.length}</strong><span>Overlays</span></div>
          <div className="studio-stat"><strong>{identity?.logos?.length || 0}</strong><span>Logos</span></div>
        </div>
      </section>

      {/* IDENTIDADE VISUAL */}
      <section className="studio-section studio-section--pad">
        <div className="studio-section-head">
          <h3>Identidade visual</h3>
          <p>logo, paleta e fontes em uso</p>
        </div>
        <div className="library-grid">
          {/* LOGOS — quantas quiser; escolhe a PADRÃO (ativa) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="studio-eyebrow" style={{ fontSize: 10.5 }}>Logos</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
              {(identity?.logos || []).map((lg) => {
                const isActive = identity?.active === lg.url;
                return (
                  <div key={lg.url} style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}>
                    <div className={"logo-tile" + (isActive ? " is-active" : "")}>
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
                  style={{ width: 86, height: 86, borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.025)", color: "#8a93a8", fontSize: 30, cursor: "pointer" }}>{busy === "logo" ? "subindo" : "+"}</button>
                <span style={{ fontSize: 10, color: "#7c869c" }}>adicionar</span>
                <input ref={logoAddRef} type="file" accept="image/png,image/*" multiple hidden onChange={(e) => { uploadLogos(Array.from(e.target.files || [])); e.currentTarget.value = ""; }} />
              </div>
            </div>
            <span style={{ fontSize: 10.5, color: "#7c869c" }}>PNG com fundo transparente é o ideal (sem fundo branco)</span>
          </div>
          <div className="studio-grid-2">
          {/* PALETA */}
          <div>
            <div className="studio-eyebrow" style={{ fontSize: 10.5, marginBottom: 9 }}>Paleta</div>
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
            <div className="studio-eyebrow" style={{ fontSize: 10.5, marginBottom: 9 }}>Fontes</div>
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
      </section>

      {/* OVERLAYS — figuras por cima dos cards */}
      <section className={"studio-section studio-section--pad" + (dragCat === "overlays" ? " is-over" : "")}
        onDragOver={(e) => { e.preventDefault(); if (dragCat !== "overlays") setDragCat("overlays"); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragCat((d) => (d === "overlays" ? "" : d)); }}
        onDrop={(e) => { e.preventDefault(); setDragCat(""); uploadImages("overlays", Array.from(e.dataTransfer.files)); }}>
        <div className="studio-section-head">
          <h3>Overlays</h3>
          <span style={{ fontSize: 12, color: "#7c869c" }}>{overlays.length} figura(s)</span>
          <p>{dragCat === "overlays" ? "solte para subir" : "PNGs transparentes para compor cards"}</p>
          <span className="spacer" />
          <button onClick={() => upRefs.current["overlays"]?.click()} disabled={busy === "overlays"} className="dg-btn" style={{ fontSize: 12, padding: "6px 12px" }}>{busy === "overlays" ? "enviando" : "subir overlays"}</button>
          <input ref={(el) => { upRefs.current["overlays"] = el; }} type="file" accept="image/png,image/*" multiple hidden onChange={(e) => { uploadImages("overlays", Array.from(e.target.files || [])); e.currentTarget.value = ""; }} />
        </div>
        {overlays.length > 0 ? (
          <div className="media-grid">
            {overlays.map((src) => (
              <div key={src} className="media-tile media-tile--contain">
                <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                <button onClick={() => delImage("overlays", src)} title="remover" className="tile-remove">x</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="studio-empty">Arraste PNGs transparentes aqui</div>
        )}
      </section>

      {/* CRIAR CATEGORIA */}
      <section className="studio-section board-quick-add">
        <span className="studio-eyebrow" style={{ fontSize: 10.5 }}>Nova categoria</span>
        <input value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createCat()}
          placeholder="ex: foco, treino-pesado, antes-depois, bastidores" className="studio-input" style={{ flex: 1, minWidth: 220 }} />
        <button onClick={createCat} className="dg-btn-primary" style={{ padding: "9px 16px" }}>+ criar</button>
      </section>

      {/* CATEGORIAS */}
      {!displayCats.length && <div className="studio-empty">Nenhuma categoria ainda</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {displayCats.map((c) => (
          <section key={c.key} className={"studio-section studio-section--pad" + (dragCat === c.key ? " is-over" : "")}
            onDragOver={(e) => { e.preventDefault(); if (dragCat !== c.key) setDragCat(c.key); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragCat((d) => (d === c.key ? "" : d)); }}
            onDrop={(e) => { e.preventDefault(); setDragCat(""); uploadImages(c.key, Array.from(e.dataTransfer.files)); }}>
            <div className="studio-section-head">
              {editing === c.key ? (
                <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") renameCat(c.key); if (e.key === "Escape") setEditing(""); }}
                    className="studio-input" style={{ fontSize: 14, padding: "6px 9px", width: 180 }} />
                  <button onClick={() => renameCat(c.key)} className="dg-btn-primary" style={{ fontSize: 11, padding: "5px 10px" }}>✓ salvar</button>
                  <button onClick={() => setEditing("")} className="dg-btn" style={{ fontSize: 11, padding: "5px 9px" }}>✕</button>
                </span>
              ) : (
                <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                  <h3>{c.key}</h3>
                  <button onClick={() => { setEditing(c.key); setEditName(c.key); }} title="renomear categoria" className="studio-mini-btn" type="button">editar</button>
                </div>
              )}
              {c.key.startsWith("coach") && <span className="dg-chip" style={{ color: "#e8c860", borderColor: "#6a5a1e" }}>capa</span>}
              <span style={{ fontSize: 12, color: "#7c869c" }}>{c.images.length} foto(s)</span>
              <p>{dragCat === c.key ? "solte para subir" : "arraste fotos aqui"}</p>
              <span className="spacer" />
              <button onClick={() => upRefs.current[c.key]?.click()} disabled={busy === c.key} className="dg-btn" style={{ fontSize: 12, padding: "6px 12px" }}>
                {busy === c.key ? "enviando" : "subir fotos"}
              </button>
              <input ref={(el) => { upRefs.current[c.key] = el; }} type="file" accept="image/*" multiple hidden onChange={(e) => { uploadImages(c.key, Array.from(e.target.files || [])); e.currentTarget.value = ""; }} />
              <button onClick={() => delCat(c.key)} className="studio-danger-btn" type="button">apagar</button>
            </div>
            {c.images.length > 0 ? (
              <div className="media-grid">
                {c.images.map((src) => (
                  <div key={src} className="media-tile">
                    <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => delImage(c.key, src)} title="remover foto"
                      className="tile-remove">x</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="studio-empty">Arraste fotos para esta categoria</div>
            )}
          </section>
        ))}
      </div>

      <div className="studio-note">
        A categoria <b style={{ color: "#9aa0b0" }}>coach</b> e qualquer uma que comece com <b style={{ color: "#9aa0b0" }}>coach</b> é usada como foto de capa. As outras funcionam melhor por emoção.
      </div>
    </div>
  );
}
