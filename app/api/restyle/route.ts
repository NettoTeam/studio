// Redesenhar com IA: o Cândido descreve o visual que quer e a IA devolve um
// pacote de ESTILO (cores, fontes, sombra, fundo, alinhamento) — SEM tocar no texto.
export const runtime = "nodejs";
export const maxDuration = 45;
const OPENAI_MODEL = process.env.OPENAI_JUDGE_MODEL || "gpt-4o-mini";

// Campos de estilo que a IA pode setar (nunca texto/conteúdo)
type Style = {
  bg?: string;
  titleColor?: string;
  bodyColor?: string;
  highlightColor?: string;
  signoffColor?: string;
  kickerColor?: string;
  titleFont?: string;
  bodyFont?: string;
  titleShadow?: number;
  bodyShadow?: number;
  titleAlign?: "left" | "center" | "right";
  bodyAlign?: "left" | "center" | "right";
  titleTracking?: number;
  titleLeading?: number;
  indexStyle?: string;
  tint?: { color: string; opacity: number };
  overlayColor?: string;
};

const FONTES = ["Anton", "Bebas Neue", "Montserrat", "Inter", "Oswald", "Archivo", "Playfair Display"];
const INDEX_STYLES = ["texto", "seta", "swipe", "pontos", "tracos", "pill", "minimo", "grande", "circulo", "barra", "pagina"];

function clampStyle(s: Style): Style {
  const hex = (v?: string) => (typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim()) ? v.trim() : undefined);
  const num = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : undefined);
  const font = (v?: string) => (FONTES.includes(v || "") ? v : undefined);
  const align = (v?: string) => (["left", "center", "right"].includes(v || "") ? (v as Style["titleAlign"]) : undefined);
  const out: Style = {};
  if (hex(s.bg)) out.bg = hex(s.bg);
  if (hex(s.titleColor)) out.titleColor = hex(s.titleColor);
  if (hex(s.bodyColor)) out.bodyColor = hex(s.bodyColor);
  if (hex(s.highlightColor)) out.highlightColor = hex(s.highlightColor);
  if (hex(s.signoffColor)) out.signoffColor = hex(s.signoffColor);
  if (hex(s.kickerColor)) out.kickerColor = hex(s.kickerColor);
  if (font(s.titleFont)) out.titleFont = font(s.titleFont);
  if (font(s.bodyFont)) out.bodyFont = font(s.bodyFont);
  const ts = num(s.titleShadow, 0, 1); if (ts != null) out.titleShadow = ts;
  const bs = num(s.bodyShadow, 0, 1); if (bs != null) out.bodyShadow = bs;
  if (align(s.titleAlign)) out.titleAlign = align(s.titleAlign);
  if (align(s.bodyAlign)) out.bodyAlign = align(s.bodyAlign);
  const tt = num(s.titleTracking, -2, 8); if (tt != null) out.titleTracking = tt;
  const tl = num(s.titleLeading, 0.8, 1.6); if (tl != null) out.titleLeading = tl;
  if (INDEX_STYLES.includes(s.indexStyle || "")) out.indexStyle = s.indexStyle;
  if (hex(s.overlayColor)) out.overlayColor = hex(s.overlayColor);
  if (s.tint && hex(s.tint.color)) {
    const op = num(s.tint.opacity, 0, 0.9);
    out.tint = { color: hex(s.tint.color)!, opacity: op ?? 0.4 };
  }
  return out;
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "OPENAI_API_KEY não configurada. Adicione a chave da OpenAI no .env.local e no Vercel." }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { instruction?: string; tema?: string; temFoto?: boolean };
  const instruction = (body.instruction || "").trim();
  if (instruction.length < 3) return Response.json({ error: "Descreve o visual que você quer." }, { status: 400 });

  const sys = `Você é diretor de arte de carrosséis do Instagram para uma marca fitness premium (treino feminino, glúteo). O usuário descreve o VISUAL que quer e você devolve um pacote de estilo que será aplicado a TODOS os cards. Você NUNCA muda o texto — só a estética.

Devolve SÓ um JSON com os campos que fizerem sentido pro pedido (omita o que não muda):
{
  "bg": "#hex (cor de fundo do card, em cards sem foto)",
  "titleColor": "#hex", "bodyColor": "#hex",
  "highlightColor": "#hex (cor do destaque/palavra em realce)",
  "signoffColor": "#hex (cor do CTA)", "kickerColor": "#hex",
  "titleFont": "uma de: Anton, Bebas Neue, Montserrat, Inter, Oswald, Archivo, Playfair Display",
  "bodyFont": "uma da mesma lista",
  "titleShadow": 0..1, "bodyShadow": 0..1,
  "titleAlign": "left|center|right", "bodyAlign": "left|center|right",
  "titleTracking": -2..8, "titleLeading": 0.8..1.6,
  "indexStyle": "texto|seta|swipe|pontos|tracos|pill|minimo|grande|circulo|barra|pagina",
  "tint": {"color":"#hex","opacity":0..0.9},
  "overlayColor": "#hex (sombra sobre a foto)"
}

Regras de bom gosto:
- Escolha uma paleta COERENTE (2 a 3 cores no máximo). Alto contraste pra legibilidade.
- Fundo escuro pede texto claro; fundo claro pede texto escuro.
- "dark/agressivo/darkside" = fundo bem escuro (#0a0a0c), destaque vermelho forte (#ef2b45), Anton/Oswald, sombra alta, tracking apertado.
- "clean/editorial/revista" = Playfair ou Montserrat, muito respiro, destaque sutil, sombra baixa, alinhamento à esquerda.
- "vibrante/energético" = cores saturadas no destaque, fundo escuro.
- Se tem foto no card, foca em tint/overlayColor/cores de texto (o fundo sólido some sob a foto).`;

  const user = `Tema do carrossel: "${body.tema || "post fitness"}"${body.temFoto ? " (os cards têm fotos)" : " (cards sem foto, fundo sólido)"}.
Pedido de visual: "${instruction}"

Devolve só o JSON de estilo.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || `OpenAI erro (${r.status})`);
    const raw = JSON.parse(d.choices?.[0]?.message?.content || "{}");
    const style = clampStyle(raw);
    if (!Object.keys(style).length) throw new Error("Não consegui montar o estilo. Descreve de outro jeito.");
    return Response.json({ style });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
