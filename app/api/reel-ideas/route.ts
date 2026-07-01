import { listReelIdeas, upsertReelIdea, deleteReelIdea } from "@/lib/store";
import type { ReelIdea } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const ideas = await listReelIdeas();
  return Response.json({ ideas });
}

export async function POST(req: Request) {
  const idea = (await req.json().catch(() => null)) as ReelIdea | null;
  if (!idea?.id) return Response.json({ error: "id obrigatório" }, { status: 400 });
  const saved = await upsertReelIdea(idea);
  return Response.json({ idea: saved });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id obrigatório" }, { status: 400 });
  await deleteReelIdea(id);
  return Response.json({ ok: true });
}
