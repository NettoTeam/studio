// Registra que você NÃO gostou de uma pauta/gancho/voz — a IA aprende o que NÃO fazer.
import { addReject, getRejects, deleteReject, type RejectKind } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const kindParam = new URL(req.url).searchParams.get("kind");
  const kind = (["pauta", "hook", "voice"] as const).includes(kindParam as RejectKind) ? (kindParam as RejectKind) : undefined;
  return Response.json({ rejects: await getRejects(kind) });
}

export async function DELETE(req: Request) {
  const at = new URL(req.url).searchParams.get("at");
  if (!at) return Response.json({ error: "Falta o parâmetro 'at'." }, { status: 400 });
  await deleteReject(at);
  return Response.json({ ok: true });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { kind?: string; text?: string; registro?: string };
  const kind = (["pauta", "hook", "voice"] as const).includes(body.kind as RejectKind) ? (body.kind as RejectKind) : null;
  const text = (body.text || "").trim();
  if (!kind || !text) return Response.json({ error: "Falta kind ou text." }, { status: 400 });
  try {
    await addReject(kind, text, body.registro);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
