// Integração com a Instagram API com Login do Instagram (graph.instagram.com).
// Caminho novo da Meta: conecta direto na conta Profissional, sem Página do Facebook.
// O Cândido gera um token curto no Graph API Explorer; a gente troca por token
// longo (60 dias), pega o user_id e puxa perfil + posts com métricas.
const IG = "https://graph.instagram.com";

export interface IgConfig {
  appId: string;
  appSecret: string;
  longToken: string;
  tokenExpires: string;   // ISO
  igUserId: string;
  username?: string;
  connectedAt: string;
}

export interface IgMedia {
  id: string;
  caption?: string;
  mediaType?: string;
  productType?: string;       // FEED | REELS | STORY
  timestamp?: string;
  permalink?: string;
  thumbnail?: string;
  likes: number;
  comments: number;
  reach?: number;
  saved?: number;
  shares?: number;
  interactions?: number;
  views?: number;
}

export interface IgSnapshot {
  username?: string;
  followers?: number;
  mediaCount?: number;
  profilePic?: string;
  reachTotal?: number;
  media: IgMedia[];
  fetchedAt: string;
}

async function iget(path: string, params: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${IG}/${path}?${qs}`);
  const d = await r.json();
  if (!r.ok || d.error) {
    throw new Error(d.error?.message || `Instagram API erro (${r.status})`);
  }
  return d;
}

// Troca token curto por token longo (60 dias) — Instagram Login usa client_secret
export async function exchangeToken(_appId: string, appSecret: string, shortToken: string): Promise<{ token: string; expiresIn: number }> {
  const d = (await iget("access_token", {
    grant_type: "ig_exchange_token",
    client_secret: appSecret,
    access_token: shortToken,
  })) as { access_token: string; expires_in?: number };
  return { token: d.access_token, expiresIn: d.expires_in || 60 * 24 * 3600 };
}

// Pega a conta Instagram do próprio token
export async function discoverIgAccount(token: string): Promise<{ igUserId: string; username?: string }> {
  const me = (await iget("me", {
    access_token: token,
    fields: "user_id,username",
  })) as { user_id?: string; id?: string; username?: string };
  const igUserId = me.user_id || me.id;
  if (!igUserId) throw new Error("Não consegui identificar a conta do Instagram. Confere se o token foi gerado com Login do Instagram.");
  return { igUserId, username: me.username };
}

// Puxa perfil + últimos posts com métricas
export async function fetchSnapshot(cfg: IgConfig, limit = 25): Promise<IgSnapshot> {
  const token = cfg.longToken;

  // Perfil
  const profile = (await iget("me", {
    access_token: token,
    fields: "username,followers_count,media_count,profile_picture_url",
  })) as { username?: string; followers_count?: number; media_count?: number; profile_picture_url?: string };

  // Últimos posts
  const mediaRes = (await iget("me/media", {
    access_token: token,
    fields: "id,caption,media_type,media_product_type,timestamp,permalink,thumbnail_url,media_url,like_count,comments_count",
    limit: String(limit),
  })) as { data?: Array<{
    id: string; caption?: string; media_type?: string; media_product_type?: string;
    timestamp?: string; permalink?: string; thumbnail_url?: string; media_url?: string;
    like_count?: number; comments_count?: number;
  }> };

  const media: IgMedia[] = [];
  let reachTotal = 0;

  for (const m of mediaRes.data || []) {
    const item: IgMedia = {
      id: m.id,
      caption: m.caption,
      mediaType: m.media_type,
      productType: m.media_product_type,
      timestamp: m.timestamp,
      permalink: m.permalink,
      thumbnail: m.thumbnail_url || (m.media_type === "IMAGE" ? m.media_url : undefined),
      likes: m.like_count || 0,
      comments: m.comments_count || 0,
    };
    // Insights por post — best effort (métricas variam por tipo)
    try {
      const metrics = m.media_product_type === "REELS"
        ? "reach,saved,shares,total_interactions,views"
        : "reach,saved,shares,total_interactions";
      const ins = (await iget(`${m.id}/insights`, { access_token: token, metric: metrics })) as {
        data?: { name: string; values?: { value: number }[] }[];
      };
      for (const row of ins.data || []) {
        const v = row.values?.[0]?.value ?? 0;
        if (row.name === "reach") { item.reach = v; reachTotal += v; }
        else if (row.name === "saved") item.saved = v;
        else if (row.name === "shares") item.shares = v;
        else if (row.name === "total_interactions") item.interactions = v;
        else if (row.name === "views") item.views = v;
      }
    } catch { /* post sem insights, segue */ }
    media.push(item);
  }

  return {
    username: profile.username,
    followers: profile.followers_count,
    mediaCount: profile.media_count,
    profilePic: profile.profile_picture_url,
    reachTotal: reachTotal || undefined,
    media,
    fetchedAt: new Date().toISOString(),
  };
}

// Renova o token longo (Instagram Login: ig_refresh_token, sem secret)
export async function refreshToken(cfg: IgConfig): Promise<{ token: string; expiresIn: number }> {
  const d = (await iget("refresh_access_token", {
    grant_type: "ig_refresh_token",
    access_token: cfg.longToken,
  })) as { access_token: string; expires_in?: number };
  return { token: d.access_token, expiresIn: d.expires_in || 60 * 24 * 3600 };
}
