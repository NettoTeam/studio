import { listSources, upsertSource, deleteSource, type Source } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const rid = () => "src-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  return Response.json({ sources: await listSources() });
}

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";

  // PDF (multipart)
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "sem arquivo" }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    let text = "";
    try {
      const pdf = (await import("pdf-parse")).default;
      const out = await pdf(buf);
      text = (out.text || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    } catch (e) {
      return Response.json({ error: "Não consegui ler esse PDF: " + (e instanceof Error ? e.message : String(e)) }, { status: 422 });
    }
    if (!text) return Response.json({ error: "PDF sem texto extraível (pode ser imagem escaneada)." }, { status: 422 });
    const title = (form.get("title") as string) || file.name.replace(/\.pdf$/i, "");
    const s: Source = { id: rid(), title, kind: "pdf", content: text, tags: (form.get("tags") as string) || undefined };
    await upsertSource(s);
    return Response.json({ source: { id: s.id, title: s.title, chars: text.length } });
  }

  // texto colado ou URL (JSON)
  const body = (await req.json().catch(() => ({}))) as { title?: string; text?: string; url?: string; tags?: string };
  let content = (body.text || "").trim();
  let kind = "texto";
  let title = (body.title || "").trim();

  if (!content && body.url) {
    try {
      const res = await fetch(body.url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const html = await res.text();
      content = htmlToText(html);
      kind = "url";
      if (!title) { const m = html.match(/<title>([^<]+)<\/title>/i); title = m ? m[1].trim() : body.url; }
    } catch {
      return Response.json({ error: "Não consegui baixar essa URL." }, { status: 422 });
    }
  }

  if (!content) return Response.json({ error: "Manda um PDF, um texto ou uma URL." }, { status: 400 });
  if (!title) title = content.slice(0, 48) + "…";
  const s: Source = { id: rid(), title, kind, url: body.url, content, tags: body.tags };
  await upsertSource(s);
  return Response.json({ source: { id: s.id, title: s.title, chars: content.length } });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "sem id" }, { status: 400 });
  await deleteSource(id);
  return Response.json({ ok: true });
}
