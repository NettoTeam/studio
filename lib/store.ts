// Armazenamento na nuvem (Supabase). Persiste de verdade e sincroniza PC ↔ celular.
// Tabelas: posts (id, data jsonb, stage, scheduled_at, updated_at) e kv (key, value jsonb).
import { createClient } from "@supabase/supabase-js";
import type { Post } from "./types";
import { AUDIENCE as DEFAULT_AUDIENCE, EDGE as DEFAULT_EDGE } from "./n2squad";
import type { Registro } from "./vitals";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(url, key, { auth: { persistSession: false } });

export async function listPosts(): Promise<Post[]> {
  const { data, error } = await sb.from("posts").select("data").order("updated_at", { ascending: false });
  if (error) { console.error("listPosts", error.message); return []; }
  return (data || []).map((r) => r.data as Post);
}

export async function getPost(id: string): Promise<Post | undefined> {
  const { data } = await sb.from("posts").select("data").eq("id", id).maybeSingle();
  return (data?.data as Post) || undefined;
}

export async function upsertPost(post: Post): Promise<Post> {
  const { error } = await sb.from("posts").upsert({
    id: post.id,
    data: post,
    stage: post.stage || "ideia",
    scheduled_at: post.scheduledAt || null,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("upsertPost", error.message);
  return post;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await sb.from("posts").delete().eq("id", id);
  if (error) console.error("deletePost", error.message);
}

// indicador simples de desempenho (amadurece com volume): taxa de salvamento
export function savesRate(p: Post): number | null {
  const m = p.metrics;
  if (!m || !m.alcance || !m.salvamentos) return null;
  return m.salvamentos / m.alcance;
}

// ---- Aprendizado (síntese dos padrões validados nos dados) ----
export interface Learnings {
  updatedAt: string;
  n: number;        // nº de posts com métricas analisados
  summary: string;  // regras/padrões acionáveis
  ackAt?: string;   // quando o Cândido revisou/integrou este aprendizado (recolhe o painel)
}

export async function getLearnings(): Promise<Learnings | null> {
  const { data } = await sb.from("kv").select("value").eq("key", "learnings").maybeSingle();
  return (data?.value as Learnings) || null;
}

export async function setLearnings(l: Learnings): Promise<void> {
  const { error } = await sb.from("kv").upsert({ key: "learnings", value: l });
  if (error) console.error("setLearnings", error.message);
}
// Cândido revisou e integrou o aprendizado atual → marca QUAL aprendizado (pelo updatedAt) foi integrado.
// (guardar o updatedAt em vez de "agora" evita bug de relógio: integrado = ackAt === updatedAt)
export async function ackLearnings(): Promise<Learnings | null> {
  const cur = await getLearnings();
  if (!cur) return null;
  const updated = { ...cur, ackAt: cur.updatedAt };
  await setLearnings(updated);
  return updated;
}

// ---- VOZ: exemplos-ouro (carrosséis/cards que o Cândido confirma serem a voz dele) ----
export interface GoldExample { text: string; createdAt: string; note?: string; registro?: string }

export async function getGold(): Promise<GoldExample[]> {
  const { data } = await sb.from("kv").select("value").eq("key", "gold_voice").maybeSingle();
  return (data?.value as GoldExample[]) || [];
}
export async function addGold(text: string, note?: string, registro?: string): Promise<void> {
  const cur = await getGold();
  cur.unshift({ text: text.slice(0, 2800).trim(), createdAt: new Date().toISOString(), note, registro: registro || undefined });
  const { error } = await sb.from("kv").upsert({ key: "gold_voice", value: cur.slice(0, 40) });
  if (error) console.error("addGold", error.message);
}
export async function setGold(arr: GoldExample[]): Promise<void> {
  const { error } = await sb.from("kv").upsert({ key: "gold_voice", value: arr });
  if (error) console.error("setGold", error.message);
}

// ---- GANCHOS-OURO: capas aprovadas pelo Cândido (a IA usa como régua de capa forte) ----
export interface HookGold { capa: string; createdAt: string }
export async function getGoldHooks(): Promise<HookGold[]> {
  const { data } = await sb.from("kv").select("value").eq("key", "gold_hooks").maybeSingle();
  return (data?.value as HookGold[]) || [];
}
export async function addGoldHook(capa: string): Promise<void> {
  const cur = await getGoldHooks();
  const clean = (capa || "").replace(/\*\*/g, "").trim().slice(0, 200);
  if (!clean || cur.some((h) => h.capa === clean)) return; // sem duplicata
  cur.unshift({ capa: clean, createdAt: new Date().toISOString() });
  const { error } = await sb.from("kv").upsert({ key: "gold_hooks", value: cur.slice(0, 80) });
  if (error) console.error("addGoldHook", error.message);
}
export async function deleteGoldHook(createdAt: string): Promise<void> {
  const cur = await getGoldHooks();
  const { error } = await sb.from("kv").upsert({ key: "gold_hooks", value: cur.filter((h) => h.createdAt !== createdAt) });
  if (error) console.error("deleteGoldHook", error.message);
}

// ---- ANTI-OURO: o que o Cândido REJEITOU (a IA aprende o que NÃO fazer — inverso do ouro) ----
export type RejectKind = "pauta" | "hook" | "voice";
export interface Reject { kind: RejectKind; text: string; registro?: string; createdAt: string }
export async function getRejects(kind?: RejectKind): Promise<Reject[]> {
  const { data } = await sb.from("kv").select("value").eq("key", "rejects").maybeSingle();
  const all = (data?.value as Reject[]) || [];
  return kind ? all.filter((r) => r.kind === kind) : all;
}
export async function addReject(kind: RejectKind, text: string, registro?: string): Promise<void> {
  const { data } = await sb.from("kv").select("value").eq("key", "rejects").maybeSingle();
  const cur = (data?.value as Reject[]) || [];
  cur.unshift({ kind, text: (text || "").slice(0, 600).trim(), registro: registro || undefined, createdAt: new Date().toISOString() });
  const { error } = await sb.from("kv").upsert({ key: "rejects", value: cur.slice(0, 60) });
  if (error) console.error("addReject", error.message);
}
export async function deleteReject(createdAt: string): Promise<void> {
  const { data } = await sb.from("kv").select("value").eq("key", "rejects").maybeSingle();
  const cur = (data?.value as Reject[]) || [];
  const { error } = await sb.from("kv").upsert({ key: "rejects", value: cur.filter((r) => r.createdAt !== createdAt) });
  if (error) console.error("deleteReject", error.message);
}

// ---- STORY POSTS: rascunhos, publicados e base de aprendizado ----
export interface StoryFrame {
  tipo?: string; mostrar?: string; texto?: string; fundo_tipo?: string;
  posicao_texto?: string; sugestao_visual?: string;
  figurinha?: { tipo: string; pergunta?: string; opcoes?: string[] } | null;
  cta?: string | null;
}
export interface StoryPost {
  id: string;
  titulo: string;
  frames: StoryFrame[];
  dica?: string;
  periodo?: string;          // "manha" | "tarde" | "noite" | undefined (avulso)
  createdAt: string;
  updatedAt: string;
  stage: "rascunho" | "publicado" | "arquivado";
  isBase?: boolean;          // salvo como referência de ouro para geração futura
  feedback?: string;         // o que achei deste story depois de postar
  engajamento?: string;      // como performou (livre: "5 DMs", "muita caixinha", etc.)
}

export async function listStoryPosts(): Promise<StoryPost[]> {
  const { data } = await sb.from("kv").select("value").eq("key", "story_posts").maybeSingle();
  return (data?.value as StoryPost[]) || [];
}
export async function upsertStoryPost(post: StoryPost): Promise<StoryPost> {
  const cur = await listStoryPosts();
  const idx = cur.findIndex(p => p.id === post.id);
  if (idx >= 0) cur[idx] = { ...cur[idx], ...post, updatedAt: new Date().toISOString() };
  else cur.unshift({ ...post, updatedAt: new Date().toISOString() });
  const { error } = await sb.from("kv").upsert({ key: "story_posts", value: cur.slice(0, 200) });
  if (error) console.error("upsertStoryPost", error.message);
  return post;
}
export async function deleteStoryPost(id: string): Promise<void> {
  const cur = await listStoryPosts();
  const { error } = await sb.from("kv").upsert({ key: "story_posts", value: cur.filter(p => p.id !== id) });
  if (error) console.error("deleteStoryPost", error.message);
}

// Posts marcados como "base" e com feedback positivo alimentam o aprendizado do gerador
export interface StoryLearnings { updatedAt: string; n: number; summary: string }
export async function getStoryLearnings(): Promise<StoryLearnings | null> {
  const { data } = await sb.from("kv").select("value").eq("key", "story_learnings").maybeSingle();
  return (data?.value as StoryLearnings) || null;
}
export async function setStoryLearnings(l: StoryLearnings): Promise<void> {
  await sb.from("kv").upsert({ key: "story_learnings", value: l });
}

// ---- ESTILO DOS STORIES (referência de estilo/formato que o gerador de stories segue) ----
// Texto livre calibrado pelos prints + arquivo base do Cândido. Editável na aba Stories.
export async function getStoriesStyle(): Promise<string> {
  const { data } = await sb.from("kv").select("value").eq("key", "stories_style").maybeSingle();
  const v = data?.value as { text?: string } | null;
  return v?.text?.trim() || "";
}
export async function setStoriesStyle(text: string): Promise<void> {
  const { error } = await sb.from("kv").upsert({ key: "stories_style", value: { text: (text || "").slice(0, 8000) } });
  if (error) console.error("setStoriesStyle", error.message);
}

// ---- REELS ----
export type ReelFormato = "falado" | "conversa" | "pov_trend";
export interface ReelIdea {
  id: string;
  titulo: string;
  descricao: string;
  formato: ReelFormato;
  angulo: string;
  dicaGravacao: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  stage: "novo" | "rascunho" | "gravado" | "publicado" | "descartado";
  isBase?: boolean;
  feedback?: string;
  engajamento?: string;
}
export async function listReelIdeas(): Promise<ReelIdea[]> {
  const { data } = await sb.from("kv").select("value").eq("key", "reel_ideas").maybeSingle();
  return (data?.value as ReelIdea[]) || [];
}
export async function upsertReelIdea(idea: ReelIdea): Promise<ReelIdea> {
  return (await batchUpsertReelIdeas([idea]))[0];
}
export async function batchUpsertReelIdeas(ideas: ReelIdea[]): Promise<ReelIdea[]> {
  const now = new Date().toISOString();
  const cur = await listReelIdeas();
  for (const idea of ideas) {
    const idx = cur.findIndex(p => p.id === idea.id);
    if (idx >= 0) cur[idx] = { ...cur[idx], ...idea, updatedAt: now };
    else cur.unshift({ ...idea, updatedAt: now });
  }
  const { error } = await sb.from("kv").upsert({ key: "reel_ideas", value: cur.slice(0, 300) });
  if (error) console.error("batchUpsertReelIdeas", error.message);
  return ideas;
}
export async function deleteReelIdea(id: string): Promise<void> {
  const cur = await listReelIdeas();
  const { error } = await sb.from("kv").upsert({ key: "reel_ideas", value: cur.filter(p => p.id !== id) });
  if (error) console.error("deleteReelIdea", error.message);
}
export interface ReelLearnings { updatedAt: string; n: number; summary: string }
export async function getReelLearnings(): Promise<ReelLearnings | null> {
  const { data } = await sb.from("kv").select("value").eq("key", "reel_learnings").maybeSingle();
  return (data?.value as ReelLearnings) || null;
}
export async function setReelLearnings(l: ReelLearnings): Promise<void> {
  await sb.from("kv").upsert({ key: "reel_learnings", value: l });
}

// ---- OURO DE DIAGRAMAÇÃO: carrosséis cujo RITMO de layout o Cândido aprovou (ensina o fatiador) ----
export interface GoldSlice { pattern: string; tema?: string; createdAt: string }
export async function getGoldSlices(): Promise<GoldSlice[]> {
  const { data } = await sb.from("kv").select("value").eq("key", "gold_slices").maybeSingle();
  return (data?.value as GoldSlice[]) || [];
}
export async function addGoldSlice(pattern: string, tema?: string): Promise<void> {
  const { data } = await sb.from("kv").select("value").eq("key", "gold_slices").maybeSingle();
  const cur = (data?.value as GoldSlice[]) || [];
  cur.unshift({ pattern: (pattern || "").slice(0, 600).trim(), tema: tema || undefined, createdAt: new Date().toISOString() });
  const { error } = await sb.from("kv").upsert({ key: "gold_slices", value: cur.slice(0, 20) });
  if (error) console.error("addGoldSlice", error.message);
}

// ---- ESTRUTURA: arcos/esqueletos validados por métrica (separado de voz e de ciência) ----
export interface GoldStructure { outline: string; hook?: string; emotions?: string[]; tema?: string; score?: number; note?: string; registro?: string; createdAt: string }

export async function getGoldStructures(): Promise<GoldStructure[]> {
  const { data } = await sb.from("kv").select("value").eq("key", "gold_structures").maybeSingle();
  return (data?.value as GoldStructure[]) || [];
}
export async function addGoldStructure(s: Omit<GoldStructure, "createdAt">): Promise<void> {
  const cur = await getGoldStructures();
  cur.unshift({ ...s, outline: (s.outline || "").slice(0, 2000), createdAt: new Date().toISOString() });
  const { error } = await sb.from("kv").upsert({ key: "gold_structures", value: cur.slice(0, 30) });
  if (error) console.error("addGoldStructure", error.message);
}
export async function setGoldStructures(arr: GoldStructure[]): Promise<void> {
  const { error } = await sb.from("kv").upsert({ key: "gold_structures", value: arr });
  if (error) console.error("setGoldStructures", error.message);
}

// ---- RÉGUA DA MARCA editável (público + aresta). Fallback = constantes do código. ----
async function getBrainText(k: string): Promise<string | null> {
  const { data } = await sb.from("kv").select("value").eq("key", k).maybeSingle();
  const v = data?.value as { text?: string } | null;
  return v?.text?.trim() || null;
}
export async function getAudience(): Promise<string> { return (await getBrainText("brain_audience")) || DEFAULT_AUDIENCE; }
export async function getEdge(): Promise<string> { return (await getBrainText("brain_edge")) || DEFAULT_EDGE; }
export async function setAudience(text: string): Promise<void> { await sb.from("kv").upsert({ key: "brain_audience", value: { text } }); }
export async function setEdge(text: string): Promise<void> { await sb.from("kv").upsert({ key: "brain_edge", value: { text } }); }
export const DEFAULTS = { audience: DEFAULT_AUDIENCE, edge: DEFAULT_EDGE };

// ---- MODELO DE MARCA estruturado (Grande Tese, Inimigo, Pilares, Temas) ----
// Ancora pautas e (futuramente, com aval do Cândido) a geração. NÃO substitui o pipeline de escrita.
export interface BrainModel {
  grandeTese: string;   // a crença central que permeia tudo
  inimigo: string;      // o inimigo cultural que o conteúdo combate
  pilares: string[];    // teses secundárias = pilares de conteúdo
  temas: string[];      // territórios temáticos que o Cândido domina
  historia: string;     // a HISTÓRIA real do Cândido — material pra ancorar conteúdo de marca pessoal (não inventar)
}
// HISTÓRIA pessoal real do Cândido Netto (1ª pessoa). Material pra IA ancorar conteúdo de marca
// pessoal — NUNCA inventar; usar só quando o post pedir história/vivência. Editável na aba Marca.
const DEFAULT_HISTORIA = `1. DE ONDE EU VIM
O esporte sempre esteve presente na minha vida. Muito antes de pensar em ser treinador, eu queria ser jogador de futebol. Durante anos esse foi o plano. Eu era aquele moleque que vivia o esporte, respirava esporte e acreditava que o futuro seria dentro de campo. Tanto que saí de Teresina pra morar em Jundiaí buscando essa oportunidade. Na minha cabeça aquilo era o que eu faria pelo resto da vida. Mas nem sempre a vida segue o caminho que a gente desenha. Uma lesão no joelho mudou completamente meus planos. E pela primeira vez eu precisei pensar em quem eu seria sem o futebol.

2. A ESCOLHA DA PROFISSÃO
Quando chegou a hora de escolher uma profissão eu estava dividido. Gostava de tecnologia, de cálculo, de engenharia. Sempre fui muito curioso e apaixonado por aprender coisa nova. Mas existia uma coisa que me acompanhava desde criança: o esporte. Foi isso que me levou pra Educação Física. Não porque eu sonhava em trabalhar com musculação, muito menos com treinamento feminino. Na verdade eu queria continuar ligado ao futebol de alguma forma.

3. O PRIMEIRO CHOQUE DE REALIDADE
Logo no começo da faculdade apareceu uma oportunidade pra trabalhar numa escolinha de futebol. Era exatamente o caminho que eu imaginava seguir. Mas bastaram poucos meses pra perceber que aquilo não era o que eu queria pra minha vida. A realidade era muito diferente da expectativa. Foi nesse momento que surgiu uma oportunidade dentro de academia. E eu resolvi aceitar, sem imaginar que aquela decisão mudaria completamente minha trajetória.

4. O QUE MUDOU TUDO
Dentro da academia eu comecei a perceber uma coisa curiosa: as mulheres me procuravam mais. Confiavam mais em mim. Tinham mais liberdade pra conversar comigo. Enquanto muitos profissionais tinham dificuldade de se conectar com elas, pra mim aquilo acontecia de forma natural. Hoje eu entendo o motivo. Eu cresci cercado por mulheres: minha mãe, minha irmã, minhas tias. Minha vida inteira foi dentro desse ambiente. Sem perceber, eu aprendi a ouvir melhor, a entender melhor, a enxergar detalhes que muitos profissionais ignoravam. E isso acabou se tornando uma das minhas maiores vantagens.

5. QUANDO ENCONTREI MEU PROPÓSITO
Quanto mais mulheres eu atendia, mais eu percebia um padrão. Elas treinavam, se esforçavam, frequentavam a academia, mas não sabiam exatamente o que estavam fazendo. Viviam frustradas. Achavam que eram fracas, que tinham genética ruim, que o problema estava nelas. Quando muitas vezes o problema era apenas falta de orientação. Aquilo me incomodava, porque eu via mulheres extremamente dedicadas colocando energia na direção errada. Foi nesse momento que comecei a aprofundar meus estudos: hipertrofia, biomecânica, treinamento feminino, glúteos, progressão de carga, composição corporal. Eu queria entender por que algumas mulheres evoluíam tanto e outras passavam anos sem resultado.

6. O PERÍODO QUE MAIS ME MARCOU
Quando eu ainda era estagiário, muita gente zombava de mim. Falavam que eu queria ser o sabichão, que eu inventava moda, que eu complicava as coisas, que eu queria aparecer. Eu escutava tudo isso enquanto estudava mais do que qualquer um ao meu redor. O curioso é que as mesmas coisas que diziam ser invenção começaram a gerar resultado. Minhas alunas evoluíam. Os feedbacks apareciam. Os resultados apareciam. E aos poucos as críticas foram desaparecendo. Essa fase me ensinou uma coisa que levo até hoje: resultado sempre fala mais alto do que opinião.

7. O ERRO QUE MAIS ME ENSINOU
Durante minha trajetória eu também cometi erros. Perdi alunos que eu gostaria de ter mantido por perto. Não porque faltava conhecimento, não porque faltava resultado, mas porque deixei brechas no atendimento. Isso me marcou profundamente, porque me fez entender que transformação física não é apenas treino e dieta. Pessoas precisam se sentir acompanhadas, cuidadas, sentir que existe alguém ao lado delas durante o processo. Desde então eu passei a enxergar atendimento de uma forma completamente diferente.

8. QUEM EU SOU HOJE
Hoje eu sou um treinador especializado em mulheres. Mas acima disso, sou alguém que acredita que mulheres são muito mais fortes do que imaginam. Todos os dias eu vejo mulheres chegando inseguras, achando que não têm força, que não conseguem, que não nasceram pra ter resultado. E todos os dias eu vejo essas mesmas mulheres fazendo coisas que jamais imaginavam ser capazes. É por isso que continuo fazendo o que faço. Não é apenas sobre construir glúteos: é sobre construir confiança, é sobre mostrar pra uma mulher que ela é capaz de muito mais do que acredita quando entra pela primeira vez na academia. E isso continua sendo a parte mais gratificante do meu trabalho.`;
export const DEFAULT_MODEL: BrainModel = {
  grandeTese: "Mulheres são muito mais fortes do que acreditam. A maioria nunca descobre isso porque passou anos recebendo informação errada sobre treino, força, emagrecimento e hipertrofia. Quando uma mulher aprende a treinar de verdade, entende progressão e para de procurar atalho, ela constrói o físico que deseja — e muda também a forma como se enxerga: força, confiança, autonomia e orgulho da própria evolução. Resultado não vem de exercício mágico nem de método milagroso; vem da combinação entre treino estruturado, progressão, consistência e direcionamento correto.",
  inimigo: "A desinformação no treinamento feminino e tudo que vende ilusão no lugar de resultado: promessa milagrosa de transformação rápida, método que vende atalho, treino montado sem lógica nem progressão, a ideia de que mulher é fraca ou que precisa treinar leve pra 'não ficar masculinizada', a crença de que genética explica tudo, a caça eterna ao próximo exercício milagroso, o profissional que vende ilusão em vez de ensinar, o conteúdo que gera confusão em vez de clareza, e a cultura fitness que faz a mulher achar que precisa sofrer, cansar ou suar mais pra ter resultado estético. Porque na prática o corpo responde a princípios — e princípio não sai de moda.",
  historia: DEFAULT_HISTORIA,
  pilares: [
    "Hipertrofia de glúteos sem mitos.",
    "Mulheres são mais fortes do que imaginam.",
    "Progressão é o que gera resultado.",
    "Treino feminino sem desinformação.",
    "Execução e técnica aplicada à hipertrofia.",
    "Erros que impedem a evolução estética.",
    "Composição corporal e construção de físico.",
    "Como pensar o treino de forma inteligente.",
    "Comportamentos que sabotam resultados.",
    "Confiança construída através da evolução física.",
    "Opinião clara como combustível de comunidade — tomar posição firme sobre crença do nicho cria pertencimento real.",
    "Frequência e desdobramento como estratégia — uma ideia vira múltiplos formatos; aparecer todo dia supera viralizar uma vez.",
    "Alcance qualificado acima de alcance amplo — atingir as pessoas certas vale mais que atingir muitas.",
  ],
  temas: [
    "Treinamento feminino",
    "Desenvolvimento de glúteos",
    "Hipertrofia muscular",
    "Biomecânica aplicada ao treino",
    "Execução de exercícios",
    "Progressão de carga e prescrição de treino",
    "Emagrecimento e composição corporal",
    "Comportamento, adesão e erros comuns de mulheres que treinam",
  ],
};
export async function getBrainModel(): Promise<BrainModel> {
  const { data } = await sb.from("kv").select("value").eq("key", "brain_model").maybeSingle();
  const v = data?.value as Partial<BrainModel> | null;
  if (!v) return DEFAULT_MODEL;
  return {
    grandeTese: v.grandeTese?.trim() || DEFAULT_MODEL.grandeTese,
    inimigo: v.inimigo?.trim() || DEFAULT_MODEL.inimigo,
    pilares: Array.isArray(v.pilares) && v.pilares.length ? v.pilares : DEFAULT_MODEL.pilares,
    temas: Array.isArray(v.temas) && v.temas.length ? v.temas : DEFAULT_MODEL.temas,
    historia: v.historia?.trim() || DEFAULT_MODEL.historia,
  };
}
// ---- PLANO DA SEMANA (diretriz proativa: qual registro em cada dia) ----
export type WeekPlan = (Registro | "")[]; // 7 posições, índice = Date.getDay() (0=domingo)
export const DEFAULT_WEEK: WeekPlan = ["convocacao", "porrada", "", "ferida", "", "ensino", ""];
export async function getWeekPlan(): Promise<WeekPlan> {
  const { data } = await sb.from("kv").select("value").eq("key", "week_plan").maybeSingle();
  const v = data?.value as WeekPlan | null;
  return Array.isArray(v) && v.length === 7 ? v : DEFAULT_WEEK;
}
export async function setWeekPlan(plan: WeekPlan): Promise<void> {
  const clean = Array.from({ length: 7 }, (_, i) => (plan[i] || "")) as WeekPlan;
  const { error } = await sb.from("kv").upsert({ key: "week_plan", value: clean });
  if (error) console.error("setWeekPlan", error.message);
}

export async function setBrainModel(m: BrainModel): Promise<void> {
  const clean: BrainModel = {
    grandeTese: (m.grandeTese || "").trim(),
    inimigo: (m.inimigo || "").trim(),
    pilares: (m.pilares || []).map((p) => p.trim()).filter(Boolean).slice(0, 30),
    temas: (m.temas || []).map((t) => t.trim()).filter(Boolean).slice(0, 30),
    historia: (m.historia || "").trim().slice(0, 8000),
  };
  const { error } = await sb.from("kv").upsert({ key: "brain_model", value: clean });
  if (error) console.error("setBrainModel", error.message);
}

// ---- GUARDA DE FRESCOR: o que já foi usado (pontes/figuras), pra não repetir ----
export interface FreshItem { label: string; date: string }
export async function getFreshness(): Promise<FreshItem[]> {
  const { data } = await sb.from("kv").select("value").eq("key", "freshness").maybeSingle();
  return (data?.value as FreshItem[]) || [];
}
export async function addFreshness(label: string): Promise<void> {
  const l = (label || "").trim().slice(0, 90);
  if (!l) return;
  const cur = await getFreshness();
  cur.unshift({ label: l, date: new Date().toISOString() });
  await sb.from("kv").upsert({ key: "freshness", value: cur.slice(0, 50) });
}
export async function recentFreshLabels(days = 30): Promise<string[]> {
  const cutoff = Date.now() - days * 86400000;
  return (await getFreshness()).filter((f) => new Date(f.date).getTime() > cutoff).map((f) => f.label);
}

// ---- FONTES (base de conhecimento — PDFs/artigos pra embasar o conteúdo) ----
export interface Source {
  id: string;
  title: string;
  kind?: string;        // pdf | texto | url
  url?: string;
  content: string;      // texto extraído
  tags?: string;
  createdAt?: string;
}

// lista sem o texto completo (payload leve pra UI). Pros livros, conta os trechos indexados.
export async function listSources(): Promise<(Omit<Source, "content"> & { chars: number; chunks?: number })[]> {
  const { data, error } = await sb.from("sources").select("id,title,kind,url,tags,created_at,content").order("created_at", { ascending: false });
  if (error || !data) { if (error) console.error("listSources", error.message); return []; }
  // conta os trechos dos livros EM PARALELO (antes era um await por livro, em série — N+1 sequencial)
  const counts = await Promise.all(
    data.map(async (r) =>
      r.kind === "livro"
        ? (await sb.from("book_chunks").select("id", { count: "exact", head: true }).eq("source_id", r.id)).count || 0
        : undefined
    )
  );
  return data.map((r, i) => ({ id: r.id, title: r.title, kind: r.kind, url: r.url, tags: r.tags, createdAt: r.created_at, chars: (r.content || "").length, chunks: counts[i] }));
}

export async function getSourcesByIds(ids: string[]): Promise<Source[]> {
  if (!ids.length) return [];
  const { data } = await sb.from("sources").select("id,title,kind,url,content,tags,created_at").in("id", ids);
  return (data || []).map((r) => ({ ...r, createdAt: r.created_at })) as Source[];
}

export async function upsertSource(s: Source): Promise<Source> {
  const excerpt = (s.content || "").replace(/\s+/g, " ").trim().slice(0, 1500);
  const { error } = await sb.from("sources").upsert({
    id: s.id, title: s.title, kind: s.kind || "texto", url: s.url || null,
    content: s.content, excerpt, tags: s.tags || null, created_at: s.createdAt || new Date().toISOString(),
  });
  if (error) console.error("upsertSource", error.message);
  return s;
}

export async function deleteSource(id: string): Promise<void> {
  const { error } = await sb.from("sources").delete().eq("id", id);
  if (error) console.error("deleteSource", error.message);
}

// Busca semântica nos livros indexados (RAG) — retorna os trechos mais relevantes ao tema.
export async function searchBooks(queryEmbedding: number[], k = 10): Promise<{ content: string }[]> {
  const { data, error } = await sb.rpc("match_book_chunks", { query_embedding: queryEmbedding, match_count: k });
  if (error) { console.error("searchBooks", error.message); return []; }
  return (data || []) as { content: string }[];
}

// Conhecimento de fundo: recortes de TODAS as fontes da biblioteca (sempre injetado na geração).
export async function sourcesBackground(totalBudget = 8000): Promise<string> {
  // exclui os livros já indexados (kind=livro) — eles entram pela busca por trecho (RAG), não pelo "fundo"
  const { data, error } = await sb.from("sources").select("title,excerpt,content").neq("kind", "livro").order("created_at", { ascending: false });
  if (error || !data?.length) return "";
  const parts: string[] = [];
  let budget = totalBudget;
  for (const r of data) {
    if (budget <= 0) break;
    const txt = (r.excerpt || r.content || "").slice(0, Math.min(1500, budget));
    if (!txt) continue;
    parts.push(`• ${r.title}: ${txt}`);
    budget -= txt.length;
  }
  return parts.join("\n");
}
