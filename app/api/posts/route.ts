import { listPosts, upsertPost, deletePost } from "@/lib/store";
import type { Post } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const posts = await listPosts();
  // GATILHO agendado → publicado: todo post agendado cuja data JÁ PASSOU vira publicado sozinho.
  // (roda em toda leitura — auto-corrige o quadro/calendário sem precisar de cron)
  const t = new Date();
  const hoje = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  const promovidos: Post[] = [];
  for (const p of posts) {
    if (p.stage === "agendado" && p.scheduledAt && p.scheduledAt < hoje) {
      p.stage = "publicado";
      p.metrics = { ...(p.metrics || {}), postedAt: p.metrics?.postedAt || p.scheduledAt }; // conta no mês certo (A Dose)
      promovidos.push(p);
    }
  }
  if (promovidos.length) await Promise.all(promovidos.map(upsertPost));
  return Response.json({ posts });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Post>;
  if (!body.carousel) return Response.json({ error: "carousel obrigatório" }, { status: 400 });
  const post: Post = {
    id: body.id || crypto.randomUUID(),
    createdAt: body.createdAt || new Date().toISOString(),
    tema: body.tema || body.carousel.tema || "Sem tema",
    templateId: body.templateId,
    tom: body.tom,
    carousel: body.carousel,
    metrics: body.metrics,
    feedback: body.feedback,
    analysis: body.analysis,
    stage: body.stage || "ideia",
    type: body.type || "carrossel",
    scheduledAt: body.scheduledAt,
    outline: body.outline,
    hook: body.hook,
    emotions: body.emotions,
    registro: body.registro,
    content: body.content,
    savedHook: body.savedHook,
  };
  await upsertPost(post);
  return Response.json({ post });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id obrigatório" }, { status: 400 });
  await deletePost(id);
  return Response.json({ ok: true });
}
