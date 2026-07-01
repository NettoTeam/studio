// CRUD de story posts (rascunho / publicado / arquivado / base).
import { listStoryPosts, upsertStoryPost, deleteStoryPost } from "@/lib/store";
import type { StoryPost } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const posts = await listStoryPosts();
  return Response.json({ posts });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<StoryPost>;
  if (!body.titulo || !body.frames) return Response.json({ error: "titulo e frames são obrigatórios." }, { status: 400 });
  const now = new Date().toISOString();
  const post: StoryPost = {
    id: body.id || `sp_${Date.now()}`,
    titulo: body.titulo,
    frames: body.frames,
    dica: body.dica,
    periodo: body.periodo,
    stage: body.stage || "rascunho",
    isBase: body.isBase || false,
    feedback: body.feedback,
    engajamento: body.engajamento,
    createdAt: body.createdAt || now,
    updatedAt: now,
  };
  await upsertStoryPost(post);
  return Response.json({ post });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  if (!id) return Response.json({ error: "id obrigatório." }, { status: 400 });
  await deleteStoryPost(id);
  return Response.json({ ok: true });
}
