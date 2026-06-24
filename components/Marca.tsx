"use client";

import { useEffect, useState } from "react";
import Pautas from "@/components/Pautas";

type Model = { grandeTese: string; inimigo: string; pilares: string[]; temas: string[]; historia: string };

export default function Marca({ onUse, onIdea }: { onUse?: (tema: string, angulo: string) => void; onIdea?: (tema: string, context?: string) => void }) {
  const [model, setModel] = useState<Model>({ grandeTese: "", inimigo: "", pilares: [], temas: [], historia: "" });
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/brain")
      .then((r) => r.json())
      .then((br) => {
        if (!alive) return;
        if (br.model) setModel(br.model);
        setLoaded(true);
      })
      .catch(() => {
        if (alive) setLoaded(true);
      });
    return () => { alive = false; };
  }, []);
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

  if (!loaded) return <div className="studio-muted" style={{ padding: 30 }}>Carregando a marca</div>;

  return (
    <div className="studio-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>Marca com tese, tensão e território</h2>
          <p>Aqui ficam a visão central, o inimigo, os pilares, os temas e a história real que sustentam a voz do conteúdo</p>
        </div>
        <div className="studio-hero__side marca-hero-stats" aria-hidden="true">
          <div className="studio-stat"><strong>{model.pilares.length}</strong><span>Pilares</span></div>
          <div className="studio-stat"><strong>{model.temas.length}</strong><span>Temas</span></div>
        </div>
      </section>

      {/* VISÃO + INIMIGO */}
      <div className="studio-grid-2">
        <section className="studio-section studio-section--pad studio-section--accent" style={{ ["--studio-accent" as string]: "#e8c860" }}>
          <div className="studio-section-head">
            <h3>Sua visão</h3>
            <p>Grande tese</p>
          </div>
          <textarea value={model.grandeTese} onChange={(e) => setModel({ ...model, grandeTese: e.target.value })} rows={4} className="studio-textarea" style={{ fontSize: 16, fontWeight: 700 }} />
        </section>
        <section className="studio-section studio-section--pad studio-section--accent" style={{ ["--studio-accent" as string]: "#ef476f" }}>
          <div className="studio-section-head">
            <h3>O que combate</h3>
            <p>Inimigo narrativo</p>
          </div>
          <textarea value={model.inimigo} onChange={(e) => setModel({ ...model, inimigo: e.target.value })} rows={4} className="studio-textarea" style={{ fontSize: 16, fontWeight: 700 }} />
        </section>
      </div>

      {msg && <div style={{ color: "#7ed957", fontSize: 13 }}>{msg}</div>}

      {/* PILARES */}
      <section className="studio-section studio-section--pad">
        <div className="studio-section-head">
          <h3>Pilares</h3>
          <p>{model.pilares.length} ângulo(s) de conteúdo</p>
          <span className="spacer" />
          <button onClick={addPilar} className="studio-mini-btn" type="button">+ pilar</button>
        </div>
        {model.pilares.map((p, i) => (
          <div key={i} className="studio-row" style={{ alignItems: "flex-start", marginBottom: 7 }}>
            <span style={{ width: 24, color: "#686b78", fontSize: 11, fontWeight: 800, paddingTop: 10, textAlign: "right" }}>{String(i + 1).padStart(2, "0")}</span>
            <textarea value={p} onChange={(e) => setPilar(i, e.target.value)} rows={1} className="studio-textarea" style={{ fontSize: 13, padding: "8px 10px" }} />
            <button onClick={() => delPilar(i)} className="studio-danger-btn" type="button">x</button>
          </div>
        ))}
      </section>

      {/* TEMAS */}
      <section className="studio-section studio-section--pad">
        <div className="studio-section-head">
          <h3>Temas</h3>
          <p>{model.temas.length} territórios dominados</p>
          <span className="spacer" />
          <button onClick={addTema} className="studio-mini-btn" type="button">+ tema</button>
        </div>
        {model.temas.map((t, i) => (
          <div key={i} className="studio-row" style={{ marginBottom: 7 }}>
            <textarea value={t} onChange={(e) => setTema(i, e.target.value)} rows={1} className="studio-textarea" style={{ fontSize: 13, padding: "8px 10px" }} />
            <button onClick={() => delTema(i)} className="studio-danger-btn" type="button">x</button>
          </div>
        ))}
      </section>

      {/* MINHA HISTÓRIA — material real pra IA ancorar conteúdo de marca pessoal (não inventar) */}
      <section className="studio-section studio-section--pad studio-section--accent" style={{ ["--studio-accent" as string]: "#caa46a" }}>
        <div className="studio-section-head">
          <h3>Minha história</h3>
          <p>vida real para marca pessoal</p>
        </div>
        <p className="studio-muted" style={{ margin: "0 0 12px" }}>
          A IA usa este material para puxar momentos reais quando o post pede história, bastidor e marca pessoal.
        </p>
        <textarea value={model.historia} onChange={(e) => setModel({ ...model, historia: e.target.value })} rows={12} placeholder="Escreve aqui a tua história real, em primeira pessoa: de onde você veio, o que te fez virar a chave, por que você faz o que faz hoje" className="studio-textarea" style={{ fontSize: 13.5, lineHeight: 1.6 }} />
      </section>

      <button onClick={save} className="dg-btn-primary" style={{ alignSelf: "flex-start", padding: "10px 22px" }}>Salvar marca</button>

      {/* PAUTAS — a partir dos pilares acima */}
      <section className="studio-section studio-section--pad">
        <div className="studio-section-head">
          <h3>Gerar pautas</h3>
          <p>a partir dos pilares acima</p>
        </div>
        <Pautas onUse={onUse || (() => {})} onIdea={onIdea || (() => {})} />
      </section>
    </div>
  );
}
