// Guarda o RITMO de diagramação de um carrossel que você aprovou — ensina o fatiador a variar layout.
import { addGoldSlice } from "@/lib/store";
import type { Carousel, Card } from "@/lib/types";

export const runtime = "nodejs";

// destila o carrossel num padrão curto e legível (sequência de layouts + papel de cada card)
function pattern(cards: Card[]): string {
  return cards.map((c, i) => {
    const tags: string[] = [];
    if (c.image) tags.push("foto");
    if (c.bullets?.length) tags.push("lista");
    if (c.stats?.length) tags.push("dados");
    if (c.overlays?.length) tags.push("overlay");
    return `${i + 1}.${c.layout}${tags.length ? "(" + tags.join("+") + ")" : ""}`;
  }).join(" → ");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { carousel?: Carousel; tema?: string };
  const cards = body.carousel?.cards;
  if (!cards?.length) return Response.json({ error: "Sem carrossel." }, { status: 400 });
  try {
    await addGoldSlice(pattern(cards), body.tema || body.carousel?.tema);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
