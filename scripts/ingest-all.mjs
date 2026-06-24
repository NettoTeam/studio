// Indexa TODOS os PDFs de uma pasta no banco vetorial (RAG), respeitando o limite GRÁTIS
// da Voyage (3 req/min, 10K tokens/min). Resumível: retoma de onde parou.
// node scripts/ingest-all.mjs
import pg from "pg";
import { readFileSync, readdirSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// 👉 Aponte para a SUA pasta de PDFs (livros/estudos). Caminho absoluto ou relativo à raiz do projeto.
const DIR = process.env.INGEST_DIR || "./livros";
// (opcional) títulos amigáveis por nome de arquivo. Vazio = usa o nome do arquivo como título.
const TITLES = {
  // "MeuLivro.pdf": "Título bonito do livro",
};

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => { const m = env.match(new RegExp("^" + k + '="?([^"\\n]+)"?', "m")); return m ? m[1] : null; };
const CONN = get("POSTGRES_URL_NON_POOLING") || get("POSTGRES_URL");
const VKEY = get("VOYAGE_API_KEY");
const VMODEL = get("VOYAGE_MODEL") || "voyage-3.5-lite";
if (!CONN || !VKEY) { console.error("falta POSTGRES_URL ou VOYAGE_API_KEY"); process.exit(1); }

const WORDS = 220, OVERLAP = 40;
const BATCH = 10;             // ~3K tokens/lote
const INTERVAL = 20000;       // 20s entre chamadas → ~3 req/min (limite grátis)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rid = () => "book-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function chunkText(text) {
  const w = text.replace(/\s+/g, " ").trim().split(" ");
  const out = [];
  for (let i = 0; i < w.length; i += (WORDS - OVERLAP)) {
    const s = w.slice(i, i + WORDS).join(" ").trim();
    if (s.length > 40) out.push(s);
    if (i + WORDS >= w.length) break;
  }
  return out;
}

async function embedBatch(texts, t = 0) {
  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${VKEY}` },
      body: JSON.stringify({ input: texts, model: VMODEL, input_type: "document", output_dimension: 1024 }),
    });
    if (res.ok) return (await res.json()).data.map((x) => x.embedding);
    const body = await res.text();
    const rateLimited = res.status === 429 || /rate limit|tokens per|reduced rate|payment method/i.test(body);
    if ((rateLimited || res.status >= 500) && t < 20) {
      const wait = rateLimited ? 22000 : 5000 * (t + 1);
      await sleep(wait); return embedBatch(texts, t + 1);
    }
    throw new Error(body.slice(0, 180));
  } catch (e) {
    if (t < 20 && /fetch failed|network|ECONN|ETIMEDOUT/i.test(String(e.message))) { await sleep(8000); return embedBatch(texts, t + 1); }
    throw e;
  }
}

// conexão resiliente (job longo — Supabase derruba conexão ociosa)
let c;
async function connect() {
  c = new pg.Client({ connectionString: CONN, ssl: { rejectUnauthorized: false }, keepAlive: true });
  // sem este listener, a queda de conexão vira erro não tratado e mata o processo
  c.on("error", (e) => console.log("  (conexão caiu, reconecta no próximo passo:", String(e.message).slice(0, 40), ")"));
  await c.connect();
}
async function q(sql, params, tries = 0) {
  try { return await c.query(sql, params); }
  catch (e) {
    if (tries >= 5) throw e;
    console.log("  (reconectando ao banco:", String(e.message).slice(0, 45), ")");
    try { await c.end(); } catch {}
    await sleep(3000);
    await connect();
    return q(sql, params, tries + 1);
  }
}

await connect();
const t0 = Date.now();
console.log(`[${new Date().toLocaleTimeString()}] início — pasta: ${DIR} — modo grátis (lento, resumível)`);

for (const f of readdirSync(DIR).filter((x) => x.toLowerCase().endsWith(".pdf"))) {
  const title = TITLES[f] || f.replace(/\.pdf$/i, "");

  // fonte existente? (resume) senão cria
  let r = await q("select id from sources where title=$1 and kind='livro' limit 1", [title]);
  let sid = r.rowCount ? r.rows[0].id : null;

  console.log(`\n[${new Date().toLocaleTimeString()}] ${title} — lendo PDF…`);
  let data;
  try { data = await pdf(readFileSync(DIR + "/" + f)); }
  catch (e) { console.log(`  ERRO ao ler: ${String(e.message).slice(0, 80)}`); continue; }
  const chunks = chunkText(data.text || "");
  data = null;
  if (!chunks.length) { console.log("  sem texto, pulando"); continue; }

  if (!sid) {
    sid = rid();
    await q("insert into sources(id,title,kind,content,excerpt,created_at) values($1,$2,'livro',$3,$4,now())",
      [sid, title, `[livro indexado: ${chunks.length} trechos]`, chunks.slice(0, 6).join(" ").slice(0, 1500)]);
  }
  const doneRes = await q("select count(*)::int n from book_chunks where source_id=$1", [sid]);
  let done = doneRes.rows[0].n;
  if (done >= chunks.length) { console.log(`  já completo (${done} trechos) ✓`); continue; }
  console.log(`  ${chunks.length} trechos · já feitos: ${done} · faltam: ${chunks.length - done}`);

  for (let i = done; i < chunks.length; i += BATCH) {
    const b = chunks.slice(i, i + BATCH);
    const embs = await embedBatch(b);
    const vals = [], params = [];
    b.forEach((txt, j) => { const k = j * 4; vals.push(`($${k + 1},$${k + 2},$${k + 3},$${k + 4}::vector)`); params.push(sid, i + j, txt, "[" + embs[j].join(",") + "]"); });
    await q(`insert into book_chunks(source_id,ord,content,embedding) values ${vals.join(",")}`, params);
    const pct = (((i + b.length) / chunks.length) * 100).toFixed(1);
    if ((Math.floor(i / BATCH)) % 5 === 0) console.log(`  …${i + b.length}/${chunks.length} (${pct}%)`);
    await sleep(INTERVAL);
  }
  console.log(`  ✓ ${title} completo`);
}

const total = await q("select count(*)::int n from book_chunks", []);
const mins = ((Date.now() - t0) / 60000).toFixed(0);
console.log(`\n[${new Date().toLocaleTimeString()}] FIM em ${mins} min. Trechos no banco: ${total.rows[0].n}`);
await c.end();
