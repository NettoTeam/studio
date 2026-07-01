// SINAIS VITAIS — o organismo vivo da marca. Tudo num lugar só (sem feature espalhada).
// Cada post carrega UM registro. Daí saem: A Dose (divisão do mês) e o alarme de desequilíbrio.
//
// NOMES INTERNOS x RÓTULOS: as chaves (ferida/porrada/ensino/convocacao) são IDs antigos mantidos
// pra não quebrar posts/planos já salvos. O que a marca mostra são os LABELS novos:
//   ferida → 🎯 Diagnóstico · porrada → 🔥 Confronto · ensino → 🧠 Clareza Estratégica
//   convocacao → ⚔️ Convocação · dominio → 👑 Domínio (novo) · darkside → ☠️ Darkside (camada)

export type Registro = "porrada" | "ferida" | "ensino" | "convocacao" | "dominio" | "darkside";

export interface RegInfo {
  id: Registro;
  label: string;
  emoji: string;
  color: string;   // cor do registro nas barras/pontos
  target: number;  // proporção-alvo (a "dieta de manutenção" da marca) — os 5 de distribuição somam 1
  o_que: string;   // o que é, em uma linha
  layer?: boolean; // camada transversal (Darkside): selecionável como tom, mas FORA da conta da Dose
}

// A régua da marca. Os 5 de distribuição somam 100% (30/25/20/15/10). Darkside é camada (não entra na conta).
export const REGISTROS: RegInfo[] = [
  { id: "ferida",     label: "Diagnóstico",        emoji: "🎯", color: "#c77dad", target: 0.30, o_que: "enxerga o problema que ela ainda não viu — valida a dor, nunca a desculpa" },
  { id: "porrada",    label: "Confronto",          emoji: "🔥", color: "#ef476f", target: 0.25, o_que: "o vilão é lá fora — mercado, atalho e promessa falsa, não a leitora" },
  { id: "dominio",    label: "Domínio",            emoji: "👑", color: "#b98bd9", target: 0.20, o_que: "demonstra leitura e profundidade — autoridade percebida, nunca declarada" },
  { id: "ensino",     label: "Clareza Estratégica", emoji: "🧠", color: "#3e7cc4", target: 0.15, o_que: "faz enxergar o mecanismo — diagnóstico, causa, consequência, direção" },
  { id: "convocacao", label: "Convocação",         emoji: "⚔️", color: "#e0a458", target: 0.10, o_que: "chama pra assumir responsabilidade e uma identidade, não pra comprar" },
  { id: "darkside",   label: "Darkside",           emoji: "☠️", color: "#8a8a96", target: 0,    o_que: "camada de aço — verdade inconveniente, sem açúcar, clareza brutal", layer: true },
];

export const REG_MAP: Record<Registro, RegInfo> = Object.fromEntries(REGISTROS.map((r) => [r.id, r])) as Record<Registro, RegInfo>;

// só os registros que entram na divisão do mês (Darkside fica de fora — é camada, não fatia)
const DIST: RegInfo[] = REGISTROS.filter((r) => !r.layer);
const DIST_IDS = new Set(DIST.map((r) => r.id));

// notas curtas quando passa/falta — na voz do Cândido, sem jargão de academia
const NOTA_ALTO: Record<Registro, string> = {
  porrada: "demais — anestesia",
  ferida: "demais — só dor, sem direção",
  dominio: "demais — virou vitrine de ego",
  ensino: "demais — virou aula",
  convocacao: "demais — pedindo muito",
  darkside: "—",
};
const NOTA_BAIXO: Record<Registro, string> = {
  porrada: "de menos — falta sacudida",
  ferida: "de menos — ninguém se viu no espelho",
  dominio: "de menos — falta autoridade",
  ensino: "de menos — falta clareza",
  convocacao: "de menos — não chama",
  darkside: "—",
};

