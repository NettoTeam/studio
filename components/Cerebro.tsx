"use client";

import { useEffect, useState, type ReactNode } from "react";

// SEÇÃO SANFONA — clica no título pra abrir/fechar. Condensa o cérebro (vê o resumo, abre o que quiser).
function Section({ title, hint, children, defaultOpen = false }: { title: string; hint?: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="dg-box" style={{ padding: 0, marginBottom: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: "14px 16px", textAlign: "left" }}>
        <span style={{ color: "#7c869c", fontSize: 12, transition: "transform .15s", transform: open ? "rotate(90deg)" : "none", flexShrink: 0 }}>▶</span>
        <span className="dg-kicker" style={{ flex: 1 }}>{title}</span>
        {hint && <span style={{ fontSize: 11.5, color: "#7c869c", flexShrink: 0 }}>{hint}</span>}
      </button>
      {open && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
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

const box: React.CSSProperties = { padding: 16, marginBottom: 14 };
const ta: React.CSSProperties = { width: "100%", background: "#101728", color: "#f5f5f5", border: "1px solid #2a3552", borderRadius: 8, padding: 12, fontSize: 14, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit" };

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
  useEffect(() => { load(); }, []);
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

  if (!b) return <div style={{ color: "#9aa0b0", padding: 30 }}>Carregando o cérebro…</div>;

  const Stat = ({ n, l }: { n: number; l: string }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#fff" }}>{n}</div>
      <div style={{ fontSize: 11, color: "#9aa0b0", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ color: "#9aa0b0", fontSize: 14, marginBottom: 12, maxWidth: 760, lineHeight: 1.5 }}>
        O lado técnico do que a IA sabe da marca — e <b style={{ color: "#cfcfcf" }}>editável</b>. Régua de público e voz, exemplos, estrutura e ciência. O que você muda aqui vale na próxima geração. (A identidade da marca e as pautas ficam na aba <b style={{ color: "#cfcfcf" }}>Marca</b>.)
      </div>

      <div className="dg-box" style={{ ...box, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
        <Stat n={b.counts.voz} l="Voz (exemplos)" />
        <Stat n={b.counts.estrutura} l="Estruturas-ouro" />
        <Stat n={b.counts.livros} l="Livros" />
        <Stat n={b.counts.trechos} l="Trechos (ciência)" />
        <Stat n={b.counts.aprendizado} l="Posts medidos" />
      </div>

      {msg && <div style={{ color: "#7ed957", fontSize: 13, marginBottom: 6 }}>{msg}</div>}

      <Section title="🎯 Régua — público + aresta" hint="o norte de toda geração" defaultOpen>
        <div className="dg-kicker" style={{ marginBottom: 8, fontSize: 12 }}>Público (a ferida certa)</div>
        <textarea value={aud} onChange={(e) => setAud(e.target.value)} rows={4} style={ta} />
        <button onClick={() => setAud(b.defaults.audience)} style={{ marginTop: 6, fontSize: 11, background: "transparent", color: "#9aa0b0", border: "1px solid #2a3552", borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}>voltar ao padrão</button>
        <div className="dg-kicker" style={{ margin: "16px 0 8px", fontSize: 12 }}>Aresta / cara da marca (o tempero)</div>
        <textarea value={edg} onChange={(e) => setEdg(e.target.value)} rows={4} style={ta} />
        <button onClick={() => setEdg(b.defaults.edge)} style={{ marginTop: 6, fontSize: 11, background: "transparent", color: "#9aa0b0", border: "1px solid #2a3552", borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}>voltar ao padrão</button>
        <div><button onClick={saveRegua} className="dg-btn-primary" style={{ marginTop: 14, padding: "10px 22px" }}>Salvar régua</button></div>
      </Section>

      <Section title="⭐ Voz — como você escreve" hint={`${voz.length} ${voz.length === 1 ? "exemplo" : "exemplos"}`}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <textarea value={newVoz} onChange={(e) => setNewVoz(e.target.value)} placeholder="cola um texto teu que é a tua voz no ponto…" rows={2} style={{ ...ta, fontSize: 13 }} />
          <button onClick={addVoz} className="dg-btn" style={{ whiteSpace: "nowrap" }}>+ exemplo</button>
        </div>
        {!voz.length && <div style={{ fontSize: 12, color: "#7c869c" }}>Nenhum ainda. Marca ⭐ nos roteiros/cards que ficaram na tua voz, ou cola um aqui.</div>}
        {voz.map((g, i) => (
          <div key={i} style={{ background: "#101728", border: "1px solid #2a3552", borderRadius: 8, padding: 10, marginBottom: 6, display: "flex", gap: 10 }}>
            <div style={{ flex: 1, fontSize: 12.5, color: "#cfcfcf", lineHeight: 1.45, whiteSpace: "pre-line", maxHeight: 90, overflow: "hidden" }}>{g.text}</div>
            <button onClick={() => delVoz(i)} style={{ alignSelf: "flex-start", fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 6, padding: "3px 9px", cursor: "pointer", flexShrink: 0 }}>excluir</button>
          </div>
        ))}
      </Section>

      <Section title="🏆 Estruturas-ouro — arcos validados" hint={`${estr.length} ${estr.length === 1 ? "estrutura" : "estruturas"}`}>
        {!estr.length && <div style={{ fontSize: 12, color: "#7c869c" }}>Nenhuma ainda. No Vault, marca 🏆 num post publicado com boa métrica.</div>}
        {estr.map((s, i) => (
          <div key={i} style={{ background: "#101728", border: "1px solid #2a3552", borderRadius: 8, padding: 10, marginBottom: 6, display: "flex", gap: 10 }}>
            <div style={{ flex: 1, fontSize: 12, color: "#cfcfcf", lineHeight: 1.4, whiteSpace: "pre-line", maxHeight: 80, overflow: "hidden" }}>
              {s.score ? <span style={{ color: "#e8c860" }}>nota {Math.round(s.score * 100)} · </span> : null}{s.tema ? <b>{s.tema}: </b> : null}{s.outline}
            </div>
            <button onClick={() => delEstr(i)} style={{ alignSelf: "flex-start", fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3a1c28", borderRadius: 6, padding: "3px 9px", cursor: "pointer", flexShrink: 0 }}>excluir</button>
          </div>
        ))}
      </Section>

      <Section title="📚 Ciência — coerência invisível" hint={`${b.counts.livros} livros · ${b.counts.trechos.toLocaleString("pt-BR")} trechos`}>
        {b.livros.map((l, i) => (
          <div key={i} style={{ fontSize: 13, color: "#cfcfcf", padding: "3px 0" }}>• {l.title} <span style={{ color: "#7c869c" }}>— {l.chunks.toLocaleString("pt-BR")} trechos</span></div>
        ))}
        <div style={{ fontSize: 11, color: "#7c869c", marginTop: 6 }}>Adiciona/remove livros na aba <b style={{ color: "#9aa0b0" }}>Fontes</b>.</div>
      </Section>
    </div>
  );
}
