// Exemplos-ouro de voz: cards/carrosséis que você confirma serem a voz da marca.
// Usados como few-shot na geração (alvo de imitação de cadência).
import { getGold, addGold, setGold } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ examples: await getGold() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { text?: string; note?: string; registro?: string };
  const text = (body.text || "").trim();
  if (!text) return Response.json({ error: "manda o texto do exemplo" }, { status: 400 });
  await addGold(text, body.note, body.registro);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const i = Number(new URL(req.url).searchParams.get("i"));
  const cur = await getGold();
  if (Number.isInteger(i) && i >= 0 && i < cur.length) {
    cur.splice(i, 1);
    await setGold(cur);
  }
  return Response.json({ ok: true });
}
