// Frameworks de criação de conteúdo — viram seleção no app (seu controle, não palpite da IA).
import { REG_MAP, type Registro } from "./vitals";

export type Framework = { id: string; name: string; short: string; prompt: string };

// As 4 emoções primais que um gancho deve carregar (uma ou mais).
export const EMOTIONS: Framework[] = [
  {
    id: "raiva",
    name: "Indignação",
    short: "empurra à ação (comentar, salvar, comprar)",
    prompt: "INDIGNAÇÃO — emoção de ALTA ativação, a que mais move à ação (comentar, compartilhar, comprar). Mire a indignação no INIMIGO certo: a mentira/indústria/mito que sabotou a leitora — NUNCA na própria leitora. Nomeie o vilão (o 'bumbum em 30 dias', a dieta da moda, a coach que vende milagre, a influencer que mostra resultado de procedimento como se fosse treino). A leitora tem que sentir 'fui enganada' e querer reagir. Indignação justa, não birra nem vitimismo.",
  },
  {
    id: "polarizacao",
    name: "Polarização",
    short: "posiciona num extremo, cria tribo",
    prompt: "POLARIZAÇÃO — escolha um lado e ABANDONE o meio-termo. Crie um 'nós contra eles'. Tem que ser uma colina que vale defender e que é de verdade a posição do Cândido Netto (Team Netto · N² Squad): método e constância contra atalho e milagre. Aliena o morno de propósito: quem concorda vira tribo, quem discorda engaja. Sem cima do muro.",
  },
  {
    id: "vies",
    name: "Viés de confirmação",
    short: "confirma uma suspeita da leitora",
    prompt: "VIÉS DE CONFIRMAÇÃO — diga em voz alta o que a leitora JÁ suspeitava mas não tinha como provar/articular. 'Você sempre sentiu que aquela dieta não era pra você. Você estava certa.' Gera alívio + confiança instantânea ('finalmente alguém falou o que eu pensava'). Valida a intuição dela e se posiciona como quem enxerga o que ela sente.",
  },
  {
    id: "curiosidade",
    name: "Curiosidade",
    short: "abre um loop que PRECISA fechar",
    prompt: "CURIOSIDADE — abra uma LACUNA de informação: a leitora sente que quase sabe, e o cérebro precisa fechar o loop. Prometa uma resposta específica que só vem adiante. Nada de curiosidade vaga ('descubra o segredo do bumbum') — tem que ser um loop preciso e concreto, com uma pergunta que cutuca.",
  },
];

// Os 3 tipos de gancho (a parte mais importante do post).
export const HOOKS: Framework[] = [
  {
    id: "correlacao",
    name: "Correlação (melhor p/ técnico)",
    short: "parte de um tema conhecido e conecta ao assunto",
    prompt: "GANCHO POR CORRELAÇÃO — comece por um tema/história ESPECÍFICO, real e relacionável, de FORA do fitness, e conecte ao assunto técnico. A ponte tem que ser CONCRETA: pessoa real, detalhe real (NUNCA uma 'mulher' vaga/inventada). PROIBIDO metáfora batida ('o corpo é como uma máquina/casa/jardim') e abrir com 'todo mundo sabe'. CRÍTICO — a correlação NÃO ACABA NO GANCHO: o card seguinte (contexto) tem que DESENVOLVER a história com detalhe concreto e fazer a PONTE EXPLÍCITA com o assunto (a leitora precisa entender QUEM/O QUE é e COMO conecta). NUNCA largue a história depois da capa nem pule direto pro ponto técnico — isso deixa os cards desconexos. Se não houver uma ponte concreta de verdade, use OUTRO tipo de gancho em vez de inventar uma história vaga.",
  },
  {
    id: "temporal",
    name: "Temporal (era uma vez)",
    short: "posiciona no tempo, liga o modo história",
    prompt: "GANCHO TEMPORAL — ancore numa marca de tempo que dá a sensação implícita de 'era uma vez' (ex: 'Há 6 meses, a Marina treinava todo dia e o bumbum não mudava nada...'). Liga o modo história e baixa a defesa da leitora. Bom pra origem, transformação, antes-e-depois honesto.",
  },
  {
    id: "pergunta",
    name: "Pergunta estranha / loop",
    short: "pergunta que só resolve nos slides",
    prompt: "GANCHO PERGUNTA ESTRANHA — abra com uma pergunta ESPECÍFICA, concreta e meio estranha que a leitora NÃO consegue responder de cara e que abre uma lacuna que só os slides fecham. REGRA DE OURO: a pergunta NÃO pode ENTREGAR a resposta nem a tese. Se ela já insinua a lição/veredito, virou pergunta RETÓRICA de coach ('por que você ainda acha que não consegue?', 'será que você...?', 'até quando você vai...?') — isso soa pregador e BOBO, fica proibido. Não é um 'gotcha', não é debate-trap, não é moral disfarçada de pergunta. É um MISTÉRIO honesto: um fato, número ou detalhe concreto que intriga e dá vontade de descobrir. Ex pro tema do glúteo — BOBO: 'por que você agacha há 2 anos e ainda acha que o problema é genética?' (entrega a tese). BOM: 'quantas das suas 4 séries de agachamento realmente chegaram perto do músculo que você quer crescer?' (abre loop, esconde a resposta). Inesperada e concreta, nunca genérica.",
  },
];

export function emotionBlock(ids: string[]): string {
  const sel = EMOTIONS.filter((e) => ids.includes(e.id));
  if (!sel.length) return "";
  return `\n\nEMOÇÃO(ÕES) PRIMAL(IS) QUE O GANCHO E O CONTEÚDO DEVEM CARREGAR (sua escolha — é obrigatório trazer isto):\n${sel.map((e) => "- " + e.prompt).join("\n")}`;
}

export function hookBlock(id?: string): string {
  const h = HOOKS.find((x) => x.id === id);
  if (!h) return "";
  return `\n\nTIPO DE GANCHO (sua escolha — o card 1 DEVE usar esta forma):\n- ${h.prompt}`;
}

// Rótulo curto da INTENÇÃO escolhida (registro + gancho + emoções) — pro Cards e o Crítico
// saberem o que o post DEVERIA ser, sem o prompt pesado de geração. "" se nada escolhido.
export function intentLabel(registro?: string | null, hook?: string | null, emotions?: string[] | null): string {
  const parts: string[] = [];
  if (registro && registro in REG_MAP) { const r = REG_MAP[registro as Registro]; parts.push(`registro/tom: ${r.label} (${r.o_que})`); }
  const h = HOOKS.find((x) => x.id === hook);
  if (h) parts.push(`tipo de gancho do card 1: ${h.name} — ${h.short}`);
  const es = EMOTIONS.filter((e) => (emotions || []).includes(e.id)).map((e) => e.name);
  if (es.length) parts.push(`emoção(ões): ${es.join(", ")}`);
  return parts.join(" · ");
}
