# Netto Company Studio

Criador de carrosséis de Instagram na voz e identidade da **Netto Company / N² Squad — Cândido Netto Consultoria Fitness** — consultoria fitness feminina, foco em glúteo.

App web (Next.js 16 / React 19) que escreve o roteiro na voz da marca, fatia em cards (1080×1350) e exporta PNGs prontos pra postar. Em volta: pipeline (Quadro + Calendário), cérebro editável (marca, voz, ciência) e um Vault que aprende com as métricas reais.

## Começar

Instale as dependências e rode o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — ele redireciona pra `/hoje`.

> Antes de rodar de verdade você precisa de um projeto Supabase e de uma chave da Anthropic no `.env.local` (veja `.env.example`) e rodar `node scripts/setup-db.mjs` uma vez. O passo a passo completo está na entrega da Parte 3.

## Stack

Next.js 16.2.7 (App Router) · React 19 · TypeScript · @anthropic-ai/sdk (Claude) · Voyage AI (embeddings/RAG) · Exa (busca semântica) · Supabase (Postgres + pgvector). Deploy: Vercel.
