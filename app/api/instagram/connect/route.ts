// Conecta o Instagram: recebe App ID/Secret + token curto, troca por token longo,
// descobre a conta IG e guarda tudo no Supabase.
import { exchangeToken, discoverIgAccount } from "@/lib/instagram";
import { getIgConfig, setIgConfig, clearIgConfig } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  const cfg = await getIgConfig();
  if (!cfg) return Response.json({ connected: false });
  return Response.json({
    connected: true,
    username: cfg.username,
    igUserId: cfg.igUserId,
    tokenExpires: cfg.tokenExpires,
    connectedAt: cfg.connectedAt,
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { appId?: string; appSecret?: string; shortToken?: string };
  const appId = (body.appId || "").trim();
  const appSecret = (body.appSecret || "").trim();
  const shortToken = (body.shortToken || "").trim();
  if (!appId || !appSecret || !shortToken) {
    return Response.json({ error: "Preencha App ID, App Secret e o token." }, { status: 400 });
  }
  try {
    const { token, expiresIn } = await exchangeToken(appId, appSecret, shortToken);
    const acct = await discoverIgAccount(token);
    const cfg = {
      appId, appSecret,
      longToken: token,
      tokenExpires: new Date(Date.now() + expiresIn * 1000).toISOString(),
      igUserId: acct.igUserId,
      username: acct.username,
      connectedAt: new Date().toISOString(),
    };
    await setIgConfig(cfg);
    return Response.json({ connected: true, username: cfg.username, igUserId: cfg.igUserId, tokenExpires: cfg.tokenExpires });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE() {
  await clearIgConfig();
  return Response.json({ ok: true });
}
