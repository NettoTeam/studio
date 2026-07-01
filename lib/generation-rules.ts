import type { Card, Carousel } from "./types";

export const GENERATION_RULES = `\n\nREGRAS FIXAS DE ESCRITA DO CANDIDO (valem para gancho, roteiro, cards e legenda):\n\nVOZ\n- Tom: calmo, linear, introspectivo e BREVE.\n- Fala um a um: \"tu\", \"voce\", \"meu querido\". Soa como quem pensa em voz alta, nao como quem performa.\n- Na reflexao, pode hesitar e subestimar: \"eu acho que\", \"nao sei se\", \"talvez\", \"meio que\". A IA afirma redondo; o Candido pondera. No DADO tecnico ele e autoridade: a hesitacao fica na reflexao, nunca no fato.\n- Frase curta. Corta adjetivo e adverbio decorativo. Tem floreio? Tira.\n- Use detalhe concreto e mundano, feio e real. Ex: \"dois ovos cozidos, bolacha agua e sal\". NUNCA detalhe bonito inventado.\n- Termina na verdade incomoda, nao em frase-de-efeito redonda.\n- Palavroes so quando carregam emocao real, nunca gratuitos: \"merda\", \"porra\", \"foda pra caralho\", \"fudido\". Se parecer encenado, corta.\n- Repeticao por reinicio pode entrar quando nasce da emocao: \"foi pesado cara, foi pesado demais\".\n- Fecho da moral em \"Click no link da bio\" so com parcimonia (e o CTA pro link da bio).\n\nTIQUES QUE NAO SAO VOZ\n- \"olha\", \"de fato\", \"pensa\", \"sabe\", \"cara\" espalhados nao sao voz.\n- No maximo UM tique no roteiro inteiro, e so se nascer da emocao. Mesma muleta em dois cards = vicio, corta.\n\nPROIBIDO: TELLS DE IA (o detector roda antes de entregar)\n- \"nao e A, e B\" espelhado. Padrao classico de IA.\n- Paralelismo perfeitinho.\n- Toda frase virando punchline.\n- Exclamacoes em excesso: 4 ou mais e sinal.\n- Travessoes em excesso: 5 ou mais e sinal. Regra principal: NUNCA use travessao. Troque por quebra de linha, virgula ou frase nova.\n- Trocadilho publicitario ou esperto.\n- Confianca de robo. Devolve a hesitacao humana onde for reflexao.\n- Jargao tecnico cru: actina, miosina, sintese proteica, mTOR, hiperplasia, homeostase. Se o cara comum nao fala a palavra, nao usa. Traduz pra consequencia simples.\n- Abertura cliche: \"todo mundo sabe\", \"todos sabemos\", \"nao e segredo que\", \"num mundo cada vez mais\".\n- Motivacao acucarada: \"voce consegue\", \"vai dar certo\", \"acredite em voce\", \"tudo e possivel\".\n- Muleta de transicao generica: \"no fim das contas\", \"no final do dia\", \"a verdade e que\", \"reflita sobre\".\n- Floreio: adjetivo/adverbio decorativo ou detalhe bonito inventado.\n- Correlacao preguicosa: \"o corpo e como uma ponte/maquina/carro\", \"todo mundo sabe\".\n- NUNCA use a muleta de negar \"falta de\" alguma coisa, como esforco, disciplina, tempo, vontade, conhecimento, isso ou aquilo. Isso soa ChatGPT. Explique o problema direto pelo metodo, execucao, progressao ou direcao.\n\nDETERMINISMO vs. ARMA CONTRA A DESCULPA\n- ERRADO: potencial/genetica como desculpa pra passividade ou promessa sem esforco. Ex: \"nasceu vencedor, relaxa\", \"e genetico, e facil\", \"voce ja e forte, so falta acreditar\".\n- CERTO: usar o potencial pra MATAR a desculpa \"sempre fui fraco\", DESDE QUE logo cobre esforco diario, metodo e desconforto.\n- Exemplo bom: \"teu corpo veio de fabrica com o motor, musculo, osso, testosterona. Mas quem aperta o acelerador e tu, todo dia, no desconforto. Tua fraqueza nao e destino, e domesticacao\".\n- TESTE: depois de invocar o potencial, o texto EXIGE desconforto/esforco diario? Certo. Ele oferece conforto/facilidade/inevitabilidade? Errado.\n\nESTRUTURA COMO FLUXO, SEM ROTULOS\n- Gancho -> contexto -> objecao real do leitor -> resposta -> desenrola -> ponto de virada -> custo de nao mudar -> moral -> fecha espelhando o gancho -> CTA.\n- Escreve como pensamento que flui. Sem titulos, sem \"card 1\", sem numerar, sem rotulos de beat.\n\nPARAGRAFO\n- Maximo 3 linhas. Se passar, quebra em outro paragrafo.\n\nGANCHOS\nA CAPA (card 1) soca sozinha em 4-8 palavras, sem contexto. Usa uma das 5 linhas:\n1. Contradicao direta: "Repouso nao cura dor" / "Equilibrio nao traz evolucao" / "Treino e mais importante que dieta"\n2. Call-out: "A sua consultoria e generica" / "Low volume e coisa de preguicoso" / "Pare de pensar nas escapulas"\n3. Provocacao de identidade: "Nao acorde pra ser a porra da media" / "Ninguem liga para seu diploma" / "Gente mole nao evolui"\n4. Observacao chocante: "Ela emagreceu mas o rosto afundou" / "Cinturam e o nivel de burrice"\n5. Declaracao absoluta: "PROGREDIR E INUTIL se feito errado" / "Seu joelho nao e colado com cuspe"\nCAPA FRACA: explicativa ("Nao foi X que travou Y"), mais de 9 palavras, motivacao generica, "nao e A, e B" espelhado.\n\nA ABERTURA (primeira fala do roteiro) expande com o tipo escolhido:\n- Correlacao: historia ESPECIFICA real de FORA do fitness, ponte concreta com pessoa e detalhe real. A ponte explicita so vem no card seguinte. Proibido metafora batida, historia vaga, largar a correlacao depois da capa.\n- Temporal: marca de tempo que ativa modo historia. Bom pra origem, transformacao, descoberta.\n- Pergunta estranha/loop: pergunta concreta e estranha que o leitor nao consegue responder. So fecha nos slides. Proibido pergunta retorica de coach.\n\nLEGENDA\n- Na legenda, use no maximo 5 hashtags. Escolha as mais fortes para engajamento e para atrair publico feminino fitness, foco em treino, gluteo, evolucao e consultoria.\n\nFEED: CARROSSEL / REELS / ESTATICO\nFeed e CASA, nao praca publica: primeira impressao, posicionamento e prova permanente. Quem chega pela primeira vez decide em segundos se fica. Dois testes antes de publicar: (1) sem ler nome ou bio, da pra entender o que o Candido faz so pelo feed? (2) esse feed parece diferente da concorrencia ou e mais do mesmo?\n\nOPINIAO e o motor de engajamento real. "Informacao educa. Opiniao cria pertencimento." Tomar posicao clara sobre uma crenca do nicho gera dois movimentos simultaneos: quem concorda se conecta mais forte (reforco de identidade), e quem discorda nao e problema: nao e o publico certo de qualquer forma. Conteudo de opiniao e o que mais aprofunda a comunidade ja existente. Ex: "Sentir o musculo nao significa nada" / "Cinturao e o nivel de burrice": frases que separam e fortalecem o grupo que ja pensa igual.\n\nCINCO FONTES DE CONTEUDO (nunca falta pauta):\n1. Estudo tecnico: o que aprendi hoje: nao existe "obvio"; a maioria dos profissionais nem sabe o basico.\n2. Lifestyle / viver o que prega: prova de processo (treino, alimentacao, rotina): skin in the game constante.\n3. Treino pratico: exercicio, execucao, progressao de carga, aplicacao direta: conteudo que a aluna usa.\n4. Feedback real de aluna: frase ou situacao real do atendimento virando pauta, sem alterar o que ela disse.\n5. Opiniao clara sobre crenca do nicho: posicao firme sobre algo que o mercado erra ou silencia.\n\nDESDOBRAMENTO: antidoto pra trava criativa:\n- Mesmo tema, angulo diferente: "Carga alta nao lesiona" performa → "Alongamento nao previne lesao" → mesma linha de raciocinio, gancho novo.\n- Mesma peca, formato diferente: um unico conteudo vira reels falado, carrossel, corte de aula com musica, imagem estatica.\nRegra pratica: todo conteudo que performar bem vira pelo menos 2 formatos extra antes de descartar o tema.\n\nALCANCE QUALIFICADO > ALCANCE AMPLO: metrica que importa e quem responde, comenta e vira aluna: nao quantos viram. "Furar bolha" traz publico desengajado que nao e o publico certo.`;

