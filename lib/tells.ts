// Detector programático de "cara de IA" — heurística que SINALIZA tells no roteiro.
// NÃO reescreve nada (informativo). Você decide se mexe. Baseado na régua anti-IA da marca.
export function detectTells(text: string): string[] {
  const t = (text || "").trim();
  if (t.length < 40) return [];
  const out: string[] = [];

  // "não é A, é B" — espelho clássico de IA
  if (/n[ãa]o é [^,.\n]{2,45},?\s*é /i.test(t)) out.push("padrão espelhado \"não é A, é B\"");

  // travessão (—) em excesso
  const dashes = (t.match(/—/g) || []).length;
  if (dashes >= 5) out.push(`${dashes} travessões (—) — a IA abusa disso`);

  // exclamações em excesso
  const excl = (t.match(/!/g) || []).length;
  if (excl >= 4) out.push(`${excl} exclamações — soa performático`);

  // motivação açucarada de coach
  if (/\b(voc[êe] consegue|acredite em voc|vai dar certo|o seu melhor|tudo é poss[íi]vel|você merece tudo)\b/i.test(t)) out.push("motivação açucarada (\"você consegue\"…)");

  // clichês de coach proibidos pela régua Netto
  if (/(confie no processo|acredite no processo|sa(ia|ir) da zona de conforto|zona de conforto|voc[êe] só precisa querer|n[ãa]o é falta de disciplina|v[áa] além|foco,? força e fé)/i.test(t)) out.push("clichê de coach (\"confie no processo\", \"zona de conforto\"…)");

  // abertura clichê
  if (/\b(todo mundo sabe|todas sabemos|todos sabemos|n[ãa]o é segredo (que|para)|num mundo (cada vez mais|onde))\b/i.test(t)) out.push("abertura clichê (\"todo mundo sabe\"…)");

  // jargão acadêmico que devia virar consequência simples
  if (/\b(s[íi]ntese proteica|mtor|hipertrofia sarcoplasm|actina|miosina|hiperplasia|home[oô]stase|recrutamento de unidades motoras)\b/i.test(t)) out.push("jargão técnico cru — traduz pra consequência simples");

  // "no fim das contas"/lugar-comum vazio
  if (/\b(no fim das contas|no final do dia|a verdade é que|reflita sobre)\b/i.test(t)) out.push("muleta de transição genérica");

  return out;
}
