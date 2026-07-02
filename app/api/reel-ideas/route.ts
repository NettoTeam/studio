import { listReelIdeas, upsertReelIdea, batchUpsertReelIdeas, deleteReelIdea } from "@/lib/store";
import type { ReelIdea } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const ideas = await listReelIdeas();
  return Response.json({ ideas });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ReelIdea | ReelIdea[] | null;
  if (!body) return Response.json({ error: "body obrigatório" }, { status: 400 });

  // Batch: array de ideias
  if (Array.isArray(body)) {
    const valid = body.filter(i => i?.id);
    if (!valid.length) return Response.json({ error: "nenhuma ideia válida" }, { status: 400 });
    const saved = await batchUpsertReelIdeas(valid);
    return Response.json({ ideas: saved });
  }

  // Single
  if (!body.id) return Response.json({ error: "id obrigatório" }, { status: 400 });
  const saved = await upsertReelIdea(body);
  return Response.json({ idea: saved });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id obrigatório" }, { status: 400 });
  await deleteReelIdea(id);
  return Response.json({ ok: true });
}
