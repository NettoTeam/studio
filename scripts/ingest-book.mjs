// Indexa um livro (PDF) no banco vetorial pra busca semântica (RAG).
// Uso: node scripts/ingest-book.mjs "/caminho/livro.pdf" "Título do Livro"
//   (precisa de VOYAGE_API_KEY e POSTGRES_URL no .env.local)
import pg from "pg";
import { readFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const [, , PDF_PATH, TITLE_ARG] = process.argv;
if (!PDF_PATH) { console.error("uso: node scripts/ingest-book.mjs <caminho.pdf> [título]"); process.exit(1); }

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => { const m = env.match(new RegExp("^" + k + '="?([^"\\n]+)"?', "m")); return m ? m[1] : null; };
const CONN = get("POSTGRES_URL_NON_POOLING") || get("POSTGRES_URL");
const VKEY = get("VOYAGE_API_KEY");
const VMODEL = get("VOYAGE_MODEL") || "voyage-3.5-lite";
if (!CONN) { console.error("sem POSTGRES_URL no .env.local"); process.exit(1); }
if (!VKEY) { console.error("sem VOYAGE_API_KEY no .env.local"); process.exit(1); }

const WORDS_PER_CHUNK = 220;   // ~300 tokens/trecho
const OVERLAP = 40;            // sobreposição p/ não cortar ideia no meio
const BATCH = 40;              // trechos por chamada de embedding

function chunkText(text) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += (WORDS_PER_CHUNK - OVERLAP)) {
    const slice = words.slice(i, i + WORDS_PER_CHUNK).join(" ").trim();
    if (slice.length > 40) chunks.push(slice);
    if (i + WORDS_PER_CHUNK >= words.length) break;
  }
  return chunks;
}

async function embedBatch(texts, tries = 0) {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${VKEY}` },
    body: JSON.stringify({ input: texts, model: VMODEL, input_type: "document", output_dimension: 1024 }),
  });
  if (res.status === 429 && tries < 6) { await new Promise((r) => setTimeout(r, 4000 * (tries + 1))); return embedBatch(texts, tries + 1); }
  const d = await res.json();
  if (!res.ok) throw new Error(d?.detail || JSON.stringify(d));
  return d.data.map((x) => x.embedding);
}

const rid = () => "book-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

(async () => {
  console.log("Lendo PDF…", PDF_PATH);
  const pdf = require("pdf-parse");
  const buf = readFileSync(PDF_PATH);
  const data = await pdf(buf);
  const title = TITLE_ARG || PDF_PATH.split(/[\\/]/).pop().replace(/\.pdf$/i, "");
  const chunks = chunkText(data.text || "");
  console.log(`Páginas: ${data.numpages} · Trechos gerados: ${chunks.length}`);
  if (!chunks.length) { console.error("PDF sem texto extraível (pode ser escaneado)."); process.exit(1); }

  const c = new pg.Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const sourceId = rid();
  await c.query(
    `insert into sources(id,title,kind,content,excerpt,created_at) values($1,$2,'livro',$3,$4,now())`,
    [sourceId, title, `[livro indexado: ${chunks.length} trechos]`, (data.text || "").slice(0, 1500)]
  );

  let done = 0;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const embs = await embedBatch(batch);
    // insert em lote
    const values = [];
    const params = [];
    batch.forEach((txt, j) => {
      const base = j * 3;
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}::vector)`);
      params.push(sourceId, txt, "[" + embs[j].join(",") + "]");
    });
    await c.query(
      `insert into book_chunks(source_id, content, embedding) values ${values.join(",")}`,
      params
    );
    done += batch.length;
    process.stdout.write(`\r  indexando… ${done}/${chunks.length}`);
  }
  console.log(`\n✓ "${title}" indexado (${chunks.length} trechos).`);
  await c.end();
})().catch((e) => { console.error("\nERRO:", e.message); process.exit(1); });
