"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { toPng, toBlob } from "html-to-image";
import CarouselCard from "@/components/CarouselCard";
import Filmstrip from "@/components/Filmstrip";
import { EMOTIONS, HOOKS } from "@/lib/frameworks";
import { REGISTROS, type Registro } from "@/lib/vitals";
import { takeIntent } from "@/lib/handoff";
import { toast } from "@/lib/toast";
import CardEditor from "@/components/CardEditor";
import { SAMPLE } from "@/lib/sample";
import type { Carousel, Card } from "@/lib/types";
import { cardElementDefs, resolveCardElement } from "@/lib/card-elements";

// quão diferente a versão editada ficou do rascunho da IA (0 = igual, ~1 = reescrito).
// jaccard de palavras: barato e bom o suficiente pra detectar "edição de verdade".
function editRatio(a: string, b: string): number {
  const wa = a.toLowerCase().split(/\s+/).filter(Boolean);
  const wb = b.toLowerCase().split(/\s+/).filter(Boolean);
  if (!wa.length || !wb.length) return 0;
  const setB = new Set(wb);
  const common = wa.filter((w) => setB.has(w)).length;
  return 1 - common / Math.max(wa.length, wb.length);
}

function plainCardText(s?: string): string {
  return (s || "")
    .replace(/(\*\*|==|__|~~|\+\+)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default function CriarPage() {
  const [carousel, setCarousel] = useState<Carousel>({ tema: "", cards: [] });
  const [content, setContent] = useState("");
  const [nCards, setNCards] = useState(8);
  const [genStyle, setGenStyle] = useState("layout1"); // estilo de diagramação: layout1 (atual) | layout2 (editorial) | layout3 (storytelling)
  const [emotions, setEmotions] = useState<string[]>([]); // emoções primais do gancho
  const [hook, setHook] = useState(""); // tipo de gancho
  const [registro, setRegistro] = useState<Registro | "">(""); // Sinais Vitais — o tom do post (gira ANTES, a IA escreve nele)
  const [funil, setFunil] = useState<"" | "topo" | "meio" | "fundo">(""); // etapa do funil de marketing
  const [correlation, setCorrelation] = useState(""); // ponte escolhida (gancho por correlação)
  const [corrCands, setCorrCands] = useState<{ title: string; snippet?: string; comoConecta?: string; url: string; usado?: boolean }[]>([]);
  const [corrLoad, setCorrLoad] = useState(false);
  const [corrErr, setCorrErr] = useState("");
  const [corrManual, setCorrManual] = useState(""); // ponte escrita à mão
  async function findCorrelations() {
    if (!content.trim()) { setCorrErr("cola o conteúdo primeiro"); return; }
    setCorrLoad(true); setCorrErr(""); setCorrCands([]);
    try {
      const r = await fetch("/api/correlate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "erro");
      setCorrCands(d.candidates || []);
      if (!(d.candidates || []).length) setCorrErr("não achei pontes — tenta refinar o tema");
    } catch (e) { setCorrErr(e instanceof Error ? e.message : String(e)); }
    setCorrLoad(false);
  }
  const [err, setErr] = useState("");
  const [inlineSrc, setInlineSrc] = useState("");   // texto extraído da fonte pontual deste conteúdo
  const [inlineName, setInlineName] = useState(""); // rótulo do que foi anexado
  const [srcInput, setSrcInput] = useState("");     // texto/URL digitado
  const [srcBusy, setSrcBusy] = useState(false);
  const srcFileRef = useRef<HTMLInputElement>(null);
  async function attachSourceText() {
    const v = srcInput.trim(); if (!v) return;
    setSrcBusy(true);
    const isUrl = /^https?:\/\//i.test(v);
    try {
      const r = await fetch("/api/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isUrl ? { url: v } : { text: v }) });
      const d = await r.json();
      if (d.text) { setInlineSrc(d.text); setInlineName(d.title || (isUrl ? v : "texto colado")); setSrcInput(""); }
    } catch {}
    setSrcBusy(false);
  }
  async function attachSourcePdf(files: FileList | null) {
    if (!files?.length) return;
    setSrcBusy(true);
    try {
      const fd = new FormData(); fd.append("file", files[0]);
      const r = await fetch("/api/extract", { method: "POST", body: fd });
      const d = await r.json();
      if (d.text) { setInlineSrc(d.text); setInlineName(d.title || files[0].name); }
    } catch {}
    setSrcBusy(false);
    if (srcFileRef.current) srcFileRef.current.value = "";
  }

  const [saveMsg, setSaveMsg] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [hooks, setHooks] = useState<{ capa: string; abertura: string }[]>([]); // opções: capa (curta) + abertura (2-4 linhas)
  const [origHooks, setOrigHooks] = useState<{ capa: string; abertura: string }[]>([]); // versão ORIGINAL da IA (pra saber se editou)
  const setHookField = (i: number, key: "capa" | "abertura", v: string) => setHooks((hs) => hs.map((h, idx) => (idx === i ? { ...h, [key]: v } : h)));
  const removeHook = (i: number) => { setHooks((hs) => hs.filter((_, idx) => idx !== i)); setOrigHooks((os) => os.filter((_, idx) => idx !== i)); };
  const [hooksLoad, setHooksLoad] = useState(false);
  const [chosenHook, setChosenHook] = useState(""); // abertura travada (alimenta o roteiro)
  const [chosenCover, setChosenCover] = useState(""); // capa travada — vai VERBATIM pro card 1 (o cards não destila)
  // Gerador de temas — 20 temas com 2 capas cada, minerando cérebro + livros
  type Tema = { tema: string; hook1: string; hook2: string; pilar: string };
  type SavedTema = { id: string; tema: string; hook1?: string; hook2?: string; pilar?: string; createdAt: string };
  const [temas, setTemas] = useState<Tema[]>([]);
  const [temasLoad, setTemasLoad] = useState(false);
  const [temasOpen, setTemasOpen] = useState(false);
  // Temas salvos
  const [savedTemas, setSavedTemas] = useState<SavedTema[]>([]);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedBusca, setSavedBusca] = useState("");
  const [savedLoaded, setSavedLoaded] = useState(false);
  async function loadSavedTemas() {
    const r = await fetch("/api/temas-salvos");
    const d = await r.json();
    setSavedTemas(d.temas || []);
    setSavedLoaded(true);
  }
  async function salvarTema(t: Tema) {
    const r = await fetch("/api/temas-salvos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: `tm_${Date.now()}`, tema: t.tema, hook1: t.hook1, hook2: t.hook2, pilar: t.pilar, createdAt: new Date().toISOString() }),
    });
    const d = await r.json();
    if (d.tema) {
      setSavedTemas(prev => [d.tema, ...prev.filter(s => s.tema.trim().toLowerCase() !== d.tema.tema.trim().toLowerCase())]);
      toast("⭐ tema salvo");
    }
  }
  async function apagarTemaSalvo(id: string) {
    await fetch(`/api/temas-salvos?id=${id}`, { method: "DELETE" });
    setSavedTemas(prev => prev.filter(t => t.id !== id));
  }
  const temaJaSalvo = (t: Tema) => savedTemas.some(s => s.tema.trim().toLowerCase() === t.tema.trim().toLowerCase());
  async function genTemas() {
    setTemasLoad(true); setTemasOpen(true);
    try {
      const r = await fetch("/api/temas", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "erro ao gerar temas");
      setTemas(d.temas || []);
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); setTemasOpen(false); }
    finally { setTemasLoad(false); }
  }
  function chooseTema(t: Tema, hook?: string) {
    setContent(t.tema);
    if (hook) { setChosenCover(hook); }
    setHooks([]); setOrigHooks([]); setRoteiro(""); setAiDraft(""); setChosenHook("");
    setTemasOpen(false);
    setStage("texto");
  }
  const [caption, setCaption] = useState(false);
  const [legenda, setLegenda] = useState("");
  const [outline, setOutline] = useState(""); // esqueleto gerado — vira estrutura-ouro
  const [roteiro, setRoteiro] = useState(""); // ETAPA 1: o texto corrido (editável/aprovável)
  const [aiDraft, setAiDraft] = useState(""); // rascunho ORIGINAL da IA (pra detectar tuas edições e aprender com elas)
  const [roteiroLoad, setRoteiroLoad] = useState(false);
  const [cardsLoad, setCardsLoad] = useState(false);
  const [tells, setTells] = useState<string[]>([]); // possíveis "caras de IA" detectadas no roteiro
  const [cleaned, setCleaned] = useState(false); // o Escritor autolimpou tells antes de mostrar
  const [voiceScore, setVoiceScore] = useState<number | null>(null); // juiz de voz (Tier 3): 0-100
  const [voiceIssues, setVoiceIssues] = useState<string[]>([]);
  const [regenerated, setRegenerated] = useState(false); // o juiz regenerou pra subir a nota
  // editor do roteiro: campo NÃO-controlado sincronizado por ref. Evita o pulo do cursor pro fim
  // (re-render do React durante a digitação de acentos do português reposicionava o caret).
  const roteiroRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = roteiroRef.current;
    if (el && el.value !== roteiro) el.value = roteiro; // só escreve quando muda POR FORA (geração/limpeza/reset)
  }, [roteiro]);
  const [voiceMsg, setVoiceMsg] = useState("");
  // Juiz cruzado (OpenAI revisa; Claude reescreve)
  type Critica = { nota: number; veredito: string; fortes: string[]; fracos: string[]; sugestoes: string[] };
  const [critica, setCritica] = useState<Critica | null>(null);
  const [judging, setJudging] = useState(false);
  const [melhorando, setMelhorando] = useState(false);
  async function pedirJuiz() {
    if (judging || roteiro.trim().length < 30) return;
    setJudging(true); setCritica(null);
    try {
      const r = await fetch("/api/judge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: roteiro, tipo: "roteiro", contexto: content.slice(0, 200) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro na 2ª opinião");
      setCritica(d.critica);
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setJudging(false); }
  }
  async function melhorarComClaude() {
    if (melhorando || !critica) return;
    setMelhorando(true);
    try {
      const notas = [...(critica.fracos || []), ...(critica.sugestoes || [])].map(s => `- ${s}`).join("\n");
      const r = await fetch("/api/roteiro", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, revisar: roteiro, critica: notas, registro: registro || undefined }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao melhorar");
      setRoteiro(d.roteiro || "");
      setTells(d.tells || []);
      setCritica(null);
      toast("✓ Claude reescreveu atacando os pontos fracos");
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setMelhorando(false); }
  }
  async function markRoteiroVoice() {
    if (roteiro.trim().length < 40) { setVoiceMsg("roteiro curto demais"); setTimeout(() => setVoiceMsg(""), 2000); return; }
    try {
      await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: roteiro, note: "roteiro", registro: registro || undefined }) });
      setVoiceMsg("⭐ guardado como tua voz — a IA vai imitar a cadência");
    } catch { setVoiceMsg("erro ao guardar"); }
    setTimeout(() => setVoiceMsg(""), 3000);
  }
  // 👎 a IA aprende o que NÃO escrever (inverso do ⭐) — guarda a abertura como anti-ouro de voz
  async function rejectRoteiro() {
    if (roteiro.trim().length < 40) { setVoiceMsg("roteiro curto demais"); setTimeout(() => setVoiceMsg(""), 2000); return; }
    try {
      await fetch("/api/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "voice", text: roteiro.slice(0, 500), registro: registro || undefined }) });
      setVoiceMsg("👎 anotei — a IA evita esse tom nas próximas");
    } catch { setVoiceMsg("erro ao anotar"); }
    setTimeout(() => setVoiceMsg(""), 3000);
  }
  const [stage, setStage] = useState<"texto" | "carrossel">("texto"); // etapa do criar: ① texto → ② carrossel
  const [exporting, setExporting] = useState(false); // nós full-size montados só durante o export
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const dragTarget = useRef<string | null>(null); // "focal" | "logo" | "ov-<i>"
  const dragStart = useRef<{ key: string; x: number; y: number; focalX?: number; focalY?: number } | null>(null);
  // posição REAL (medida) de título/corpo/texto pra colar as alças no conteúdo (como o nick/logo)
  const previewRef = useRef<HTMLDivElement>(null);
  const editorStageRef = useRef<HTMLDivElement>(null);
  const [hbase, setHbase] = useState<{ title?: { x: number; y: number }; body?: { x: number; y: number }; text?: { x: number; y: number }; signoff?: { x: number; y: number }; kicker?: { x: number; y: number } }>({});
  // limpa o rascunho INTEIRO — tela nova (o que já foi pro Quadro/Vault continua salvo lá)
  function clearAll() {
    setContent(""); setRoteiro(""); setAiDraft(""); setHooks([]); setOrigHooks([]);
    setChosenHook(""); setChosenCover(""); setCarousel({ tema: "", cards: [] }); setLegenda("");
    setRegistro(""); setHook(""); setEmotions([]); setCorrelation(""); setCorrCands([]);
    setInlineSrc(""); setInlineName(""); setTells([]); setCleaned(false); setVoiceScore(null); setVoiceIssues([]); setRegenerated(false); setSelected(null);
    setOutline(""); setStage("texto");
    try { localStorage.removeItem("dg_draft"); } catch {}
  }
  useEffect(() => { loadSavedTemas().catch(() => {}); }, []);
  useEffect(() => {
    if (selected == null || stage !== "carrossel") return;
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const id = window.setTimeout(() => {
      editorStageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => window.clearTimeout(id);
  }, [selected, stage]);
  useLayoutEffect(() => {
    let alive = true;
    const commit = (next: typeof hbase) => {
      window.requestAnimationFrame(() => {
        if (alive) setHbase(next);
      });
    };
    const frame = previewRef.current;
    if (!frame || selected == null) { commit({}); return () => { alive = false; }; }
    const c = carousel.cards[selected];
    if (!c) { commit({}); return () => { alive = false; }; }
    const fr = frame.getBoundingClientRect();
    if (!fr.width) return () => { alive = false; };
    const center = (el: Element | null) => {
      if (!el) return undefined;
      const r = el.getBoundingClientRect();
      return { x: (r.left + r.width / 2 - fr.left) / fr.width, y: (r.top + r.height / 2 - fr.top) / fr.height };
    };
    const findTextEl = (text?: string) => {
      const wanted = plainCardText(text);
      if (!wanted) return null;
      const nodes = Array.from(frame.querySelectorAll(".create-preview-inner *")) as HTMLElement[];
      return nodes
        .filter((el) => {
          const got = plainCardText(el.textContent || "");
          return got === wanted || got.includes(wanted);
        })
        .sort((a, b) => (a.textContent || "").length - (b.textContent || "").length)[0] || null;
    };
    const titleC = center(findTextEl(c.headline) || frame.querySelector("h1, h2"));
    const bodyC = center(findTextEl(c.body) || frame.querySelector('[data-mv="body"]'));
    const signoffC = center(findTextEl(c.signoff) || frame.querySelector('[data-mv="signoff"]'));
    const kickerC = center(frame.querySelector('[data-mv="kicker"]'));
    const nb: { title?: { x: number; y: number }; body?: { x: number; y: number }; text?: { x: number; y: number }; signoff?: { x: number; y: number }; kicker?: { x: number; y: number } } = {};
    if (c.headline && c.body) {
      if (titleC) nb.title = { x: titleC.x - (c.titleX || 0), y: titleC.y - (c.titleY || 0) };
      if (bodyC) nb.body = { x: bodyC.x - (c.bodyX || 0), y: bodyC.y - (c.bodyY || 0) };
    } else {
      const m = titleC || bodyC;
      if (m) nb.text = { x: m.x - (c.textX || 0), y: m.y - (c.textY || 0) };
    }
    if (signoffC) nb.signoff = { x: signoffC.x - (c.signoffX || 0), y: signoffC.y - (c.signoffY || 0) };
    if (kickerC) nb.kicker = { x: kickerC.x - (c.kickerX || 0), y: kickerC.y - (c.kickerY || 0) };
    commit(nb);
    return () => { alive = false; };
  }, [selected, carousel]);

  // auto-save do rascunho (localStorage) — carrossel + legenda + campos
  const hydrated = useRef(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      let hadCards = false;
      try {
        const s = localStorage.getItem("dg_draft");
        if (s) {
          const d = JSON.parse(s);
          const car = d?.carousel ?? (d?.cards ? d : null); // compat: formato antigo era o carrossel cru
          if (car?.cards?.length) { setCarousel(car); setStage("carrossel"); hadCards = true; }
          if (typeof d?.legenda === "string") setLegenda(d.legenda);
          if (typeof d?.roteiro === "string") setRoteiro(d.roteiro);
          if (typeof d?.content === "string") setContent(d.content);
          if (typeof d?.nCards === "number") setNCards(d.nCards);
          if (typeof d?.registro === "string") setRegistro(d.registro);
          if (typeof d?.hook === "string") setHook(d.hook);
          if (Array.isArray(d?.emotions)) setEmotions(d.emotions);
          if (typeof d?.caption === "boolean") setCaption(d.caption);
          if (typeof d?.chosenHook === "string") setChosenHook(d.chosenHook);
          if (typeof d?.chosenCover === "string") setChosenCover(d.chosenCover);
          if (typeof d?.correlation === "string") setCorrelation(d.correlation);
          if (typeof d?.inlineSrc === "string") setInlineSrc(d.inlineSrc);
          if (typeof d?.inlineName === "string") setInlineName(d.inlineName);
          if (d?.funil === "topo" || d?.funil === "meio" || d?.funil === "fundo") setFunil(d.funil);
        }
      } catch {}
      // aplica a INTENÇÃO vinda de outra tela (Hoje/Quadro/Calendário/Marca/Vault), sobrepondo o rascunho
      try {
        const intent = takeIntent();
        if (intent) {
          if (intent.kind === "open") { setCarousel(intent.carousel); setStage("carrossel"); }
          else if (intent.kind === "resume") { setStage(hadCards ? "carrossel" : "texto"); }
          else if (intent.kind === "novo") { clearAll(); }
          else if (intent.kind === "pede") { setRegistro(intent.registro); setChosenHook(""); setChosenCover(""); setHooks([]); setRoteiro(""); setAiDraft(""); setStage("texto"); }
          else if (intent.kind === "pauta") { setContent(`Tema: ${intent.tema}\nÂngulo: ${intent.angulo}`); setChosenHook(""); setChosenCover(""); setHooks([]); setRoteiro(""); setAiDraft(""); setStage("texto"); }
          else if (intent.kind === "hook") {
            const post = intent.post;
            setContent(post.content || post.tema || "");
            setRegistro(post.registro || "");
            if (post.savedHook) { setChosenCover(post.savedHook.capa || ""); setChosenHook((post.savedHook.abertura || "").replace(/\*\*/g, "")); }
            else { setChosenCover(""); setChosenHook(""); }
            setHooks([]); setRoteiro(""); setAiDraft(""); setStage("texto");
          }
        }
      } catch {}
      hydrated.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!hydrated.current) return; // não grava antes de restaurar (evita sobrescrever com vazio)
    const t = setTimeout(() => {
      try {
        localStorage.setItem("dg_draft", JSON.stringify({ carousel, legenda, roteiro, content, nCards, registro, hook, emotions, caption, chosenHook, chosenCover, correlation, inlineSrc, inlineName, funil }));
        setSavedAt(Date.now());
      } catch {}
    }, 500); // debounce: grava 0,5s após a última alteração
    return () => clearTimeout(t);
  }, [carousel, legenda, roteiro, content, nCards, registro, hook, emotions, caption, chosenHook, chosenCover, correlation, inlineSrc, inlineName, funil]);

  // histórico (desfazer/refazer)
  const past = useRef<Carousel[]>([]);
  const future = useRef<Carousel[]>([]);
  const skipHist = useRef(false);
  const prevCar = useRef<Carousel>(carousel);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  function syncHistoryState() {
    setHistoryState({ canUndo: past.current.length > 0, canRedo: future.current.length > 0 });
  }
  useEffect(() => {
    if (skipHist.current) { skipHist.current = false; prevCar.current = carousel; return; }
    if (prevCar.current !== carousel) {
      past.current.push(prevCar.current);
      if (past.current.length > 60) past.current.shift();
      future.current = [];
      prevCar.current = carousel;
      syncHistoryState();
    }
  }, [carousel]);
  function undo() {
    if (!past.current.length) return;
    const prev = past.current.pop()!;
    future.current.push(prevCar.current);
    skipHist.current = true; prevCar.current = prev;
    setCarousel(prev); syncHistoryState();
  }
  function redo() {
    if (!future.current.length) return;
    const next = future.current.pop()!;
    past.current.push(prevCar.current);
    skipHist.current = true; prevCar.current = next;
    setCarousel(next); syncHistoryState();
  }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      else if ((e.ctrlKey || e.metaKey) && k === "y") { e.preventDefault(); redo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function updateCard(i: number, patch: Partial<Card>) {
    setCarousel((c) => ({ ...c, cards: c.cards.map((cd, idx) => (idx === i ? { ...cd, ...patch } : cd)) }));
  }
  function replaceCard(i: number, nc: Card) {
    setCarousel((c) => ({ ...c, cards: c.cards.map((cd, idx) => (idx === i ? { ...nc, id: cd.id, index: cd.index, tint: cd.tint, overlays: cd.overlays, logo: cd.logo } : cd)) }));
  }

  function reindex(cards: Card[]): Card[] {
    const n = cards.length;
    return cards.map((c, i) => ({ ...c, index: `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}` }));
  }
  function mutateCards(fn: (cards: Card[]) => Card[]) {
    setCarousel((c) => ({ ...c, cards: reindex(fn(c.cards)) }));
  }

  // Redesenhar com IA: descreve o visual → a IA devolve estilo → aplica em TODOS os cards, sem tocar no texto
  const [restyleText, setRestyleText] = useState("");
  const [restyling, setRestyling] = useState(false);
  const [restyleOpen, setRestyleOpen] = useState(false);
  const [lastStyle, setLastStyle] = useState<Partial<Card> | null>(null);
  const [preStyle, setPreStyle] = useState<Card[] | null>(null);
  async function redesenharComIA() {
    if (restyling || restyleText.trim().length < 3 || !carousel.cards.length) return;
    setRestyling(true);
    try {
      const temFoto = carousel.cards.some((c) => !!c.image);
      const r = await fetch("/api/restyle", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: restyleText, tema: carousel.tema || content.slice(0, 80), temFoto }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao redesenhar");
      const style = d.style as Partial<Card>;
      setPreStyle(carousel.cards);           // guarda pra desfazer
      setLastStyle(style);
      setCarousel((c) => ({ ...c, cards: c.cards.map((cd) => ({ ...cd, ...style })) }));
      toast("✨ visual novo aplicado — o texto continua o mesmo");
    } catch (e) { toast(e instanceof Error ? e.message : String(e), "err"); }
    finally { setRestyling(false); }
  }
  function desfazerRedesenho() {
    if (!preStyle) return;
    setCarousel((c) => ({ ...c, cards: preStyle }));
    setPreStyle(null); setLastStyle(null);
    toast("visual anterior restaurado");
  }
  function duplicateCard(i: number) {
    mutateCards((cards) => { const a = [...cards]; a.splice(i + 1, 0, { ...cards[i], id: crypto.randomUUID() }); return a; });
  }
  function removeCard(i: number) {
    mutateCards((cards) => cards.filter((_, idx) => idx !== i));
    setSelected(null);
  }
  function addCard() {
    mutateCards((cards) => [...cards, { id: crypto.randomUUID(), layout: "text", headline: "NOVO CARD", body: "Escreve aqui" }]);
  }
  function reorderCard(from: number, to: number) {
    mutateCards((cards) => { const a = [...cards]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; });
    setSelected(to);
  }
  // propaga propriedades de estilo do card atual pra TODOS os cards
  function applyToAll(keys: (keyof Card)[]) {
    if (selected == null) return;
    const src = carousel.cards[selected];
    mutateCards((cards) => cards.map((c) => {
      const patch: Partial<Card> = {};
      keys.forEach((k) => { (patch as Record<string, unknown>)[k] = src[k]; });
      return { ...c, ...patch };
    }));
    setSaveMsg("Aplicado a todos os cards ✓"); setTimeout(() => setSaveMsg(""), 2200);
  }

  // ---- KIT DA MARCA: aplica um conjunto de estilo a este card ou a todos ----
  function applyKit(style: Partial<Card>, all: boolean) {
    if (all) mutateCards((cards) => cards.map((c) => ({ ...c, ...style })));
    else if (selected != null) updateCard(selected, style);
    setSaveMsg(all ? "Kit aplicado a todos ✓" : "Kit aplicado ✓"); setTimeout(() => setSaveMsg(""), 2000);
  }

  // ---- RASCUNHOS NOMEADOS (histórico) ----
  const draftData = () => ({ carousel, legenda, roteiro, content, nCards, registro, hook, emotions, caption, chosenHook, chosenCover, correlation, inlineSrc, inlineName });
  const [drafts, setDrafts] = useState<{ id: string; name: string; at: number; data: ReturnType<typeof draftData> }[]>([]);
  const [draftsOpen, setDraftsOpen] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setDrafts(JSON.parse(localStorage.getItem("n2_drafts") || "[]")); } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function persistDrafts(list: typeof drafts) { setDrafts(list); try { localStorage.setItem("n2_drafts", JSON.stringify(list)); } catch {} }
  function saveNamedDraft() {
    const name = prompt("Nome deste rascunho:", carousel.tema || "Sem título");
    if (!name) return;
    persistDrafts([{ id: Math.random().toString(36).slice(2), name, at: Date.now(), data: draftData() }, ...drafts].slice(0, 30));
    setSaveMsg("Rascunho salvo ✓"); setTimeout(() => setSaveMsg(""), 2000);
  }
  function loadNamedDraft(d: { data: ReturnType<typeof draftData> }) {
    const x = d.data;
    if (x.carousel?.cards?.length) { setCarousel(x.carousel); setStage("carrossel"); }
    setLegenda(x.legenda || ""); setRoteiro(x.roteiro || ""); setContent(x.content || "");
    if (typeof x.nCards === "number") setNCards(x.nCards);
    setRegistro(x.registro || ""); setHook(x.hook || ""); setEmotions(x.emotions || []);
    setCaption(!!x.caption); setChosenHook(x.chosenHook || ""); setChosenCover(x.chosenCover || "");
    setCorrelation(x.correlation || ""); setInlineSrc(x.inlineSrc || ""); setInlineName(x.inlineName || "");
    setSelected(null); setDraftsOpen(false);
    setSaveMsg("Rascunho carregado ✓"); setTimeout(() => setSaveMsg(""), 2000);
  }

  // ---- PRÉVIA EM SWIPE ----
  const [swipe, setSwipe] = useState<number | null>(null);
  useEffect(() => {
    if (swipe == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSwipe(null);
      else if (e.key === "ArrowRight") setSwipe((i) => (i == null ? 0 : Math.min(carousel.cards.length - 1, i + 1)));
      else if (e.key === "ArrowLeft") setSwipe((i) => (i == null ? 0 : Math.max(0, i - 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe, carousel.cards.length]);

  const EXPORT_OPTS = { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true } as const;
  // imagens/fontes precisam estar carregadas antes de rasterizar (senão sai card vazio na 1ª vez)
  function cardImageUrls(): string[] {
    const urls = new Set<string>(["/logo/cn-logo.png"]);
    for (const c of carousel.cards) {
      if (c.image) urls.add(c.image);
      if (c.image2) urls.add(c.image2);
      (c.overlays || []).forEach((o) => o.src && urls.add(o.src));
      (c.logos || []).forEach((l) => l.src && urls.add(l.src));
    }
    return [...urls];
  }
  async function preloadCards() {
    try { await (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready; } catch {}
    await Promise.all(cardImageUrls().map((src) => new Promise<void>((res) => {
      const img = new Image();
      img.onload = () => res(); img.onerror = () => res();
      img.src = src;
      if (img.complete) res();
    })));
    await new Promise((r) => setTimeout(r, 120));
  }
  // render duplo: a 1ª passada embute imagens/fontes, a 2ª já sai completa
  async function nodeToBlob(node: HTMLElement): Promise<Blob | null> {
    await toBlob(node, EXPORT_OPTS);
    return toBlob(node, EXPORT_OPTS);
  }
  function nextPaint() { return new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))); }
  // monta os cards full-size só durante fn() e desmonta no fim (fora do export ficam fora da tela)
  async function withExportNodes<T>(fn: () => Promise<T>): Promise<T> {
    setExporting(true);
    await nextPaint();
    await preloadCards();
    try { return await fn(); }
    finally { setExporting(false); }
  }
  async function downloadCard(i: number) {
    const node = refs.current[i];
    if (!node) return;
    await toPng(node, EXPORT_OPTS);
    const url = await toPng(node, EXPORT_OPTS);
    const a = document.createElement("a");
    a.href = url; a.download = `card-${String(i + 1).padStart(2, "0")}.png`; a.click();
  }

  async function exportToFolder() {
    const w = window as unknown as { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle> };
    if (!w.showDirectoryPicker) { await exportAll(); return; }
    const dir = await w.showDirectoryPicker();
    setSaveMsg("Salvando na pasta");
    await withExportNodes(async () => {
      for (let i = 0; i < carousel.cards.length; i++) {
        const node = refs.current[i];
        if (!node) continue;
        const blob = await nodeToBlob(node);
        if (!blob) continue;
        const fh = await dir.getFileHandle(`${String(i + 1).padStart(2, "0")}.png`, { create: true });
        const ws = await fh.createWritable();
        await ws.write(blob);
        await ws.close();
      }
      if (legenda.trim()) {
        const lh = await dir.getFileHandle("legenda.txt", { create: true });
        const lw = await lh.createWritable();
        await lw.write(legenda);
        await lw.close();
      }
    });
    setSaveMsg("Salvo na pasta ✓");
    setTimeout(() => setSaveMsg(""), 2500);
  }

  async function genHooks() {
    setHooksLoad(true); setErr("");
    try {
      const r = await fetch("/api/hooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, hook, emotions, correlation, registro: registro || undefined }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "erro ao gerar ganchos");
      if (!Array.isArray(d.hooks) || !d.hooks.length) throw new Error("a IA não devolveu ganchos — tenta de novo");
      setHooks(d.hooks);
      setOrigHooks(d.hooks.map((h: { capa: string; abertura: string }) => ({ ...h })));
      // Aviso suave — ganchos disponíveis mas com tiques detectados (não bloqueia)
      if (d.tells_warning) setErr("⚠ alguns tiques detectados (revisa antes de usar): " + d.tells_warning);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setHooksLoad(false); }
  }
  // salva uma OPÇÃO de gancho (a TUA versão, editada) como IDEIA no Quadro pra virar carrossel depois
  async function saveHookAsIdea(i: number) {
    const h = hooks[i];
    const tema = ((h.capa || h.abertura) || "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim().slice(0, 90) || "Gancho salvo";
    // APRENDE COM A EDIÇÃO: se você mexeu na abertura, a tua versão vira exemplo da tua voz
    const o = origHooks[i];
    const edited = o && (h.abertura || "").trim() !== (o.abertura || "").trim();
    try {
      const r = await fetch("/api/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, stage: "ideia", type: "carrossel", carousel: { tema, cards: [] }, content: content || undefined, savedHook: h, registro: registro || undefined, hook, emotions }),
      });
      if (edited && (h.abertura || "").replace(/\*\*/g, "").trim().length >= 40) {
        fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: (h.abertura || "").replace(/\*\*/g, "").trim(), note: "gancho editado", registro: registro || undefined }) }).catch(() => {});
        toast(r.ok ? "🎣 gancho salvo · ✏️ aprendi com tua edição" : "erro ao salvar", r.ok ? "ok" : "err");
      } else {
        toast(r.ok ? "🎣 gancho salvo no Quadro (Ideias)" : "erro ao salvar", r.ok ? "ok" : "err");
      }
      if (r.ok) removeHook(i); // some da tela — não polui
    } catch { toast("erro ao salvar", "err"); }
  }

  async function saveToVault() {
    const tema = carousel.tema || carousel.cards[0]?.headline?.replace(/\*\*/g, "") || "Sem tema";
    const r = await fetch("/api/posts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema, carousel, stage: "ideia", type: "carrossel", outline, hook, emotions, registro: registro || undefined }),
    });
    toast(r.ok ? "✓ salvo no Quadro (Ideias)" : "erro ao salvar no Quadro", r.ok ? "ok" : "err");
  }

  // 🏆 guarda o RITMO de diagramação deste carrossel — o fatiador imita a variedade de layout depois
  async function saveGoldSlice() {
    if (!carousel.cards.length) return;
    try {
      const r = await fetch("/api/goldslice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carousel }) });
      toast(r.ok ? "🏆 diagramação guardada — o fatiador vai seguir esse ritmo" : "erro ao guardar", r.ok ? "ok" : "err");
    } catch { toast("erro ao guardar", "err"); }
  }

  function novoConteudo() {
    const temAlgo = content.trim() || roteiro.trim() || carousel.cards.length || hooks.length;
    if (temAlgo && !confirm("Começar do zero? Isso limpa o conteúdo, o roteiro e o carrossel atuais desta tela; o que você já guardou no Quadro/Vault continua lá")) return;
    clearAll();
    toast("✓ tela nova — pode começar do zero");
  }

  // ETAPA 1 — gera o ROTEIRO (texto corrido, na voz). Você edita e aprova antes do carrossel.
  async function generateRoteiro() {
    setErr(""); setRoteiroLoad(true); setHooks([]);
    try {
      const r = await fetch("/api/roteiro", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, hook, emotions, correlation, inlineSource: inlineSrc, registro: registro || undefined, chosenHook: chosenHook || undefined, funil: funil || undefined }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setRoteiro(d.roteiro || "");
      setAiDraft(d.roteiro || ""); // guarda o original pra comparar com a tua edição depois
      setTells(d.tells || []);
      setCleaned(!!d.cleaned);
      setVoiceScore(typeof d.voiceScore === "number" ? d.voiceScore : null);
      setVoiceIssues(d.voiceIssues || []);
      setRegenerated(!!d.regenerated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setRoteiroLoad(false); }
  }
  // ETAPA 2 — com o roteiro aprovado, gera o CARROSSEL (fatia em cards, sem reescrever).
  async function generateCards() {
    if (!roteiro.trim()) { setErr("Gera/aprova o roteiro primeiro"); return; }
    setErr(""); setCardsLoad(true);
    try {
      const r = await fetch("/api/cards", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roteiro, nCards, caption, registro: registro || undefined, hook, emotions, cover: chosenCover || undefined, style: genStyle === "layout1" ? undefined : genStyle }),
      });
      const raw = await r.text();
      let d: { carousel?: Carousel; legenda?: string; error?: string };
      try { d = JSON.parse(raw); }
      catch { throw new Error(r.status === 504 || /timeout|error occurred/i.test(raw) ? "O fatiador demorou demais e o servidor cortou — teu roteiro tá salvo, clica em “Gerar carrossel” de novo (costuma passar na 2ª)" : "O servidor respondeu fora do formato — teu roteiro tá salvo, tenta gerar o carrossel de novo"); }
      if (!r.ok) throw new Error(d.error || "Erro");
      if (!d.carousel) throw new Error("O fatiador não devolveu os cards — teu roteiro tá salvo, tenta de novo");
      setCarousel(d.carousel);
      setLegenda(d.legenda || "");
      setOutline(roteiro);
      setStage("carrossel");
      // APRENDE COM A EDIÇÃO: se você mexeu de verdade no roteiro antes de aprovar,
      // a TUA versão vira voz-ouro (no registro certo) — a IA imita tuas correções depois.
      if (aiDraft && roteiro.trim().length > 200 && editRatio(aiDraft, roteiro) > 0.12) {
        try {
          await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: roteiro, note: "edição aprovada", registro: registro || undefined }) });
          toast("✏️ aprendi com tua edição do roteiro");
        } catch {}
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setCardsLoad(false); }
  }

  async function exportOne(i: number) {
    setSaveMsg("Baixando");
    await withExportNodes(() => downloadCard(i));
    setSaveMsg("Baixado ✓"); setTimeout(() => setSaveMsg(""), 1500);
  }
  async function exportAll() {
    setSaveMsg("Baixando todos");
    await withExportNodes(async () => {
      for (let i = 0; i < carousel.cards.length; i++) { await downloadCard(i); await new Promise((r) => setTimeout(r, 200)); }
    });
    setSaveMsg("Baixado ✓"); setTimeout(() => setSaveMsg(""), 2000);
  }

  const hasDraft = !!(content.trim() || roteiro.trim() || carousel.cards.length || hooks.length);

  return (
        <div className="studio-page create-page">
          <section className="studio-hero create-hero">
            <div className="studio-hero__copy">
              <h2>Da ideia ao carrossel pronto para postar</h2>
              <p>Construa o roteiro, trave o gancho, gere os cards e refine cada peça com a voz da marca no mesmo fluxo</p>
            </div>
          </section>

          {/* barra de estado + começar do zero */}
          <div className="create-status">
            <span>
              {(content.trim() || roteiro.trim() || carousel.cards.length)
                ? <>📝 rascunho em andamento {carousel.cards.length ? `· ${carousel.cards.length} cards` : roteiro.trim() ? "· roteiro pronto" : "· escrevendo"} — salvo automático</>
                : "tela nova — começa colando um conteúdo abaixo"}
            </span>
            {hasDraft ? (
              <button onClick={novoConteudo} className="dg-btn" style={{ fontSize: 12.5, padding: "6px 13px" }}>✕ Começar do zero</button>
            ) : null}
          </div>

          {/* STEPPER — ① Texto → ② Carrossel */}
          <div className="create-stepper">
            {([["texto", "①", "Texto", "escreve e aprova o roteiro"], ["carrossel", "②", "Carrossel", "monta e edita os cards"]] as const).map(([st, num, label, sub], idx) => {
              const active = stage === st;
              const locked = st === "carrossel" && carousel.cards.length === 0;
              return (
                <button key={st} onClick={() => { if (!locked) setStage(st); }} disabled={locked}
                  className={"create-step" + (active ? " is-active" : "") + (locked ? " is-locked" : "")}
                  style={{ borderLeft: idx === 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  <span className="create-step-num">{num}</span>
                  <span className="create-step-copy">
                    <strong>{label}</strong>
                    <small>{locked ? "gere o roteiro primeiro" : sub}</small>
                  </span>
                </button>
              );
            })}
          </div>

          {stage === "texto" && (<>
          {/* ── GERADOR DE TEMAS ── */}
          <div className="studio-section studio-section--pad" style={{ paddingBottom: temasOpen ? 0 : 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={temasOpen && temas.length ? () => setTemasOpen(false) : genTemas}
                disabled={temasLoad}
                className="dg-btn-primary"
                style={{ fontSize: 13, padding: "8px 18px", opacity: temasLoad ? 0.7 : 1 }}>
                {temasLoad ? "⏳ Minerando cérebro + livros…" : temasOpen && temas.length ? "✕ fechar temas" : "✨ Gerar 20 Temas"}
              </button>
              {temas.length > 0 && !temasOpen && (
                <button onClick={() => setTemasOpen(true)} style={{ fontSize: 12, color: "#7c869c", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  ver os {temas.length} temas gerados
                </button>
              )}
              <button onClick={() => { setSavedOpen(o => !o); if (!savedLoaded) loadSavedTemas().catch(() => {}); }}
                style={{ fontSize: 12.5, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                  background: savedOpen ? "rgba(245,200,32,.12)" : "#17171b",
                  color: savedOpen ? "#f5c820" : "#9aa0b0",
                  border: "1px solid " + (savedOpen ? "rgba(245,200,32,.4)" : "#2e2e36"), fontWeight: 600 }}>
                ⭐ Temas salvos{savedTemas.length > 0 ? ` (${savedTemas.length})` : ""}
              </button>
              <span style={{ fontSize: 11, color: "#5a6378", marginLeft: 4 }}>— minera livros, fontes e cérebro · gera capa no padrão aprovado</span>
            </div>

            {/* ── TEMAS SALVOS ── */}
            {savedOpen && (
              <div style={{ marginTop: 14, paddingBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={savedBusca}
                  onChange={e => setSavedBusca(e.target.value)}
                  placeholder="🔍 buscar nos temas salvos..."
                  className="dg-input"
                  style={{ fontSize: 13, padding: "9px 14px", maxWidth: 420 }}
                />
                {savedTemas.length === 0 && (
                  <p style={{ fontSize: 12.5, color: "#5a6378", margin: 0, padding: "8px 0" }}>
                    Nenhum tema salvo ainda. Gera os 20 temas e clica em ⭐ nos que valem guardar.
                  </p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
                  {savedTemas
                    .filter(t => !savedBusca.trim() || `${t.tema} ${t.hook1 || ""} ${t.hook2 || ""} ${t.pilar || ""}`.toLowerCase().includes(savedBusca.trim().toLowerCase()))
                    .map(t => (
                      <div key={t.id} style={{ background: "#17171b", border: "1px solid rgba(245,200,32,.25)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {t.pilar && <span style={{ fontSize: 10, background: "#1e2030", color: "#7c8db0", borderRadius: 5, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{t.pilar}</span>}
                          <span style={{ fontSize: 10, color: "#4e5878", marginLeft: "auto" }}>{new Date(t.createdAt).toLocaleDateString("pt-BR")}</span>
                          <button onClick={() => apagarTemaSalvo(t.id)} title="Apagar tema salvo"
                            style={{ fontSize: 11, background: "none", border: "none", color: "#5a6378", cursor: "pointer", padding: "2px 4px" }}>✕</button>
                        </div>
                        <p style={{ fontSize: 12.5, color: "#bdc4d4", lineHeight: 1.5, margin: 0 }}>{t.tema}</p>
                        {(t.hook1 || t.hook2) && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 5, borderTop: "1px solid #2a2a36", paddingTop: 8 }}>
                            {[t.hook1, t.hook2].filter(Boolean).map((h, hi) => (
                              <div key={hi} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ flex: 1, fontSize: 13, color: "#e8d5b7", fontWeight: 600, lineHeight: 1.3 }}
                                  dangerouslySetInnerHTML={{ __html: (h as string).replace(/\*\*([^*]+)\*\*/g, '<span style="color:#e85d6a">$1</span>') }} />
                                <button onClick={() => chooseTema({ tema: t.tema, hook1: t.hook1 || "", hook2: t.hook2 || "", pilar: t.pilar || "" }, (h as string).replace(/\*\*/g, ""))}
                                  style={{ fontSize: 11, background: "#0e1420", color: "#7c8db0", border: "1px solid #2a3a5a", borderRadius: 6, padding: "3px 9px", cursor: "pointer", whiteSpace: "nowrap" }}>
                                  usar
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={() => chooseTema({ tema: t.tema, hook1: t.hook1 || "", hook2: t.hook2 || "", pilar: t.pilar || "" })}
                          style={{ fontSize: 11.5, background: "transparent", color: "#5a6a8a", border: "1px dashed #2e3a50", borderRadius: 7, padding: "5px 0", cursor: "pointer", marginTop: 2 }}>
                          → usar tema (gerar capas depois)
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {temasOpen && (
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10, paddingBottom: 14 }}>
                {temasLoad && !temas.length && (
                  <div style={{ gridColumn: "1/-1", color: "#7c869c", fontSize: 13, padding: "20px 0" }}>analisando livros e cérebro…</div>
                )}
                {temas.map((t, i) => (
                  <div key={i} style={{ background: "#17171b", border: "1px solid #2e2e36", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* pilar badge + salvar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, background: "#1e2030", color: "#7c8db0", borderRadius: 5, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{t.pilar}</span>
                      <button
                        onClick={() => { if (!temaJaSalvo(t)) salvarTema(t); }}
                        title={temaJaSalvo(t) ? "Tema já salvo" : "Salvar tema para usar depois"}
                        style={{ marginLeft: "auto", fontSize: 14, background: "none", border: "none", cursor: temaJaSalvo(t) ? "default" : "pointer",
                          color: temaJaSalvo(t) ? "#f5c820" : "#4e5878", padding: "0 2px", lineHeight: 1,
                          transition: "color .15s" }}>
                        {temaJaSalvo(t) ? "★" : "☆"}
                      </button>
                    </div>
                    {/* tema */}
                    <p style={{ fontSize: 12.5, color: "#bdc4d4", lineHeight: 1.5, margin: 0 }}>{t.tema}</p>
                    {/* capas */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, borderTop: "1px solid #2a2a36", paddingTop: 8 }}>
                      {[t.hook1, t.hook2].map((h, hi) => (
                        <div key={hi} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: "#5a6378", minWidth: 14 }}>{hi + 1}.</span>
                          <span style={{ flex: 1, fontSize: 13, color: "#e8d5b7", fontWeight: 600, lineHeight: 1.3 }}
                            dangerouslySetInnerHTML={{ __html: h.replace(/\*\*([^*]+)\*\*/g, '<span style="color:#e85d6a">$1</span>') }} />
                          <button onClick={() => chooseTema(t, h.replace(/\*\*/g, ""))}
                            title="Usa este tema com esta capa já pré-selecionada"
                            style={{ fontSize: 11, background: "#0e1420", color: "#7c8db0", border: "1px solid #2a3a5a", borderRadius: 6, padding: "3px 9px", cursor: "pointer", whiteSpace: "nowrap" }}>
                            usar
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* usar tema sem capa pre-selecionada */}
                    <button onClick={() => chooseTema(t)}
                      style={{ fontSize: 11.5, background: "transparent", color: "#5a6a8a", border: "1px dashed #2e3a50", borderRadius: 7, padding: "5px 0", cursor: "pointer", marginTop: 2 }}>
                      → usar tema (gerar capas depois)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="studio-section studio-section--pad create-compose" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Cola aqui o conteúdo bruto — ou escolhe um tema acima"
              className="dg-input" style={{ width: "100%", height: 130, fontSize: 15, resize: "vertical" }} />

            {/* TOM (registro — Sinais Vitais). Gira ANTES; a IA escreve neste tom. */}
            <div className="dg-box create-control-card" style={{ padding: 10 }}>
              <div className="dg-kicker" style={{ marginBottom: 6 }}>🫀 Tom do post <span style={{ color: "#7c869c", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>— a IA escreve neste registro</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {REGISTROS.map((r) => {
                  const on = registro === r.id;
                  return (
                    <button key={r.id} title={r.o_que} onClick={() => setRegistro(on ? "" : r.id)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, fontSize: 13, padding: "7px 12px", borderRadius: 9, cursor: "pointer", minWidth: 120,
                        background: on ? r.color + "22" : "#17171b", color: on ? r.color : "#9aa0b0",
                        border: "1px solid " + (on ? r.color : "#2e2e36"), fontWeight: on ? 700 : 500 }}>
                      <span>{r.emoji} {r.label}{on ? " ✓" : ""}</span>
                      <span style={{ fontSize: 10.5, color: on ? r.color : "#7c869c", fontWeight: 400 }}>{r.o_que}</span>
                    </button>
                  );
                })}
              </div>
              {!registro && <div style={{ fontSize: 10.5, color: "#7c869c", marginTop: 6 }}>sem tom = a IA decide o registro pelo conteúdo</div>}
            </div>

            {/* ETAPA DO FUNIL */}
            <div className="dg-box create-control-card" style={{ padding: 10 }}>
              <div className="dg-kicker" style={{ marginBottom: 6 }}>📣 Etapa do funil <span style={{ color: "#7c869c", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>— a IA adapta o objetivo do post</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {([
                  { id: "topo", emoji: "🔍", label: "Topo", desc: "atrair atenção", detail: "Descoberta · alcance · curiosidade · viral", color: "#22c55e" },
                  { id: "meio", emoji: "📚", label: "Meio", desc: "construir autoridade", detail: "Educação · confiança · método · profundidade", color: "#3b82f6" },
                  { id: "fundo", emoji: "🎯", label: "Fundo", desc: "gerar conversão", detail: "Decisão · provas · quebra de objeções · CTA", color: "#ef476f" },
                ] as const).map((f) => {
                  const on = funil === f.id;
                  return (
                    <button key={f.id} onClick={() => setFunil(on ? "" : f.id)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, fontSize: 13, padding: "8px 14px", borderRadius: 9, cursor: "pointer", flex: "1 1 140px",
                        background: on ? f.color + "18" : "#17171b", color: on ? f.color : "#9aa0b0",
                        border: "1px solid " + (on ? f.color : "#2e2e36"), fontWeight: on ? 700 : 500 }}>
                      <span>{f.emoji} {f.label}{on ? " ✓" : ""} <span style={{ fontWeight: 400, fontSize: 11.5 }}>— {f.desc}</span></span>
                      <span style={{ fontSize: 10.5, color: on ? f.color + "cc" : "#5a6378", fontWeight: 400 }}>{f.detail}</span>
                    </button>
                  );
                })}
              </div>
              {!funil && <div style={{ fontSize: 10.5, color: "#7c869c", marginTop: 6 }}>sem etapa = a IA decide o foco pelo conteúdo</div>}
            </div>

            {/* opções */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>

              {/* gancho & emoção (frameworks — seu controle) */}
              <div className="dg-box create-control-card" style={{ minWidth: 260, padding: 10 }}>
                <div className="dg-kicker" style={{ marginBottom: 6 }}>🎣 Gancho & emoção</div>
                <select value={hook} onChange={(e) => setHook(e.target.value)} title="Tipo de gancho do card 1"
                  style={{ width: "100%", background: "#17171b", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 13 }}>
                  <option value="">gancho: IA decide</option>
                  {HOOKS.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EMOTIONS.map((e) => {
                    const on = emotions.includes(e.id);
                    return (
                      <button key={e.id} title={e.short} onClick={() => setEmotions(on ? emotions.filter((x) => x !== e.id) : [...emotions, e.id])}
                        style={{ fontSize: 11, background: on ? "#3a1424" : "#17171b", color: on ? "#ff6b8f" : "#9aa0b0", border: "1px solid " + (on ? "#ef476f" : "#2e2e36"), borderRadius: 14, padding: "4px 10px", cursor: "pointer" }}>
                        {on ? "✓ " : ""}{e.name}
                      </button>
                    );
                  })}
                </div>
                {hook === "correlacao" && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #2e2e36" }}>
                    {correlation ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        <span style={{ flex: 1, color: "#7fd0c0" }}>🔗 ponte: {correlation.slice(0, 60)}</span>
                        <button onClick={() => setCorrelation("")} style={{ fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3d3d4d", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>tirar</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", gap: 6 }}>
                          <input value={corrManual} onChange={(e) => setCorrManual(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && corrManual.trim()) setCorrelation(corrManual.trim()); }}
                            placeholder="escreve a tua ponte (ex: bailarina que treinou 10 anos pra um movimento)" className="dg-input" style={{ flex: 1, fontSize: 12, padding: "6px 9px" }} />
                          <button onClick={() => corrManual.trim() && setCorrelation(corrManual.trim())} style={{ fontSize: 12, background: "#21212a", color: "#cfcfcf", border: "1px solid #3b3b44", borderRadius: 7, padding: "6px 12px", cursor: "pointer" }}>usar</button>
                        </div>
                        <div style={{ fontSize: 10.5, color: "#7c869c", margin: "5px 0" }}>ou deixa o Exa achar um tema atemporal/relacionável:</div>
                        <button onClick={findCorrelations} disabled={corrLoad} style={{ fontSize: 12, background: "#16201f", color: "#7fd0c0", border: "1px solid #2c4c48", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>
                          {corrLoad ? "buscando pontes" : "🔎 buscar pontes (Exa)"}
                        </button>
                        {corrErr && <div style={{ fontSize: 11, color: "#e08", marginTop: 5 }}>{corrErr}</div>}
                        {corrCands.length > 0 && (
                          <div style={{ marginTop: 6, maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
                            {corrCands.map((c, i) => (
                              <button key={i} onClick={() => { setCorrelation(c.title + (c.comoConecta ? " — conexão: " + c.comoConecta : c.snippet ? " — " + c.snippet : "")); setCorrCands([]); }} title={c.comoConecta || c.snippet}
                                style={{ textAlign: "left", fontSize: 11.5, background: "#17171b", color: "#cfcfcf", border: "1px solid " + (c.usado ? "#6a5a1e" : "#2e2e36"), borderRadius: 7, padding: "7px 9px", cursor: "pointer", display: "block", opacity: c.usado ? 0.75 : 1 }}>
                                <span style={{ fontWeight: 600 }}>{c.title}</span>
                                {c.usado && <span style={{ color: "#e8c860", fontSize: 10, marginLeft: 6 }}>· já usado recentemente</span>}
                                {c.comoConecta && <span style={{ display: "block", color: "#7fa0a0", fontSize: 10.5, marginTop: 2 }}>🔗 {c.comoConecta}</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* fonte deste conteúdo */}
              <div className="dg-box create-control-card" style={{ flex: 1, minWidth: 280, padding: 10 }}>
                <div className="dg-kicker" style={{ marginBottom: 6 }}>📎 Fonte deste conteúdo (opcional)</div>
                {inlineSrc ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#cfcfcf" }}>
                    <span title={inlineName} style={{ background: "#0e0e11", border: "1px solid #2e2e36", borderRadius: 6, padding: "4px 8px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✓ {inlineName} · {(inlineSrc.length / 1000).toFixed(1)}k</span>
                    <button onClick={() => { setInlineSrc(""); setInlineName(""); }} style={{ background: "transparent", color: "#e0738c", border: "1px solid #3d3d4d", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>tirar</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                    <textarea value={srcInput} onChange={(e) => setSrcInput(e.target.value)} placeholder="cola o artigo ou uma URL" className="dg-input" style={{ flex: 1, height: 44, resize: "vertical", fontSize: 12 }} />
                    <button onClick={attachSourceText} disabled={srcBusy} style={{ fontSize: 12, background: "#21212a", color: "#cfcfcf", border: "1px solid #3b3b44", borderRadius: 7, padding: "6px 12px", cursor: "pointer" }}>{srcBusy ? "anexando" : "anexar"}</button>
                    <button onClick={() => srcFileRef.current?.click()} disabled={srcBusy} style={{ fontSize: 12, background: "#21212a", color: "#cfcfcf", border: "1px solid #3b3b44", borderRadius: 7, padding: "6px 12px", cursor: "pointer" }}>PDF</button>
                    <input ref={srcFileRef} type="file" accept="application/pdf" hidden onChange={(e) => attachSourcePdf(e.target.files)} />
                  </div>
                )}
              </div>
            </div>

            {/* PASSO GANCHO — trava a abertura ANTES do roteiro (opcional; pode pular) */}
            <div className="dg-box create-hook-box" style={{ padding: 12, border: "1px solid " + (chosenHook ? "#6a5a1e" : "#2e2e36") }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="dg-kicker">🎣 1º o gancho</span>
                <span style={{ fontSize: 11.5, color: "#7c869c" }}>escolhe a abertura antes — o roteiro nasce comprometido com ela (a capa sai dela, sem distorcer)</span>
                <span style={{ flex: 1 }} />
                <button onClick={genHooks} disabled={hooksLoad || !content} className="dg-btn" style={{ fontSize: 13, opacity: (hooksLoad || !content) ? 0.6 : 1 }}>
                  {hooksLoad ? "gerando" : (chosenHook ? "↻ outros ganchos" : "✦ Gerar 5 ganchos")}
                </button>
              </div>

              {(chosenCover || chosenHook) && (
                <div style={{ background: "#17171b", border: "1px solid #6a5a1e", borderRadius: 8, padding: 10, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11.5, color: "#e8c860", fontWeight: 600 }}>✓ gancho travado</span>
                    <span style={{ flex: 1 }} />
                    <button onClick={() => { setChosenHook(""); setChosenCover(""); }} style={{ fontSize: 11, background: "transparent", color: "#e0738c", border: "1px solid #3d3d4d", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>limpar</button>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#9a8f6a", marginBottom: 3 }}>CAPA (vai pro card 1 verbatim — usa ** pro rosa)</div>
                  <textarea value={chosenCover} onChange={(e) => setChosenCover(e.target.value)} rows={2}
                    className="dg-input" style={{ width: "100%", fontSize: 14, fontWeight: 700, lineHeight: 1.4, resize: "vertical", marginBottom: 8 }} />
                  <div style={{ fontSize: 10.5, color: "#7c869c", marginBottom: 3 }}>ABERTURA do roteiro (a IA começa por aqui)</div>
                  <textarea value={chosenHook} onChange={(e) => setChosenHook(e.target.value)} rows={3}
                    className="dg-input" style={{ width: "100%", fontSize: 13.5, lineHeight: 1.5, resize: "vertical" }} />
                </div>
              )}

              {hooks.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  <div style={{ fontSize: 11.5, color: "#9aa0b0" }}>Pode <b style={{ color: "#cfcfcf" }}>editar</b> antes de travar ou salvar — tua edição também ensina a IA. (** = palavra em rosa)</div>
                  {hooks.map((h, i) => {
                    const lock = () => { setChosenCover(h.capa || ""); setChosenHook((h.abertura || "").replace(/\*\*/g, "")); setHooks([]); };
                    return (
                      <div key={i} style={{ background: "#17171b", border: "1px solid #2e2e36", borderRadius: 8, padding: "10px 12px" }}>
                        <textarea value={h.capa} onChange={(e) => setHookField(i, "capa", e.target.value)} rows={1}
                          style={{ width: "100%", background: "transparent", color: "#fff", border: "1px solid transparent", borderRadius: 6, padding: "3px 5px", fontSize: 14, fontWeight: 700, marginBottom: 3, resize: "none", fontFamily: "inherit" }}
                          onFocus={(e) => (e.currentTarget.style.border = "1px solid #2e2e36")} onBlur={(e) => (e.currentTarget.style.border = "1px solid transparent")} />
                        <textarea value={h.abertura} onChange={(e) => setHookField(i, "abertura", e.target.value)} rows={3}
                          style={{ width: "100%", background: "transparent", color: "#bdc4d4", border: "1px solid transparent", borderRadius: 6, padding: "3px 5px", fontSize: 12.5, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit" }}
                          onFocus={(e) => (e.currentTarget.style.border = "1px solid #2e2e36")} onBlur={(e) => (e.currentTarget.style.border = "1px solid transparent")} />
                        <div style={{ display: "flex", gap: 8, marginTop: 9, alignItems: "center", flexWrap: "wrap" }}>
                          <button onClick={lock} className="dg-btn-primary" style={{ fontSize: 12, padding: "5px 13px" }}>✓ usar este</button>
                          <button onClick={() => saveHookAsIdea(i)} title="Salva este gancho no Quadro (Ideias) pra gerar o carrossel depois" style={{ fontSize: 12, background: "#17171b", color: "#cfcfcf", border: "1px dashed #4a5a7a", borderRadius: 7, padding: "5px 13px", cursor: "pointer" }}>+ Quadro (salvar pra depois)</button>
                          <button onClick={() => {
                            const capa = (h.capa || "").replace(/\*\*/g, "").trim();
                            fetch("/api/hooks-gold", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ capa }) }).catch(() => {});
                            toast("⭐ capa salva como gancho-ouro — a IA vai imitar esse padrão");
                          }} title="Salva a CAPA como gancho-ouro — a IA aprende esse padrão pra gerar capas mais fortes no futuro" style={{ fontSize: 12, background: "#17171b", color: "#e8c97a", border: "1px solid #4a3d1a", borderRadius: 7, padding: "5px 13px", cursor: "pointer" }}>⭐ gancho-ouro</button>
                          <span style={{ flex: 1 }} />
                          <button onClick={() => {
                            fetch("/api/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "hook", text: `${(h.capa || "").replace(/\*\*/g, "")} | ${(h.abertura || "").replace(/\*\*/g, "")}`, registro: registro || undefined }) }).catch(() => {});
                            removeHook(i);
                            toast("👎 anotado — a IA evita esse tipo");
                          }} title="Não curti — a IA aprende a NÃO gerar esse tipo de gancho" style={{ fontSize: 12, background: "transparent", color: "#9a8a90", border: "1px solid #3a2a32", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>👎 não curti</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* gerar */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid #2e2e36", paddingTop: 14 }}>
              <button onClick={generateRoteiro} disabled={roteiroLoad || !content} className="dg-btn-primary" style={{ padding: "11px 26px", fontSize: 15, opacity: (roteiroLoad || !content) ? 0.6 : 1 }}>
                {roteiroLoad ? "Escrevendo roteiro" : (chosenHook ? "✍️ Gerar roteiro com este gancho" : "✍️ Gerar roteiro (IA escolhe o gancho)")}
              </button>
              <span style={{ fontSize: 12, color: "#5a6378" }} title="A qualidade está toda embutida: a IA ancora na marca + aprendizado, pensa o arco antes de escrever e se autolimpa sozinha — sem caixinha pra marcar">✓ qualidade embutida</span>
              {savedAt && (carousel.cards.length > 0 || legenda || roteiro) && <span style={{ color: "#5a6378", fontSize: 12, marginLeft: "auto" }} title="rascunho salvo no navegador — sobrevive ao F5">💾 salvo automático</span>}
              {carousel.cards.length > 0 && (
                <button onClick={() => setStage("carrossel")} className="dg-btn" style={{ marginLeft: savedAt ? 0 : "auto" }}>ir pro carrossel →</button>
              )}
            </div>
          </div>

          {/* ETAPA 1 — o roteiro (texto), editável e aprovável antes de virar carrossel */}
          {roteiro && (
            <div className="studio-section studio-section--pad create-script">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#fff", letterSpacing: 1 }}>✍️ ROTEIRO</span>
                <span style={{ fontSize: 12, color: "#9aa0b0" }}>edita à vontade — é a TUA escrita. Só vira carrossel quando você aprovar</span>
                <span style={{ flex: 1 }} />
                {voiceMsg && <span style={{ fontSize: 12, color: voiceMsg.startsWith("⭐") ? "#e8c860" : "#e0738c" }}>{voiceMsg}</span>}
                <button onClick={markRoteiroVoice} title="Marca este roteiro como a TUA voz no ponto — a IA imita a cadência nas próximas"
                  style={{ fontSize: 12, background: "#241f0e", color: "#e8c860", border: "1px solid #6a5a1e", borderRadius: 7, padding: "6px 11px", cursor: "pointer", fontWeight: 600 }}>⭐ minha voz</button>
                <button onClick={rejectRoteiro} title="Não curti — a IA aprende a NÃO escrever assim (evita esse tom/ângulo nas próximas)"
                  style={{ fontSize: 12, background: "transparent", color: "#9a8a90", border: "1px solid #3a2a32", borderRadius: 7, padding: "6px 11px", cursor: "pointer" }}>👎 não curti</button>
                <button onClick={pedirJuiz} disabled={judging} title="A OpenAI revisa com outro olhar e aponta as fraquezas — o Claude continua sendo quem escreve"
                  style={{ fontSize: 12, background: "#0e1a24", color: "#63b3d6", border: "1px solid #1e455a", borderRadius: 7, padding: "6px 11px", cursor: "pointer", fontWeight: 600, opacity: judging ? 0.6 : 1 }}>{judging ? "revisando..." : "🔍 2ª opinião"}</button>
                <button onClick={generateRoteiro} disabled={roteiroLoad} className="dg-btn" style={{ fontSize: 12, padding: "6px 12px" }}>{roteiroLoad ? "reescrevendo" : "↻ reescrever"}</button>
              </div>

              {/* Painel do juiz cruzado */}
              {critica && (
                <div style={{ background: "#0d1620", border: "1px solid #1e455a", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#63b3d6" }}>🔍 2ª opinião (OpenAI)</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: critica.nota >= 80 ? "#7bbf6a" : critica.nota >= 65 ? "#e8c860" : "#e0738c" }}>{critica.nota}/100</span>
                    <span style={{ fontSize: 12.5, color: "#aab4c4", flex: 1, minWidth: 180 }}>{critica.veredito}</span>
                    <button onClick={() => setCritica(null)} style={{ fontSize: 11, background: "none", border: "none", color: "#5a6378", cursor: "pointer" }}>✕</button>
                  </div>
                  {critica.fracos?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#e0738c", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>fraquezas</div>
                      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
                        {critica.fracos.map((f, i) => <li key={i} style={{ fontSize: 12.5, color: "#cbd2de", lineHeight: 1.45 }}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {critica.sugestoes?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#7bbf6a", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>sugestões</div>
                      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
                        {critica.sugestoes.map((s, i) => <li key={i} style={{ fontSize: 12.5, color: "#cbd2de", lineHeight: 1.45 }}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                    <button onClick={melhorarComClaude} disabled={melhorando} className="dg-btn-primary" style={{ fontSize: 12.5, padding: "8px 16px", opacity: melhorando ? 0.6 : 1 }}>
                      {melhorando ? "Claude reescrevendo..." : "✨ melhorar com Claude"}
                    </button>
                    <span style={{ fontSize: 11, color: "#7c869c" }}>o Claude reescreve atacando esses pontos, mantendo tua voz</span>
                  </div>
                </div>
              )}
              <textarea ref={roteiroRef} defaultValue={roteiro} onChange={(e) => setRoteiro(e.target.value)} rows={14}
                className="dg-input" style={{ width: "100%", fontSize: 15, lineHeight: 1.55, resize: "vertical", fontFamily: "inherit" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={generateCards} disabled={cardsLoad || !roteiro.trim()} className="dg-btn-primary" style={{ padding: "11px 22px", fontSize: 15, opacity: (cardsLoad || !roteiro.trim()) ? 0.6 : 1 }}>
                  {cardsLoad ? "Montando carrossel" : "🎨 Gerar carrossel deste roteiro"}
                </button>
                <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#cfcfcf", fontSize: 13 }}>
                  Estilo
                  <select value={genStyle} onChange={(e) => setGenStyle(e.target.value)}
                    style={{ background: "#17171b", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 8, padding: "7px 9px", fontSize: 13 }}>
                    <option value="layout1">Layout 1 (clássico)</option>
                    <option value="layout2">Layout 2 (editorial)</option>
                    <option value="layout3">Layout 3 (storytelling)</option>
                    <option value="layout4">Layout 4 (revista)</option>
                    <option value="layout5">Layout 5 (minimalista)</option>
                    <option value="layout6">Layout 6 (manifesto)</option>
                    <option value="layout7">Layout 7 (científico)</option>
                    <option value="layout8">Layout 8 (80/20)</option>
                    <option value="layout9">Layout 9 (minimalista)</option>
                    <option value="layout10">Layout 10 (vinho premium)</option>
                  </select>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#cfcfcf", fontSize: 13 }}>
                  Nº de cards
                  <input type="number" min={3} max={12} value={nCards} onChange={(e) => setNCards(Number(e.target.value))}
                    style={{ width: 60, background: "#17171b", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 8, padding: "7px 9px" }} />
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#cfcfcf", fontSize: 13 }}>
                  <input type="checkbox" checked={caption} onChange={(e) => setCaption(e.target.checked)} /> Legenda + hashtags
                </label>
                <button onClick={() => navigator.clipboard.writeText(roteiro)} className="dg-btn" style={{ fontSize: 13 }}>copiar roteiro</button>
                <span style={{ fontSize: 12, color: "#7c869c" }}>{roteiro.trim().split(/\s+/).length} palavras</span>
              </div>
              {voiceScore != null && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #2e2e36", display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span title="juiz de voz: quão parecido com a sua escrita real (comparado aos seus exemplos-ouro)" style={{ fontSize: 12.5, fontWeight: 600, flexShrink: 0, color: voiceScore >= 80 ? "#7bbf6a" : voiceScore >= 65 ? "#e8c860" : "#e0738c" }}>🎯 voz: {voiceScore}/100{regenerated ? " · regenerei pra subir" : ""}</span>
                  {voiceIssues.length > 0 && <span style={{ fontSize: 12, color: "#cfcfcf" }}>{voiceIssues.join(" · ")}</span>}
                  {voiceScore < 80 && <span style={{ fontSize: 11, color: "#7c869c" }}>(quanto mais exemplos seus no Cérebro, mais alto isso fica)</span>}
                </div>
              )}
              {cleaned && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #2e2e36", display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, color: "#7bbf6a" }}>🧹 autolimpei algumas caras-de-IA antes de te mostrar</span>
                  <span style={{ fontSize: 11, color: "#7c869c" }}>(cirúrgico — só tirei os vícios de robô, não mexi no resto)</span>
                </div>
              )}
              {tells.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #2e2e36", display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#e8a020", flexShrink: 0 }}>⚠ {cleaned ? "ainda sobrou" : "possíveis caras de IA"}:</span>
                  <span style={{ fontSize: 12.5, color: "#cfcfcf" }}>{tells.join(" · ")}</span>
                  <span style={{ fontSize: 11, color: "#7c869c" }}>(só um aviso — você decide e ajusta na mão)</span>
                </div>
              )}
            </div>
          )}
          </>)}{/* fim ETAPA 1 — texto */}

          {err && <div style={{ color: "#ef476f", marginBottom: 16 }}>⚠ {err}</div>}

          {stage === "carrossel" && (<>
            {/* barra de ações do carrossel */}
            <div className="studio-section create-toolbar" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", padding: "12px 16px" }}>
              <button onClick={() => setStage("texto")} className="dg-btn" style={{ fontWeight: 600 }}>← voltar ao texto</button>
              <span style={{ width: 1, height: 22, background: "#2e2e36" }} />
              {carousel.cards.length > 0 && <button onClick={() => setSwipe(0)} className="dg-btn" title="Ver o carrossel deslizando, como no Instagram">👁️ Pré-visualizar</button>}
              <button onClick={saveNamedDraft} className="dg-btn" title="Salva este carrossel como rascunho nomeado (histórico)">💾 salvar rascunho</button>
              <button onClick={() => setDraftsOpen((o) => !o)} className="dg-btn" title="Meus rascunhos salvos">📁 rascunhos{drafts.length ? ` (${drafts.length})` : ""}</button>
              <span style={{ width: 1, height: 22, background: "#2e2e36" }} />
              <button onClick={exportToFolder} className="dg-btn">📂 Salvar na pasta</button>
              <button onClick={saveToVault} className="dg-btn">Salvar no Quadro</button>
              <button onClick={saveGoldSlice} title="Marca o RITMO de diagramação deste carrossel como bom — o fatiador imita essa variedade de layout nas próximas" className="dg-btn">🏆 boa diagramação</button>
              <button onClick={exportAll} className="dg-btn-primary" style={{ padding: "8px 16px" }}>⬇ Baixar {carousel.cards.length}</button>
              <span style={{ flex: 1 }} />
              {savedAt && (carousel.cards.length > 0 || legenda || roteiro) && <span style={{ color: "#5a6378", fontSize: 12 }} title="rascunho salvo no navegador — sobrevive ao F5">💾 salvo automático</span>}
              {saveMsg && <span style={{ color: "#7ed957", fontSize: 13 }}>{saveMsg}</span>}
              <button className="dg-btn" onClick={undo} disabled={!historyState.canUndo} style={{ padding: "8px 14px" }} title="Desfazer (Ctrl+Z)">↶ desfazer</button>
              <button className="dg-btn" onClick={redo} disabled={!historyState.canRedo} style={{ padding: "8px 14px" }} title="Refazer (Ctrl+Y)">↷ refazer</button>
            </div>

            {/* Redesenhar com IA — muda o visual de todos os cards, mantém o texto */}
            {carousel.cards.length > 0 && (
              <div className="studio-section" style={{ padding: restyleOpen ? "14px 16px" : "10px 16px", marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setRestyleOpen((o) => !o)}
                    style={{ fontSize: 13, fontWeight: 700, background: "none", border: "none", color: "#c07bd6", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
                    🎨 Redesenhar com IA <span style={{ fontSize: 10, color: "#5a6378" }}>{restyleOpen ? "▲" : "▼"}</span>
                  </button>
                  <span style={{ fontSize: 12, color: "#7c869c" }}>descreve o visual e a IA remonta a estética — o texto continua igual</span>
                  {lastStyle && <button onClick={desfazerRedesenho} style={{ fontSize: 11.5, background: "transparent", color: "#9aa0b0", border: "1px solid #3b3b44", borderRadius: 7, padding: "5px 11px", cursor: "pointer", marginLeft: "auto" }}>↩ desfazer redesenho</button>}
                </div>
                {restyleOpen && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <textarea value={restyleText} onChange={(e) => setRestyleText(e.target.value)} rows={2}
                      placeholder="ex: mais dark e agressivo, destaque vermelho forte / estilo revista clean com fundo claro / vibe premium com dourado"
                      style={{ flex: 1, minWidth: 260, fontSize: 13.5, background: "#121216", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 8, padding: 10, resize: "vertical", fontFamily: "inherit" }} />
                    <button onClick={redesenharComIA} disabled={restyling || restyleText.trim().length < 3} className="dg-btn-primary"
                      style={{ padding: "11px 20px", fontSize: 14, opacity: (restyling || restyleText.trim().length < 3) ? 0.55 : 1, whiteSpace: "nowrap" }}>
                      {restyling ? "redesenhando..." : "✨ aplicar visual"}
                    </button>
                  </div>
                )}
              </div>
            )}

          {draftsOpen && (
            <div className="studio-section studio-section--pad create-drafts">
              <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#fff", letterSpacing: 1 }}>MEUS RASCUNHOS</span>
                <span style={{ flex: 1 }} />
                <button onClick={() => setDraftsOpen(false)} className="dg-btn" style={{ padding: "5px 12px", fontSize: 12 }}>fechar</button>
              </div>
              {drafts.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--dg-faint)" }}>Nenhum rascunho salvo ainda. Use <b style={{ color: "#cfcfcf" }}>💾 salvar rascunho</b> pra guardar o atual</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                  {drafts.map((d) => (
                    <div key={d.id} className="dg-box" style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontWeight: 600, color: "#fff", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: "var(--dg-faint)" }}>{d.data.carousel?.cards?.length || 0} cards · {new Date(d.at).toLocaleDateString("pt-BR")}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                        <button onClick={() => loadNamedDraft(d)} className="dg-btn" style={{ flex: 1, padding: "5px", fontSize: 12 }}>abrir</button>
                        <button onClick={() => { if (confirm("Apagar este rascunho?")) persistDrafts(drafts.filter((x) => x.id !== d.id)); }} className="dg-btn" style={{ padding: "5px 9px", fontSize: 12, color: "#e0738c" }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {carousel.cards.length > 0 && (
            <Filmstrip cards={carousel.cards} selected={selected}
              onSelect={(i) => setSelected(i)} onAdd={addCard}
              onDuplicate={duplicateCard} onDelete={removeCard} onReorder={reorderCard} />
          )}

          {carousel.cards.length === 0 && (
            <div className="studio-section studio-section--pad create-empty" style={{ textAlign: "center", color: "#7c869c" }}>
              <div className="dg-title" style={{ fontSize: 26, color: "#cfcfcf", marginBottom: 6 }}>NADA AQUI AINDA</div>
              <div style={{ fontSize: 14, marginBottom: 20 }}>Cola um conteúdo acima e clica <b style={{ color: "#ef476f" }}>Gerar carrossel</b> — ou começa na mão</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button className="dg-btn" onClick={addCard}>+ adicionar card manual</button>
                <button className="dg-btn" onClick={() => setCarousel(SAMPLE)}>ver exemplo</button>
              </div>
            </div>
          )}

          {selected !== null && carousel.cards[selected] && (() => {
            const sc = carousel.cards[selected];
            const hasImg = !!sc.image;
            const fx = sc.focalX ?? 0.5, fy = sc.focalY ?? 0.4;
            const PHOTO_MIN = -4, PHOTO_MAX = 4;
            const PHOTO_Y_MIN = -4, PHOTO_Y_MAX = 4, PHOTO_Y_DRAG_GAIN = 1.35;
            const lg = sc.logo;
            const showLogo = !lg?.hide && sc.layout !== "moral" && !/^l[2-9]-/.test(sc.layout) && !/^l10-/.test(sc.layout);
            const lx = lg?.x ?? 0.06, ly = lg?.y ?? 0.05;
            const ovs = sc.overlays || [];
            const elementHandles = cardElementDefs(sc)
              .map((d) => resolveCardElement(sc, d))
              .filter((e) => !e.hidden && e.movable !== false);
            const rawNorm = (e: React.PointerEvent) => {
              const r = e.currentTarget.getBoundingClientRect();
              return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
            };
            const norm = (e: React.PointerEvent) => {
              const p = rawNorm(e);
              return { x: Math.min(1, Math.max(0, p.x)), y: Math.min(1, Math.max(0, p.y)) };
            };
            const r2 = (n: number) => Math.round(n * 1000) / 1000;
            const apply = (e: React.PointerEvent) => {
              // eslint-disable-next-line react-hooks/refs
              const t = dragTarget.current; if (!t) return;
              e.preventDefault();
              const raw = rawNorm(e);
              const { x, y } = norm(e);
              const cl = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v)); // mantém dentro do post
              if (t === "focal") {
                // eslint-disable-next-line react-hooks/refs
                const start = dragStart.current?.key === "focal" ? dragStart.current : null;
                updateCard(selected, {
                  focalX: r2(cl((start?.focalX ?? fx) + raw.x - (start?.x ?? raw.x), PHOTO_MIN, PHOTO_MAX)),
                  focalY: r2(cl((start?.focalY ?? fy) + (raw.y - (start?.y ?? raw.y)) * PHOTO_Y_DRAG_GAIN, PHOTO_Y_MIN, PHOTO_Y_MAX)),
                });
              }
              else if (t === "logo") { const w = lg?.w ?? 250; updateCard(selected, { logo: { x: r2(cl(x, 0, 1 - w / 1080)), y: r2(cl(y, 0, 1 - w / 1350)), w, hide: lg?.hide ?? false } }); }
              else if (t.startsWith("lg-")) { const i = Number(t.slice(3)); const w = sc.logos?.[i]?.w ?? 200; const arr = (sc.logos || []).map((l, idx) => idx === i ? { ...l, x: r2(cl(x, 0, 1 - w / 1080)), y: r2(cl(y, 0, 1 - w / 1350)) } : l); updateCard(selected, { logos: arr }); }
              else if (t.startsWith("ov-")) { const i = Number(t.slice(3)); const arr = ovs.map((o, idx) => idx === i ? { ...o, x: r2(x), y: r2(y) } : o); updateCard(selected, { overlays: arr }); }
              else if (t.startsWith("ci-")) { const i = Number(t.slice(3)); const arr = (sc.cardImages || []).map((ci, idx) => idx === i ? { ...ci, x: r2(cl(x, -0.2, 1.1)), y: r2(cl(y, -0.2, 1.1)) } : ci); updateCard(selected, { cardImages: arr }); }
              else if (t.startsWith("el-")) {
                const id = t.slice(3);
                const el = elementHandles.find((item) => item.id === id);
                if (!el) return;
                const txt = el.text || el.label || "";
                const w = el.w ?? (el.size ? txt.length * el.size * 0.5 : 160);
                const h = el.h ?? (el.size ? el.size * 1.5 : w);
                updateCard(selected, { elements: { ...(sc.elements || {}), [id]: { ...(sc.elements?.[id] || {}), x: r2(cl(x, 0, Math.max(0, 1 - w / 1080))), y: r2(cl(y, 0, Math.max(0, 1 - h / 1350))) } } });
              }
              else if (t === "nick") updateCard(selected, { nickPos: { x: r2(cl(x, 0, 0.95)), y: r2(cl(y, 0, 0.95)), size: sc.nickPos?.size ?? 28 } });
              else if (t === "text") { const b = hbase.text || { x: 0.5, y: 0.5 }; updateCard(selected, { textX: r2(cl(x, 0.02, 0.98) - b.x), textY: r2(cl(y, 0.02, 0.98) - b.y) }); }
              else if (t === "title") { const b = hbase.title || { x: 0.5, y: 0.5 }; updateCard(selected, { titleX: r2(cl(x, 0.02, 0.98) - b.x), titleY: r2(cl(y, 0.02, 0.98) - b.y) }); }
              else if (t === "body") { const b = hbase.body || { x: 0.5, y: 0.5 }; updateCard(selected, { bodyX: r2(cl(x, 0.02, 0.98) - b.x), bodyY: r2(cl(y, 0.02, 0.98) - b.y) }); }
              else if (t === "signoff") { const b = hbase.signoff || { x: 0.5, y: 0.88 }; updateCard(selected, { signoffX: r2(cl(x, 0.02, 0.98) - b.x), signoffY: r2(cl(y, 0.02, 0.98) - b.y) }); }
              else if (t === "kicker") { const b = hbase.kicker || { x: 0.5, y: 0.12 }; updateCard(selected, { kickerX: r2(cl(x, 0.02, 0.98) - b.x), kickerY: r2(cl(y, 0.02, 0.98) - b.y) }); }
            };
            const onDown = (e: React.PointerEvent) => {
              const t = (e.target as HTMLElement).closest("[data-drag]")?.getAttribute("data-drag") || (e.target as HTMLElement).dataset?.drag;
              if (!t) return; // clique em área branca não move nada — só handles explícitos
              dragTarget.current = t;
              const raw = rawNorm(e);
              dragStart.current = { key: t, x: raw.x, y: raw.y, focalX: fx, focalY: fy };
              e.preventDefault();
              try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
              apply(e);
            };
            const shortHandleLabel = (label: string) => {
              const clean = label.replace(/^📷\s*/, "");
              if (/índice/i.test(clean)) return "ÍNDICE";
              if (/barra superior/i.test(clean)) return "BARRA";
              if (/logo/i.test(clean)) return clean.replace(/^Logo/i, "LOGO").replace(/\s+(da|do|de)\s+.*/i, "");
              if (/marcador/i.test(clean)) return "MARCA";
              if (/rodapé/i.test(clean)) return "RODAPÉ";
              if (/faixa/i.test(clean)) return "FAIXA";
              if (/moldura/i.test(clean)) return "MOLDURA";
              if (/código/i.test(clean)) return "CÓDIGO";
              return clean;
            };
            const handle = (key: string, x: number, y: number, label: string, color: string) => (
              <div key={key} data-drag={key} className="create-drag-handle" style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, transform: "translate(-50%,-50%)", background: color, color: "#fff", fontSize: 8.5, fontWeight: 800, minHeight: 21, minWidth: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "2px 5px", borderRadius: 5, border: "1px solid #fff", cursor: "grab", whiteSpace: "nowrap", boxShadow: "0 1px 6px rgba(0,0,0,.62)", touchAction: "none", userSelect: "none", zIndex: 30 }}>{shortHandleLabel(label)}</div>
            );
            const focalHandleX = Math.min(0.965, Math.max(0.035, fx));
            const focalHandleY = Math.min(0.965, Math.max(0.035, fy));
            return (
            <div ref={editorStageRef} className="create-editor-stage">
              <div className="dg-canvas">
                <div className="studio-section create-preview-card" style={{ padding: 14 }}>
                <div
                  ref={previewRef}
                  onPointerDown={onDown}
                  onPointerMove={(e) => { if (dragTarget.current) apply(e); }}
                  onPointerUp={(e) => { dragTarget.current = null; dragStart.current = null; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {} }}
                  onPointerCancel={(e) => { dragTarget.current = null; dragStart.current = null; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {} }}
                  onLostPointerCapture={() => { dragTarget.current = null; dragStart.current = null; }}
                  className="create-preview-frame"
                  style={{ width: "var(--create-preview-w)", height: "var(--create-preview-h)", overflow: "hidden", borderRadius: 12, border: "1px solid var(--dg-line)", position: "relative", cursor: "default", touchAction: "none", boxShadow: "0 10px 30px -18px rgba(0,0,0,.9)" }}>
                  <div className="create-preview-inner">
                    <CarouselCard card={sc} />
                  </div>
                  {hasImg && handle("focal", focalHandleX, focalHandleY, "FOTO", "rgba(0,0,0,.78)")}
                  {sc.logos !== undefined
                    ? (sc.logos || []).map((l, i) => handle(`lg-${i}`, l.x, l.y, "LOGO " + (i + 1), "rgba(20,33,61,.95)"))
                    : (showLogo && handle("logo", lx, ly, "LOGO", "rgba(20,33,61,.95)"))}
                  {elementHandles.map((el) => handle(`el-${el.id}`, el.x, el.y, el.label, "rgba(255,132,74,.95)"))}
                  {ovs.map((o, i) => handle(`ov-${i}`, o.x, o.y, "img", "rgba(239,71,111,.92)"))}
                  {(sc.cardImages || []).map((ci, i) => handle(`ci-${i}`, Math.min(0.98, Math.max(0.02, ci.x)), Math.min(0.98, Math.max(0.02, ci.y)), `IMG ${i + 1}`, "rgba(239,71,111,.85)"))}
                  {sc.headline && sc.body
                    ? <>
                        {handle("title", (hbase.title ? hbase.title.x : 0.5) + (sc.titleX ?? 0), (hbase.title ? hbase.title.y : 0.5) + (sc.titleY ?? 0), "TÍTULO", "rgba(95,211,138,.92)")}
                        {handle("body", (hbase.body ? hbase.body.x : 0.5) + (sc.bodyX ?? 0), (hbase.body ? hbase.body.y : 0.5) + (sc.bodyY ?? 0), "CORPO", "rgba(120,170,255,.92)")}
                      </>
                    : handle("text", (hbase.text ? hbase.text.x : 0.5) + (sc.textX ?? 0), (hbase.text ? hbase.text.y : 0.5) + (sc.textY ?? 0), "TEXTO", "rgba(95,211,138,.92)")}
                  {!sc.hideNick && handle("nick", sc.nickPos?.x ?? 0.06, sc.nickPos?.y ?? 0.05, "NICK", "rgba(232,200,96,.95)")}
                  {sc.signoff && handle("signoff", (hbase.signoff ? hbase.signoff.x : 0.5) + (sc.signoffX ?? 0), (hbase.signoff ? hbase.signoff.y : 0.88) + (sc.signoffY ?? 0), "CTA", "rgba(168,115,255,.95)")}
                  {sc.kicker && handle("kicker", Math.min(0.97, Math.max(0.03, (hbase.kicker?.x ?? 0.15) + (sc.kickerX ?? 0))), Math.min(0.97, Math.max(0.03, (hbase.kicker?.y ?? 0.7) + (sc.kickerY ?? 0))), "KICKER", "rgba(255,180,50,.95)")}
                  <div style={{ position: "absolute", left: 8, bottom: 8, fontSize: 10.5, color: "#fff", background: "rgba(0,0,0,.62)", padding: "3px 9px", borderRadius: 6, pointerEvents: "none" }}>🖱️ arraste os handles para mover foto, texto, logo, kicker ou elementos</div>
                </div>
                <button onClick={() => exportOne(selected)} className="dg-btn-primary create-preview-download" style={{ width: "100%", marginTop: 12, padding: "11px" }}>
                  ⬇ Baixar esta imagem
                </button>
                <div className="create-preview-meta" style={{ fontSize: 10.5, color: "var(--dg-faint)", marginTop: 7, textAlign: "center" }}>só o card {sc.index} · PNG 1080×1350</div>
                </div>
                <button onClick={() => setSelected(null)} className="dg-btn create-preview-close" style={{ width: "100%", marginTop: 10, padding: "8px", fontSize: 13 }}>✕ fechar edição</button>
              </div>
              <div className="create-mobile-editor-actions">
                <span>Editando {sc.index}</span>
                <button onClick={() => exportOne(selected)} className="dg-btn-primary" type="button">⬇ Baixar</button>
                <button onClick={() => setSelected(null)} className="dg-btn" type="button">✕ Fechar</button>
              </div>
              <CardEditor card={sc} onChange={(patch) => updateCard(selected, patch)} carousel={carousel} index={selected} onReplace={(nc) => replaceCard(selected, nc)} onApplyAll={carousel.cards.length > 1 ? applyToAll : undefined} onApplyKit={applyKit} />
            </div>
            );
          })()}

          {carousel.cards.length > 0 && selected === null && (
            <div style={{ textAlign: "center", color: "#7c869c", fontSize: 14, padding: "30px 0" }}>
              Clica num card lá em cima pra editar. 🖱️
            </div>
          )}

          {legenda && (
            <div className="studio-section studio-section--pad create-caption">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>📝 Legenda do post</span>
                <button onClick={() => navigator.clipboard.writeText(legenda)} style={{ fontSize: 13, background: "#21212a", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>copiar</button>
              </div>
              <textarea value={legenda} onChange={(e) => setLegenda(e.target.value)} rows={8}
                style={{ width: "100%", background: "#17171b", color: "#f5f5f5", border: "1px solid #2e2e36", borderRadius: 8, padding: 12, fontSize: 14, lineHeight: 1.5, resize: "vertical" }} />
            </div>
          )}
          </>)}{/* fim ETAPA 2 — carrossel */}

          {/* render full-size (1080x1350) fora da tela — montado SÓ na hora de exportar */}
          {exporting && (
            <div style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }} aria-hidden>
              {carousel.cards.map((card, i) => (
                <div key={card.id} ref={(el) => { refs.current[i] = el; }} style={{ width: 1080, height: 1350 }}>
                  <CarouselCard card={card} />
                </div>
              ))}
            </div>
          )}

          {/* PRÉVIA EM SWIPE — vê o carrossel deslizando, como no Instagram */}
          {swipe != null && carousel.cards[swipe] && (
            <div onClick={() => setSwipe(null)} className="create-swipe-overlay">
              <div onClick={(e) => e.stopPropagation()} className="create-swipe-shell">
                <button onClick={() => setSwipe((i) => Math.max(0, (i ?? 0) - 1))} disabled={swipe === 0} className="dg-btn create-swipe-nav create-swipe-nav--prev" style={{ opacity: swipe === 0 ? 0.3 : 1 }}>‹</button>
                <div className="create-swipe-card">
                  <div className="create-swipe-inner"><CarouselCard card={carousel.cards[swipe]} /></div>
                </div>
                <button onClick={() => setSwipe((i) => Math.min(carousel.cards.length - 1, (i ?? 0) + 1))} disabled={swipe === carousel.cards.length - 1} className="dg-btn create-swipe-nav create-swipe-nav--next" style={{ opacity: swipe === carousel.cards.length - 1 ? 0.3 : 1 }}>›</button>
              </div>
              <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 6, marginTop: 18 }}>
                {carousel.cards.map((_, i) => <button key={i} onClick={() => setSwipe(i)} style={{ width: i === swipe ? 24 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", padding: 0, background: i === swipe ? "var(--dg-red)" : "rgba(255,255,255,.3)", transition: "width .2s" }} />)}
              </div>
              <div style={{ marginTop: 12, color: "#cfcfcf", fontSize: 13 }}>{swipe + 1} / {carousel.cards.length} · use ← → · Esc fecha</div>
              <button onClick={() => setSwipe(null)} className="create-swipe-close">✕ fechar</button>
            </div>
          )}
        </div>
  );
}
