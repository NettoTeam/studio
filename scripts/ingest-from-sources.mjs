// Indexa no RAG os textos que JÁ estão na aba Fontes (sources kind=pdf/texto/url) — SEM re-upload.
// Quebra em trechos, gera embeddings (Voyage) e marca como "livro" → passa a aparecer em
// Cérebro → Ciência e vira coerência invisível na escrita.
// Uso: node scripts/ingest-from-sources.mjs   (precisa VOYAGE_API_KEY + POSTGRES_URL no .env.local)
import pg from "pg";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => { const m = env.match(new RegExp("^" + k + '="?([^"\\n]+)"?', "m")); return m ? m[1] : null; };
const CONN = get("POSTGRES_URL_NON_POOLING") || get("POSTGRES_URL");
const VKEY = get("VOYAGE_API_KEY");
const VMODEL = get("VOYAGE_MODEL") || "voyage-3.5-lite";
if (!CONN || !VKEY || VKEY === "SEU_VALOR_AQUI") { console.error("falta POSTGRES_URL ou VOYAGE_API_KEY (real) no .env.local"); process.exit(1); }
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const WORDS = 220, OVERLAP = 40, BATCH = 10, INTERVAL = 20000; // ~3 req/min (limite grátis Voyage)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function chunkText(t) {
  const w = (t || "").replace(/\s+/g, " ").trim().split(" ");
  const o = [];
  for (let i = 0; i < w.length; i += (WORDS - OVERLAP)) {
    const s = w.slice(i, i + WORDS).join(" ").trim();
    if (s.length > 40) o.push(s);
    if (i + WORDS >= w.length) break;
  }
  return o;
}

async function embedBatch(texts, t = 0) {
  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${VKEY}` },
      body: JSON.stringify({ input: texts, model: VMODEL, input_type: "document", output_dimension: 1024 }),
    });
    if (res.ok) return (await res.json()).data.map((x) => x.embedding);
    const body = await res.text();
    const rl = res.status === 429 || /rate limit|tokens per|reduced rate|payment method/i.test(body);
    if ((rl || res.status >= 500) && t < 20) { await sleep(rl ? 22000 : 5000 * (t + 1)); return embedBatch(texts, t + 1); }
    throw new Error(body.slice(0, 180));
  } catch (e) {
    if (t < 20 && /fetch failed|network|ECONN|ETIMEDOUT/i.test(String(e.message))) { await sleep(8000); return embedBatch(texts, t + 1); }
    throw e;
  }
}

let c;
async function connect() {
  c = new pg.Client({ connectionString: CONN, ssl: { rejectUnauthorized: false }, keepAlive: true });
  c.on("error", (e) => console.log("  (conexão caiu, reconecta:", String(e.message).slice(0, 40), ")"));
  await c.connect();
}
async function q(sql, params, tries = 0) {
  try { return await c.query(sql, params); }
  catch (e) {
    if (tries >= 5) throw e;
    console.log("  (reconectando ao banco:", String(e.message).slice(0, 45), ")");
    try { await c.end(); } catch {}
    await sleep(3000); await connect();
    return q(sql, params, tries + 1);
  }
}

await connect();
const { rows: srcs } = await q("select id,title,content from sources where kind <> 'livro' and length(content) > 200 order by created_at", []);
if (!srcs.length) { console.log("Nenhuma fonte pendente (ou já são 'livro')."); await c.end(); process.exit(0); }
console.log(`${srcs.length} fonte(s) da aba Fontes pra indexar:\n` + srcs.map((s) => "  • " + s.title).join("\n"));

const t0 = Date.now();
for (const s of srcs) {
  const chunks = chunkText(s.content);
  if (!chunks.length) { console.log(`  ${s.title}: sem texto, pulando`); continue; }
  const done0 = (await q("select count(*)::int n from book_chunks where source_id=$1", [s.id])).rows[0].n;
  console.log(`\n[${new Date().toLocaleTimeString()}] ${s.title} — ${chunks.length} trechos · já feitos: ${done0}`);
  for (let i = done0; i < chunks.length; i += BATCH) {
    const b = chunks.slice(i, i + BATCH);
    const embs = await embedBatch(b);
    const vals = [], params = [];
    b.forEach((txt, j) => { const k = j * 4; vals.push(`($${k + 1},$${k + 2},$${k + 3},$${k + 4}::vector)`); params.push(s.id, i + j, txt, "[" + embs[j].join(",") + "]"); });
    await q(`insert into book_chunks(source_id,ord,content,embedding) values ${vals.join(",")}`, params);
    const pct = (((i + b.length) / chunks.length) * 100).toFixed(0);
    if ((Math.floor(i / BATCH)) % 5 === 0) console.log(`  …${i + b.length}/${chunks.length} (${pct}%)`);
    await sleep(INTERVAL);
  }
  // marca como livro: sai do "fundo" e entra no RAG/Ciência; enxuga o content (os trechos guardam o texto)
  await q("update sources set kind='livro', content=$2 where id=$1", [s.id, `[livro indexado: ${chunks.length} trechos]`]);
  console.log(`  ✓ ${s.title} indexado e marcado como livro`);
}
const total = (await q("select count(*)::int n from book_chunks", [])).rows[0].n;
const mins = ((Date.now() - t0) / 60000).toFixed(0);
console.log(`\n[${new Date().toLocaleTimeString()}] FIM em ${mins} min. Trechos no banco: ${total}. Confere em Cérebro → Ciência.`);
await c.end();
