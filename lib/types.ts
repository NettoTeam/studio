// Espec de um carrossel N² Squad — o que o cérebro (IA) devolve e o renderizador desenha.

export type Layout =
  | "cover"   // capa: SEMPRE foto de capa da marca + título centralizado embaixo
  | "top"     // foto no topo dissolvendo + texto embaixo
  | "bottom"  // foto na base + texto no topo (invertido)
  | "full"    // full-bleed cinematográfico + texto sobreposto
  | "list"    // fundo escuro/foto + bullets
  | "data"    // números gigantes (callout de dado)
  | "moral"   // fecho: full-bleed + signoff + logo minimalista
  | "quote"   // A: citação gigante centralizada no escuro
  | "text"    // B: parágrafo grande, minimalista
  | "split"   // C: metade foto / metade texto
  | "steps"   // H: passo a passo (fluxo numerado)
  // ── Layout 2 (editorial premium) ──
  | "l2-capa"      // foto full + overlay azul + barra rosa + handle + headline c/ caixa rosa
  | "l2-dor-dir"   // fundo azul + foto na metade DIREITA + conteúdo à esquerda (tag rosa + headline + apoio)
  | "l2-dor-esq"   // fundo azul + foto na metade ESQUERDA + conteúdo à direita
  | "l2-emocional" // fundo azul sólido, sem foto, frase central (branco + rosa)
  | "l2-virada"    // foto ~60% + overlay azul + tag rosa + headline solução + apoio
  | "l2-cta"       // foto full + overlay + headline multi-linha (branco/rosa) + CTA
  // ── Layout 3 (storytelling / caso — editorial premium) ──
  | "l3-capa"         // capa do caso: imagem ~40% em container arredondado + texto corrido (gancho em rosa)
  | "l3-prova"        // prova social: screenshot do depoimento + comentário em rosa + complemento
  | "l3-historia"     // desenvolvimento: só texto (contexto / virada em rosa / resultado) + seta no rodapé
  | "l3-antes-depois" // antes e depois: fundo claro, 2 fotos lado a lado + marca circular
  | "l3-educacional" // capa educacional: headline 2 linhas (rosa + branco) + teaser do próximo
  // ── Layout 4 (revista premium de negócios) ──
  | "l4-capa"       // foto 100% + overlay azul + headline gigante rosa (inferior esq) + sub + logo
  | "l4-split"      // 60% texto (fundo claro, headline rosa + corpo azul) / 40% foto P&B
  | "l4-horizontal" // foto no topo 40% + base 60% branca, título rosa central + texto azul
  | "l4-faixa"      // foto quase cheia + faixa vertical azul 40% com headline rosa + texto branco
  | "l4-final"      // foto escura + pergunta gigante rosa + caixa "Comente aqui" + CTA + logo
  // ── Layout 5 (editorial minimalista premium) ──
  | "l5-capa"       // foto 60% dir + texto 40% esq, logo+@ topo, título multi-linha c/ caixa rosa
  | "l5-split"      // 50% texto (fundo branco) / 50% foto vertical
  | "l5-caixa"      // foto tela cheia + caixa rosa centro-baixo + subtexto branco
  | "l5-texto"      // respiro: sem foto, fundo branco, frase serif centralizada (Playfair/Georgia)
  | "l5-solucao"    // 70% foto / 30% texto, headline + subheadline centralizados
  | "l5-galeria"    // foto centralizada com moldura fina + legenda + rodapé da marca
  // ── Layout 6 (manifesto fitness premium) ──
  | "l6-capa"       // foto cheia escura + headline gigante + @ topo + assinatura no rodapé + caixa rosa
  | "l6-historia"   // storytelling: foto ~80% + texto ~20%
  | "l6-manifesto"  // sem foto, fundo preto/azul, texto gigante centralizado + caixa rosa
  | "l6-lifestyle"  // foto dominante, pouco texto, muito respiro
  | "l6-fecho"      // encerramento: foto + headline gigante + palavras rosa + assinatura
  // ── Layout 7 (científico / autoridade — accent bar, brand bar, progress bar) ──
  | "l7-capa"       // foto full + overlay + headline (linha accent + linha branca) inferior esq
  | "l7-problema"   // 45% foto P&B com fade diagonal + 55% navy, headline accent + body + bullets
  | "l7-ciencia"    // foto full + overlay forte + headline 2 tons + texto + referência científica
  | "l7-prova"      // 50% foto topo + 50% fundo claro, headline (accent+dark) + texto central
  | "l7-virada"     // foto full P&B + overlay leve + headline accent + texto (muito respiro)
  | "l7-cta"        // foto escura + logo maior + pergunta + caixa de CTA (borda branca)
  // ── Layout 8 (80/20 lifestyle — só fotos e números, sem chrome) ──
  | "l8-split"      // 2 fotos empilhadas (topo/baixo) + números gigantes (ex 80% / 20%)
  | "l8-ruptura"    // 2 fotos empilhadas + overlay + headline central + body
  | "l8-cta"        // fundo escuro, sem foto, headline gigante central + handle abaixo
  // ── Layout 9 (editorial minimalista preto/cinza — base pra overlays decorativos) ──
  | "l9-capa"       // título gigante topo + foto (personagem) embaixo + cabeçalho/rodapé técnico
  | "l9-intro"      // palavra-gatilho enorme + texto + CTA, alinhado à esquerda, muito respiro
  | "l9-conteudo"   // cartão/título no topo + explicação central + foto embaixo (A+B=resultado via overlay)
  | "l9-final"      // divisão 40/60: texto à esquerda + pessoa à direita
  // ── Layout 10 (editorial vinho premium — serifada + dourado) ──
  | "l10-capa"      // foto central + título em 3 níveis embaixo + micro CTA (fundo vinho)
  | "l10-texto"     // editorial só texto (serifada), alinhável (base pra objeto atravessando via overlay)
  | "l10-regra"     // título central + caixa de contorno dourado com a mensagem
  | "l10-resumo"    // título + checklist elegante
  | "l10-cta";      // minimalismo extremo: monograma + mensagem + pergunta final

