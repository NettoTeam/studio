// Registra que você NÃO gostou de uma pauta/gancho/voz — a IA aprende o que NÃO fazer.
import { addReject, type RejectKind } from "@/lib/store";

export const runtime = "nodejs";

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
