import { getGoldHooks, addGoldHook, deleteGoldHook } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const hooks = await getGoldHooks();
  return Response.json({ hooks });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { capa?: string };
  const capa = (body.capa || "").trim();
  if (!capa) return Response.json({ error: "Manda a capa." }, { status: 400 });
  await addGoldHook(capa);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const body = (await req.json()) as { createdAt?: string };
  if (!body.createdAt) return Response.json({ error: "Manda o createdAt." }, { status: 400 });
  await deleteGoldHook(body.createdAt);
  return Response.json({ ok: true });
}