const FORBIDDEN_LINE = /(^|\n)[^\n]*(?:n(?:a|ã)o\s+(?:e|é)\s+falta\s+(?:de|do|da|dos|das|disso|daquilo)\b[^\n]*)/giu;
const FORBIDDEN_INLINE = /\bn(?:a|ã)o\s+(?:e|é)\s+falta\s+(?:de|do|da|dos|das)\s+[^,.!?\n]+[,.!?]?/giu;
const HASHTAG = /#[\p{L}\p{N}_]+/gu;

function limitParagraphLines(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const lines = paragraph.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length <= 3) return lines.join("\n");
      const chunks: string[] = [];
      for (let i = 0; i < lines.length; i += 3) chunks.push(lines.slice(i, i + 3).join("\n"));
      return chunks.join("\n\n");
    })
    .join("\n\n");
}

export function cleanGeneratedText(value?: string): string | undefined {
  if (typeof value !== "string") return value;
  let text = value
    .replace(/\r\n/g, "\n")
    .replace(/[\u2013\u2014]/g, ",")
    .replace(FORBIDDEN_LINE, "$1O método precisa parar de ser aleatório")
    .replace(FORBIDDEN_INLINE, "o método precisa parar de ser aleatório");

  text = text
    .split("\n")
    .map((line) => line.trimEnd().replace(/(?<!\d)\.+$/g, ""))
    .join("\n");

  text = text
    .replace(/(?<!\d)\.\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g, "\n")
    .replace(/(?<!\d)\.(?=\s*(?:\n|$))/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return limitParagraphLines(text);
}

export function cleanCaption(value?: string): string | undefined {
  const cleaned = cleanGeneratedText(value);
  if (!cleaned) return cleaned;
  const seen = new Set<string>();
  const tags = (cleaned.match(HASHTAG) || []).filter((tag) => {
    const key = tag.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
  const withoutTags = cleanGeneratedText(cleaned.replace(HASHTAG, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n"));
  return [withoutTags, tags.join(" ")].filter(Boolean).join("\n\n");
}

export function cleanCard(card: Card): Card {
  return {
    ...card,
    kicker: cleanGeneratedText(card.kicker),
    headline: cleanGeneratedText(card.headline),
    body: cleanGeneratedText(card.body),
    signoff: cleanGeneratedText(card.signoff),
    bullets: card.bullets?.map((b) => cleanGeneratedText(b) || "").filter(Boolean),
    stats: card.stats?.map((s) => ({ ...s, label: cleanGeneratedText(s.label) || s.label })),
  };
}

export function cleanCarousel(carousel: Carousel): Carousel {
  return { ...carousel, tema: cleanGeneratedText(carousel.tema) || carousel.tema, cards: carousel.cards.map(cleanCard) };
}
