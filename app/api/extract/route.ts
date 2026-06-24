// Extrai texto de um PDF / URL / texto colado SEM salvar na biblioteca.
// Usado pela fonte pontual ("deste conteúdo") na tela Criar.
export const runtime = "nodejs";
export const maxDuration = 60;

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim();
}

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "sem arquivo" }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    try {
      const pdf = (await import("pdf-parse")).default;
      const out = await pdf(buf);
      const text = (out.text || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      if (!text) return Response.json({ error: "PDF sem texto (pode ser escaneado)." }, { status: 422 });
      return Response.json({ text, title: file.name.replace(/\.pdf$/i, "") });
    } catch (e) {
      return Response.json({ error: "Não li o PDF: " + (e instanceof Error ? e.message : String(e)) }, { status: 422 });
    }
  }

  const body = (await req.json().catch(() => ({}))) as { text?: string; url?: string };
  if (body.text?.trim()) return Response.json({ text: body.text.trim() });
  if (body.url) {
    try {
      const res = await fetch(body.url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const html = await res.text();
      const m = html.match(/<title>([^<]+)<\/title>/i);
      return Response.json({ text: htmlToText(html), title: m ? m[1].trim() : body.url });
    } catch {
      return Response.json({ error: "Não baixei a URL." }, { status: 422 });
    }
  }
  return Response.json({ error: "Manda um PDF, texto ou URL." }, { status: 400 });
}
