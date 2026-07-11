// Integração com a Instagram Graph API (Meta oficial).
// Modelo: o Cândido gera um token curto no Graph API Explorer + App ID/Secret,
// a gente troca por token longo (60 dias), descobre a conta IG e guarda tudo.
const GRAPH = "https://graph.facebook.com/v21.0";

export interface IgConfig {
  appId: string;
  appSecret: string;
  longToken: string;
  tokenExpires: string;   // ISO
  igUserId: string;
  username?: string;
  pageId?: string;
  connectedAt: string;
}

export interface IgMedia {
  id: string;
  caption?: string;
  mediaType?: string;         // IMAGE | VIDEO | CAROUSEL_ALBUM
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
  reachTotal?: number;        // soma do alcance dos posts recentes (best effort)
  media: IgMedia[];
  fetchedAt: string;
}

async function gget(path: string, params: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${GRAPH}/${path}?${qs}`);
  const d = await r.json();
  if (!r.ok || d.error) {
    throw new Error(d.error?.message || `Graph API erro (${r.status})`);
  }
  return d;
}

// Troca token curto por token longo (60 dias)
export async function exchangeToken(appId: string, appSecret: string, shortToken: string): Promise<{ token: string; expiresIn: number }> {
  const d = (await gget("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  })) as { access_token: string; expires_in?: number };
  return { token: d.access_token, expiresIn: d.expires_in || 60 * 24 * 3600 };
}

// Descobre a conta Instagram Business ligada às Páginas do usuário
export async function discoverIgAccount(token: string): Promise<{ igUserId: string; username?: string; pageId?: string }> {
  const pages = (await gget("me/accounts", {
    access_token: token,
    fields: "id,name,instagram_business_account{id,username}",
  })) as { data?: { id: string; instagram_business_account?: { id: string; username?: string } }[] };

  for (const p of pages.data || []) {
    if (p.instagram_business_account?.id) {
      return { igUserId: p.instagram_business_account.id, username: p.instagram_business_account.username, pageId: p.id };
    }
  }
  throw new Error("Nenhuma conta Instagram Profissional encontrada. Confere se o Instagram é Comercial/Criador e está vinculado a uma Página do Facebook.");
}

// Puxa o snapshot completo: perfil + últimos posts com métricas
export async function fetchSnapshot(cfg: IgConfig, limit = 25): Promise<IgSnapshot> {
  const token = cfg.longToken;

  // Perfil
  const profile = (await gget(cfg.igUserId, {
    access_token: token,
    fields: "username,followers_count,media_count,profile_picture_url",
  })) as { username?: string; followers_count?: number; media_count?: number; profile_picture_url?: string };

  // Últimos posts
  const mediaRes = (await gget(`${cfg.igUserId}/media`, {
    access_token: token,
    fields: "id,caption,media_type,media_product_type,timestamp,permalink,thumbnail_url,like_count,comments_count",
    limit: String(limit),
  })) as { data?: Array<{
    id: string; caption?: string; media_type?: string; media_product_type?: string;
    timestamp?: string; permalink?: string; thumbnail_url?: string; like_count?: number; comments_count?: number;
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
      thumbnail: m.thumbnail_url,
      likes: m.like_count || 0,
      comments: m.comments_count || 0,
    };
    // Insights por post — best effort (métricas variam por tipo/versão)
    try {
      const metrics = m.media_product_type === "REELS"
        ? "reach,saved,shares,total_interactions,views"
        : "reach,saved,shares,total_interactions";
      const ins = (await gget(`${m.id}/insights`, { access_token: token, metric: metrics })) as {
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
    } catch { /* post sem insights disponíveis, segue */ }
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

// Renova o token longo (deve rodar antes dos 60 dias)
export async function refreshToken(cfg: IgConfig): Promise<{ token: string; expiresIn: number }> {
  return exchangeToken(cfg.appId, cfg.appSecret, cfg.longToken);
}
