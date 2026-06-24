"use client";

import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";

type Pauta = { id: string; tema: string; angulo: string; pilar?: string };

export default function Pautas({ onUse, onIdea }: { onUse: (tema: string, angulo: string) => void; onIdea: (tema: string, context?: string) => void }) {
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [origs, setOrigs] = useState<Record<string, string>>({}); // id -> angulo original (pra saber se editou)
  const [loading, setLoading] = useState(false);

  // persiste as pautas geradas — não se perdem ao trocar de aba e voltar
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("dg_pautas");
      if (raw) { const d = JSON.parse(raw); setPautas(d.pautas || []); setOrigs(d.origs || {}); }
    } catch {}
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem("dg_pautas", JSON.stringify({ pautas, origs })); } catch {}
  }, [pautas, origs]);

  async function gen() {
    setLoading(true);
    try {
      const r = await fetch("/api/suggest", { method: "POST" });
      const d = await r.json();
      const ps: Pauta[] = (d.pautas || []).map((p: Omit<Pauta, "id">) => ({ ...p, id: crypto.randomUUID() }));
      setPautas(ps);
      setOrigs(Object.fromEntries(ps.map((p) => [p.id, p.angulo])));
    } catch { toast("erro ao sugerir pautas", "err"); }
    setLoading(false);
  }
  function setField(id: string, key: "tema" | "angulo", v: string) {
    setPautas((ps) => ps.map((p) => (p.id === id ? { ...p, [key]: v } : p)));
  }
  function remove(id: string) { setPautas((ps) => ps.filter((p) => p.id !== id)); }

  function guardar(p: Pauta) {
    onIdea(p.tema, `Tema: ${p.tema}\nÂngulo: ${p.angulo}`); // salva a TUA versão (editada) no Quadro
    // APRENDE COM A EDIÇÃO: se você mexeu no ângulo, a tua versão vira exemplo da tua voz
    const o = origs[p.id];
    const edited = o != null && p.angulo.trim() !== o.trim();
    if (edited && p.angulo.trim().length >= 40) {
      fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: p.angulo.trim(), note: "pauta editada" }) }).catch(() => {});
      toast("✓ guardado em Ideias · ✏️ aprendi com tua edição");
    } else {
      toast("✓ guardado em Ideias");
    }
    remove(p.id); // some da tela — não polui
  }
  function naoCurti(p: Pauta) {
    fetch("/api/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "pauta", text: `${p.tema} — ${p.angulo}` }) }).catch(() => {});
    toast("👎 anotado — a IA evita esse tipo");
    remove(p.id); // some da tela
  }

  return (
    <div>
      <div className="dg-panel" style={{ padding: 18, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ color: "var(--dg-grey)", fontSize: 14, flex: 1, minWidth: 280 }}>
          A IA sugere pautas novas com base no que dá certo pra você + no que já postou (sem repetir). Pode <b style={{ color: "var(--dg-text)" }}>editar</b> antes de guardar — e ao guardar ou recusar, a pauta <b style={{ color: "var(--dg-text)" }}>sai da tela</b>.
        </div>
        <button className="dg-btn-primary" onClick={gen} disabled={loading} style={{ padding: "10px 20px" }}>{loading ? "Pensando…" : "Sugerir pautas"}</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pautas.map((p) => (
          <div key={p.id} className="dg-card" style={{ padding: 16 }}>
            <textarea value={p.tema} onChange={(e) => setField(p.id, "tema", e.target.value)} rows={1}
              style={{ width: "100%", background: "transparent", color: "var(--dg-white)", border: "1px solid transparent", borderRadius: 6, padding: "4px 6px", fontSize: 17, fontWeight: 700, marginBottom: 2, resize: "none", fontFamily: "inherit" }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid var(--dg-line)")} onBlur={(e) => (e.currentTarget.style.border = "1px solid transparent")} />
            <textarea value={p.angulo} onChange={(e) => setField(p.id, "angulo", e.target.value)} rows={2}
              style={{ width: "100%", background: "transparent", color: "var(--dg-text)", border: "1px solid transparent", borderRadius: 6, padding: "4px 6px", fontSize: 14, lineHeight: 1.5, marginBottom: p.pilar ? 6 : 10, resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid var(--dg-line)")} onBlur={(e) => (e.currentTarget.style.border = "1px solid transparent")} />
            {p.pilar && <div style={{ fontSize: 11, color: "#9a8f6a", marginBottom: 12, paddingLeft: 6 }} title="pilar de marca de onde a pauta nasceu">💎 pilar: {p.pilar}</div>}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="dg-btn-primary" onClick={() => onUse(p.tema, p.angulo)} style={{ padding: "7px 14px", fontSize: 13 }}>criar agora</button>
              <button className="dg-btn" onClick={() => guardar(p)} style={{ padding: "7px 14px", fontSize: 13 }}>→ guardar em Ideias</button>
              <span style={{ flex: 1 }} />
              <button onClick={() => naoCurti(p)} title="Não curti — a IA aprende a NÃO sugerir esse tipo de pauta/tom" style={{ background: "transparent", color: "#9a8a90", border: "1px solid #3a2a32", borderRadius: 7, padding: "7px 12px", fontSize: 13, cursor: "pointer" }}>👎 não curti</button>
            </div>
          </div>
        ))}
        {!pautas.length && !loading && <div style={{ color: "var(--dg-faint)", padding: "20px 2px" }}>Clica em “Sugerir pautas” que a IA te entrega ideias pro próximo conteúdo. Conforme você guarda ou recusa, elas saem daqui.</div>}
      </div>
    </div>
  );
}
