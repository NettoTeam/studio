"use client";

import { useEffect, useState, type ReactNode } from "react";

// SEÇÃO SANFONA — clica no título pra abrir/fechar. Condensa o cérebro (vê o resumo, abre o que quiser).
function Section({ title, hint, children, defaultOpen = false }: { title: string; hint?: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="studio-section brain-accordion">
      <button onClick={() => setOpen((o) => !o)} className="brain-accordion-toggle" type="button">
        <span className={"brain-chevron" + (open ? " is-open" : "")}>▶</span>
        <span className="studio-eyebrow" style={{ flex: 1, fontSize: 10.5 }}>{title}</span>
        {hint && <span style={{ fontSize: 11.5, color: "#7c869c", flexShrink: 0 }}>{hint}</span>}
      </button>
      {open && <div className="brain-accordion-body">{children}</div>}
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="brain-stat">
      <strong>{n}</strong>
      <span>{l}</span>
    </div>
  );
}

type Brain = {
  audience: string; edge: string;
  defaults: { audience: string; edge: string };
  counts: { voz: number; estrutura: number; livros: number; trechos: number; aprendizado: number };
  livros: { title: string; chunks: number }[];
};
type Gold = { text: string; createdAt?: string; note?: string };
type Struct = { outline: string; score?: number; tema?: string; hook?: string; createdAt?: string };

