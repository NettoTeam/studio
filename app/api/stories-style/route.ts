// Estilo/referência dos stories — o jeito que o Cândido curte fazer (calibrado pelos prints + arquivo base).
// Texto livre que é injetado na geração de stories. Editável na aba Stories.
import { getStoriesStyle, setStoriesStyle } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ text: await getStoriesStyle() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  await setStoriesStyle(typeof body.text === "string" ? body.text : "");
  return Response.json({ ok: true });
}
