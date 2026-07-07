"use client";

import { useEffect, useRef, useState } from "react";
import { STORY_IDEAS, DAY_RHYTHM } from "@/lib/stories";
import { ARSENAL_ORDEM, ARSENAL_CATEGORIAS, type ArsenalCategoria } from "@/lib/arsenal";

type Figurinha = { tipo: string; pergunta?: string; opcoes?: string[] } | null;
type Frame = {
  tipo?: string;
  mostrar?: string;
  texto?: string;
  fundo_tipo?: string;
  posicao_texto?: string;
  sugestao_visual?: string;
  figurinha?: Figurinha;
  cta?: string | null;
};
type Result = { titulo: string; frames: Frame[]; dica?: string };
type RotinaOpcao = { titulo: string; angulo: string; frames: Frame[]; dica?: string };
type RotinaTema = { descricao: string; opcoes: RotinaOpcao[]; loading: boolean; err?: string };
type RotinaPeriodo = { temas: RotinaTema[] };
type PeriodoKey = "manha" | "tarde" | "noite";

type StoryStage = "rascunho" | "publicado" | "arquivado";
type StoryPost = {
  id: string; titulo: string; frames: Frame[]; dica?: string;
  periodo?: string; createdAt: string; updatedAt: string;
  stage: StoryStage; isBase?: boolean; feedback?: string; engajamento?: string;
};

const OBJETIVOS: { key: string; label: string }[] = [
  { key: "equilibrar", label: "⚖️ Mix A.E.I (equilibrado)" },
  { key: "engajar",    label: "🎭 E→A (engajar + aquecer)" },
  { key: "autoridade", label: "👑 A (autoridade + skin in the game)" },
  { key: "venda",      label: "⚔️ Vender consultoria" },
];

const OBJECTIVE_HELP = [
  { title: "Mix A.E.I", text: "modo padrão: mistura bastidor, valor e autoridade" },
  { title: "E→A", text: "aquece primeiro, depois entra com ponto forte" },
  { title: "Autoridade", text: "prova, treino, estudo e opinião técnica" },
  { title: "Venda", text: "prova + CTA leve, sem parecer pedido" },
];

const STORY_TYPES = [
  { key: "camera", label: "câmera" },
  { key: "tela", label: "tela" },
];

const TEXT_POSITIONS = [
  { key: "topo", label: "topo" },
  { key: "meio", label: "meio" },
  { key: "rodape", label: "rodapé" },
];

const FUNDO_TYPES = [
  { key: "camera_escuro", label: "câmera escura" },
  { key: "tela_escura", label: "tela escura" },
  { key: "preto", label: "preto" },
  { key: "vermelho", label: "vermelho" },
];

const FIGURINHAS = [
  { key: "nenhuma", label: "sem figurinha" },
  { key: "enquete", label: "enquete" },
  { key: "caixinha", label: "caixinha" },
  { key: "quiz", label: "quiz" },
  { key: "controle", label: "controle" },
];

// Fundo do card baseado em fundo_tipo
function cardBg(fundo?: string, tipo?: string): string {
  if (fundo === "vermelho") return "#991b1b";
  if (fundo === "preto")    return "#000";
  if (fundo === "tela_escura" || tipo === "tela") return "#0d0e12";
  return "#101115"; // camera_escuro
}

// Ghost camera icon para frames de câmera
function CameraGhost() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}
      style={{ width: 72, height: 72, opacity: 0.07, color: "#fff" }}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

// Mock de enquete do Instagram
function EnqueteMock({ fig }: { fig: NonNullable<Figurinha> }) {
  return (
    <div className="story-poll-mock">
      <div className="story-poll-question">{fig.pergunta || "Enquete"}</div>
      {(fig.opcoes || []).map((o, i) => (
        <div key={i} className="story-poll-option">{o}</div>
      ))}
    </div>
  );
}

// Card visual 9:16 de um story frame
function StoryFrameCard({
  frame, index, total, image, selected, onSelect,
}: {
  frame: Frame; index: number; total: number; image?: string; selected: boolean; onSelect: () => void;
}) {
  const bg = cardBg(frame.fundo_tipo, frame.tipo);
  const isCamera = frame.tipo !== "tela";
  const pos = frame.posicao_texto || "meio";
  const hasInteraction = frame.figurinha && frame.figurinha.tipo && frame.figurinha.tipo !== "nenhuma";

  const textStyle: React.CSSProperties = {
    position: "absolute", left: 10, right: 10,
    fontSize: 11.5, fontWeight: 700, color: "#fff", lineHeight: 1.35,
    textAlign: "center", textShadow: "0 1px 6px rgba(0,0,0,0.9)", whiteSpace: "pre-line",
    ...(pos === "topo"   ? { top: 30 } :
        pos === "rodape" ? { bottom: 38 } :
                           { top: "50%", transform: "translateY(-50%)" }),
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`story-frame-card${selected ? " is-selected" : ""}`}
      style={{ background: bg }}
    >
      {/* Foto de fundo (quando tem) */}
      {image && (
        <>
          <img src={image} alt="" className="story-frame-photo" />
          <div className="story-frame-scrim" />
        </>
      )}

      {/* Barra de progresso */}
      <div className="story-frame-progress">
        <div style={{ width: `${((index + 1) / Math.max(total, 1)) * 100}%` }} />
      </div>

      {/* Badge tipo */}
      <div className={`story-frame-badge ${isCamera ? "is-camera" : "is-screen"}`}>
        {isCamera ? "📹" : "🖥️"} {isCamera ? "câm" : "tela"}
      </div>

      {/* Número */}
      <div className="story-frame-number">{index + 1}</div>

      {/* Ghost de câmera quando sem foto */}
      {!image && isCamera && (
        <div className="story-frame-ghost">
          <CameraGhost />
        </div>
      )}

      {/* Dots para tela */}
      {!image && !isCamera && <div className="story-frame-dots" />}

      {/* Faixa vermelha lateral */}
      {frame.fundo_tipo === "vermelho" && <div className="story-frame-redbar" />}

      {/* TEXTO */}
      <div style={{ ...textStyle, zIndex: 3 }}>
        {frame.texto || ""}
        {hasInteraction && pos === "meio" && frame.figurinha && <EnqueteMock fig={frame.figurinha} />}
      </div>

      {/* Enquete fora do meio */}
      {hasInteraction && pos !== "meio" && frame.figurinha && (
        <div className="story-frame-floating-poll">
          <EnqueteMock fig={frame.figurinha} />
        </div>
      )}

      {/* CTA */}
      {frame.cta && (
        <div className="story-frame-cta">
          ➡ {frame.cta}
        </div>
      )}

      {/* Sugestão visual */}
      {frame.sugestao_visual && !image && (
        <div className="story-frame-visual-note" style={{ bottom: frame.cta ? 22 : 7 }}>
          📷 {frame.sugestao_visual}
        </div>
      )}

      {/* Badge "tem foto" */}
      {image && (
        <div className="story-frame-photo-badge">
          📷
        </div>
      )}
    </button>
  );
}

