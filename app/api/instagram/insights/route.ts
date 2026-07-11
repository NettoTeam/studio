// Busca os insights atualizados do Instagram e guarda em cache.
import { fetchSnapshot, refreshToken, type IgConfig } from "@/lib/instagram";
import { getIgConfig, setIgConfig, setIgSnapshot, getIgSnapshot } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET: devolve o snapshot em cache (rápido, sem bater na Meta)
export async function GET() {
  const snap = await getIgSnapshot();
  return Response.json({ snapshot: snap });
}

// POST: atualiza agora — bate na Graph API, guarda e devolve
export async function POST() {
  const stored = await getIgConfig();
  if (!stored) return Response.json({ error: "Instagram não conectado." }, { status: 400 });

  const cfg: IgConfig = stored;
  try {
    // renova o token se estiver perto de expirar (menos de 7 dias)
    const expMs = new Date(cfg.tokenExpires).getTime();
    if (expMs - Date.now() < 7 * 24 * 3600 * 1000) {
      try {
        const { token, expiresIn } = await refreshToken(cfg);
        cfg.longToken = token;
        const updated = { ...stored, longToken: token, tokenExpires: new Date(Date.now() + expiresIn * 1000).toISOString() };
        await setIgConfig(updated);
      } catch { /* segue com o token atual */ }
    }

    const snapshot = await fetchSnapshot(cfg);
    await setIgSnapshot(snapshot);
    return Response.json({ snapshot });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