export interface Stat {
  value: string; // ex: "-24%"
  label: string; // ex: "VOLUME DE TREINO"
}

// Imagem sobreposta ao fundo, com posição/tamanho ajustáveis (frações 0..1 do canvas).
export interface Overlay {
  src: string;
  x: number;              // 0..1 — posição do canto superior esquerdo
  y: number;              // 0..1
  width: number;          // 0..1 — largura como fração da largura do card
  color?: boolean;        // true = colorido (default P&B)
  opacity?: number;       // 0..1 (default 1)
}

export interface Card {
  id: string;
  layout: Layout;
  kicker?: string;
  headline?: string;      // pode ter **trecho** em rosa
  body?: string;          // parágrafos separados por \n\n, **trecho** em rosa. Máx 3 linhas/parágrafo.
  bullets?: string[];
  stats?: Stat[];
  source?: string;
  signoff?: string;       // ex: "Tamo junto."
  image?: string;         // /library/...  (resolvido pelo app a partir de imageSentiment)
  image2?: string;        // 2ª foto (usada no "depois" do layout l3-antes-depois)
  imageSentiment?: string;// chave de sentimento que a IA escolhe (ex: "foco", "superacao")
  focalX?: number;        // 0..1
  focalY?: number;        // 0..1
  scale?: number;         // zoom da imagem de fundo (1 = padrão; >1 aproxima)
  rotate?: number;        // rotação da imagem de fundo em graus (0/90/180/270)
  bw?: boolean;           // fundo em preto e branco (default true = P&B; false = colorido)
  align?: "left" | "center"; // alinhamento do texto no card
  titleScale?: number;    // multiplicador do tamanho do título (1 = padrão)
  bodyScale?: number;     // multiplicador do tamanho do corpo/bullets (1 = padrão)
  titleFont?: string;     // fonte do título (ex: "Anton", "Montserrat", "Inter")
  bodyFont?: string;      // fonte do corpo/bullets
  titleShadow?: number;   // intensidade da sombra do título (0 = sem sombra, ~0.6 padrão)
  bodyShadow?: number;    // intensidade da sombra do corpo (0 = sem, ~0.5 padrão)
  titleColor?: string;    // cor do título (default branco #f5f5f5)
  bodyColor?: string;     // cor do corpo/bullets (default branco #f5f5f5)
  highlightColor?: string;// cor do destaque (**rosa** e ==caixa==) — default rosa #ef476f
  textX?: number;         // desloca o bloco de texto na horizontal (fração do card; 0 = posição padrão)
  textY?: number;         // desloca o bloco de texto na vertical (fração do card; 0 = posição padrão)
  titleX?: number;        // desloca SÓ o título (independente do corpo)
  titleY?: number;
  bodyX?: number;         // desloca SÓ o corpo/bullets (independente do título)
  bodyY?: number;
  titleTracking?: number; // espaçamento entre letras do título, em px (default 0.5)
  bodyTracking?: number;  // espaçamento entre letras do corpo, em px (default 0)
  titleLeading?: number;  // espaçamento entre linhas do título (line-height; default ~0.9)
  bodyLeading?: number;   // espaçamento entre linhas do corpo (line-height; default ~1.34)
  overlays?: Overlay[];   // imagens sobrepostas ajustáveis
  logo?: { x: number; y: number; w?: number; hide?: boolean }; // posição da logo PADRÃO (quando logos não definido)
  logos?: { src: string; x: number; y: number; w?: number }[]; // logos escolhidas da biblioteca (até 2); [] = nenhuma; undefined = usa a padrão
  nicks?: string[];                                              // nick(s) do Instagram exibidos no topo (Layout 2/3); até 2. undefined = usa o padrão
  hideNick?: boolean;                                            // esconde o nick do Instagram neste card
  nickPos?: { x: number; y: number; size?: number };             // posição livre do nick (substitui a posição padrão do layout)
  bg?: string;                                                   // cor de fundo sólida do card (default preto) — útil em slides sem foto
  tint?: { color: string; opacity: number };                    // sombra/tom de cor (gradiente) sobre o card
  index?: string;         // "03 / 08"
}