// O TOM que cada registro impõe ao roteiro inteiro — ANCORADO na voz real do Cândido Netto (Team Netto · N² Squad).
// É POSTURA e SUBSTÂNCIA, não cadência: a cadência manda nos exemplos "⭐ minha voz". Não brigue com o ritmo dele.
// Definições estruturais (essência / verdade central / linguagem / o que fala / o que nunca fala / sensação) vêm da marca.
const TOM: Record<Registro, string> = {
  ferida:
    "Registro DIAGNÓSTICO — o texto não consola, DIAGNOSTICA. A leitora está cansada de tentar e não entender por que continua sem resultado; ela não precisa de mais motivação, precisa de alguém que enxergue o problema que ela ainda não conseguiu enxergar. O objetivo não é consolar, é gerar IDENTIFICAÇÃO. O que vem antes de tudo é VALIDAÇÃO DA DOR — nunca validação da desculpa: a dor dela é real, mas o motivo da dor quase nunca é o que ela acredita. Linguagem calma, firme, segura, madura, direta. Fala muito 'eu vejo isso todos os dias', 'existe um motivo pra isso acontecer', 'o problema não é o que você imagina', 'você não está sozinha nisso'. NUNCA fala 'você consegue', 'vai dar certo', 'basta acreditar', 'sua hora vai chegar', 'confie no processo' — pra marca isso é só mais uma promessa que afunda a pessoa. A conexão vem de quem já orientou centenas de mulheres no mesmo lugar, não de pena nem de superioridade. Sensação que tem que gerar: 'era exatamente isso que estava acontecendo comigo'. Fecha na verdade, sem laço bonito.",
  porrada:
    "Registro CONFRONTO — existe um culpado, e quase nunca é a pessoa: é o mercado, a informação ruim, o método errado, a promessa falsa, o atalho vendido como solução. O que vem antes de tudo é INDIGNAÇÃO, mirada nessa injustiça (a mulher é enganada e depois culpada quando o atalho não funciona), não birra. Verdade central: muita gente continua travada porque acreditou na explicação errada. Linguagem incômoda, provocativa, direta, sem medo de discordar. Fala muito 'estão mentindo pra você', 'ninguém te contou isso', 'o mercado quer que você acredite nisso', 'é exatamente por isso que você continua travada'. NUNCA fala 'você é preguiçosa', 'a culpa é sua', 'você não quer o suficiente' — não humilha; a sabotagem vem de falta de informação e de promessa quebrada, não de fraqueza de caráter. Devolve a responsabilidade à adulta DEPOIS de mostrar o caminho. Sensação: 'eu sabia que tinha alguma coisa errada'. Termina numa verdade que incomoda, não num efeito bonito.",
  dominio:
    "Registro DOMÍNIO — demonstra capacidade de leitura, profundidade e experiência: você enxerga detalhes que a maioria ignora. Não é ensinar, não é confrontar, não é convocar — é demonstrar superioridade técnica SEM precisar dizer que é superior. O que vem antes de tudo é OBSERVAÇÃO. Verdade central: os melhores profissionais enxergam o que os outros não enxergam. Linguagem segura, precisa, cirúrgica, quase arrogante mas nunca arrogante. Fala muito 'quando eu analiso uma aluna, observo isso primeiro', 'quase ninguém percebe esse detalhe', 'é aqui que a maioria dos profissionais erra', 'o problema está escondido num lugar que ninguém olha', 'esse detalhe muda completamente o resultado'. NUNCA fala 'eu sou referência', 'eu sou especialista', 'eu sou o melhor', 'confia em mim' — a autoridade é PERCEBIDA, nunca declarada. Arquétipos: mestre, estrategista, especialista de elite. Ex.: 'duas mulheres podem fazer exatamente o mesmo treino e uma evoluir muito mais — o motivo quase nunca é o exercício, é a capacidade de gerar sobrecarga ao longo do tempo'. Sensação: 'esse cara enxerga um nível acima'.",
  ensino:
    "Registro CLAREZA ESTRATÉGICA — não ensina pra parecer inteligente, ensina pra gerar CLAREZA: o objetivo não é mostrar conhecimento, é fazer a pessoa enxergar o MECANISMO. O que vem antes de tudo é DIAGNÓSTICO, sempre. Verdade central: quem entende o problema toma decisões melhores. Estrutura: diagnóstico → causa → consequência → direção. Linguagem simples, objetiva, prática, cirúrgica. Fala muito 'o erro está aqui', 'é por isso que acontece', 'é por isso que não funciona', 'o problema real é esse'. NUNCA fala 'segundo os estudos', 'a literatura demonstra', 'metanálises mostram' — a ciência SUSTENTA a mensagem, ela não lidera a mensagem. Uma alavanca por vez, o porquê fisiológico traduzido na voz do Cândido, denso o suficiente pra respeitar a inteligência da leitora, nunca infantilizado ('amiga, faz 3x12 que dá certo'). O ser humano antes do protocolo. Sensação: 'agora tudo faz sentido'.",
  convocacao:
    "Registro CONVOCAÇÃO — não chama pra comprar, seguir ou assistir: chama pra ASSUMIR RESPONSABILIDADE e pra uma IDENTIDADE. O que vem antes de tudo é COMPROMISSO. Verdade central: nem todo mundo terá o resultado que diz querer, porque nem todo mundo aceita pagar o preço necessário. A própria linguagem é o filtro — forte, madura, seletiva, responsável; afasta quem quer atalho, chama quem quer construir de verdade. Fala muito 'existe um preço', 'existe uma escolha', 'existe um padrão', 'existe uma responsabilidade'. NUNCA fala 'últimas vagas', 'corre', 'aproveita', 'não perca' — nunca vendedor pidão, nunca escassez falsa. O pacto: ela MERECE o resultado, o Cândido mostra o melhor caminho mas NÃO caminha por ela (a responsabilidade é dela). Sensação: 'eu preciso estar desse lado'. Fecha obrigando a escolher um lado: construir de verdade, ou seguir recomeçando pra sempre.",
  darkside:
    "Camada DARKSIDE — sobreposição de postura pra quando o conteúdo precisa de aço, não de açúcar. (1) Confronto antes do conforto: não começa com 'você consegue', começa com 'você está fazendo errado' ou 'ninguém te contou isso'. (2) Verdade inconveniente: expõe uma verdade que a audiência evita encarar ('você consome mais conteúdo do que executa método e progressão'). (3) Autoridade de campo: não fala como professor, psicólogo ou coach — fala como quem já viu centenas ou milhares de casos. (4) Sem emoção açucarada: evita 'estamos aqui por você'; prefere 'o mercado não vai diminuir a régua porque você está cansado'. (5) Clareza brutal: frases curtas, sem floreio, sem academicismo, sem complicação. Sensação que tem que gerar: 'a verdade que eu precisava ouvir'.",
};

