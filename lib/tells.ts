// Detector programático de "cara de IA" — heurística que SINALIZA tells no roteiro.
// NÃO reescreve nada (informativo). Você decide se mexe. Baseado na régua anti-IA da marca.
export function detectTells(text: string): string[] {
  const t = (text || "").trim();
  if (t.length < 40) return [];
  const out: string[] = [];
  const lines = t.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  // "não é A, é B" — espelho clássico de IA
  if (/n[ãa]o (?:é|e) [^,.\n]{2,45},?\s*(?:é|e) /i.test(t)) out.push("padrão espelhado \"não é A, é B\"");

  // paralelismo perfeitinho: linhas vizinhas começando igual demais
  const starts = lines.map((line) => line.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).slice(0, 2).join(" ")).filter((s) => s.length > 3);
  const repeatedStarts = starts.filter((s, i) => i > 0 && s === starts[i - 1]).length;
  if (repeatedStarts >= 2) out.push("paralelismo perfeitinho em sequência");

  // muitas linhas curtas com cadência de punchline
  const punchyLines = lines.filter((line) => line.length >= 18 && line.length <= 72).length;
  if (lines.length >= 7 && punchyLines / lines.length > 0.78) out.push("toda frase virando punchline");

  // tiques repetidos: threshold escala com o tamanho do texto
  // ganchos são curtos (~100-200 chars) → só flagra com 3+; roteiros longos → 2+ já é vício
  const ticMatches = t.match(/\b(olha|de fato|pensa|sabe|cara)\b/gi) || [];
  const ticThreshold = t.length < 280 ? 3 : 2;
  if (ticMatches.length >= ticThreshold) out.push(`${ticMatches.length} tiques de fala repetidos`);

  // travessão em excesso
  const dashes = (t.match(/[—–]/g) || []).length;
  if (dashes >= 5) out.push(`${dashes} travessões; a IA abusa disso`);

  // exclamações em excesso
  const excl = (t.match(/!/g) || []).length;
  if (excl >= 4) out.push(`${excl} exclamações — soa performático`);

  // motivação açucarada de coach
  if (/\b(voc[êe] consegue|acredite em voc|vai dar certo|o seu melhor|tudo (?:é|e) poss[íi]vel|você merece tudo|sua hora vai chegar)\b/i.test(t)) out.push("motivação açucarada (\"você consegue\"…)");

  // clichês de coach proibidos pela régua Netto
  if (/(confie no processo|acredite no processo|sa(ia|ir) da zona de conforto|zona de conforto|voc[êe] só precisa querer|n[ãa]o (?:é|e) falta (?:de|do|da|disso|daquilo)|v[áa] além|foco,? força e fé)/i.test(t)) out.push("clichê de coach ou muleta de \"falta de\"");

  // abertura clichê
  if (/\b(todo mundo sabe|todas sabemos|todos sabemos|n[ãa]o (?:é|e) segredo (que|para)|num mundo (cada vez mais|onde))\b/i.test(t)) out.push("abertura clichê (\"todo mundo sabe\"…)");

  // jargão acadêmico que devia virar consequência simples
  if (/\b(s[íi]ntese proteica|mtor|hipertrofia sarcoplasm|actina|miosina|hiperplasia|home[oô]stase|recrutamento de unidades motoras|mecanotransdu[cç][aã]o|miostatina|sarc[oô]mero)\b/i.test(t)) out.push("jargão técnico cru — traduz pra consequência simples");

  // "no fim das contas"/lugar-comum vazio
  if (/\b(no fim das contas|no final do dia|a verdade (?:é|e) que|reflita sobre)\b/i.test(t)) out.push("muleta de transição genérica");

  // correlação preguiçosa/metáfora batida
  if (/\bo corpo (?:é|e) como (?:uma? )?(ponte|m[áa]quina|carro|motor|casa|jardim)\b/i.test(t)) out.push("correlação preguiçosa/metáfora batida");

  // trocadilho publicitário ou esperto demais
  if (/\b(segredo revelado|hack|desbloqueie|f[oó]rmula secreta|o mapa para|virada de chave definitiva)\b/i.test(t)) out.push("trocadilho publicitário ou esperto");

  // determinismo confortável: potencial sem cobrança logo perto
  if (/\b(nasceu vencedor|[ée] gen[ée]tico,? [ée] f[áa]cil|j[áa] (?:é|e) forte,? s[oó] falta acreditar|relaxa,? (?:é|e) gen[ée]tico)\b/i.test(t)) out.push("determinismo confortável/promessa sem esforço");

  return out;
}
