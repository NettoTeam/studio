// SINAIS VITAIS — o organismo vivo da marca. Tudo num lugar só (sem feature espalhada).
// Cada post carrega UM registro. Daí saem: A Dose (divisão do mês) e o alarme de desequilíbrio.

export type Registro = "porrada" | "ferida" | "ensino" | "convocacao";

export interface RegInfo {
  id: Registro;
  label: string;
  emoji: string;
  color: string;   // cor do registro nas barras/pontos
  target: number;  // proporção-alvo (a "dieta de manutenção" da marca) — soma ~1
  o_que: string;   // o que é, em uma linha
}

// A régua inicial (chute honesto). Depois a Memória ajusta pra realidade do Cândido.
export const REGISTROS: RegInfo[] = [
  { id: "ferida",     label: "Ferida",     emoji: "🩷", color: "#9aa0b0", target: 0.35, o_que: "acolhe, conecta — 'eu também já passei por isso'" },
  { id: "porrada",    label: "Porrada",    emoji: "🔥", color: "#ef476f", target: 0.30, o_que: "confronta, acorda, para o scroll" },
  { id: "ensino",     label: "Ensino",     emoji: "🧠", color: "#3e7cc4", target: 0.25, o_que: "entrega o método, prova substância" },
  { id: "convocacao", label: "Convocação", emoji: "⚔️", color: "#e0a458", target: 0.10, o_que: "chama pra ação / consultoria" },
];

export const REG_MAP: Record<Registro, RegInfo> = Object.fromEntries(REGISTROS.map((r) => [r.id, r])) as Record<Registro, RegInfo>;

// notas curtas quando passa/falta — na voz do Cândido, sem jargão de academia
const NOTA_ALTO: Record<Registro, string> = {
  porrada: "demais — anestesia",
  ferida: "demais — só dor",
  ensino: "demais — virou aula",
  convocacao: "demais — pedindo muito",
};
const NOTA_BAIXO: Record<Registro, string> = {
  porrada: "de menos — falta sacudida",
  ferida: "de menos — esfriou",
  ensino: "de menos — falta peso",
  convocacao: "de menos — não chama",
};

// O TOM que cada registro impõe ao roteiro inteiro — ANCORADO na voz real do Cândido Netto (Team Netto · N² Squad).
// É POSTURA e SUBSTÂNCIA, não cadência: a cadência manda nos exemplos "⭐ minha voz". Não brigue com o ritmo dele.
const TOM: Record<Registro, string> = {
  porrada:
    "Registro PORRADA — o texto CONFRONTA. O vilão é SEMPRE lá fora, nunca a leitora fragilizada: a indústria fitness que vende 'bumbum em 30 dias', os coaches que prometem milagre, a influencer que mostra resultado de cirurgia como se fosse treino, a dieta da moda que foi feita pra falhar. A indignação é MIRADA nessa injustiça (a mulher é enganada e depois culpada quando o atalho não funciona), não é birra. Quando o confronto for com o comportamento da leitora, lembre: a sabotagem dela vem de FALTA DE INFORMAÇÃO e de promessa quebrada, não de fraqueza de caráter — então não humilhe ninguém; devolva a responsabilidade à adulta DEPOIS de mostrar o caminho ('só depende de você, você vai errar, e mesmo assim não pode parar'). Sem afago de ego, sem motivação vazia. Termina numa verdade que incomoda, não num efeito bonito.",
  ferida:
    "Registro FERIDA — acolhe pela VERDADE, não pelo açúcar. ATENÇÃO: a ferida da marca (Team Netto · N² Squad) REJEITA conforto vazio e motivação fácil. NUNCA escreva 'você consegue', 'vai dar certo', 'acredite que vai' — pra marca isso é só mais uma promessa que afunda a pessoa. O acolhimento é pôr a realidade na frente: 'você vai errar — e PRECISA errar, é errando que se acha o caminho'. A conexão vem da experiência de quem já orientou centenas de mulheres no mesmo lugar, não de superioridade nem de pena: 'eu já vi você aí, e por isso sei te orientar pra você sofrer MENOS, errar menos, e chegar mais rápido'. Há firmeza DENTRO do acolhimento. Terreno sensível (frustração, comparação, autoimagem) se trata com cuidado no peso, mas se fala com honestidade. Fecha na verdade, sem laço bonito.",
  ensino:
    "Registro ENSINO — ensinar é DIAGNOSTICAR, não cuspir protocolo. Parte de ler a realidade da pessoa (rotina, hábitos E o nível dela) e aponta a alavanca certa PRIMEIRO: o 80/20 dela — o que dá resultado rápido pra ela sentir o processo e ficar no jogo (execução? dieta? constância? sono?). Autoridade que vem do diagnóstico ('eu vejo o que você precisa primeiro'), não de aula genérica. Uma alavanca por vez, o porquê fisiológico traduzido na voz do Cândido — denso o suficiente pra respeitar a inteligência da leitora, nunca infantilizado ('amiga, faz 3x12 que dá certo'). O ser humano antes do protocolo.",
  convocacao:
    "Registro CONVOCAÇÃO — convoca pra um MOVIMENTO, não vende um serviço. A própria linguagem é o filtro: madura e técnica, JAMAIS simplificada — afasta quem quer atalho, chama quem quer construir de verdade. O pacto que a pessoa aceita: que ela MERECE o resultado, sabendo que o Cândido mostra o melhor caminho mas NÃO caminha por ela (a responsabilidade é dela). Tom de quem lidera quem chegou até aqui — respeito, não arrogância; nunca vendedor pidão, nunca escassez falsa ('últimas vagas!!'). Ecoa o que a marca acredita: resultado se constrói com método e constância, todo dia, mesmo sem vontade. Fecha obrigando a escolher um lado: construir de verdade, ou seguir recomeçando pra sempre.",
};