// REGRA GLOBAL DA MARCA — DESMASCARAMENTO. Vale pra TODO post, com ou sem registro escolhido.
const REGRA_GLOBAL =
  "REGRA GLOBAL DA MARCA — DESMASCARAMENTO. Todo conteúdo responde a duas perguntas: (1) o que a audiência ACREDITA ser o problema? (2) o que REALMENTE é o problema? Ex.: ela acredita 'meu glúteo não cresce porque não tenho genética' → realidade 'seu glúteo não cresce porque nunca recebeu sobrecarga suficiente'. Ela acredita 'meu problema é motivação' → realidade 'seu problema é falta de estrutura'. A função da marca é desmascarar a falsa explicação e revelar a causa real do problema.";

export function registroBlock(id?: Registro | string | null): string {
  const r = id && id in TOM ? (id as Registro) : null;
  const head = r
    ? `\n\nREGISTRO / TOM DO POST (sua escolha — o roteiro INTEIRO vive neste tom). Isto define a POSTURA e a SUBSTÂNCIA; a CADÊNCIA continua sendo a dos exemplos de voz do Cândido (não atropele o ritmo dele):\n- ${TOM[r]}`
    : "";
  return `${head}\n\n${REGRA_GLOBAL}`;
}

export interface DoseRow {
  info: RegInfo;
  n: number;
  pct: number;
  status: "ok" | "alto" | "baixo";
  nota: string;
}
export interface Dose {
  total: number;
  rows: DoseRow[];
  alarme: string | null;   // o desequilíbrio mais grave do mês (um só)
  pede: Registro | null;   // o que o ritmo pede agora (o mais em falta)
}

const TOL = 0.12;   // tolerância (±12 pontos) antes de gritar
const MIN = 3;      // abaixo disso não dá pra julgar ritmo

