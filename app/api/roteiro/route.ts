// ETAPA 1 — escreve o ROTEIRO corrido (prosa, voz do Cândido). Modelo forte (Opus). Saída: texto.
import Anthropic from "@anthropic-ai/sdk";
import { ROTEIRO_SYSTEM } from "@/lib/n2squad";
import { emotionBlock, hookBlock } from "@/lib/frameworks";
import { registroBlock } from "@/lib/vitals";
import { textOf, extractJson, pickRandom } from "@/lib/llm";
import { detectTells } from "@/lib/tells";
import { cleanGeneratedText, GENERATION_RULES } from "@/lib/generation-rules";

const CHEAP_MODEL = "claude-haiku-4-5";
const CLEAN_MODEL = "claude-sonnet-4-6"; // passe cirúrgico de limpeza dos tells

export const runtime = "nodejs";
export const maxDuration = 300; // o juiz de voz pode regenerar 1x — precisa de fôlego (requer plano Vercel Pro)

const WRITE_MODEL = process.env.ANTHROPIC_WRITE_MODEL || "claude-opus-4-8";
const JUDGE_MODEL = process.env.ANTHROPIC_JUDGE_MODEL || "claude-sonnet-4-6"; // juiz de voz (Tier 3)
const VOICE_MIN = 72; // abaixo disso, regenera uma vez com a crítica do juiz

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { content?: string; hook?: string; emotions?: string[]; correlation?: string; inlineSource?: string; registro?: string; chosenHook?: string; funil?: "topo" | "meio" | "fundo"; revisar?: string; critica?: string };
  const content = (body.content || "").trim();

  const anthropic = new Anthropic({ apiKey: key });

  // CAMINHO REVISÃO: reescreve um roteiro existente atacando as fraquezas apontadas pelo juiz cruzado.
  // O texto final continua sendo do Claude — só usamos a crítica como norte.
  const aRevisar = (body.revisar || "").trim();
  if (aRevisar) {
    const critica = (body.critica || "").trim().slice(0, 2000);
    const { getGold } = await import("@/lib/store");
    const gold = await getGold();
    const goldB = gold.length ? `\n\nA VOZ DO CÂNDIDO (imite a cadência, NÃO copie):\n${pickRandom(gold, 2).map(g => g.text).join("\n---\n")}` : "";
    const revMsg = `${GENERATION_RULES}${registroBlock(body.registro)}${goldB}

ROTEIRO ATUAL DO CÂNDIDO (a base — mantenha o que já é bom e a voz dele):
"""${aRevisar.slice(0, 4000)}"""

CRÍTICA DE UM EDITOR (ataque ESTES pontos, sem inventar assunto novo):
${critica || "Deixe o gancho mais forte, corte gordura, afie o fecho."}

TAREFA: reescreve o roteiro corrigindo as fraquezas apontadas. Mantém a VOZ do Cândido (calma, direta, breve, sem cara de IA, sem clichê de coach). NÃO alonga: mesmo tamanho ou mais curto. Devolve SÓ o roteiro em texto corrido, sem comentários.`;
    try {
      const res = await anthropic.messages.create({
        model: WRITE_MODEL, max_tokens: 1500,
        messages: [{ role: "user", content: revMsg }],
      });
      let roteiro = cleanGeneratedText(textOf(res)) || textOf(res);
      roteiro = roteiro.trim();
      return Response.json({ roteiro, tells: detectTells(roteiro), revised: true });
    } catch (e) {
      return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  }

  if (!content) return Response.json({ error: "Manda o conteúdo." }, { status: 400 });

  const emoBlock = emotionBlock(body.emotions || []);
  const hkBlock = hookBlock(body.hook);
  const regBlock = registroBlock(body.registro);
  const FUNIL_MAP = {
    topo: `\n\nETAPA DO FUNIL: TOPO (descoberta)\nObjetivo: atrair atenção de quem não te conhece e não sabe que tem um problema. Foco em CRIAR CONSCIÊNCIA, não vender.\n- Linguagem simples, emocional, sem jargão técnico pesado.\n- Gancho fortíssimo — a leitora precisa parar de rolar o feed.\n- Alto potencial de compartilhamento e identificação.\n- Conteúdo curto, direto, visceral. Pode ser: mito/verdade, erro comum, curiosidade, quebra de crença, identificação.\n- Objetivo psicológico: "nossa, isso acontece comigo" ou "nunca tinha pensado nisso".\n- NÃO inclua convite pra consulta nem fale de serviço. NÃO seja educativo demais — seja RELEVANTE e CHAMATIVO.`,
    meio: `\n\nETAPA DO FUNIL: MEIO (consideração)\nObjetivo: transformar curiosidade em confiança. A leitora já sabe que tem um problema — agora quer aprender e quer saber se você entende do assunto.\n- Mais profundidade e contexto do que o conteúdo de topo.\n- Mostre o MÉTODO, o raciocínio, a forma de pensar — não só a informação.\n- Conteúdo educativo, científico traduzido, comparativo, frameworks, bastidores do processo.\n- Objetivo psicológico: "esse profissional realmente entende do que está falando".\n- Pode ter CTA leve (salvar, seguir), mas NÃO força convite pra consulta ainda.`,
    fundo: `\n\nETAPA DO FUNIL: FUNDO (decisão)\nObjetivo: gerar ação — consulta, agendamento, venda. A leitora já confia, só falta decidir.\n- Foco em ELIMINAR OBJEÇÕES: "será que funciona comigo?", "vale o investimento?", "posso confiar?".\n- Use provas sociais, resultados reais, depoimentos, bastidores do atendimento, cases de sucesso.\n- Conteúdo de decisão: antes/depois, frequentes dúvidas respondidas, garantias, convite direto.\n- Objetivo psicológico: "é exatamente o que eu preciso" → "vou entrar em contato".\n- Termine com CTA DIRETO e claro (agendar, mandar mensagem, etc.).`,
  };
  const funilBlock = body.funil ? FUNIL_MAP[body.funil] : "";
  const chosen = (body.chosenHook || "").trim().slice(0, 600);
  const chosenBlock = chosen
    ? `\n\nABERTURA JÁ ESCOLHIDA E APROVADA POR VOCÊ — o roteiro DEVE começar EXATAMENTE com esta abertura (pode ajustar levemente a pontuação/quebra pra fluir, mas mantenha as palavras e a força dela; NÃO troque por outra abertura, NÃO suavize). Construa o arco inteiro pra ENTREGAR e ESPELHAR essa abertura no fecho:\n"""${chosen}"""`
    : "";
  const correlation = (body.correlation || "").trim().slice(0, 600);
  const corrBlock = correlation
    ? `\n\nPONTE DE CORRELAÇÃO (sua escolha). Use ASSIM: ache o PRINCÍPIO REAL que a ponte e o assunto compartilham; a conexão tem que ser HONESTA, não forçada. Abre com a história/detalhe concreto, DESENVOLVE (quem é, o que aconteceu) e amarra no princípio comum ANTES de qualquer lição. Nunca largue a história e pule pro técnico.\nA ponte:\n${correlation}`
    : "";

  // coerência científica por AFIRMAÇÃO (RAG nos livros): extrai as claims do conteúdo e busca a PROVA de cada uma
  let booksBlock = "";
  try {
    const { hasEmbeddings, embed } = await import("@/lib/embed");
    if (hasEmbeddings()) {
      // 1) extrai até 3 afirmações factuais que precisam estar corretas (Haiku — barato/rápido)
      let claims: string[] = [];
      try {
        const cl = await anthropic.messages.create({
          model: CHEAP_MODEL, max_tokens: 300,
          messages: [{ role: "user", content: `Extraia até 3 AFIRMAÇÕES factuais/fisiológicas que este conteúdo faz e que precisam estar cientificamente CORRETAS (cada uma curta, em português, sem opinião). Responda APENAS JSON {"claims":["...","..."]}.\n\nCONTEÚDO:\n${content.slice(0, 2000)}` }],
        });
        const j = JSON.parse(extractJson(textOf(cl))) as { claims?: string[] };
        claims = (j.claims || []).map((c) => (c || "").trim()).filter(Boolean).slice(0, 3);
      } catch { /* sem claims → cai no fallback */ }

      const queries = claims.length ? claims : [content.slice(0, 2000)];
      const vecs = await embed(queries, "query");
      const { searchBooks } = await import("@/lib/store");
      const arrs = await Promise.all(vecs.map((v) => searchBooks(v, claims.length ? 3 : 8)));
      const seen = new Set<string>();
      const hits: { content: string }[] = [];
      for (const arr of arrs) for (const h of arr) { const kk = h.content.slice(0, 60); if (!seen.has(kk)) { seen.add(kk); hits.push(h); } }
      if (hits.length) {
        booksBlock = `\n\nVERIFICAÇÃO DE COERÊNCIA — USO INTERNO (livros de fisiologia/nutrição${claims.length ? ", buscado pelas AFIRMAÇÕES do conteúdo" : ""}). Use SÓ pra não falar besteira. NÃO cite, NÃO copie termo acadêmico, NÃO deixe denso — invisível pra leitora:\n${hits.slice(0, 6).map((h) => `• ${h.content.slice(0, 500)}`).join("\n")}`;
      }
    }
  } catch (e) { console.error("RAG roteiro", e instanceof Error ? e.message : String(e)); }

  const inline = (body.inlineSource || "").trim().slice(0, 14000);
  const inlineBlock = inline ? `\n\nFONTE PRINCIPAL (embase os números NISTO, na voz do Cândido, sem copiar frases):\n${inline}` : "";

  // exemplos-ouro da voz (alvo de imitação de cadência) + estruturas-ouro (arco)
  const { getGold, getGoldStructures, getAudience, getEdge, recentFreshLabels, addFreshness, getBrainModel, getLearnings, getRejects, sourcesBackground } = await import("@/lib/store");
  const [aud, edg, recent] = await Promise.all([getAudience(), getEdge(), recentFreshLabels(30)]);
  const reguaBlock = `\n\nRÉGUA ATUAL DA MARCA (use como norte):\nPÚBLICO: ${aud}\nARESTA / CARA DA MARCA: ${edg}`;

  // ESPINHA DA MARCA + APRENDIZADO (ancoram o QUE você acredita/o que funciona — NÃO mudam COMO escreve).
  // Sempre ligado: é parte da qualidade-base da escrita.
  let brandBlock = "", learnBlock = "", historiaBlock = "";
  try {
    const [model, learn] = await Promise.all([getBrainModel(), getLearnings()]);
    brandBlock = `\n\nESPINHA DA MARCA (ancore o conteúdo NISTO — é a verdade da marca (Team Netto · N² Squad); isto NÃO muda COMO você escreve, só no QUE você acredita e contra o que aponta):\nGRANDE TESE: ${model.grandeTese}\nINIMIGO (o conteúdo combate isto): ${model.inimigo}`;
    if (learn?.summary) learnBlock = `\n\nAPRENDIZADO DOS DADOS REAIS DO CÂNDIDO (${learn.n} posts medidos — o que de fato performa pra ESTE público; use pra acertar mais, sem mudar a voz):\n${learn.summary}`;
    if (model.historia?.trim()) historiaBlock = `\n\nA HISTÓRIA REAL DO CÂNDIDO (a vida dele, em primeira pessoa). Use QUANDO o conteúdo pedir HISTÓRIA / for sobre MARCA PESSOAL / a abertura partir da vivência dele — pra ancorar em momentos e cicatrizes REAIS, NUNCA inventar biografia nem colar uma frase pronta. NÃO force isto num post puramente técnico. Os pontos sensíveis se tocam com VERDADE e cuidado no peso, nunca como espetáculo nem como troféu:\n${model.historia.trim()}`;
  } catch (e) { console.error("brand/learn roteiro", e instanceof Error ? e.message : String(e)); }
  // CONHECIMENTO DE FUNDO da biblioteca de Fontes (PDFs/artigos/URLs) — embasa sem citar (invisível).
  let sourcesBlock = "";
  try {
    const bg = await sourcesBackground(6000);
    if (bg) sourcesBlock = `\n\nCONHECIMENTO DE FUNDO (da sua biblioteca de Fontes — use SÓ pra embasar e não falar besteira; NÃO cite, NÃO copie frases, NÃO deixe denso, mantenha invisível pra leitora):\n${bg}`;
  } catch (e) { console.error("sources roteiro", e instanceof Error ? e.message : String(e)); }
  const freshBlock = recent.length
    ? `\n\nFRESCOR — EVITE repetir estas figuras/analogias/temas usados recentemente (varie, traga algo novo, não caia no mesmo): ${recent.slice(0, 12).join("; ")}`
    : "";
  // VOZ-OURO RELEVANTE: prioriza os exemplos do MESMO registro (não mais sorteio cego), completa com outros
  const reg = body.registro;
  const gold = await getGold();
  const goldMatch = reg ? gold.filter((g) => g.registro === reg) : [];
  const goldOther = gold.filter((g) => !goldMatch.includes(g));
  // até 3 do MESMO registro (garante a cadência certa) + completa até 5 com outros
  const pickedGold = [...pickRandom(goldMatch, 3), ...pickRandom(goldOther, 5)].slice(0, 5);
  const goldBlock = pickedGold.length
    ? `\n\nA VOZ DO CÂNDIDO — EXEMPLOS REAIS DE COMO ELE ESCREVE (imite a CADÊNCIA, o ritmo, as quebras, o jeito de fechar; NÃO copie tema/frases, é o TOM)${goldMatch.length ? " — priorizei exemplos do MESMO tom" : ""}:\n${pickedGold.map((g, i) => `### exemplo ${i + 1}\n${g.text}`).join("\n\n")}`
    : "";
  // ANTI-OURO — roteiros que o Cândido REJEITOU: o Escritor aprende o que NÃO fazer (não muda COMO escreve, ancora contra)
  const voiceRejects = await getRejects("voice");
  const rejectBlock = voiceRejects.length
    ? `\n\nROTEIROS/ABERTURAS QUE O CÂNDIDO REJEITOU (NÃO escreva assim — ele NÃO curtiu esse tom, ângulo ou jeito; fuja desse padrão):\n${voiceRejects.slice(0, 8).map((r) => `✗ ${r.text}`).join("\n")}`
    : "";
  // ESTRUTURA-OURO RELEVANTE: prefere a do mesmo registro
  const gstructs = await getGoldStructures();
  const structMatch = reg ? gstructs.filter((s) => s.registro === reg) : [];
  const pickedStructs = structMatch.length ? pickRandom(structMatch, 1) : pickRandom(gstructs, 1);
  const structBlock = pickedStructs.length
    ? `\n\nESTRUTURA QUE FUNCIONOU (validada por métrica — use como MOLDE do ARCO, adapte ao tema, não copie):\n${pickedStructs.map((s) => s.outline).join("\n")}`
    : "";

  const userMsg = `${GENERATION_RULES}${reguaBlock}${brandBlock}${historiaBlock}${learnBlock}${regBlock}${funilBlock}${freshBlock}${hkBlock}${emoBlock}${chosenBlock}${corrBlock}${structBlock}${booksBlock}${sourcesBlock}${inlineBlock}${goldBlock}${rejectBlock}\n\nCONTEÚDO BRUTO PRA VIRAR ROTEIRO:\n${content}\n\nEscreva o roteiro corrido, na voz do Cândido. Só o texto.`;

  try {
    // ESCREVE o rascunho (pensa o arco antes; o texto de pensamento não entra no roteiro).
    const gen = await anthropic.messages.create({
      model: WRITE_MODEL,
      max_tokens: 6000,
      thinking: { type: "adaptive" as const },
      system: [{ type: "text", text: ROTEIRO_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMsg }],
    });
    let roteiro = cleanGeneratedText(textOf(gen)) || "";
    const res = { usage: gen.usage };

    // AUTO-LIMPEZA (sempre): se o detector achou tells, conserta SÓ eles — cirúrgico.
    // NÃO reescreve nem "melhora": só tira a cara de IA. Trava de segurança: só aceita se reduziu os
    // tells E manteve o texto (não encurtou). Se piorar/encolher, fica o original. NÃO toca COMO escreve.
    let tells = detectTells(roteiro);
    let cleaned = false;
    if (tells.length > 0) {
      try {
        const cl = await anthropic.messages.create({
          model: CLEAN_MODEL, max_tokens: 2600,
          messages: [{ role: "user", content: `Este é um roteiro do Cândido Netto (Team Netto · N² Squad, voz calma, linear, introspectiva e breve; palavrão só se carregar emoção real, nunca gratuito). Um detector apontou estes possíveis "tells de IA" (vícios de robô): ${tells.join(" | ")}.\n\nConserte SOMENTE esses pontos. REGRAS DURAS:\n- Mude o MÍNIMO possível. Mantenha TODAS as outras palavras, a cadência, as quebras de linha, a pontuação.\n- NÃO reescreva, NÃO "melhore", NÃO suavize, NÃO acrescente ideia nova, NÃO resuma.\n- Se um "tell" na verdade for proposital e bom na voz dele (ex: uma repetição de força, "seu corpo responde a estímulo"), deixe quieto.\n- Tira muleta de IA: "não é X, é Y" virado clichê, travessão demais, exclamação fácil, frase motivacional açucarada ("você consegue"), jargão técnico cru, transição genérica, trocadilho esperto e determinismo confortável. Troca pela forma direta que o Cândido usaria.\n\nDevolva SÓ o texto do roteiro corrigido, nada mais.\n\nROTEIRO:\n${roteiro}` }],
        });
        const cand = textOf(cl).trim();
        const candTells = detectTells(cand);
        if (cand.length > roteiro.length * 0.6 && candTells.length < tells.length) {
          roteiro = cleanGeneratedText(cand) || cand; tells = candTells; cleaned = true;
        }
      } catch (e) { console.error("auto-clean", e instanceof Error ? e.message : String(e)); }
    }

    // ===== JUIZ DE VOZ (Tier 3) — nota 0-100 de "quão Cândido é", comparando com os exemplos-ouro.
    // Se baixo, regenera UMA vez com a crítica e fica com o melhor dos dois. Se o juiz falhar, não bloqueia.
    let voiceScore: number | null = null;
    let voiceIssues: string[] = [];
    let regenerated = false;
    async function judgeVoice(text: string): Promise<{ score: number; issues: string[] }> {
      const refs = pickedGold.length
        ? pickedGold.map((g, i) => `### exemplo ${i + 1}\n${g.text}`).join("\n\n")
        : "(sem exemplos-ouro ainda — julgue pela régua de voz do Cândido: calmo, breve, hesita na reflexão, detalhe mundano, fecha na verdade incômoda, zero cara de IA/coachismo)";
      const jr = await anthropic.messages.create({
        model: JUDGE_MODEL, max_tokens: 500,
        messages: [{ role: "user", content: `Você é o juiz de voz do Cândido Netto (Team Netto · N² Squad). Compare o ROTEIRO com os EXEMPLOS REAIS da escrita dele e dê uma nota 0-100 de "quão Cândido isso soa": cadência, brevidade, hesitação na reflexão (não no fato técnico), detalhe concreto/mundano, fecho na verdade incômoda, e ZERO cara de IA / coachismo / motivação açucarada. Seja rigoroso — 100 é "parece escrito por ele". Responda APENAS JSON {"score": <int 0-100>, "issues": ["o que mais destoa da voz dele, bem curto", ...]} (até 4 issues; [] se estiver ótimo).\n\nEXEMPLOS REAIS DA VOZ DELE:\n${refs}\n\nROTEIRO A JULGAR:\n${text}` }],
      });
      try {
        const j = JSON.parse(extractJson(textOf(jr))) as { score?: number; issues?: string[] };
        return { score: Math.max(0, Math.min(100, Math.round(Number(j.score) || 0))), issues: (j.issues || []).map((x) => (x || "").trim()).filter(Boolean).slice(0, 4) };
      } catch { return { score: 100, issues: [] }; }
    }
    try {
      const v1 = await judgeVoice(roteiro);
      voiceScore = v1.score; voiceIssues = v1.issues;
      if (v1.score < VOICE_MIN) {
        const fb = `\n\nA TENTATIVA ANTERIOR NÃO SOOU SUFICIENTEMENTE COMO O CÂNDIDO (nota ${v1.score}/100). Reescreva o roteiro inteiro mais na cadência REAL dele (mais breve, mais hesitação na reflexão, detalhe mundano, fecho na verdade incômoda, ZERO cara de IA/coachismo), corrigindo: ${v1.issues.join(" | ") || "soou redondo/genérico demais"}. NÃO perca a substância nem o gancho escolhido.`;
        const gen2 = await anthropic.messages.create({
          model: WRITE_MODEL, max_tokens: 6000, thinking: { type: "adaptive" as const },
          system: [{ type: "text", text: ROTEIRO_SYSTEM, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: userMsg + fb }],
        });
        let r2 = cleanGeneratedText(textOf(gen2)) || "";
        let t2 = detectTells(r2);
        if (t2.length > 0) {
          try {
            const cl2 = await anthropic.messages.create({
              model: CLEAN_MODEL, max_tokens: 2600,
              messages: [{ role: "user", content: `Conserte SOMENTE estes tells de IA, mudando o MÍNIMO (mantenha cadência, quebras, pontuação; não reescreva, não resuma): ${t2.join(" | ")}.\n\nROTEIRO:\n${r2}` }],
            });
            const c2 = textOf(cl2).trim();
            const c2t = detectTells(c2);
            if (c2.length > r2.length * 0.6 && c2t.length < t2.length) { r2 = cleanGeneratedText(c2) || c2; t2 = c2t; }
          } catch {}
        }
        const v2 = await judgeVoice(r2);
        // fica com o melhor: nota do juiz decide; empate → menos tells
        if (r2.length > 80 && (v2.score > v1.score || (v2.score === v1.score && t2.length < tells.length))) {
          roteiro = r2; tells = t2; voiceScore = v2.score; voiceIssues = v2.issues; regenerated = true;
        }
      }
    } catch (e) { console.error("voice-judge", e instanceof Error ? e.message : String(e)); }

    // registra a ponte usada (frescor) — o pedaço-chave antes do "—"
    if (correlation) { try { await addFreshness(correlation.split("—")[0]); } catch {} }
    // FRESCOR DO ÂNGULO: registra a abertura pra não repetir o mesmo tipo de gancho (só quando não foi gancho travado)
    if (!chosen) { try { const op = roteiro.split(/\n|(?<=[.?!])\s/)[0].replace(/\*\*/g, "").trim(); if (op.length > 14) await addFreshness(op.slice(0, 70)); } catch {} }
    return Response.json({ roteiro, tells, cleaned, voiceScore, voiceIssues, regenerated, usage: res.usage });
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
