// Cria as tabelas no Supabase (posts + kv + sources + book_chunks) e a função de busca vetorial. Rodar uma vez.
import pg from "pg";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => { const m = env.match(new RegExp("^" + k + '="?([^"\\n]+)"?', "m")); return m ? m[1] : null; };
const conn = get("POSTGRES_URL_NON_POOLING") || get("POSTGRES_URL");
if (!conn) { console.error("sem POSTGRES_URL"); process.exit(1); }

const c = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`
  create table if not exists posts (
    id text primary key,
    data jsonb not null,
    stage text,
    scheduled_at text,
    updated_at timestamptz default now()
  );
  create table if not exists kv (
    key text primary key,
    value jsonb
  );
  create table if not exists sources (
    id text primary key,
    title text not null,
    kind text,            -- pdf | texto | url
    url text,
    content text not null, -- texto extraído (referência pra IA)
    excerpt text,          -- recorte enxuto usado como conhecimento de fundo da IA
    tags text,
    created_at timestamptz default now()
  );
  alter table sources add column if not exists excerpt text;

  create extension if not exists vector;
  create table if not exists book_chunks (
    id bigserial primary key,
    source_id text references sources(id) on delete cascade,
    ord int,
    content text not null,
    embedding vector(1024)
  );
`);
// índice de similaridade (HNSW, cosseno) — ignora se a versão do pgvector não suportar
try {
  await c.query(`create index if not exists book_chunks_embedding_idx on book_chunks using hnsw (embedding vector_cosine_ops);`);
} catch (e) { console.log("aviso índice:", e.message); }
// função de busca semântica
await c.query(`
  create or replace function match_book_chunks(query_embedding vector(1024), match_count int)
  returns table(content text, source_id text, similarity float)
  language sql stable as $func$
    select bc.content, bc.source_id, 1 - (bc.embedding <=> query_embedding) as similarity
    from book_chunks bc
    order by bc.embedding <=> query_embedding
    limit match_count;
  $func$;
`);
const r = await c.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('posts','kv','sources','book_chunks')");
console.log("tabelas:", r.rows.map((x) => x.table_name).join(", "));
await c.end();