// Componente full-size para export (1080×1920, fora da tela)
function StoryFrameFullSize({ frame, image }: { frame: Frame; image?: string }) {
  const W = 1080, H = 1920;
  const bg = cardBg(frame.fundo_tipo, frame.tipo);
  const pos = frame.posicao_texto || "meio";
  const hasInteraction = frame.figurinha && frame.figurinha.tipo && frame.figurinha.tipo !== "nenhuma";

  const textStyle: React.CSSProperties = {
    position: "absolute", left: 80, right: 80,
    fontSize: 88, fontWeight: 800, color: "#fff", lineHeight: 1.25,
    textAlign: "center", textShadow: "0 4px 24px rgba(0,0,0,0.85)",
    whiteSpace: "pre-line", letterSpacing: -0.5,
    ...(pos === "topo"   ? { top: 220 } :
        pos === "rodape" ? { bottom: 280 } :
                           { top: "50%", transform: "translateY(-50%)" }),
  };

  return (
    <div style={{ width: W, height: H, position: "relative", background: bg, overflow: "hidden" }}>
      {image && (
        <>
          <img src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        </>
      )}
      {/* Faixa colorida lateral */}
      {frame.fundo_tipo === "vermelho" && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: "#ef4444" }} />
      )}
      {/* Texto */}
      <div style={{ ...textStyle, zIndex: 2 }}>{frame.texto || ""}</div>
      {/* Enquete mock full-size */}
      {hasInteraction && frame.figurinha && (
        <div style={{
          position: "absolute", zIndex: 2,
          ...(pos !== "rodape" ? { bottom: 300 } : { top: 200 }),
          left: 80, right: 80,
          background: "rgba(255,255,255,0.15)", borderRadius: 32, padding: "36px 44px",
        }}>
          <div style={{ fontSize: 54, fontWeight: 700, color: "#fff", marginBottom: 24 }}>{frame.figurinha.pergunta}</div>
          {frame.figurinha.opcoes?.map((o, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.25)", borderRadius: 18, padding: "16px 28px", marginBottom: 14, fontSize: 46, color: "#fff" }}>{o}</div>
          ))}
        </div>
      )}
      {/* CTA */}
      {frame.cta && (
        <div style={{ position: "absolute", bottom: 120, left: 80, right: 80, zIndex: 2, fontSize: 52, fontWeight: 700, color: "#ef4444", textAlign: "center" }}>
          ➡ {frame.cta}
        </div>
      )}
      {/* Handle */}
      <div style={{ position: "absolute", bottom: 60, right: 80, zIndex: 2, fontSize: 36, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
        @n2squad
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const [theme, setTheme]         = useState("");
  const [objetivo, setObjetivo]   = useState("equilibrar");
  const [nFrames, setNFrames]     = useState(5);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState("");
  const [res, setRes]             = useState<Result | null>(null);
  const [copied, setCopied]       = useState(false);
  const [viewMode, setViewMode]   = useState<"visual" | "lista">("visual");
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);

  // Fotos por frame (índice → URL)
  const [framePhotos, setFramePhotos] = useState<Record<number, string>>({});
  const [libSentiments, setLibSentiments] = useState<string[]>([]);
  const [libImgs, setLibImgs]         = useState<string[]>([]);
  const [libLoading, setLibLoading]   = useState(false);
  const [exporting, setExporting]     = useState<number | null>(null);
  const uploadRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const exportRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Estilo
  const [styleText, setStyleText] = useState("");
  const [styleOpen, setStyleOpen] = useState(false);
  const [styleMsg, setStyleMsg]   = useState("");

  // Modo principal: sequência / rotina / arsenal / rascunhos
  const [mode, setMode] = useState<"sequencia" | "rotina" | "arsenal" | "rascunhos">("sequencia");

  // Arsenal — ciclo de 9 categorias (1 dia cada)
  const [cicloPos, setCicloPos] = useState(0);
  const [arsenalCtx, setArsenalCtx] = useState("");
  const [arsenalGen, setArsenalGen] = useState<ArsenalCategoria | null>(null);
  const [arsenalErr, setArsenalErr] = useState("");
  const [arsenalRes, setArsenalRes] = useState<{ categoria: ArsenalCategoria; script: { dia: number; nome: string }; opcoes: RotinaOpcao[] } | null>(null);
  const [arsenalSaveMsg, setArsenalSaveMsg] = useState("");

  // Rascunhos
  const [drafts, setDrafts]           = useState<StoryPost[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [saveMsg, setSaveMsg]         = useState("");
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [draftFeedback, setDraftFeedback] = useState<Record<string, string>>({});
  const [draftEngaj, setDraftEngaj]   = useState<Record<string, string>>({});
  const [learnMsg, setLearnMsg]       = useState("");
  const [learnLoading, setLearnLoading] = useState(false);
  const [learnings, setLearnings]     = useState<{ summary: string; updatedAt: string; n: number } | null>(null);
  const [learningsOpen, setLearningsOpen] = useState(false);
  // Filtro de stage nos rascunhos
  const [draftFilter, setDraftFilter] = useState<"todos" | StoryStage | "base">("todos");

  // Rotina — temas por período (até 3 por período)
  const [manhaTemas, setManhaTemas] = useState<string[]>([""]);
  const [tardeTemas, setTardeTemas] = useState<string[]>([""]);
  const [noiteTemas, setNoiteTemas] = useState<string[]>([""]);

  // Rotina — períodos ativos e modo escrita
  const [periodoAtivo, setPeriodoAtivo] = useState<Record<PeriodoKey, boolean>>({ manha: true, tarde: true, noite: true });
  const [modoEscrita, setModoEscrita] = useState(false);

  // Rotina — perguntas de contexto
  const [treinou, setTreinou]       = useState("");
  const [provaSocial, setProvaSocial] = useState("");
  const [aconteceu, setAconteceu]   = useState("");
  const [vendendo, setVendendo]     = useState(false);
  const [ctxOpen, setCtxOpen]       = useState(false);
  const [rotinaFrames, setRotinaFrames] = useState(4);

  // Rotina — estado de loading e resultados
  const [rotinaGenerating, setRotinaGenerating] = useState(false);
  const [rotinaResult,  setRotinaResult]  = useState<Record<PeriodoKey, RotinaPeriodo | null>>({ manha: null, tarde: null, noite: null });
  const [rotinaStarted, setRotinaStarted] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState("");
  const [editorCarregado, setEditorCarregado] = useState(false);

  useEffect(() => {
    try {
      const pos = Number(localStorage.getItem("arsenal_ciclo") || "0");
      if (pos >= 0 && pos < ARSENAL_ORDEM.length) setCicloPos(pos);
    } catch {}
  }, []);

  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      fetch("/api/stories-style").then(r => r.json()).then(d => { if (alive) setStyleText(d.text || ""); }).catch(() => {});
      fetch("/api/library").then(r => r.json()).then(d => { if (alive) setLibSentiments(d.sentiments || []); }).catch(() => {});
      fetch("/api/story-posts").then(r => r.json()).then(d => { if (alive) setDrafts(d.posts || []); }).catch(() => {});
      fetch("/api/story-learn").then(r => r.json()).then(d => { if (alive && d.learnings) setLearnings(d.learnings); }).catch(() => {});
    }, 0);
    return () => { alive = false; window.clearTimeout(timer); };
  }, []);

  async function saveStyle() {
    await fetch("/api/stories-style", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: styleText }) });
    setStyleMsg("estilo salvo ✓"); setTimeout(() => setStyleMsg(""), 2000);
  }

  function buildFigurinha(tipo: string, existing: Figurinha): Figurinha {
    if (tipo === "nenhuma") return { tipo: "nenhuma" };
    const base = existing && existing.tipo !== "nenhuma" ? existing : null;
    return {
      tipo,
      pergunta: base?.pergunta || (tipo === "caixinha" ? "Me conta aqui" : "Qual bate mais?"),
      opcoes: tipo === "enquete" || tipo === "quiz" ? (base?.opcoes?.length ? base.opcoes : ["sim", "não"]) : base?.opcoes,
    };
  }

  function updateFrame(idx: number, patch: Partial<Frame>) {
    setRes(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        frames: prev.frames.map((frame, i) => i === idx ? { ...frame, ...patch } : frame),
      };
    });
  }

  function updateFigurinha(idx: number, patch: Partial<NonNullable<Figurinha>>) {
    setRes(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        frames: prev.frames.map((frame, i) => {
          if (i !== idx) return frame;
          return {
            ...frame,
            figurinha: {
              tipo: frame.figurinha?.tipo || "enquete",
              ...(frame.figurinha || {}),
              ...patch,
            },
          };
        }),
      };
    });
  }

  // Gerar
  async function gerar(over?: { theme?: string; objetivo?: string; nFrames?: number }) {
    const t = (over?.theme ?? theme).trim();
    if (!t) { setErr("Me diz o que rolou hoje, ou escolhe uma ideia do banco."); return; }
    setErr(""); setLoading(true); setRes(null); setCopied(false);
    setFramePhotos({}); setSelectedFrame(null);
    try {
      const r = await fetch("/api/stories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: t, objetivo: over?.objetivo ?? objetivo, nFrames: over?.nFrames ?? nFrames }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setRes({ titulo: d.titulo, frames: d.frames || [], dica: d.dica });
      setSelectedFrame(0);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  // Carregar biblioteca
  async function loadLib(sentiment: string) {
    if (!sentiment) { setLibImgs([]); return; }
    setLibLoading(true);
    const r = await fetch("/api/library?sentiment=" + encodeURIComponent(sentiment));
    const d = await r.json();
    setLibImgs(d.images || []);
    setLibLoading(false);
  }

  // Upload foto para um frame
  async function uploadPhoto(idx: number, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (d.src) setFramePhotos(prev => ({ ...prev, [idx]: d.src }));
  }

  // Export frame como PNG
  async function downloadFrame(idx: number, toPng: (node: HTMLElement, options?: { pixelRatio?: number; cacheBust?: boolean }) => Promise<string>) {
    if (!res?.frames[idx]) return;
    const node = exportRefs.current[idx];
    if (!node) return;
    const url = await toPng(node, { pixelRatio: 1, cacheBust: true });
    const a = document.createElement("a");
    a.href = url; a.download = `story-frame-${idx + 1}.png`; a.click();
  }

  async function exportFrame(idx: number) {
    setExporting(idx);
    try {
      const { toPng } = await import("html-to-image");
      await downloadFrame(idx, toPng);
    } catch (e) { console.error("export", e); }
    finally { setExporting(null); }
  }

  async function exportAllFrames() {
    if (!res?.frames.length) return;
    setExporting(-1);
    try {
      const { toPng } = await import("html-to-image");
      for (let i = 0; i < res.frames.length; i++) {
        await downloadFrame(i, toPng);
      }
    } catch (e) { console.error("export all", e); }
    finally { setExporting(null); }
  }

  // Copiar tudo
  function copiarTudo() {
    if (!res) return;
    const linhas = res.frames.map((f, i) => {
      const parts = [`STORY ${i + 1} [${f.tipo === "camera" ? "câmera" : "tela"}]`];
      if (f.sugestao_visual) parts.push(`📷 Filmar: ${f.sugestao_visual}`);
      if (f.mostrar) parts.push(`Mostrar: ${f.mostrar}`);
      if (f.texto) parts.push(`Texto: ${f.texto}`);
      if (f.figurinha?.tipo && f.figurinha.tipo !== "nenhuma")
        parts.push(`Figurinha (${f.figurinha.tipo}): ${f.figurinha.pergunta || ""}${f.figurinha.opcoes?.length ? ": " + f.figurinha.opcoes.join(" / ") : ""}`);
      if (f.cta) parts.push(`CTA: ${f.cta}`);
      return parts.join("\n");
    });
    navigator.clipboard.writeText(`${res.titulo}\n\n${linhas.join("\n\n")}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  function pegarIdeia(txt: string) {
    setTheme(txt);
    setMode("sequencia");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Salvar / Rascunhos ──
  async function salvarStory(opts: { isBase?: boolean; periodo?: string } = {}) {
    if (!res) return;
    const now = new Date().toISOString();
    const post: StoryPost = {
      id: `sp_${Date.now()}`,
      titulo: res.titulo,
      frames: res.frames,
      dica: res.dica,
      periodo: opts.periodo,
      stage: "rascunho",
      isBase: opts.isBase || false,
      createdAt: now,
      updatedAt: now,
    };
    const r = await fetch("/api/story-posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(post) });
    const d = await r.json();
    if (d.post) {
      setDrafts(prev => [d.post, ...prev.filter(p => p.id !== d.post.id)]);
      setSaveMsg(opts.isBase ? "salvo como base ⭐" : "rascunho salvo ✓");
      setTimeout(() => setSaveMsg(""), 2500);
    }
  }

  async function atualizarDraft(id: string, patch: Partial<StoryPost>) {
    const existing = drafts.find(p => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await fetch("/api/story-posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setDrafts(prev => prev.map(p => p.id === id ? updated : p));
  }

  async function deletarDraft(id: string) {
    await fetch(`/api/story-posts?id=${id}`, { method: "DELETE" });
    setDrafts(prev => prev.filter(p => p.id !== id));
    if (expandedDraft === id) setExpandedDraft(null);
  }

  async function aprenderComStories() {
    setLearnLoading(true); setLearnMsg("");
    const r = await fetch("/api/story-learn", { method: "POST" });
    const d = await r.json();
    if (d.learnings) { setLearnings(d.learnings); setLearningsOpen(true); setLearnMsg("aprendizado atualizado ✓"); }
    else setLearnMsg(d.error || "Erro");
    setLearnLoading(false);
    setTimeout(() => setLearnMsg(""), 3000);
  }

  // Carrega um rascunho no editor
  function carregarDraft(post: StoryPost) {
    setRes({ titulo: post.titulo, frames: post.frames, dica: post.dica });
    setSelectedFrame(0);
    setFramePhotos({});
    setCopied(false);
    setMode("sequencia");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
  }

  // Carrega uma sequência da Rotina no editor — NÃO muda de aba
  function usarSequencia(opcao: RotinaOpcao) {
    setRes({ titulo: opcao.titulo, frames: opcao.frames, dica: opcao.dica });
    setSelectedFrame(0);
    setFramePhotos({});
    setCopied(false);
    setEditorCarregado(true);
  }

  // Abre no editor e vai para a aba de sequência
  function abrirNoEditor(opcao: RotinaOpcao) {
    setRes({ titulo: opcao.titulo, frames: opcao.frames, dica: opcao.dica });
    setSelectedFrame(0);
    setFramePhotos({});
    setCopied(false);
    setEditorCarregado(true);
    setMode("sequencia");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
  }

  // Gera todas as sequências da rotina em paralelo (um call por tema por período)
  async function gerarRotina() {
    const ctx = { treinou: treinou || undefined, provaSocial: provaSocial || undefined, aconteceu: aconteceu || undefined, vendendo: vendendo || undefined };
    const temasMap: Record<PeriodoKey, string[]> = {
      manha: periodoAtivo.manha ? manhaTemas.filter(t => t.trim()) : [],
      tarde: periodoAtivo.tarde ? tardeTemas.filter(t => t.trim()) : [],
      noite: periodoAtivo.noite ? noiteTemas.filter(t => t.trim()) : [],
    };
    if (!Object.values(temasMap).some(arr => arr.length > 0)) return;

    const diaCompleto = Object.values(temasMap).flat().join(" / ");

    setRotinaResult({
      manha: temasMap.manha.length ? { temas: temasMap.manha.map(d => ({ descricao: d, opcoes: [], loading: true })) } : null,
      tarde: temasMap.tarde.length ? { temas: temasMap.tarde.map(d => ({ descricao: d, opcoes: [], loading: true })) } : null,
      noite: temasMap.noite.length ? { temas: temasMap.noite.map(d => ({ descricao: d, opcoes: [], loading: true })) } : null,
    });
    setRotinaStarted(true);
    setRotinaGenerating(true);
    setAutoSaveMsg("");

    // Acumulador local para auto-save ao final
    const toSave: Array<RotinaOpcao & { periodo: PeriodoKey }> = [];

    const calls: Promise<void>[] = [];
    (["manha", "tarde", "noite"] as PeriodoKey[]).forEach(periodo => {
      temasMap[periodo].forEach((descricao, idx) => {
        calls.push((async () => {
          try {
            const r = await fetch("/api/stories-rotina", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ periodo, descricao, diaCompleto, contexto: ctx, objetivo, nFrames: rotinaFrames, modoEscrita }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Erro");
            const opcoes: RotinaOpcao[] = d.opcoes || [];
            opcoes.forEach(o => toSave.push({ ...o, periodo }));
            setRotinaResult(prev => {
              const pr = prev[periodo];
              if (!pr) return prev;
              const ts = [...pr.temas];
              ts[idx] = { descricao, opcoes, loading: false };
              return { ...prev, [periodo]: { temas: ts } };
            });
          } catch (e) {
            setRotinaResult(prev => {
              const pr = prev[periodo];
              if (!pr) return prev;
              const ts = [...pr.temas];
              ts[idx] = { descricao, opcoes: [], loading: false, err: e instanceof Error ? e.message : String(e) };
              return { ...prev, [periodo]: { temas: ts } };
            });
          }
        })());
      });
    });

    await Promise.all(calls);
    setRotinaGenerating(false);

    // Auto-save todas as sequências geradas como rascunhos
    if (toSave.length > 0) {
      const now = new Date().toISOString();
      const saveBase = Date.now();
      await Promise.all(toSave.map(async (opcao, i) => {
        const post: StoryPost = {
          id: `sp_rot_${saveBase}_${i}`,
          titulo: opcao.titulo,
          frames: opcao.frames,
          dica: opcao.dica,
          periodo: opcao.periodo,
          stage: "rascunho",
          isBase: false,
          createdAt: now,
          updatedAt: now,
        };
        const r = await fetch("/api/story-posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(post) });
        const saved = await r.json();
        if (saved.post) setDrafts(prev => [saved.post, ...prev.filter(p => p.id !== saved.post.id)]);
      }));
      setAutoSaveMsg(`${toSave.length} sequências salvas em rascunhos ✓`);
      setTimeout(() => setAutoSaveMsg(""), 4000);
    }
  }

  // Gera sequência do Arsenal para uma categoria
  async function gerarArsenal(cat: ArsenalCategoria) {
    if (arsenalGen) return;
    setArsenalGen(cat);
    setArsenalErr("");
    setArsenalRes(null);
    setArsenalSaveMsg("");
    try {
      let usados: number[] = [];
      try { usados = JSON.parse(localStorage.getItem("arsenal_usados") || "[]"); } catch {}
      const r = await fetch("/api/stories-arsenal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria: cat, contexto: arsenalCtx || undefined, excluirDias: usados }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao gerar");
      setArsenalRes(d);

      // marca o script como usado (evita repetir até rodar todos da categoria)
      try {
        const novos = [...usados.filter(u => u !== d.script.dia), d.script.dia].slice(-50);
        localStorage.setItem("arsenal_usados", JSON.stringify(novos));
      } catch {}

      // avança o ciclo se gerou a categoria do dia
      if (ARSENAL_ORDEM[cicloPos] === cat) {
        const nx = (cicloPos + 1) % ARSENAL_ORDEM.length;
        setCicloPos(nx);
        try { localStorage.setItem("arsenal_ciclo", String(nx)); } catch {}
      }

      // auto-save como rascunho
      const opcao: RotinaOpcao | undefined = d.opcoes?.[0];
      if (opcao) {
        const now = new Date().toISOString();
        const post: StoryPost = {
          id: `sp_ars_${Date.now()}`,
          titulo: opcao.titulo,
          frames: opcao.frames,
          dica: opcao.dica,
          periodo: `arsenal · ${ARSENAL_CATEGORIAS[cat].label}`,
          stage: "rascunho",
          isBase: false,
          createdAt: now,
          updatedAt: now,
        };
        const rs = await fetch("/api/story-posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(post) });
        const ds = await rs.json();
        if (ds.post) {
          setDrafts(prev => [ds.post, ...prev.filter(p => p.id !== ds.post.id)]);
          setArsenalSaveMsg("sequência salva em rascunhos ✓");
          setTimeout(() => setArsenalSaveMsg(""), 4000);
        }
      }
    } catch (e) {
      setArsenalErr(e instanceof Error ? e.message : String(e));
    } finally {
      setArsenalGen(null);
    }
  }

  const selF = selectedFrame !== null ? selectedFrame : null;
  const selectedStory = selF !== null && res?.frames[selF] ? res.frames[selF] : null;

  return (
    <div className="studio-page stories-page">
      <section className="studio-hero stories-hero">
        <div className="studio-hero__copy">
          <h2>Sequência do dia, já pronta pra gravar</h2>
          <p>
            Monta stories em A.E.I com câmera, tela, interação, foto e CTA. Depois de gerar, você edita frame por frame e baixa no formato 9:16.
          </p>
        </div>
      </section>

      <section className="studio-section studio-section--pad stories-composer">
        {/* Tabs: Sequência avulsa / Rotina do dia / Rascunhos */}
        <div className="stories-mode-tabs">
          <button type="button" onClick={() => setMode("sequencia")} className={mode === "sequencia" ? "is-active" : ""}>
            Sequência avulsa
          </button>
          <button type="button" onClick={() => setMode("rotina")} className={mode === "rotina" ? "is-active" : ""}>
            Rotina do dia
          </button>
          <button type="button" onClick={() => setMode("arsenal")} className={mode === "arsenal" ? "is-active" : ""}>
            🎯 Arsenal
          </button>
          <button type="button" onClick={() => { setMode("rascunhos"); setDraftsLoading(true); fetch("/api/story-posts").then(r => r.json()).then(d => { setDrafts(d.posts || []); setDraftsLoading(false); }); }} className={mode === "rascunhos" ? "is-active" : ""}>
            Rascunhos {drafts.length > 0 && <span className="stories-tab-badge">{drafts.length}</span>}
          </button>
        </div>

        {/* ── SEQUÊNCIA AVULSA ── */}
        {mode === "sequencia" && (
          <>
            <div className="studio-section-head">
              <div>
                <h3>Gerar sequência</h3>
                <p>Descreve o que rolou hoje ou puxa uma ideia do banco.</p>
              </div>
              {rotinaStarted && (
                <button type="button" onClick={() => setMode("rotina")} className="rotina-voltar-btn">
                  ← resultados da rotina
                </button>
              )}
            </div>

            <div className="stories-compose-grid">
              <label className="stories-field stories-field--wide">
                <span>O que rolou hoje?</span>
                <textarea
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  rows={5}
                  placeholder="ex: gravei o treino de glúteo da Nath e ela foi pesada / chegou um feedback de aluna / quero falar sobre por que a maioria não evolui"
                  className="studio-textarea stories-textarea"
                />
              </label>

              <div className="stories-control-stack">
                <label className="stories-field">
                  <span>Objetivo</span>
                  <select value={objetivo} onChange={e => setObjetivo(e.target.value)} className="studio-input">
                    {OBJETIVOS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </label>
                <label className="stories-field">
                  <span>Nº de frames</span>
                  <input
                    type="number"
                    min={3}
                    max={7}
                    value={nFrames}
                    onChange={e => setNFrames(Math.min(7, Math.max(3, Number(e.target.value) || 5)))}
                    className="studio-input"
                  />
                </label>
                <div className="stories-objective-help">
                  <strong>Objetivos, sem mistério</strong>
                  <div>
                    {OBJECTIVE_HELP.map(item => (
                      <p key={item.title}><b>{item.title}</b>: {item.text}</p>
                    ))}
                  </div>
                </div>
                <button onClick={() => gerar()} disabled={loading} className="dg-btn-primary stories-primary-btn stories-main-action">
                  {loading ? "montando..." : "Gerar stories"}
                </button>
              </div>
            </div>

            {err && <div className="stories-error">⚠ {err}</div>}
          </>
        )}

        {/* ── ROTINA DO DIA ── */}
        {mode === "rotina" && (
          <div className="rotina-form">
            <div className="studio-section-head">
              <div>
                <h3>Rotina do dia</h3>
                <p>Conta o que vai fazer, o que fez ou o que quer falar em cada período. Passado, presente ou futuro — a gente monta 2 opções de sequência pra você gravar.</p>
              </div>
            </div>

            <div className="rotina-periods">
              {([
                { key: "manha" as PeriodoKey, emoji: "🌅", label: "MANHÃ", hint: "café, consultoria, treino pessoal",
                  temas: manhaTemas, setTemas: setManhaTemas,
                  phs: ["ex: vou treinar glúteo pesado", "ex: quero falar sobre progressão de carga", "ex: corrigi vídeo de aluna e tive insight"] },
                { key: "tarde" as PeriodoKey, emoji: "☀️", label: "TARDE", hint: "consultoria 2ª parte, treino da Nath",
                  temas: tardeTemas, setTemas: setTardeTemas,
                  phs: ["ex: vou treinar a Nath", "ex: chegou feedback incrível de aluna", "ex: quero explicar progressão de carga"] },
                { key: "noite" as PeriodoKey, emoji: "🌙", label: "NOITE", hint: "fechamento, Nath, programação hobby",
                  temas: noiteTemas, setTemas: setNoiteTemas,
                  phs: ["ex: programei material novo hoje", "ex: quero fechar o dia com CTA leve", "ex: algo da consultoria que quero comentar"] },
              ] as const).map(({ key, emoji, label, hint, temas, setTemas, phs }) => {
                const pr = rotinaResult[key];
                const isDone = pr && !pr.temas.some(t => t.loading);
                const ativo = periodoAtivo[key];
                return (
                  <div key={key} className={`rotina-period${!ativo ? " rotina-period--off" : ""}`}>
                    <div className="rotina-period-head">
                      <span className="rotina-period-emoji">{emoji}</span>
                      <strong className="rotina-period-label">{label}</strong>
                      <span className="rotina-period-hint">{hint}</span>
                      {pr?.temas.some(t => t.loading) && <span className="rotina-loading-pill">gerando...</span>}
                      {isDone && <span className="rotina-done-pill">✓ pronto</span>}
                      <button
                        type="button"
                        onClick={() => setPeriodoAtivo(p => ({ ...p, [key]: !p[key] }))}
                        className={`rotina-periodo-toggle${!ativo ? " is-off" : ""}`}
                        title={ativo ? "Desativar este período" : "Ativar este período"}
                      >
                        {ativo ? "ativo" : "inativo"}
                      </button>
                    </div>

                    {ativo && (
                      <>
                        <div className="rotina-temas-list">
                          {temas.map((val, idx) => (
                            <div key={idx} className="rotina-tema-row">
                              <span className="rotina-tema-num">{idx + 1}</span>
                              <textarea
                                value={val}
                                onChange={e => {
                                  const next = [...temas];
                                  next[idx] = e.target.value;
                                  setTemas(next);
                                }}
                                rows={2}
                                placeholder={phs[idx] || phs[0]}
                                className="studio-textarea rotina-tema-input"
                              />
                              {temas.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setTemas(temas.filter((_, i) => i !== idx))}
                                  className="rotina-tema-remove"
                                  title="Remover tema"
                                >✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                        {temas.length < 3 && (
                          <button
                            type="button"
                            onClick={() => setTemas([...temas, ""])}
                            className="rotina-add-tema"
                          >
                            + adicionar tema
                          </button>
                        )}
                      </>
                    )}
                    {!ativo && (
                      <p className="rotina-period-off-hint">período desativado — não será gerado</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Perguntas de contexto */}
            <div className="rotina-ctx">
              <button type="button" className="rotina-ctx-toggle" onClick={() => setCtxOpen(o => !o)}>
                <span>Perguntas rápidas</span>
                <span className="rotina-ctx-hint">opcional — ajuda a personalizar</span>
                <span className="spacer" />
                <span>{ctxOpen ? "▲" : "▼"}</span>
              </button>
              {ctxOpen && (
                <div className="rotina-ctx-body">
                  <label className="stories-field">
                    <span>Treinou hoje?</span>
                    <select value={treinou} onChange={e => setTreinou(e.target.value)} className="studio-input">
                      <option value="">não sei ainda / prefiro não dizer</option>
                      <option value="eu treinei">sim, eu treinei (skin in the game)</option>
                      <option value="eu + aluna">sim, eu treino com aluna hoje</option>
                      <option value="não treinei">não treino hoje</option>
                    </select>
                  </label>
                  <label className="stories-field">
                    <span>Tem feedback/resultado de aluna pra mostrar?</span>
                    <textarea
                      value={provaSocial}
                      onChange={e => setProvaSocial(e.target.value)}
                      rows={2}
                      placeholder="ex: aluna subiu de 10kg pro 40kg no terra em 3 meses"
                      className="studio-textarea"
                    />
                  </label>
                  <label className="stories-field">
                    <span>Algo específico aconteceu hoje?</span>
                    <textarea
                      value={aconteceu}
                      onChange={e => setAconteceu(e.target.value)}
                      rows={2}
                      placeholder="ex: chegou cancelamento, novo insight sobre periodização, curiosidade fora do trabalho..."
                      className="studio-textarea"
                    />
                  </label>
                  <label className="rotina-check-label">
                    <input type="checkbox" checked={vendendo} onChange={e => setVendendo(e.target.checked)} />
                    <span>Quero vender consultoria hoje (CTA orgânico)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Controles + botão */}
            <div className="rotina-controls">
              <label className="stories-field">
                <span>Objetivo</span>
                <select value={objetivo} onChange={e => setObjetivo(e.target.value)} className="studio-input">
                  {OBJETIVOS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </label>
              <label className="stories-field">
                <span>Frames por período <small style={{ color: "#5b6480", fontWeight: 400 }}>(manhã, tarde e noite recebem esse nº cada)</small></span>
                <input
                  type="number" min={3} max={6} value={rotinaFrames}
                  onChange={e => setRotinaFrames(Math.min(6, Math.max(3, Number(e.target.value) || 4)))}
                  className="studio-input"
                />
              </label>
              <button
                type="button"
                onClick={() => setModoEscrita(v => !v)}
                className={`rotina-escrita-toggle${modoEscrita ? " is-on" : ""}`}
                title="Sequências só com texto escrito, sem câmera"
              >
                {modoEscrita ? "📝 escrita (ativo)" : "📝 modo escrita"}
              </button>
              <button
                onClick={gerarRotina}
                disabled={rotinaGenerating}
                className="dg-btn-primary stories-primary-btn rotina-gerar-btn"
              >
                {rotinaGenerating ? "gerando rotina..." : "Gerar rotina do dia"}
              </button>
            </div>
            {autoSaveMsg && <p className="rotina-autosave-msg">{autoSaveMsg}</p>}
          </div>
        )}

        {/* ── ABA ARSENAL ── */}
        {mode === "arsenal" && (
          <div className="arsenal-section">
            <div className="studio-section-head">
              <div>
                <h3>Gerar sequência do arsenal</h3>
                <p>Ciclo de 9 dias, 1 categoria por dia, nessa ordem exata. A IA pega um script do arsenal e reescreve 100% na sua voz. Cada sequência gerada já vai pros rascunhos.</p>
              </div>
            </div>

            {/* Contexto opcional */}
            <label className="stories-field" style={{ marginBottom: 14 }}>
              <span>Contexto do momento <small style={{ color: "#5b6480", fontWeight: 400 }}>(opcional — encaixo no roteiro)</small></span>
              <textarea
                value={arsenalCtx}
                onChange={e => setArsenalCtx(e.target.value)}
                rows={2}
                placeholder="ex: chegou feedback da aluna Fernanda / semana de foco em glúteo / abri 5 vagas na consultoria"
                className="studio-textarea"
              />
            </label>

            {/* Ciclo de categorias */}
            <div className="arsenal-grid">
              {ARSENAL_ORDEM.map((cat, idx) => {
                const info = ARSENAL_CATEGORIAS[cat];
                const isHoje = idx === cicloPos;
                const isGen = arsenalGen === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => gerarArsenal(cat)}
                    disabled={!!arsenalGen}
                    className={`arsenal-card${isHoje ? " is-hoje" : ""}${isGen ? " is-gen" : ""}`}
                  >
                    <div className="arsenal-card-top">
                      <span className="arsenal-card-dia">dia {idx + 1}</span>
                      {isHoje && <span className="arsenal-hoje-pill">hoje</span>}
                    </div>
                    <div className="arsenal-card-emoji">{info.emoji}</div>
                    <strong className="arsenal-card-label">{info.label}</strong>
                    <p className="arsenal-card-obj">{info.objetivo}</p>
                    <span className="arsenal-card-action">{isGen ? "gerando..." : "gerar sequência →"}</span>
                  </button>
                );
              })}
            </div>

            {arsenalErr && <div className="stories-error">⚠ {arsenalErr}</div>}
            {arsenalSaveMsg && <p className="rotina-autosave-msg">{arsenalSaveMsg}</p>}

            {/* Resultado */}
            {arsenalRes && (
              <div className="arsenal-result">
                <div className="arsenal-result-head">
                  <span className="arsenal-result-cat" >
                    {ARSENAL_CATEGORIAS[arsenalRes.categoria].emoji} {ARSENAL_CATEGORIAS[arsenalRes.categoria].label}
                  </span>
                  <span className="arsenal-result-script">script: {arsenalRes.script.nome}</span>
                </div>
                {arsenalRes.opcoes.map((opcao, i) => (
                  <div key={i} className="rotina-opcao-card">
                    <div className="rotina-opcao-head">
                      <span className="rotina-opcao-titulo">{opcao.titulo}</span>
                    </div>
                    <p className="rotina-opcao-angulo">{opcao.angulo}</p>
                    <div className="rotina-frame-strip">
                      {opcao.frames.map((f, fi) => (
                        <div key={fi} className={`rotina-frame-chip ${f.tipo === "camera" ? "is-camera" : "is-screen"}`}>
                          <span className="rotina-chip-icon">{f.tipo === "camera" ? "📹" : "🖥️"}</span>
                          <span className="rotina-chip-text">{(f.texto || f.sugestao_visual || "").slice(0, 40)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rotina-opcao-footer">
                      {opcao.dica && <span className="rotina-dica">💡 {opcao.dica}</span>}
                      <div className="rotina-usar-actions">
                        <button
                          onClick={() => abrirNoEditor(opcao)}
                          className="dg-btn-primary stories-primary-btn rotina-usar-btn"
                          title="Abrir no editor para gravar e baixar"
                        >
                          ✏ editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ABA RASCUNHOS ── */}
        {mode === "rascunhos" && (
          <div className="drafts-section">
            <div className="studio-section-head">
              <div>
                <h3>Rascunhos & postados</h3>
                <p>Stories salvos, editáveis. Adiciona feedback depois de postar pra IA aprender com eles.</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {learnMsg && <span className="stories-saved">{learnMsg}</span>}
                <button onClick={aprenderComStories} disabled={learnLoading} className="dg-btn">
                  {learnLoading ? "analisando..." : "aprender com esses stories"}
                </button>
              </div>
            </div>

            {/* Aprendizado atual */}
            {learnings && (
              <div className={`drafts-learn-card${learningsOpen ? " is-open" : ""}`}>
                <button type="button" className="drafts-learn-toggle" onClick={() => setLearningsOpen(o => !o)}>
                  <span>O que a IA aprendeu com seus stories</span>
                  <span className="drafts-learn-meta">{learnings.n} analisados · {new Date(learnings.updatedAt).toLocaleDateString("pt-BR")}</span>
                  <span className="spacer" />
                  <span>{learningsOpen ? "▲" : "▼"}</span>
                </button>
                {learningsOpen && <div className="drafts-learn-body">{learnings.summary}</div>}
              </div>
            )}

            {/* Filtro */}
            <div className="drafts-filter">
              {(["todos", "rascunho", "publicado", "arquivado", "base"] as const).map(f => (
                <button key={f} type="button" onClick={() => setDraftFilter(f)} className={draftFilter === f ? "is-active" : ""}>
                  {f === "base" ? "⭐ base" : f}
                  {f === "todos" && drafts.length > 0 ? ` (${drafts.length})` : ""}
                  {f !== "todos" && f !== "base" ? ` (${drafts.filter(d => d.stage === f).length})` : ""}
                  {f === "base" ? ` (${drafts.filter(d => d.isBase).length})` : ""}
                </button>
              ))}
            </div>

            {draftsLoading && <div className="stories-error" style={{ background: "none", color: "#6b7694" }}>carregando...</div>}

            {!draftsLoading && drafts.length === 0 && (
              <div className="drafts-empty">Nenhum story salvo ainda. Gera uma sequência e clica em "Salvar rascunho" ou "Salvar base".</div>
            )}

            <div className="drafts-list">
              {drafts
                .filter(d => draftFilter === "todos" || (draftFilter === "base" ? d.isBase : d.stage === draftFilter))
                .map(post => {
                  const isOpen = expandedDraft === post.id;
                  const fb = draftFeedback[post.id] ?? (post.feedback || "");
                  const eng = draftEngaj[post.id] ?? (post.engajamento || "");
                  return (
                    <div key={post.id} className={`draft-card${isOpen ? " is-open" : ""}`}>
                      <div className="draft-card-head">
                        <div className="draft-card-info">
                          {post.isBase && <span className="draft-badge draft-badge--base">⭐ base</span>}
                          <span className={`draft-badge draft-badge--${post.stage}`}>{post.stage}</span>
                          {post.periodo && <span className="draft-badge draft-badge--periodo">{post.periodo === "manha" ? "🌅" : post.periodo === "tarde" ? "☀️" : "🌙"} {post.periodo}</span>}
                          <strong className="draft-titulo">{post.titulo}</strong>
                        </div>
                        <div className="draft-card-actions">
                          <button onClick={() => carregarDraft(post)} className="dg-btn" title="Carregar no editor">editar →</button>
                          <button onClick={() => setExpandedDraft(isOpen ? null : post.id)} className="dg-btn" title="Feedback / stage">
                            {isOpen ? "fechar" : "feedback"}
                          </button>
                          <button onClick={() => deletarDraft(post.id)} className="dg-btn draft-delete-btn" title="Deletar">✕</button>
                        </div>
                      </div>

                      {/* Mini preview dos frames */}
                      <div className="rotina-frame-strip" style={{ marginTop: 8 }}>
                        {post.frames.slice(0, 5).map((f, fi) => (
                          <div key={fi} className={`rotina-frame-chip ${f.tipo === "camera" ? "is-camera" : "is-screen"}`}>
                            <span className="rotina-chip-icon">{f.tipo === "camera" ? "📹" : "🖥️"}</span>
                            <span className="rotina-chip-text">{(f.texto || f.sugestao_visual || "").slice(0, 50)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Painel expandível de feedback */}
                      {isOpen && (
                        <div className="draft-feedback-panel">
                          <label className="stories-field">
                            <span>O que achei deste story</span>
                            <textarea
                              value={fb}
                              onChange={e => setDraftFeedback(p => ({ ...p, [post.id]: e.target.value }))}
                              rows={3}
                              placeholder="ex: a enquete bombou, mas o último frame ficou confuso / abertura col..."
                              className="studio-textarea"
                            />
                          </label>
                          <label className="stories-field">
                            <span>Engajamento observado</span>
                            <input
                              value={eng}
                              onChange={e => setDraftEngaj(p => ({ ...p, [post.id]: e.target.value }))}
                              placeholder="ex: 8 DMs, muita caixinha, stories lidos até o fim"
                              className="studio-input"
                            />
                          </label>
                          <div className="draft-feedback-footer">
                            <label className="stories-field" style={{ flex: 1 }}>
                              <span>Stage</span>
                              <select
                                value={post.stage}
                                onChange={e => atualizarDraft(post.id, { stage: e.target.value as StoryStage })}
                                className="studio-input"
                              >
                                <option value="rascunho">rascunho</option>
                                <option value="publicado">publicado</option>
                                <option value="arquivado">arquivado</option>
                              </select>
                            </label>
                            <label className="rotina-check-label" style={{ alignSelf: "flex-end", paddingBottom: 10 }}>
                              <input type="checkbox" checked={!!post.isBase} onChange={e => atualizarDraft(post.id, { isBase: e.target.checked })} />
                              <span>marcar como base ⭐</span>
                            </label>
                            <button
                              onClick={() => atualizarDraft(post.id, { feedback: fb, engajamento: eng })}
                              className="dg-btn-primary stories-primary-btn"
                              style={{ alignSelf: "flex-end" }}
                            >
                              salvar feedback
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </section>

      {/* ── RESULTADOS DA ROTINA ── */}
      {mode === "rotina" && rotinaStarted && (
        <section className="studio-section studio-section--pad rotina-results">
          <div className="studio-section-head">
            <div>
              <h3>Rotina de hoje</h3>
              <p>Escolhe uma sequência por período — clica "usar essa" pra editar e baixar.</p>
            </div>
          </div>

          {([
            { key: "manha" as PeriodoKey, emoji: "🌅", label: "MANHÃ" },
            { key: "tarde" as PeriodoKey, emoji: "☀️", label: "TARDE" },
            { key: "noite" as PeriodoKey, emoji: "🌙", label: "NOITE" },
          ] as const).map(({ key, emoji, label }) => {
            const pr = rotinaResult[key];
            if (!pr) return null;
            const anyLoading = pr.temas.some(t => t.loading);
            return (
              <div key={key} className="rotina-periodo-block">
                <div className="rotina-periodo-head">
                  <span className="rotina-periodo-emoji">{emoji}</span>
                  <strong>{label}</strong>
                  {anyLoading && <span className="rotina-loading-pill">gerando...</span>}
                  {!anyLoading && <span className="rotina-done-pill">✓ pronto</span>}
                </div>

                {pr.temas.map((tema, tIdx) => (
                  <div key={tIdx} className="rotina-tema-result">
                    <div className="rotina-tema-result-head">
                      <span className="rotina-tema-result-num">Tema {tIdx + 1}</span>
                      <span className="rotina-tema-result-desc">{tema.descricao}</span>
                    </div>

                    {tema.loading && <div className="rotina-skeleton"><div /><div /></div>}
                    {tema.err && <div className="stories-error">⚠ {tema.err}</div>}

                    {!tema.loading && tema.opcoes.length > 0 && (
                      <div className="rotina-opcoes">
                        {tema.opcoes.map((opcao, i) => (
                          <div key={i} className="rotina-opcao-card">
                            <div className="rotina-opcao-head">
                              <span className="rotina-opcao-num">Opção {i + 1}</span>
                              <span className="rotina-opcao-titulo">{opcao.titulo}</span>
                            </div>
                            <p className="rotina-opcao-angulo">{opcao.angulo}</p>
                            <div className="rotina-frame-strip">
                              {opcao.frames.slice(0, 5).map((f, fi) => (
                                <div key={fi} className={`rotina-frame-chip ${f.tipo === "camera" ? "is-camera" : "is-screen"}`}>
                                  <span className="rotina-chip-icon">{f.tipo === "camera" ? "📹" : "🖥️"}</span>
                                  <span className="rotina-chip-text">{(f.texto || f.sugestao_visual || "").slice(0, 40)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="rotina-opcao-footer">
                              {opcao.dica && <span className="rotina-dica">💡 {opcao.dica}</span>}
                              <div className="rotina-usar-actions">
                                <button
                                  onClick={() => abrirNoEditor(opcao)}
                                  className="dg-btn-primary stories-primary-btn rotina-usar-btn"
                                  title="Abrir no editor para gravar e baixar"
                                >
                                  ✏ editar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      )}

      <section className={`studio-section stories-style-card${styleOpen ? " is-open" : ""}`}>
        <button type="button" onClick={() => setStyleOpen(o => !o)} className="stories-accordion-toggle">
          <span className="dg-kicker">📎 Estilo & referências</span>
          <span className={`stories-status-dot${styleText ? " is-on" : ""}`}>{styleText ? "calibrado" : "vazio"}</span>
          <span className="spacer" />
          <span className="stories-chevron">{styleOpen ? "▲" : "▼"}</span>
        </button>
        {styleOpen && (
          <div className="stories-accordion-body">
            <textarea
              value={styleText}
              onChange={e => setStyleText(e.target.value)}
              rows={8}
              className="studio-textarea stories-style-textarea"
            />
            <div className="stories-inline-actions">
              <button onClick={saveStyle} className="dg-btn-primary stories-primary-btn">salvar estilo</button>
              {styleMsg && <span className="stories-saved">{styleMsg}</span>}
            </div>
          </div>
        )}
      </section>

      {res && (
        <section className="studio-section studio-section--pad stories-result">
          <div className="stories-result-head">
            <div className="stories-result-title">
              <span className="dg-kicker">Sequência gerada</span>
              <h3>{res.titulo}</h3>
            </div>
            <div className="stories-result-actions">
              <div className="stories-segmented">
                <button type="button" onClick={() => setViewMode("visual")} className={viewMode === "visual" ? "is-active" : ""}>Visual</button>
                <button type="button" onClick={() => setViewMode("lista")} className={viewMode === "lista" ? "is-active" : ""}>Lista</button>
              </div>
              {saveMsg
                ? <span className="stories-saved">{saveMsg}</span>
                : <>
                    <button onClick={() => salvarStory()} className="dg-btn" title="Salvar como rascunho para postar depois">salvar rascunho</button>
                    <button onClick={() => salvarStory({ isBase: true })} className="dg-btn" title="Salvar como referência de qualidade — a IA aprende com esse">⭐ salvar base</button>
                  </>
              }
              <button onClick={copiarTudo} className="dg-btn">{copied ? "copiado ✓" : "copiar tudo"}</button>
              <button onClick={exportAllFrames} disabled={exporting !== null} className="dg-btn-primary stories-primary-btn">
                {exporting === -1 ? "baixando..." : "baixar todos"}
              </button>
            </div>
          </div>

          {viewMode === "visual" && (
            <div className="stories-workbench">
              <div className="stories-frame-rail" aria-label="Frames gerados">
                {res.frames.map((f, i) => (
                  <StoryFrameCard
                    key={i}
                    frame={f}
                    index={i}
                    total={res.frames.length}
                    image={framePhotos[i]}
                    selected={selectedFrame === i}
                    onSelect={() => setSelectedFrame(i)}
                  />
                ))}
              </div>

              {selectedStory && selF !== null && (
                <div className="stories-workbench-grid">
                  <div className="stories-editor-panel">
                    <div className="stories-editor-head">
                      <div>
                        <strong>Frame {selF + 1}</strong>
                        <span>{selectedStory.tipo === "camera" ? "📹 câmera" : "🖥️ tela"}</span>
                      </div>
                      <button onClick={() => exportFrame(selF)} disabled={exporting === selF} className="dg-btn-primary stories-primary-btn">
                        {exporting === selF ? "exportando..." : "baixar frame"}
                      </button>
                    </div>

                    <div className="stories-selected-tools">
                      <div className="stories-photo-panel">
                        <div className="stories-photo-preview">
                          {framePhotos[selF] ? (
                            <>
                              <img src={framePhotos[selF]} alt="" />
                              <button
                                type="button"
                                onClick={() => setFramePhotos(p => { const n = { ...p }; delete n[selF]; return n; })}
                                aria-label="Remover foto"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <span>sem foto</span>
                          )}
                        </div>

                        <button type="button" onClick={() => uploadRefs.current[selF]?.click()} className="dg-btn stories-upload-btn">
                          enviar arquivo
                        </button>
                        <input
                          ref={el => { uploadRefs.current[selF] = el; }}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(selF, f); e.currentTarget.value = ""; }}
                        />

                        <label className="stories-field">
                          <span>Biblioteca</span>
                          <select defaultValue="" onChange={e => loadLib(e.target.value)} className="studio-input">
                            <option value="">escolher tema</option>
                            {libSentiments.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </label>
                        {libLoading && <span className="stories-loading">carregando...</span>}

                        {libImgs.length > 0 && (
                          <div className="stories-library-grid">
                            {libImgs.map(src => (
                              <button
                                key={src}
                                type="button"
                                onClick={() => setFramePhotos(p => ({ ...p, [selF]: src }))}
                                className={framePhotos[selF] === src ? "is-active" : ""}
                              >
                                <img src={src} alt="" loading="lazy" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="stories-text-panel">
                        <label className="stories-field">
                          <span>Texto</span>
                          <textarea
                            value={selectedStory.texto || ""}
                            onChange={e => updateFrame(selF, { texto: e.target.value })}
                            rows={6}
                            className="studio-textarea"
                          />
                        </label>

                        <div className="stories-mini-grid">
                          <label className="stories-field">
                            <span>Tipo</span>
                            <select value={selectedStory.tipo || "camera"} onChange={e => updateFrame(selF, { tipo: e.target.value })} className="studio-input">
                              {STORY_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                            </select>
                          </label>
                          <label className="stories-field">
                            <span>Posição</span>
                            <select value={selectedStory.posicao_texto || "meio"} onChange={e => updateFrame(selF, { posicao_texto: e.target.value })} className="studio-input">
                              {TEXT_POSITIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                            </select>
                          </label>
                          <label className="stories-field">
                            <span>Fundo</span>
                            <select value={selectedStory.fundo_tipo || "camera_escuro"} onChange={e => updateFrame(selF, { fundo_tipo: e.target.value })} className="studio-input">
                              {FUNDO_TYPES.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                            </select>
                          </label>
                          <label className="stories-field">
                            <span>Figurinha</span>
                            <select
                              value={selectedStory.figurinha?.tipo || "nenhuma"}
                              onChange={e => updateFrame(selF, { figurinha: buildFigurinha(e.target.value, selectedStory.figurinha || null) })}
                              className="studio-input"
                            >
                              {FIGURINHAS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                            </select>
                          </label>
                        </div>

                        {selectedStory.figurinha?.tipo && selectedStory.figurinha.tipo !== "nenhuma" && (
                          <div className="stories-mini-grid">
                            <label className="stories-field stories-field--wide">
                              <span>Pergunta da figurinha</span>
                              <input
                                value={selectedStory.figurinha.pergunta || ""}
                                onChange={e => updateFigurinha(selF, { pergunta: e.target.value })}
                                className="studio-input"
                              />
                            </label>
                            <label className="stories-field stories-field--wide">
                              <span>Opções</span>
                              <input
                                value={(selectedStory.figurinha.opcoes || []).join(" / ")}
                                onChange={e => updateFigurinha(selF, { opcoes: e.target.value.split("/").map(o => o.trim()).filter(Boolean) })}
                                placeholder="sim / não"
                                className="studio-input"
                              />
                            </label>
                          </div>
                        )}

                        <label className="stories-field">
                          <span>CTA</span>
                          <input
                            value={selectedStory.cta || ""}
                            onChange={e => updateFrame(selF, { cta: e.target.value || null })}
                            className="studio-input"
                          />
                        </label>

                        <label className="stories-field">
                          <span>Mostrar / filmar</span>
                          <input
                            value={selectedStory.sugestao_visual || selectedStory.mostrar || ""}
                            onChange={e => updateFrame(selF, { sugestao_visual: e.target.value })}
                            className="studio-input"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="stories-frame-list">
                    {res.frames.map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedFrame(i)}
                        className={`stories-frame-row${selectedFrame === i ? " is-active" : ""}`}
                      >
                        <span className="stories-row-num">{i + 1}</span>
                        <span className="stories-row-copy">
                          <strong>{f.tipo === "camera" ? "📹 câmera" : "🖥️ tela"}</strong>
                          <em>{f.sugestao_visual || f.mostrar || "sem sugestão visual"}</em>
                          <span>{f.texto || "sem texto"}</span>
                        </span>
                        {framePhotos[i] && <img src={framePhotos[i]} alt="" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === "lista" && (
            <div className="stories-list-mode">
              {res.frames.map((f, i) => (
                <article key={i} className="stories-list-card">
                  <span className="stories-row-num">{i + 1}</span>
                  <div>
                    <div className={`stories-list-type ${f.tipo === "camera" ? "is-camera" : "is-screen"}`}>
                      {f.tipo === "camera" ? "📹 câmera" : "🖥️ tela"}
                    </div>
                    {f.sugestao_visual && <p className="stories-visual-tip">📷 Filmar: {f.sugestao_visual}</p>}
                    {f.mostrar && <p><b>Mostrar:</b> {f.mostrar}</p>}
                    {f.texto && <p className="stories-list-text">{f.texto}</p>}
                    {f.figurinha?.tipo && f.figurinha.tipo !== "nenhuma" && (
                      <div className="stories-chip-block">
                        <strong>{f.figurinha.tipo}: {f.figurinha.pergunta}</strong>
                        {f.figurinha.opcoes?.length ? <span>{f.figurinha.opcoes.join(" / ")}</span> : null}
                      </div>
                    )}
                    {f.cta && <p className="stories-list-cta">➡ {f.cta}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}

          {res.dica && <div className="stories-result-note">💡 {res.dica}</div>}
        </section>
      )}

      {res && (
        <div className="stories-export-stage" aria-hidden>
          {res.frames.map((f, i) => (
            <div key={i} ref={el => { exportRefs.current[i] = el; }}>
              <StoryFrameFullSize frame={f} image={framePhotos[i]} />
            </div>
          ))}
        </div>
      )}

      <section className="studio-section studio-section--pad stories-rhythm">
        <div className="studio-section-head">
          <div>
            <h3>Ritmo do dia</h3>
            <p>Blocos A.E.I com intervalo para o story rodar.</p>
          </div>
          <span className="spacer" />
          <button
            onClick={() => gerar({ theme: "Um dia inteiro de stories: manhã bastidor pessoal (abre o dia), manhã retomada com treino + insight, tarde prova social de aluna da N2 Squad, noite fechamento leve com CTA. Framework A.E.I completo.", objetivo: "equilibrar", nFrames: 6 })}
            disabled={loading}
            className="dg-btn"
          >
            gerar dia inteiro
          </button>
        </div>
        <div className="stories-rhythm-grid">
          {DAY_RHYTHM.map(r => (
            <div key={r.hora} className="stories-rhythm-item">
              <strong>{r.hora}</strong>
              <span>{r.tipo}</span>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-section studio-section--pad stories-ideas">
        <div className="studio-section-head">
          <div>
            <h3>Banco de ideias</h3>
            <p>Toca em uma ideia para jogar no gerador.</p>
          </div>
        </div>
        <div className="stories-ideas-grid">
          {STORY_IDEAS.map(cat => (
            <div key={cat.key} className="stories-idea-group">
              <div className="stories-idea-head">
                <span className="dg-kicker">{cat.emoji} {cat.titulo}</span>
                {cat.label && <span className={`stories-letter stories-letter--${cat.label.toLowerCase()}`}>{cat.label}</span>}
              </div>
              <div className="stories-idea-list">
                {cat.ideias.map((idea, i) => (
                  <button key={i} type="button" onClick={() => pegarIdeia(idea)}>
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-section studio-section--pad stories-check">
        <div className="studio-section-head">
          <div>
            <h3>Checklist diário</h3>
            <p>Marca rápido antes de postar.</p>
          </div>
        </div>
        <div className="stories-check-grid">
          {[
            "Abri o dia com story de contexto",
            "Pelo menos 1 story de A (Autoridade)",
            "Dei 3-4h de intervalo entre os blocos",
            "Pelo menos 1 story de E (Entretenimento)",
            "Fechei o dia: audiência sabe que acabou",
            "Pelo menos 1 story de I (Informação)",
            "Usei pelo menos 1 ferramenta de interação",
            "Me mostrei como o primeiro aluno do método",
            "Nenhum story contradiz meu posicionamento",
            "Não só narrei: trouxe insight ou opinião",
          ].map((item, i) => (
            <label key={i} className="stories-check-item">
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
