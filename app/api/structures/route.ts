// Estruturas-ouro: arcos/esqueletos validados por métrica (taxa de salvamento).
// Usados como molde do arco na passada 1 (estrutura), separados de voz e ciência.
import { getGoldStructures, addGoldStructure, setGoldStructures } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ structures: await getGoldStructures() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { outline?: string; hook?: string; emotions?: string[]; tema?: string; score?: number; note?: string; registro?: string };
  if (!body.outline?.trim()) return Response.json({ error: "sem esqueleto pra guardar" }, { status: 400 });
  await addGoldStructure({ outline: body.outline.trim(), hook: body.hook, emotions: body.emotions, tema: body.tema, score: body.score, note: body.note, registro: body.registro });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const i = Number(new URL(req.url).searchParams.get("i"));
  const cur = await getGoldStructures();
  if (Number.isInteger(i) && i >= 0 && i < cur.length) {
    cur.splice(i, 1);
    await setGoldStructures(cur);
  }
  return Response.json({ ok: true });
}
