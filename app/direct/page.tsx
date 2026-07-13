"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

type Opcao = { tom: string; texto: string };

export default function DirectPage() {
  const [tipo, setTipo] = useState<"dm" | "parceria">("dm");
  const [mensagem, setMensagem] = useState("");
  const [contexto, setContexto] = useState("");
  const [busy, setBusy] = useState(false);
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [copiado, setCopiado] = useState<number | null>(null);

  async function gerar() {
    if (busy || mensagem.trim().length < 2) return;
    setBusy(true); setOpcoes([]);
    try {
      const r = await fetch("/api/assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, mensagem, contexto }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setOpcoes(d.opcoes || []);
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setBusy(false); }
  }

  function copiar(txt: string, i: number) {
    navigator.clipboard.writeText(txt);
    setCopiado(i); setTimeout(() => setCopiado(null), 2000);
  }

  const isDm = tipo === "dm";

  return (
    <div className="studio-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>{isDm ? "Responde no direct como você mesmo" : "Conduz parcerias na tua voz"}</h2>
          <p>{isDm
            ? "Cola a mensagem do lead. A IA rascunha respostas na tua voz pra entender, quebrar objeção e conduzir pra consultoria, sem parecer vendedor."
            : "Descreve a parceria (quem te procurou ou quem você quer). A IA rascunha mensagens na tua voz pra avançar o negócio."}</p>
        </div>
      </section>

      <section className="studio-section studio-section--pad">
        <div className="stories-mode-tabs" style={{ marginBottom: 18 }}>
          <button type="button" onClick={() => { setTipo("dm"); setOpcoes([]); }} className={isDm ? "is-active" : ""}>💬 DM / venda</button>
          <button type="button" onClick={() => { setTipo("parceria"); setOpcoes([]); }} className={!isDm ? "is-active" : ""}>🤝 Parcerias</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
          <label className="stories-field">
            <span>{isDm ? "Mensagem que a pessoa te mandou" : "Situação da parceria (mensagem recebida ou o que você quer propor)"}</span>
            <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={5}
              placeholder={isDm
                ? "ex: Oi, vi teu perfil. Treino há 1 ano e meu glúteo não cresce nada, será que tua consultoria funciona pra mim?"
                : "ex: Uma marca de suplemento me chamou querendo parceria de permuta. Ou: quero propor parceria com a nutri @fulana pra indicar alunas uma pra outra."}
              className="studio-textarea" />
          </label>
          <label className="stories-field">
            <span>Contexto <small style={{ color: "#5b6480", fontWeight: 400 }}>(opcional — produto, objeção, teu objetivo)</small></span>
            <textarea value={contexto} onChange={e => setContexto(e.target.value)} rows={2}
              placeholder={isDm ? "ex: interessada na Premium (treino+dieta) / acha caro / já foi enganada antes" : "ex: só topo se for pago, não permuta / quero fechar uma call essa semana"}
              className="studio-textarea" />
          </label>
          <button onClick={gerar} disabled={busy || mensagem.trim().length < 2} className="dg-btn-primary stories-primary-btn" style={{ alignSelf: "flex-start" }}>
            {busy ? "rascunhando..." : "✨ rascunhar 3 respostas"}
          </button>
        </div>

        {opcoes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
            {opcoes.map((o, i) => (
              <div key={i} style={{ background: "var(--dg-sunken)", border: "1px solid var(--dg-line)", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: "#ef476f", background: "rgba(239,71,111,.12)", padding: "3px 10px", borderRadius: 20 }}>{o.tom}</span>
                  <button onClick={() => copiar(o.texto, i)} style={{ marginLeft: "auto", fontSize: 12, background: "transparent", color: copiado === i ? "#7ed957" : "#9aa0b0", border: "1px solid var(--dg-line)", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>
                    {copiado === i ? "copiado ✓" : "copiar"}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#e0e5f2", whiteSpace: "pre-wrap" }}>{o.texto}</p>
              </div>
            ))}
            <p style={{ fontSize: 11.5, color: "#5b6480", margin: 0 }}>rascunhos na tua voz — revisa e ajusta antes de enviar. Nunca envie no automático.</p>
          </div>
        )}
      </section>
    </div>
  );
}
