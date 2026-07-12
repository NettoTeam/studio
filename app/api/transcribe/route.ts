// Transcreve reels (áudio/vídeo) com o Whisper da OpenAI.
// Reels de 30s a 120s ficam bem dentro do limite de 25MB.
export const runtime = "nodejs";
export const maxDuration = 120;
const WHISPER_MODEL = process.env.OPENAI_WHISPER_MODEL || "whisper-1";
const MAX_BYTES = 25 * 1024 * 1024; // limite do Whisper

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "OPENAI_API_KEY não configurada." }, { status: 400 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Manda o arquivo do reel (vídeo ou áudio)." }, { status: 400 });

  if (file.size > MAX_BYTES) {
    return Response.json({
      error: `O arquivo tem ${(file.size / 1024 / 1024).toFixed(1)}MB e o limite é 25MB. Manda o ÁUDIO do reel (não o vídeo), ou um vídeo em qualidade menor.`,
    }, { status: 400 });
  }

  try {
    const fd = new FormData();
    fd.append("file", file, file.name || "reel.mp4");
    fd.append("model", WHISPER_MODEL);
    fd.append("language", "pt");
    fd.append("response_format", "json");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || `Whisper erro (${r.status})`);
    const texto = (d.text || "").trim();
    if (!texto) throw new Error("A transcrição veio vazia. O áudio pode estar sem fala.");
    return Response.json({ texto });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