export default function Cerebro() {
  const [b, setB] = useState<Brain | null>(null);
  const [aud, setAud] = useState("");
  const [edg, setEdg] = useState("");
  const [voz, setVoz] = useState<Gold[]>([]);
  const [estr, setEstr] = useState<Struct[]>([]);
  const [msg, setMsg] = useState("");
  const [newVoz, setNewVoz] = useState("");

  async function load() {
    const [br, vz, st] = await Promise.all([
      fetch("/api/brain").then((r) => r.json()),
      fetch("/api/voice").then((r) => r.json()),
      fetch("/api/structures").then((r) => r.json()),
    ]);
    setB(br); setAud(br.audience || ""); setEdg(br.edge || "");
    setVoz(vz.examples || []); setEstr(st.structures || []);
  }
  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/brain").then((r) => r.json()),
      fetch("/api/voice").then((r) => r.json()),
      fetch("/api/structures").then((r) => r.json()),
    ])
      .then(([br, vz, st]) => {
        if (!alive) return;
        setB(br); setAud(br.audience || ""); setEdg(br.edge || "");
        setVoz(vz.examples || []); setEstr(st.structures || []);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 2500); }

  async function saveRegua() {
    await fetch("/api/brain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audience: aud, edge: edg }) });
    flash("Régua salva ✓ — já vale nas próximas gerações"); load();
  }
  async function addVoz() {
    if (newVoz.trim().length < 20) return;
    await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: newVoz }) });
    setNewVoz(""); flash("Exemplo de voz adicionado ✓"); load();
  }
  async function delVoz(i: number) { await fetch(`/api/voice?i=${i}`, { method: "DELETE" }); load(); }
  async function delEstr(i: number) { await fetch(`/api/structures?i=${i}`, { method: "DELETE" }); load(); }

  if (!b) return <div className="studio-muted" style={{ padding: 30 }}>Carregando o cérebro</div>;

  return (
    <div className="studio-page">
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <h2>O cérebro que calibra a voz da marca</h2>
          <p>Régua de público, aresta, exemplos de voz, estruturas validadas e ciência ficam aqui para orientar as próximas gerações</p>
        </div>
        <div className="studio-hero__side" aria-hidden="true">
          <div className="studio-stat"><strong>{b.counts.voz}</strong><span>Voz</span></div>
          <div className="studio-stat"><strong>{b.counts.estrutura}</strong><span>Ouro</span></div>
          <div className="studio-stat"><strong>{b.counts.livros}</strong><span>Livros</span></div>
          <div className="studio-stat"><strong>{b.counts.aprendizado}</strong><span>Posts</span></div>
        </div>
      </section>

      <section className="brain-stats">
        <Stat n={b.counts.voz} l="Voz (exemplos)" />
        <Stat n={b.counts.estrutura} l="Estruturas-ouro" />
        <Stat n={b.counts.livros} l="Livros" />
        <Stat n={b.counts.trechos} l="Trechos (ciência)" />
        <Stat n={b.counts.aprendizado} l="Posts medidos" />
      </section>

      {msg && <div style={{ color: "#7ed957", fontSize: 13 }}>{msg}</div>}

      <Section title="🎯 Régua — público + aresta" hint="o norte de toda geração" defaultOpen>
        <div className="dg-kicker" style={{ marginBottom: 8, fontSize: 12 }}>Público (a ferida certa)</div>
        <textarea value={aud} onChange={(e) => setAud(e.target.value)} rows={4} className="studio-textarea" />
        <button onClick={() => setAud(b.defaults.audience)} className="studio-mini-btn" style={{ marginTop: 8 }} type="button">voltar ao padrão</button>
        <div className="dg-kicker" style={{ margin: "16px 0 8px", fontSize: 12 }}>Aresta / cara da marca (o tempero)</div>
        <textarea value={edg} onChange={(e) => setEdg(e.target.value)} rows={4} className="studio-textarea" />
        <button onClick={() => setEdg(b.defaults.edge)} className="studio-mini-btn" style={{ marginTop: 8 }} type="button">voltar ao padrão</button>
        <div><button onClick={saveRegua} className="dg-btn-primary" style={{ marginTop: 14, padding: "10px 22px" }}>Salvar régua</button></div>
      </Section>

      <Section title="⭐ Voz — como você escreve" hint={`${voz.length} ${voz.length === 1 ? "exemplo" : "exemplos"}`}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <textarea value={newVoz} onChange={(e) => setNewVoz(e.target.value)} placeholder="cola um texto teu que é a tua voz no ponto" rows={2} className="studio-textarea" style={{ fontSize: 13 }} />
          <button onClick={addVoz} className="dg-btn" style={{ whiteSpace: "nowrap" }}>+ exemplo</button>
        </div>
        {!voz.length && <div className="studio-empty">Nenhum exemplo de voz ainda</div>}
        {voz.map((g, i) => (
          <div key={i} className="studio-section studio-section--pad" style={{ marginBottom: 8, display: "flex", gap: 10 }}>
            <div style={{ flex: 1, fontSize: 12.5, color: "#cfcfcf", lineHeight: 1.45, whiteSpace: "pre-line", maxHeight: 90, overflow: "hidden" }}>{g.text}</div>
            <button onClick={() => delVoz(i)} className="studio-danger-btn" style={{ alignSelf: "flex-start", flexShrink: 0 }} type="button">excluir</button>
          </div>
        ))}
      </Section>

      <Section title="🏆 Estruturas-ouro — arcos validados" hint={`${estr.length} ${estr.length === 1 ? "estrutura" : "estruturas"}`}>
        {!estr.length && <div className="studio-empty">Nenhuma estrutura validada ainda</div>}
        {estr.map((s, i) => (
          <div key={i} className="studio-section studio-section--pad" style={{ marginBottom: 8, display: "flex", gap: 10 }}>
            <div style={{ flex: 1, fontSize: 12, color: "#cfcfcf", lineHeight: 1.4, whiteSpace: "pre-line", maxHeight: 80, overflow: "hidden" }}>
              {s.score ? <span style={{ color: "#e8c860" }}>nota {Math.round(s.score * 100)} · </span> : null}{s.tema ? <b>{s.tema}: </b> : null}{s.outline}
            </div>
            <button onClick={() => delEstr(i)} className="studio-danger-btn" style={{ alignSelf: "flex-start", flexShrink: 0 }} type="button">excluir</button>
          </div>
        ))}
      </Section>

      <Section title="📚 Ciência — coerência invisível" hint={`${b.counts.livros} livros · ${b.counts.trechos.toLocaleString("pt-BR")} trechos`}>
        {b.livros.map((l, i) => (
          <div key={i} style={{ fontSize: 13, color: "#cfcfcf", padding: "3px 0" }}>• {l.title} <span style={{ color: "#7c869c" }}>— {l.chunks.toLocaleString("pt-BR")} trechos</span></div>
        ))}
        <div style={{ fontSize: 11, color: "#7c869c", marginTop: 6 }}>Adiciona/remove livros na aba <b style={{ color: "#9aa0b0" }}>Fontes</b></div>
      </Section>
    </div>
  );
}