export function registroBlock(id?: Registro | string | null): string {
  if (!id || !(id in TOM)) return "";
  const r = id as Registro;
  return `\n\nREGISTRO / TOM DO POST (sua escolha — o roteiro INTEIRO vive neste tom). Isto define a POSTURA e a SUBSTÂNCIA; a CADÊNCIA continua sendo a dos exemplos de voz do Cândido (não atropele o ritmo dele):\n- ${TOM[r]}`;
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
  const tagged = registros.filter(Boolean) as Registro[];
  const total = tagged.length;

  const rows: DoseRow[] = REGISTROS.map((info) => {
    const n = tagged.filter((r) => r === info.id).length;
    const pct = total ? n / total : 0;
    const diff = pct - info.target;
    let status: "ok" | "alto" | "baixo" = "ok";
    if (total >= MIN) {
      if (diff > TOL) status = "alto";
      // registro de alvo baixo (ex: convocação 10% < tolerância 12%) nunca cairia em "baixo" pela conta.
      // pra ele, "baixo" = AUSÊNCIA total no mês. pros grandes (ferida/porrada/ensino), a banda normal.
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

  // 1) PORRADAS SEGUIDAS — streak no fim da sequência (os mais recentes)
  let streak = 0;
  for (let i = n - 1; i >= 0 && seq[i] === "porrada"; i--) streak++;
  if (streak >= 3) alerts.push({ tipo: "porrada-streak", msg: `${streak} 🔥 porradas seguidas — tá gritando, a galera anestesia. Respira numa 🩷 ferida.` });

  // 2) MUITO TEMPO SEM FERIDA — quantos posts desde a última ferida
  const lastFerida = seq.lastIndexOf("ferida");
  const desdeFerida = lastFerida === -1 ? n : n - 1 - lastFerida;
  if (n >= 4 && desdeFerida >= 4) {
    alerts.push({ tipo: "sem-ferida", msg: lastFerida === -1
      ? `${n} posts e nenhuma 🩷 ferida — o coração esfriou, virou só técnica e sacudida.`
      : `${desdeFerida} posts desde a última 🩷 ferida — o coração tá esfriando.` });
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
