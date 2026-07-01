"use client";

import { useEffect, useState, type ReactNode } from "react";
import { REGISTROS, REG_MAP } from "@/lib/vitals";

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

// tag do registro de um exemplo (emoji + label). "" se não tiver tom marcado.
function RegTag({ id }: { id?: string }) {
  if (!id || !(id in REG_MAP)) return <span style={{ fontSize: 10.5, color: "#5a6378" }}>sem tom</span>;
  const r = REG_MAP[id as keyof typeof REG_MAP];
  return <span style={{ fontSize: 10.5, color: r.color, fontWeight: 600, whiteSpace: "nowrap" }}>{r.emoji} {r.label}</span>;
}

type Brain = {
  audience: string; edge: string;
  defaults: { audience: string; edge: string };
  counts: { voz: number; estrutura: number; livros: number; trechos: number; aprendizado: number };
  livros: { title: string; chunks: number }[];
};
type Gold = { text: string; createdAt?: string; note?: string; registro?: string };
type Struct = { outline: string; score?: number; tema?: string; hook?: string; createdAt?: string };
type Reject = { kind: string; text: string; registro?: string; createdAt: string };

// seletor de registro reutilizável (inclui "sem tom")
function RegSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="studio-textarea" style={{ width: 220, flexShrink: 0, fontSize: 12.5, padding: "8px 10px" }}>
      <option value="">tom (opcional)</option>
      {REGISTROS.map((r) => <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>)}
    </select>
  );
}