export function computeDose(registros: (Registro | undefined | null)[]): Dose {
  // só os registros de DISTRIBUIÇÃO entram na conta (Darkside é camada — fica de fora do numerador e do denominador)
  const tagged = registros.filter((r): r is Registro => !!r && DIST_IDS.has(r));
  const total = tagged.length;

  const rows: DoseRow[] = DIST.map((info) => {
    const n = tagged.filter((r) => r === info.id).length;
    const pct = total ? n / total : 0;
    const diff = pct - info.target;
    let status: "ok" | "alto" | "baixo" = "ok";
    if (total >= MIN) {
      if (diff > TOL) status = "alto";
      // registro de alvo baixo (ex: convocação 10% < tolerância 12%) nunca cairia em "baixo" pela conta.
      // pra ele, "baixo" = AUSÊNCIA total no mês. pros grandes, a banda normal.
      else if (info.target <= TOL ? n === 0 : diff < -TOL) status = "baixo";
    }
    const nota = status === "ok" ? "no ponto" : status === "alto" ? NOTA_ALTO[info.id] : NOTA_BAIXO[info.id];
    return { info, n, pct, status, nota };
  });

  let alarme: string | null = null;
  let pede: Registro | null = null;
  if (total >= MIN) {
    const alto = [...rows].filter((r) => r.status === "alto").sort((a, b) => (b.pct - b.info.target) - (a.pct - a.info.target))[0];
    const baixo = [...rows].filter((r) => r.status === "baixo").sort((a, b) => (a.pct - a.info.target) - (b.pct - b.info.target))[0];
    pede = baixo?.info.id || null;
    if (alto && baixo) alarme = `o mês tá com ${alto.info.emoji} ${alto.info.label.toLowerCase()} ${alto.nota} e ${baixo.info.emoji} ${baixo.info.label.toLowerCase()} ${baixo.nota}.`;
    else if (alto) alarme = `o mês tá com ${alto.info.emoji} ${alto.info.label.toLowerCase()} ${alto.nota}.`;
    else if (baixo) alarme = `o mês tá com ${baixo.info.emoji} ${baixo.info.label.toLowerCase()} ${baixo.nota}.`;
  }

  return { total, rows, alarme, pede };
}

// CONVOCAÇÃO — o "pedido" da marca. Não se mede por proporção (alvo baixo), se mede por CADÊNCIA:
// entregar bastante e, de tempos em tempos, chamar pra dentro. Recebe os registros JÁ ordenados (antigo→novo).
export interface ConvStatus { n: number; desde: number; never: boolean; pede: boolean }
export function convocacaoStatus(orderedRegistros: (Registro | undefined | null)[]): ConvStatus {
  const seq = orderedRegistros.filter(Boolean) as Registro[];
  const n = seq.length;
  const last = seq.lastIndexOf("convocacao");
  const never = last === -1;
  const desde = never ? n : n - 1 - last; // quantos posts desde a última convocação
  // só cobra DEPOIS de ter entregado um tanto (nunca no começo) — pra não virar pedinte
  const pede = never ? n >= 5 : desde >= 6;
  return { n, desde, never, pede };
}

// ALARMES DE SEQUÊNCIA — olham a ORDEM (cronológica) dos posts, não só a proporção.
// Recebe os registros JÁ ordenados do mais antigo pro mais novo.
export interface SeqAlert { tipo: string; msg: string }
export function sequenceAlerts(orderedRegistros: (Registro | undefined | null)[]): SeqAlert[] {
  const seq = orderedRegistros.filter(Boolean) as Registro[]; // só os marcados, em ordem
  const n = seq.length;
  const alerts: SeqAlert[] = [];
  if (n < 2) return alerts;

  // 1) CONFRONTOS SEGUIDOS — streak no fim da sequência (os mais recentes)
  let streak = 0;
  for (let i = n - 1; i >= 0 && seq[i] === "porrada"; i--) streak++;
  if (streak >= 3) alerts.push({ tipo: "porrada-streak", msg: `${streak} 🔥 confrontos seguidos — tá gritando, a galera anestesia. Respira num 🎯 diagnóstico.` });

  // 2) MUITO TEMPO SEM DIAGNÓSTICO — quantos posts desde o último
  const lastFerida = seq.lastIndexOf("ferida");
  const desdeFerida = lastFerida === -1 ? n : n - 1 - lastFerida;
  if (n >= 4 && desdeFerida >= 4) {
    alerts.push({ tipo: "sem-ferida", msg: lastFerida === -1
      ? `${n} posts e nenhum 🎯 diagnóstico — virou só técnica e sacudida, ninguém se viu no espelho.`
      : `${desdeFerida} posts desde o último 🎯 diagnóstico — a identificação tá esfriando.` });
  }

  // 3) CONVOCAÇÕES COLADAS — duas seguidas
  for (let i = 1; i < n; i++) {
    if (seq[i] === "convocacao" && seq[i - 1] === "convocacao") {
      alerts.push({ tipo: "convoca-dupla", msg: `2 ⚔️ convocações coladas — tá pedindo demais, ainda não mereceu. Entrega antes de pedir de novo.` });
      break;
    }
  }
  return alerts;
}
