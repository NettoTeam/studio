import { listSavedTemas, addSavedTema, deleteSavedTema } from "@/lib/store";
import type { SavedTema } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const temas = await listSavedTemas();
  return Response.json({ temas });
}

export async function POST(req: Request) {
  const t = (await req.json().catch(() => null)) as SavedTema | null;
  if (!t?.tema?.trim()) return Response.json({ error: "tema obrigatório" }, { status: 400 });
  const saved = await addSavedTema({
    id: t.id || `tm_${Date.now()}`,
    tema: t.tema.trim(),
    hook1: t.hook1,
    hook2: t.hook2,
    pilar: t.pilar,
    createdAt: t.createdAt || new Date().toISOString(),
  });
  return Response.json({ tema: saved });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id obrigatório" }, { status: 400 });
  await deleteSavedTema(id);
  return Response.json({ ok: true });
}