export default function Cerebro() {
  const [b, setB] = useState<Brain | null>(null);
  const [aud, setAud] = useState("");
  const [edg, setEdg] = useState("");
  const [voz, setVoz] = useState<Gold[]>([]);
  const [estr, setEstr] = useState<Struct[]>([]);
  const [rejects, setRejects] = useState<Reject[]>([]);
  const [msg, setMsg] = useState("");
  const [newVoz, setNewVoz] = useState("");
  const [newVozReg, setNewVozReg] = useState("");
  const [newRej, setNewRej] = useState("");
  const [newRejReg, setNewRejReg] = useState("");

  async function load() {
    const [br, vz, st, rj] = await Promise.all([
      fetch("/api/brain").then((r) => r.json()),
      fetch("/api/voice").then((r) => r.json()),
      fetch("/api/structures").then((r) => r.json()),
      fetch("/api/reject?kind=voice").then((r) => r.json()).catch(() => ({ rejects: [] })),
    ]);
    setB(br); setAud(br.audience || ""); setEdg(br.edge || "");
    setVoz(vz.examples || []); setEstr(st.structures || []); setRejects(rj.rejects || []);
  }
  useEffect(() => {
    const id = window.setTimeout(() => { load().catch(() => {}); }, 0);
    return () => window.clearTimeout(id);
  }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 2500); }

  async function saveRegua() {
    await fetch("/api/brain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audience: aud, edge: edg }) });
    flash("Régua salva ✓ — já vale nas próximas gerações"); load();
  }
  async function addVoz() {
    if (newVoz.trim().length < 20) { flash("cola um texto um pouco maior (mín. 20 caracteres)"); return; }
    await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: newVoz, registro: newVozReg || undefined }) });
    setNewVoz(""); flash("Exemplo de voz adicionado ✓"); load();
  }
  async function delVoz(i: number) { await fetch(`/api/voice?i=${i}`, { method: "DELETE" }); load(); }
  async function delEstr(i: number) { await fetch(`/api/structures?i=${i}`, { method: "DELETE" }); load(); }
  async function addRej() {
    if (newRej.trim().length < 12) { flash("cola um trecho um pouco maior"); return; }
    await fetch("/api/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "voice", text: newRej, registro: newRejReg || undefined }) });
    setNewRej(""); flash("Anti-ouro registrado ✓ — a IA vai fugir desse padrão"); load();
  }
  async function delRej(at: string) { await fetch(`/api/reject?at=${encodeURIComponent(at)}`, { method: "DELETE" }); load(); }

  if (!b) return <div className="studio-muted" style={{ padding: 30 }}>Carregando o cérebro</div>;

  // contagem de exemplos de voz por registro (mostra os vazios — ex: 👑 e ☠️ novos)
  const vozPorReg = REGISTROS.map((r) => ({ r, n: voz.filter((g) => g.registro === r.id).length }));

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
        <Stat n={rejects.length} l="Anti-ouro" />
        <Stat n={b.counts.livros} l="Livros" />
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

      <Section title="⭐ Voz — como você escreve (por tom)" hint={`${voz.length} ${voz.length === 1 ? "exemplo" : "exemplos"}`} defaultOpen>
        <div style={{ fontSize: 12, color: "#9aa0b0", lineHeight: 1.55, marginBottom: 10 }}>
          É o texto REAL que a IA imita pra clonar sua cadência. Quanto mais, melhor — e <b style={{ color: "#cfcfcf" }}>marque o tom</b> de cada um, principalmente os novos (👑 Domínio e ☠️ Darkside), que ainda estão zerados.
        </div>
        {/* cobertura por registro — deixa os vazios óbvios */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {vozPorReg.map(({ r, n }) => (
            <span key={r.id} title={`${n} exemplo(s) no tom ${r.label}`} style={{ fontSize: 11.5, padding: "4px 9px", borderRadius: 999, border: "1px solid " + (n === 0 ? "#5a2030" : "#2e2e36"), background: n === 0 ? "rgba(239,71,111,0.08)" : "#17171b", color: n === 0 ? "#e0738c" : r.color, fontWeight: 600, whiteSpace: "nowrap" }}>
              {r.emoji} {r.label}: {n}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <textarea value={newVoz} onChange={(e) => setNewVoz(e.target.value)} placeholder="cola um texto teu que é a tua voz no ponto (legenda, áudio transcrito, post antigo...)" rows={3} className="studio-textarea" style={{ fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <RegSelect value={newVozReg} onChange={setNewVozReg} />
          <button onClick={addVoz} className="dg-btn-primary" style={{ whiteSpace: "nowrap", padding: "9px 18px" }}>+ adicionar exemplo</button>
        </div>
        {!voz.length && <div className="studio-empty">Nenhum exemplo de voz ainda</div>}
        {voz.map((g, i) => (
          <div key={g.createdAt || i} className="studio-section studio-section--pad" style={{ marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 5 }}><RegTag id={g.registro} /></div>
              <div style={{ fontSize: 12.5, color: "#cfcfcf", lineHeight: 1.45, whiteSpace: "pre-line", maxHeight: 90, overflow: "hidden" }}>{g.text}</div>
            </div>
            <button onClick={() => delVoz(i)} className="studio-danger-btn" style={{ alignSelf: "flex-start", flexShrink: 0 }} type="button">excluir</button>
          </div>
        ))}
      </Section>

      <Section title="🚫 Anti-ouro — o que NÃO é a sua voz" hint={`${rejects.length} ${rejects.length === 1 ? "trecho" : "trechos"}`}>
        <div style={{ fontSize: 12, color: "#9aa0b0", lineHeight: 1.55, marginBottom: 10 }}>
          Cola aqui um trecho que saiu <b style={{ color: "#cfcfcf" }}>fora de você</b> (genérico, coachismo, cara de IA). A geração foge desse padrão. (Também dá pra rejeitar direto na tela de Criar.)
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <textarea value={newRej} onChange={(e) => setNewRej(e.target.value)} placeholder="cola o trecho que NÃO te representa..." rows={2} className="studio-textarea" style={{ fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <RegSelect value={newRejReg} onChange={setNewRejReg} />
          <button onClick={addRej} className="dg-btn" style={{ whiteSpace: "nowrap", padding: "9px 18px" }}>+ marcar anti-ouro</button>
        </div>
        {!rejects.length && <div className="studio-empty">Nenhum anti-ouro ainda</div>}
        {rejects.map((r) => (
          <div key={r.createdAt} className="studio-section studio-section--pad" style={{ marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 5 }}><RegTag id={r.registro} /></div>
              <div style={{ fontSize: 12.5, color: "#b89aa2", lineHeight: 1.45, whiteSpace: "pre-line", maxHeight: 70, overflow: "hidden" }}>✗ {r.text}</div>
            </div>
            <button onClick={() => delRej(r.createdAt)} className="studio-danger-btn" style={{ alignSelf: "flex-start", flexShrink: 0 }} type="button">excluir</button>
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
