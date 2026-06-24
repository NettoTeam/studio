"use client";

import { useEffect, useState } from "react";
import Pautas from "@/components/Pautas";

type Model = { grandeTese: string; inimigo: string; pilares: string[]; temas: string[]; historia: string };

const box: React.CSSProperties = { padding: 16, marginBottom: 14 };
const ta: React.CSSProperties = { width: "100%", background: "#101728", color: "#f5f5f5", border: "1px solid #2a3552", borderRadius: 8, padding: 12, fontSize: 14, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit" };

export default function Marca({ onUse, onIdea }: { onUse?: (tema: string, angulo: string) => void; onIdea?: (tema: string, context?: string) => void }) {
  const [model, setModel] = useState<Model>({ grandeTese: "", inimigo: "", pilares: [], temas: [], historia: "" });
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const br = await fetch("/api/brain").then((r) => r.json());
    if (br.model) setModel(br.model);
    setLoaded(true);
  }
  useEffect(() => { load(); }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 2500); }
  async function save() {
    await fetch("/api/brain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model }) });
    flash("Marca salva ✓ — pilares e temas já valem nas pautas");
  }
  const setPilar = (i: number, v: string) => setModel((m) => ({ ...m, pilares: m.pilares.map((p, idx) => (idx === i ? v : p)) }));
  const delPilar = (i: number) => setModel((m) => ({ ...m, pilares: m.pilares.filter((_, idx) => idx !== i) }));
  const addPilar = () => setModel((m) => ({ ...m, pilares: [...m.pilares, ""] }));
  const setTema = (i: number, v: string) => setModel((m) => ({ ...m, temas: m.temas.map((t, idx) => (idx === i ? v : t)) }));
  const delTema = (i: number) => setModel((m) => ({ ...m, temas: m.temas.filter((_, idx) => idx !== i) }));
  const addTema = () => setModel((m) => ({ ...m, temas: [...m.temas, ""] }));

  if (!loaded) return <div style={{ color: "#9aa0b0", padding: 30 }}>Carregando a marca…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ color: "#9aa0b0", fontSize: 14, marginBottom: 12, maxWidth: 760, lineHeight: 1.5 }}>
        A identidade da marca: a tese central, o inimigo, os pilares e os temas. Daqui saem as <b style={{ color: "#cfcfcf" }}>pautas</b> — pega uma e manda pro Criar.
      </div>

      {/* VISÃO + INIMIGO */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <div className="dg-box" style={{ ...box, flex: 1, minWidth: 280, marginBottom: 0, borderLeft: "3px solid #e8c860" }}>
          <div className="dg-kicker" style={{ color: "#e8c860", marginBottom: 8 }}>💎 Sua visão (Grande Tese)</div>
          <textarea value={model.grandeTese} onChange={(e) => setModel({ ...model, grandeTese: e.target.value })} rows={3} style={{ ...ta, fontSize: 16, fontWeight: 600 }} />
        </div>
        <div className="dg-box" style={{ ...box, flex: 1, minWidth: 280, marginBottom: 0, borderLeft: "3px solid #ef476f" }}>
          <div className="dg-kicker" style={{ color: "#ff6b8f", marginBottom: 8 }}>⚔ O que você combate (Inimigo)</div>
          <textarea value={model.inimigo} onChange={(e) => setModel({ ...model, inimigo: e.target.value })} rows={3} style={{ ...ta, fontSize: 16, fontWeight: 600 }} />
        </div>
      </div>

      {msg && <div style={{ color: "#7ed957", fontSize: 13, marginBottom: 6 }}>{msg}</div>}

      {/* PILARES */}
      <div className="dg-box" style={box}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span className="dg-kicker"># Pilares ({model.pilares.length}) — cada um é um ângulo de conteúdo</span>
          <button onClick={addPilar} style={{ fontSize: 11, background: "#1b2a4a", color: "#cfcfcf", border: "1px solid #3d4d6d", borderRadius: 6, padding: "2px 9px", cursor: "pointer" }}>+ pilar</button>
        </div>
        {model.pilares.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, color: "#56607c", width: 18, textAlign: "right", paddingTop: 10 }}>{String(i + 1).padStart(2, "0")}</span>
            <textarea value={p} onChange={(e) => setPilar(i, e.target.value)} rows={1} style={{ ...ta, fontSize: 13, padding: "8px 10px" }} />
            <button onClick={() => delPilar(i)} style={{ fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 6, padding: "6px 9px", cursor: "pointer", flexShrink: 0 }}>×</button>
          </div>
        ))}
      </div>

      {/* TEMAS */}
      <div className="dg-box" style={box}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span className="dg-kicker">◎ Temas que você domina ({model.temas.length})</span>
          <button onClick={addTema} style={{ fontSize: 11, background: "#1b2a4a", color: "#cfcfcf", border: "1px solid #3d4d6d", borderRadius: 6, padding: "2px 9px", cursor: "pointer" }}>+ tema</button>
        </div>
        {model.temas.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "center" }}>
            <textarea value={t} onChange={(e) => setTema(i, e.target.value)} rows={1} style={{ ...ta, fontSize: 13, padding: "8px 10px" }} />
            <button onClick={() => delTema(i)} style={{ fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 6, padding: "6px 9px", cursor: "pointer", flexShrink: 0 }}>×</button>
          </div>
        ))}
      </div>

      {/* MINHA HISTÓRIA — material real pra IA ancorar conteúdo de marca pessoal (não inventar) */}
      <div className="dg-box" style={{ ...box, borderLeft: "3px solid #8a6a3a" }}>
        <div className="dg-kicker" style={{ color: "#caa46a", marginBottom: 6 }}>🩷 Minha história — a tua vida real</div>
        <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 10, lineHeight: 1.5 }}>
          Quando o post é sobre <b style={{ color: "#9aa0b0" }}>marca pessoal / história</b>, a IA ancora NISTO — pra puxar momentos e cenas <b style={{ color: "#9aa0b0" }}>reais</b> tuas, não genéricas. Quanto mais verdade você puser aqui (momentos, cenas, datas, o que sentiu), melhor ela conta a sua história. <b style={{ color: "#9aa0b0" }}>Deixei vazio de propósito</b> — preenche com a SUA história. Enquanto estiver vazio, a IA não inventa nada.
        </div>
        <textarea value={model.historia} onChange={(e) => setModel({ ...model, historia: e.target.value })} rows={14} placeholder="Escreve aqui a tua história real, em primeira pessoa: de onde você veio, o que te fez virar a chave, por que você faz o que faz hoje…" style={{ ...ta, fontSize: 13.5, lineHeight: 1.6 }} />
      </div>

      <button onClick={save} className="dg-btn-primary" style={{ alignSelf: "flex-start", padding: "10px 22px", marginBottom: 18 }}>Salvar marca</button>

      {/* PAUTAS — a partir dos pilares acima */}
      <div className="dg-box" style={box}>
        <div className="dg-kicker" style={{ marginBottom: 4 }}>✦ Gerar pautas — a partir da sua marca</div>
        <div style={{ fontSize: 11.5, color: "#7c869c", marginBottom: 12 }}>Cada pauta desdobra de um <b style={{ color: "#9aa0b0" }}>pilar</b> acima. Pega o ângulo que te acendeu e clica <b style={{ color: "#cfcfcf" }}>criar agora</b> (vai pro Criar) — ou guarda no Quadro.</div>
        <Pautas onUse={onUse || (() => {})} onIdea={onIdea || (() => {})} />
      </div>
    </div>
  );
}
