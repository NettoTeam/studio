// Embeddings via Voyage AI (recomendado pela Anthropic). 1024 dims, multilíngue.
const MODEL = process.env.VOYAGE_MODEL || "voyage-3.5-lite";

export function hasEmbeddings(): boolean {
  return !!process.env.VOYAGE_API_KEY;
}

export async function embed(texts: string[], inputType: "document" | "query" = "document"): Promise<number[][]> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new Error("VOYAGE_API_KEY ausente");
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ input: texts, model: MODEL, input_type: inputType, output_dimension: 1024 }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d?.detail || JSON.stringify(d));
  return (d.data as { embedding: number[] }[]).map((x) => x.embedding);
}
