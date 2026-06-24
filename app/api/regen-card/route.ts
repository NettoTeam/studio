import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM } from "@/lib/n2squad";
import { textOf, extractJson, pickRandom } from "@/lib/llm";
import { sentimentMenu, resolveImage, coverPhoto } from "@/lib/catalog";
import type { Card, Carousel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Sem ANTHROPIC_API_KEY." }, { status: 500 });

  const body = (await req.json()) as { carousel: Carousel; index: number; instruction?: string; tom?: string };
  const { carousel, index } = body;
  if (!carousel || index == null || !carousel.cards[index]) {
    return Response.json({ error: "carousel/index inválido" }, { status: 400 });
  }

  const menu = await sentimentMenu();
  const ctx = carousel.cards.map((c, i) => ({
    i, layout: c.layout, headline: c.headline,
    body: c.body ? c.body.slice(0, 100) : undefined, bullets: c.bullets,
    ALVO: i === index ? "<<< REESCREVER ESTE" : undefined,
  }));

  const { getLearnings, getGold } = await import("@/lib/store");
  const learnings = await getLearnings();
  const learnBlock = learnings?.summary
    ? `\n\nAPRENDIZADO DOS SEUS DADOS (aplique pra acertar mais):\n${learnings.summary}`
    : "";
  const gold = await getGold();
  const pickedGold = pickRandom(gold, 2);
  const goldBlock = pickedGold.length
    ? `\n\nA VOZ DO CÂNDIDO — COMO ELE ESCREVE (imite a CADÊNCIA: frases curtas e quebradas, perguntas que cutucam, firmeza sem palavrão, fecho na verdade incômoda). NÃO copie o tema nem a estrutura — só o jeito de escrever:\n${pickedGold.map((g, i) => `### exemplo ${i + 1}\n${g.text}`).join("\n\n")}`
    : "";

  const userMsg = `Tom: ${body.tom || "técnico"}.
SENTIMENTOS (imageSentiment): ${menu}

Carrossel atual (resumo de cada card):
${JSON.stringify(ctx)}

Reescreva APENAS o card de índice ${index}, mantendo coerência com os outros, a voz e o design do Cândido Netto (Team Netto · N² Squad).${body.instruction ? " INSTRUÇÃO: " + body.instruction : ""}${learnBlock}${goldBlock}

Devolva SÓ um objeto JSON de UM card (sem array, sem "tema", sem markdown):
{"layout": string, "kicker"?: string, "headline"?: string, "body"?: string, "bullets"?: string[], "stats"?: [{"value":string,"label":string}], "source"?: string, "signoff"?: string, "imageSentiment"?: string, "focalX"?: number, "focalY"?: number}`;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMsg }],
    });
    const card = JSON.parse(extractJson(textOf(res))) as Card;

    if (card.layout === "cover") card.image = (await coverPhoto()) || card.image;
    else if (card.imageSentiment) card.image = (await resolveImage(card.imageSentiment)) || card.image;

    return Response.json({ card, usage: res.usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