export interface Carousel {
  tema: string;
  cards: Card[];
}

// ---- VAULT (biblioteca de desempenho / aprendizado) ----

export interface Metrics {
  postedAt?: string;        // data da postagem
  alcance?: number;
  salvamentos?: number;
  compartilhamentos?: number;
  comentarios?: number;
  curtidas?: number;
  visitasPerfil?: number;
  seguidores?: number;      // ganhos
  dms?: number;
  vendas?: number;
}

export type Stage = "ideia" | "desenvolvimento" | "agendado" | "publicado" | "arquivado";

export interface Post {
  id: string;
  createdAt: string;
  tema: string;
  templateId?: string;
  tom?: string;
  carousel: Carousel;
  metrics?: Metrics;
  feedback?: string;        // feedback qualitativo do Cândido sobre o conteúdo
  analysis?: string;        // análise/padrões (preenchido pela IA na síntese)
  stage?: Stage;            // etapa no quadro (default "ideia")
  type?: string;            // carrossel | reels | roteiro
  scheduledAt?: string;     // data agendada (calendário) — YYYY-MM-DD
  outline?: string;         // o esqueleto/arco gerado (passada 1) — pra virar estrutura-ouro
  hook?: string;            // tipo de gancho usado
  emotions?: string[];      // emoções primais usadas
  registro?: "porrada" | "ferida" | "ensino" | "convocacao"; // Sinais Vitais — o registro emocional do post
  content?: string;         // conteúdo bruto de origem (pra retomar a geração de uma ideia)
  savedHook?: { capa: string; abertura: string }; // gancho salvo no Quadro pra virar carrossel depois
}
