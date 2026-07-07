// ARSENAL DE STORIES — 62 scripts do curso, organizados por categoria.
// Cada script é um TEMPLATE com estrutura story-a-story + exemplos.
// A IA usa como esqueleto narrativo e reescreve 100% na voz do Cândido.

export type ArsenalCategoria =
  | "educacao" | "autoridade" | "venda" | "quebra_objecao" | "conexao"
  | "rotina" | "feedback" | "consultoria" | "story_unico";

export interface ArsenalScript {
  dia: number;
  nome: string;
  categoria: ArsenalCategoria;
  roteiro: string;
}

// Ordem oficial do ciclo (1 dia cada, exatamente nessa ordem)
export const ARSENAL_ORDEM: ArsenalCategoria[] = [
  "educacao", "autoridade", "venda", "quebra_objecao", "conexao",
  "rotina", "feedback", "consultoria", "story_unico",
];

export const ARSENAL_CATEGORIAS: Record<ArsenalCategoria, { label: string; emoji: string; objetivo: string }> = {
  educacao:       { label: "Educação",                  emoji: "📚", objetivo: "Mostrar conhecimento e agregar valor. Quando você ensina, aumenta a chance de compra futura por reciprocidade." },
  autoridade:     { label: "Autoridade",                emoji: "👑", objetivo: "Transmitir credibilidade com provas de domínio e experiência. Resultados reais geram confiança pra decisão de compra." },
  venda:          { label: "Venda",                     emoji: "💰", objetivo: "Tornar a consultoria desejável a ponto de não ser ignorada. Diferenciais, benefícios e a transformação física e emocional." },
  quebra_objecao: { label: "Quebra de objeção",         emoji: "🧱", objetivo: "Antecipar argumentos que impedem de fechar a consultoria. Mudar a opinião do lead de forma sutil." },
  conexao:        { label: "Conexão",                   emoji: "🤝", objetivo: "Fazer as pessoas se identificarem com seu perfil e visão de mundo. É aqui que nasce a legião de fãs." },
  rotina:         { label: "Rotina",                    emoji: "☀️", objetivo: "Conexão por congruência: mostrar que você vive o que prega — treino, alimentação, rotina corrida, lazer." },
  feedback:       { label: "Feedback",                  emoji: "💬", objetivo: "Autoridade pela voz de outra pessoa. Relatos reais que conectam com novos leads." },
  consultoria:    { label: "Por dentro da consultoria", emoji: "🔍", objetivo: "Mostrar como funciona a consultoria — quebra de objeção indireta pra quem tem curiosidade mas não chama." },
  story_unico:    { label: "$torie Único",              emoji: "⚡", objetivo: "Social selling: ficar ~24h sem postar e soltar UM story forte, maximizando visualização e interação." },
};

export const ARSENAL_SCRIPTS: ArsenalScript[] = [
  {
    dia: 1,
    nome: "Vou te ajudar",
    categoria: "educacao",
    roteiro: `**Story 1**

Use uma foto ou uma notícia para exemplificar um problema

***Exemplo:** Já pensou na frustração de treinar por meses e ainda não ver definição nos glúteos ou nas coxas?*

**Story 2**

Depois de ver esse story, você terá três opções:

Continuar ______[com o problema]

Tentar esquecer

Deixar que eu te ajude

acho que…

***Exemplo*** 

*Depois de ver esse story você terá três opções:*

1. Continuar treinando sem ver resultados.
2. Tentar esquecer o tempo perdido sem mudanças.
3. Deixar que eu te ajude a transformar seu corpo com estratégias eficazes.

**Story 3** 

A terceira opção é a mais confortável e segura.
Eu vou te ajudar a [sua solução para o problema] no próximo story..

***Exemplo*** 

*A terceira opção é a mais segura. Eu vou te ajudar a transformar seu físico com treinos personalizados no próximo story.*

**Story 4 e 5**

*Apresente formas simples de solucionar o problema, como a importância da progressão de carga e a execução correta dos exercícios, e gere curiosidade sobre o “como” aplicar isso.*

***ExemploS***

**Story 6** 

Essas são apenas algumas das formas que uso para [desejo da audiência], existem outras técnicas que compartilho apenas [clientes/alunas]

***Exemplo*** 

*Essas são apenas algumas das formas que uso para ajudar mulheres a conquistarem o shape que sempre sonharam. Outras estratégias, eu compartilho apenas com minhas alunas na consultoria online.*`,
  },
  {
    dia: 2,
    nome: "Domínio da Arte",
    categoria: "autoridade",
    roteiro: `**Este conteúdo destina-se a consolidar sua autoridade, mostrando a evolução e aperfeiçoamento de suas técnicas**

*Você compartilhará como desenvolveu habilidades específicas, superou obstáculos e aplicou esses métodos com sucesso, tanto pessoalmente quanto ajudando outros, destacando seu conhecimento e experiência únicos.*

---

**Story 01**

______ [inicie com uma demonstração da sua habilidade ou conhecimento] e que já ____ [ganho].

***Exemplo***

*A metodologia de treino que desenvolvi ao longo dos anos já ajudou mais de 100 mulheres a conquistar o corpo definido que sempre sonharam.*

**Story 02**

Quando comecei _____ [revele o processo inicial e os desafios enfrentados ao aprender essa habilidade].

***Exemplo***

*"Quando comecei, eu tinha apenas o básico que aprendi nos cursos de educação física e algumas tentativas e erros com clientes. Cada experiência me trouxe uma lição valiosa.*

**Story 03**

_____  [mostre uma comparação entre os resultados iniciais e os atuais, destacando seu progresso].

***Exemplo***

No início, minhas alunas tinham dificuldades para ver resultados rápidos, e eu percebi que o problema estava na falta de estratégia adequada no treino.

**Story 04**

_____ [explique um ponto de virada ou descoberta que elevou seu nível de habilidade].

***Exemplo***

*"Foi então que percebi que o segredo não era apenas treinar mais, mas treinar de maneira mais inteligente com foco em carga progressiva e consistência*

**Story 05**

_____ [demonstre como essa habilidade tem sido aplicada com sucesso em casos reais ou em clientes/estudantes.]

***Exemplo***

*Agora, aplicando essa metodologia, aqui estão alguns dos resultados incríveis que minhas alunas conseguiram em poucas semanas.*

**Story 06**

_____ [compartilhe um breve tutorial ou dica que os seguidores possam experimentar imediatamente.]

***Exemplo***

*Quer começar a transformar o seu corpo também? Aqui vai uma dica simples: comece a varaiar estimulos no seu treino e faça uma periodização ondulatória para evitar a desmotivação.*

**Story 07**

***Exemplo***

Ficou fácil entender?

[Enquete: Sim | Não] 

**Story 08**

_____ [conclua com um chamado à ação motivacional, reforçando a importância de adquirir seu produto/serviço].

[Link para ação]

***Exemplo***

Você também pode alcançar esse corpo definido que tanto deseja. Estou aqui para te ajudar. Clica na reação que eu te chamo!

[reação de 💪🏻]`,
  },
  {
    dia: 3,
    nome: "O maior erro",
    categoria: "venda",
    roteiro: `**Story 01**

O maior erro que eu cometi ao querer __[desejo do público] e que você pode estar cometendo também
[sticker de reação com espanto]

***Exemplo***

*O maior erro que eu cometi ao querer **definir meu corpo** e que você pode estar cometendo também...*

*[sticker de reação com espanto]*

***Sugestões***:

- **emagrecer de forma saudável**
- **ganhar massa muscular rapidamente**

**Story 2**

Eu passei muito tempo querendo [desejo do público]. Fiz de tudo. Cheguei até mesmo a fazer___ [algo que está na moda], mas nada disso adiantou.

***Exemplo***

*Eu passei muito tempo querendo **emagrecer e definir**. Fiz de tudo. Cheguei até mesmo a tentar **dietas da moda**, mas nada disso adiantou.*

***Sugestões***:

- **ganhar músculo sem engordar**
- **seguir treinos online sem orientação**
- **seguir treinos feito por blogueiras**

**Story 3** 

Mas depois de tantos dias entre tentativa e erro eu descobri como ___[desejo do público] de uma forma simples, mas que pode até parecer estranha...

Vou te contar exatamente o que eu fiz.

***Exemplo***

*Mas depois de muitos erros e tentativas, eu descobri como **ter um corpo definido** de uma forma simples, mas que pode até parecer estranha... Vou te contar exatamente o que fiz.*

***Sugestões***:

- **aumentar a massa muscular**
- **emagrecer com saúde**

**Story 4**

Eu só consegui [desejo do seu público] quando eu...
Conte a solução em formato de lista.

***Exemplo***

*Eu só consegui **ver resultados no meu corpo** quando eu...*

1. *Adaptei meu treino à minha rotina.*
2. *Segui uma alimentação personalizada.*
3. *Mantive a progressão de cargas no treino.*

***Sugestões***:

- **treinar corretamente para meu objetivo**
- **manter uma alimentação balanceada sem restrições exageradas**

**Story 5**

Você gostaria da minha ajuda pessoal para te orientar com cada um desses pontos? 

Se sim, clica aqui  (Sticker de reação) que eu te explico todos os detalhes.`,
  },
  {
    dia: 4,
    nome: "Relembrando uma dor",
    categoria: "quebra_objecao",
    roteiro: `**Story 01**

Eu sei que você não quer finalizar mais um [ciclo] frustrado. 

***Exemplo***

*Eu sei que você não quer terminar mais um ano frustrada.*

Sugestões:

- *mais um verão sem conseguir se sentir a vontade de biquini*

**Story 02**

Todas as vezes é igual. 

[fale sobre o sentimento que a pessoa tem durante essa data] 

***Exemplo*** 

*Todas as vezes é igual.*

*Você segue o plano por meses, se esforça ao máximo, mas o resultado que espera nunca chega, e tudo o que sente é uma mistura de frustração e culpa.*

Sugestões:

- *você treina duro, mas os números na balança parecem estagnados e isso te desanima…*

**Story 03**

Você se sente culpada por [algo que sua audiência faz]. 

***Exemplo*** 

*Você se sente culpada por **comer fora do planejado no final de semana** e depois tenta compensar com dietas restritivas que só aumentam sua ansiedade.*

Sugestões:

- **treinar intensamente durante semanas, mas ainda se sentir insegura com seu corpo**
- **não conseguir se manter consistente, mesmo sabendo o que precisa fazer**

**Story 04:**

Mas isso não vai mais se repetir.

Eu quero que você faça uma promessa comigo: no seu próximo [ciclo/dia/data], você estará [sonho da sua audiência]. 

***Exemplo*** 

*Mas não dessa vez. Eu quero que você faça uma promessa comigo: no seu próximo aniversário, você estará com o seu corpo dos sonhos e livre de toda culpa por comer.*

Sugestões:

- *Mas tudo vai mudar a partir de agora. Você vai terminar o ano realizada com as escolhas que fez pra você.*

**Story 05**

Porque eu sei que depois ___[o seu método/acompanhamento] você vai conquistar __[desejo/promessa do que você vende]

***Exemplo*** 

*Porque eu sei que depois da **[NOME DA CONSULTORIA]** você vai conquistar muito mais confiança em si mesma fazendo as pazes com a balança.*

**Story 06**

E eu sei que vou comemorar/celebrar com você no dia quando eu receber a sua mensagem dizendo: __[Eu consegui/Deu tudo certo]! 

Eu acredito em você. 

***Exemplo*** 

eu sei que vou comemorar com você quando eu receber a sua mensagem dizendo: **“Eu consegui, finalmente me sinto bem com meu corpo e não vivo mais nesse ciclo de frustração.”**

**Story 07**

Você também acredita? 

[Enquete SIM | NÃO]`,
  },
  {
    dia: 5,
    nome: "Nunca contei",
    categoria: "conexao",
    roteiro: `**A ideia é trazer curiosidade e mais envolvimento com a sua marca, assim você ganha maior poder de convencimento.**

*A(s) curiosidade(s) apresentada(s) jamais devem trazer uma questões que possam diminuir a sua percepção de valor, sempre serão curiosidades que de algum modo gera conexão com quem te acompanha.*

**Story 1**

O lado da [seu nome/ sua marca] que você ainda não sabe/conhece. 
ou 
Você não conhece o lado [seu nome/sua marca] de __[o que você faz].

***Exemplo***

*O lado da **[seu nome]** que você ainda não conhece.*

Sugestões:

- *Você não conhece o lado **Ana** que ama desafios.*
- *Você sabia que eu, **[seu nome]**, quase segui outro caminho?*

**Story 2** 

Curiosidade 01 + imagem

***Exemplo***

*Curiosidade 01 + imagem*

*Antes de ser personal trainer, eu era…*

Sugestões:

- *Antes de começar a ajudar mulheres a transformarem seus corpos, eu trabalhei como engenheira…*
- *Antes de entrar no mundo fitness, eu fazia medicina…*

.jpg)

**Story 3** 

Curiosidade 02 + imagem

***Exemplo***

*Curiosidade 02 + imagem*

*Fiz uma mudança radical quando…*

Sugestões:

- *Fiz uma mudança radical aos 30 anos quando decidi virar personal full-time.*
- *Minha maior mudança foi quando abandonei meu antigo trabalho para ajudar mulheres a ganharem mais confiança através de treinos.*

**Story 4**

Curiosidade 03 + imagem

***Exemplo***

*Curiosidade 03 + imagem*

*Quando comecei, tive que superar muitos desafios…*

Sugestões:

- *Quando comecei a treinar, meu maior desafio era a consistência nos treinos.*
- *Quando abri minha consultoria online, eu duvidava se daria certo…*

**Story 5**

Curiosidade 04 + Imagem

***Exemplo***

*Curiosidade 04 + Imagem*

*Tomei um susto quando percebi que…*

Sugestões:

- *Tomei um susto quando percebi que era possível ajudar tantas mulheres mesmo à distância.*
- *Fiquei surpresa ao ver o impacto que pequenos ajustes no treino traziam para as minhas alunas.*

**Story 6**

Curiosidade 05 com reforço de autoridade + Imagem

***Exemplo***

*Curiosidade 05 + Imagem de autoridade*

*Nesses **[X] anos**, já ajudei **[Y]** pessoas a…*

Sugestões:

- *Nesses 5 anos, ajudei mais de 500 mulheres a se sentirem confiantes em seus corpos.*
- *Ao longo desses anos, já vi de tudo e cada conquista me dá mais motivação para seguir.*

**Story 7**

Encerre agora a sequência com uma pergunta para a sua audiência, questionando se alguma surpreendeu, ou se descobriu algo curioso, ou em qual parte dessa história eles te conheceram.

***Exemplo***

*Agora me conta, qual dessas curiosidades você não sabia?*

Sugestões:

- *Qual dessas curiosidades você não imaginava? Me conta nos comentários!*
- *Agora me conta, em qual dessas histórias você se identificou?*

 **

 ***OBS**: Esse tipo de CTA é excelente para abrir espaço para as pessoas expressarem coisas boas a seu respeito e você ter vários depoimentos para printar e repostar na sequência*.`,
  },
  {
    dia: 6,
    nome: "Mostrando seu pré treino",
    categoria: "rotina",
    roteiro: `📌

**Como usar este Storie:**

Postar uma foto ou vídeo preparando ou tomando o pré-treino, seja um suplemento, café ou uma refeição rápida. Isso cria conexão com quem também treina e desperta curiosidade sobre a rotina alimentar do personal.

***Exemplo 1*** 

**Story explicando sobre seu pré treino**

Carregando as baterias antes do treino! Hoje fui de [café, suplemento, banana, etc.].

***Exemplo 2***

**Story com uma frase que você pode usar todos os dias!**

Sem isso aqui, meu treino não rende! 

[sticker de reação]🔥`,
  },
  {
    dia: 7,
    nome: "O que eu faria se quisesse",
    categoria: "feedback",
    roteiro: `A ideia desse conteúdo é que você mostre **como você solucionaria dúvidas** e questões comuns vivenciadas pela sua **audiência**.

**Story 1**

O que eu faria se quisesse [desejo da audiência]…

***Exemplo*** 

*O que eu faria se quisesse diminuir a celulite em poucos dias…*

**Story 2**

Vou começar te fazendo uma pergunta…

[desejo] te deixaria realizado/ mais feliz?

***Exemplo***

*Vou começar te fazendo uma pergunta…*

*diminuir a celulite em pouco tempo te deixaria feliz com o seu corpo?*

*[enquete: SIM | NÃO]*

**Story 3**

*Espere alguns instantes para as pessoas responderem a enquete e então retome a sequência.*

Muitas de vocês estão respondendo “Sim” na enquete e eu sei o motivo:

- [motivo 01]
- [motivo 02]

E é claro que eu sei que você não aguenta mais viver assim…

***Exemplo*** 

*Muitas de vocês estão respondendo “Sim” na enquete e eu sei os motivos:*

- *Porque as celulites te impedem de escolher a roupa que gosta, te limitando a usar só aquelas que não marcam;*
- *Porque as celulites tiram a sua segurança de botar um biquíni ou uma roupa íntima;*
- *Porque as celulites te trazem vergonha e diminuem a sua autoconfiança…*

*E é claro que eu sei que você não aguenta mais viver com isso…*

**Story 4**

Por isso, para [desejo da audiência] eu quero que a partir de hoje você siga esses passos:

- [solução 1 em tópico]
- [solução 2 em tópico]
- [solução 3 em tópico]

**Story 5**

Só depende de você **🤌**

Eu te garanto que ao começar a fazer isso você vai ver muita diferença.`,
  },
  {
    dia: 8,
    nome: "Tangibilizando o que você vende",
    categoria: "consultoria",
    roteiro: `Nem sempre as **narrativas** precisam ser complexas para gerar **conversão**, se você já está falando para a sua **audiência** sobre um produto/serviço, chegou a hora deles perceberem de forma tangível como é a **experiência da sua entrega**.

 ***IMPORTANTE:**  essa é uma sequência que pode ser encaixada dentro da sua construção de stories do dia, antes de alguma sequência educativa, de autoridade ou de conexão.*

 **Story 01**

Use uma frase relacionada ao que seu produto gera e use como composição uma foto que você ainda não tenha usado para falar dele. A ideia é gerar um senso de mudança, novidade com a imagem diferente.

***Exemplo***

*“**Transformar seu corpo** nunca foi tão simples.”*

*Foto de fundo mostrando algo novo e diferente relacionado ao seu produto, como uma imagem sua no treino ou uma refeição balanceada.*

 

**Story 02**

Quadrante de fotos com o produto ou vídeo rápido mostrando um pouco de como é a experiência que você gera.

Você pode tirar fotos de detalhes do seu produto, usando uma ferramenta, algo dele impresso. O ponto chave é: capriche nas fotos para gerar percepção de valor sobre o seu produto.

***Exemplo*** 

*Quadrante de fotos com imagens que mostram detalhes da sua metodologia de treino ou de como você orienta as alunas.*

- Foto do app de treino com vídeo proprio
- Imagem do processo de avaliação postural
- Vídeo rápido mostrando as correçoes de exercícios`,
  },
  {
    dia: 9,
    nome: "O bom dia que eu recebi",
    categoria: "story_unico",
    roteiro: `Este é um **story único** para você complementar com outras **sequências estratégicas**, a ideia dele é **gerar valor** para o que você vende de uma forma mais contextualizada e menos invasiva. Você vai usar um **print de um elogio que você recebeu + um vídeo da sua rotina matinal**.

**Story único**

Olha o bom dia que recebi…

*[print de uma mensagem de agradecimento ou resultado positivo de uma aluna]*

Esse tipo de story é ótimo para gerar prova social e aumentar o engajamento com a audiência, mostrando os resultados que você traz para seus clientes.`,
  },
  {
    dia: 10,
    nome: "Mais pedido",
    categoria: "educacao",
    roteiro: `**Esta é uma sequência de conteúdo educativo que gera valor para a audiência.**

*Lembre-se de conectar o tema abordado com o assunto do produto ou serviço que você deseja vender na semana.*

**Story 1**

**Selecione um tema que a sua audiência sempre te pergunta e enfim você vai explicar passo a passo.**

***Exemplo*** 

*Finalmente vou ensinar o que vocês sempre me perguntam: como aumentar e definir glúteos de forma eficiente…*

*Sugestão: Vamos?
[Enquete: Sim | Tava esperando]*

**Story 2 e 3**

Faça um tutorial, que pode ser em vídeo ou em texto (o importante é que tenha imagens para ilustrar), de como a pessoa deve fazer para atingir o objetivo desejado.

*Grave um tutorial rápido ou faça um passo a passo com imagens sobre como realizar exercícios focados em glúteos, com dicas de execução correta e progressão de carga.*

**Story 4**

Use uma enquete para perguntar se a audiência gostou do que você trouxe.

***Exemplo*** 

Gostou desse tipo de conteúdo sobre como definir glúteos?

*[Enquete: SIM | NÃO]*`,
  },
  {
    dia: 11,
    nome: "Preciso de ajuda",
    categoria: "autoridade",
    roteiro: `**A ideia desta sequência é aumentar o número de interações e abrir espaço para conversar com a sua audiência sobre uma temática que eles tem dúvidas.**

*As pessoas amam dar a opinião delas se você perguntar. Vamos começar essa sequência exatamente perguntando algo simples para gerar muitas interações. Porém, a pergunta deve necessariamente fazer um link com o restante da sua narrativa. Com o princípio de que você não sabia de algo, pediu ajuda, as pessoas responderam e você fez o link com pedir ajuda pra quem entende. Você pode replicar essa mesma narrativa, por exemplo, pedindo ajuda para decidir a foto do seu perfil e após linkar com o motivo que te levou a trocar, uma mudança no seu negócio que gera autoridade, ou um novo serviço, ou até mesmo uma nova era de valor no seu perfil.*

**Story 01**

Neste story a ideia é pegar algo que você tem dificuldade, ou não sabe o nome, ou quer saber a opinião da maioria [algo que seja só para gerar curiosidade].

**Preciso de ajuda**

***Exemplo 1***

*Preciso de ajuda*

*Alguém sabe como liga isso?*

***Exemplo 2***

*Preciso de ajuda*

*Como você organiza seu planner da semana?* 

*Estou com dificuldade de ajustar o meu.*

***Exemplo 3***

*Preciso de ajuda*

*O que dizer para uma pessoa que quer se no seu treino na academia?*

***Exemplo 4***

*Me ajuda a decidir…*

*Esse ou esse?*

.jpg)

**Story 02**

vocês me ajudaram muito!

[print de quem interagiu]

Enquanto vocês respondiam me veio a cabeça que …

**Story 03**

É muito mais fácil pedir ajuda do que insistir com uma dúvida ou um problema que você não sabe resolver.

Concorda?

[Enquete: sim / com certeza]

**Story 04**

E por que você continua quebrando a cabeça sem pedir ajuda quando o assunto é [tema que gera muitas dúvidas do seu nicho]?

[sticker de olhinho]

**Exemplo:** 

*Então por que você continua quebrando a cabeça sem pedir ajuda quando o assunto é o seu treino ou alimentação?*

**Story 05**

Agora é a minha vez de te ajudar sobre [tema que gera muitas dúvidas do seu nicho]

Manda aqui sua maior dúvida

[caixinha]

**Exemplo:** 

*Agora é a minha vez de te ajudar com seus treinos e alimentação! Manda aqui sua maior dúvida!*

[caixinha]

**Story 06**

Responda 2 ou 3 perguntas que gerem autoridade e quebre objeção gerando desejo sobre um produto ou serviço que você ofereça.`,
  },
  {
    dia: 12,
    nome: "Eu gostaria que mais pessoas…",
    categoria: "venda",
    roteiro: `A ideia desta sequência é mostrar uma **oportunidade**, um caminho mais simples que talvez a sua **audiência** ainda desconheça.

**Story 01**

Eu gostaria que mais pessoas percebessem que…

**Story 02**

[desejo do público] significa apenas [sua forma simplificada de alcançar o desejo].

***Exemplo***

**Definir o corpo** significa apenas **manter consistência nos treinos e uma boa alimentação.**

Sugestões:

- **Ganhar massa muscular** significa apenas **aumentar a carga e comer de forma estratégica.**
- **Emagrecer** significa apenas **focar em um déficit calórico e manter-se ativo.**

**Story 03**

E que existem [mecanismo que entrega uma possibilidade de resultado].

***Exemplo***

E que existem **estratégias simples** que **podem acelerar seus resultados**.

Sugestões:

- **rotinas de treino eficazes** que **podem te ajudar a atingir suas metas mais rápido.**
- **métodos eficientes** que **te levam a resultados duradouros.**

**Story 04**

Ou seja, [expectativa aumentada comparando story 03 e 02] se [seu meio para alcançar o desejo].

***Exemplo***

Ou seja, **você pode alcançar o físico que deseja** se **seguir o plano certo com disciplina.**

Sugestões:

- **você pode mudar completamente seu corpo** se **tiver orientação e consistência.**
- **você pode alcançar grandes resultados** se **trabalhar com progressão e foco.**

**Story 05**

Clica aqui [Sticker de Reação] **se você ja tentou varias saidas e nunca conseguiu ter resultados**

Sugestões:

- … se você esta cansada de treinar por horas na academia mas não vê resultado
- … se você nunca sabe se esta treinando corretamente e tem medo de se machucar`,
  },
  {
    dia: 13,
    nome: "Escolha o seu difícil",
    categoria: "quebra_objecao",
    roteiro: `A ideia desta sequência é trazer **clareza para a audiência** de que apesar dela achar difícil obter algum tipo de **resultado** que ela tanto quer, o seu **método** é uma forma simplificada de resolver e muito mais difícil do que **começar a aplicar** para ter o resultado é permanecer com o problema e com as consequências futuras desse problema.

**Story 01**

[desejo] é difícil.

***Exemplo***

*Alcançar o corpo dos sonhos é difícil.*

Sugestões:

- *Perder peso e ganhar definição é difícil.*
- *Seguir um plano de treino consistente é difícil.*
- Treinar no ciclo menstrual é difícil.

**Story 02**

[problema] é difícil.

***Exemplo***

*Olhar no espelho e não gostar do que vê também é difícil.*

Sugestões:

- *Sentir-se cansada e sem energia todos os dias também é difícil.*
- Não aguentar subir um lance de escada é difícil.

**Story 03**

Ambos podem ser difíceis em algum nível, cabe a você decidir qual difícil você quer viver.

Se um difícil temporário, ou um difícil permanente.

**Story 04**

O que você escolhe…

Ter acesso a uma forma simples de [promessa do que você vende] ou continuar [resultado do problema]?

***Exemplo***

O que você escolhe…

Ter acesso a uma forma simples de alcançar o corpo que você tanto sonha ou continuar sofrendo com as consequências do sobrepeso.

Sugestões:

- O que você escolhe…
Ter acesso a uma forma simples de fazer stories em minutos ou continuar sofrendo sem clientes.
- *O que você escolhe...
Ter acesso a uma forma simples de **transformar seu corpo e autoestima**, ou continuar **se sentindo estagnada e insatisfeita com sua aparência?***

**Story 05**

Chegou a hora de você escolher o seu difícil!`,
  },
  {
    dia: 14,
    nome: "A primeira coisa",
    categoria: "conexao",
    roteiro: `**Story 1**

A primeira coisa que você faz quando acorda é cuidar de
você? [enquete SIM | NÃO]
****

***Exemplo***

*A primeira coisa que você faz quando acorda é cuidar de você?*

[Enquete: SIM | NÃO]

**Sugestões:**

- *Você começa o dia focando em você ou já vai direto para as tarefas?* [Enquete: Sim, foco em mim | Não, vou direto pro trabalho]
- *Você já tem um ritual de autocuidado pela manhã?* [Enquete: Sim | Ainda não]
- *Você se prioriza pela manhã?* [Enquete: Sim, sempre | Não, nunca tenho tempo]

**Story 2** 

Vou te contar um segredo...
Todos os dias a primeira coisa que eu faço é [seu ritual para se manter produtivo e de bem com você].

Confesso que foi difícil os primeiros dias de adaptação… 

[use imagens para ilustrar]

***Exemplo***

*Vou te contar um segredo... Todos os dias, a primeira coisa que eu faço é [seu ritual para se manter produtivo e de bem com você].*

*Confesso que foi difícil nos primeiros dias de adaptação...*

[Use imagens para ilustrar sua rotina: meditação, exercício, café da manhã saudável, etc.]

**Sugestões:**

- *Vou te contar algo que mudou minha vida: Todos os dias eu começo com [exercício, respiração, planejamento, etc.].*
- *Sabe qual é meu segredo para ter energia todos os dias?*
- *Minha rotina de autocuidado me dá o foco que preciso para começar o dia.*

**Story 3**

Mas desde que [sua estratégia] pela manhã e priorizei fazer coisas que me motivam: TUDO MUDOU.

Eu consegui 

[conquista 1];
[conquista 2];
[conquista 3];

fora que agora a energia para começar o dia é outra!

[foto / vídeo que mostre essa sua rotina]

***Exemplo*** 

*Mas desde que comecei a [sua estratégia], tudo mudou!*

*Eu consegui:*

- [Conquista 1: Mais foco nos meus treinos];
- [Conquista 2: Acordar com disposição todos os dias];
- [Conquista 3: Melhorar minha produtividade e resultados].*Fora que agora a energia para começar o dia é outra!*

[Foto/vídeo que mostre essa sua rotina – como acorda, seu treino matinal, etc.]

**Sugestões:**

- *Desde que adotei essa rotina, meus treinos melhoraram e a disposição é incrível.*
- *Com esse hábito matinal, consegui mais foco e energia para o dia inteiro.*
- *Essas mudanças na minha manhã me ajudaram a transformar não só meu corpo, mas minha mentalidade.*

**Story 4**

Acredite, não é inútil cuidar de si mesmo ,não é historinha, é sobre HONRAR A FONTE que produz coisas incríveis!

Você é a fonte das suas conquistas!

Concorda comigo?
Enquete: SIM | NÃO

***Exemplo*** 

*Acredite, não é inútil cuidar de si mesmo, não é historinha... é sobre HONRAR A FONTE que produz coisas incríveis!*

*Você é a fonte das suas conquistas!*

*Concorda comigo?*

[Enquete: SIM | NÃO]

**Sugestões:**

- *Concorda que cuidar de si é essencial para alcançar qualquer meta?* [Enquete: SIM | NÃO]
- *Você também acredita que sua energia pessoal é sua maior força?* [Enquete: SIM | NÃO]

- *Você concorda que sua saúde mental e física são a base para suas conquistas?* [Enquete: SIM | NÃO]`,
  },
  {
    dia: 15,
    nome: "Seu Pet",
    categoria: "rotina",
    roteiro: `📌

**Como usar este Storie:**

Postar fotos ou vídeos com seu pet durante momentos do dia, como antes de sair para o treino, ao voltar para casa ou durante uma pausa. 

Esse tipo de conteúdo cria conexão com a audiência e gera engajamento, pois muitas pessoas adoram ver animais de estimação.

**Exemplo 1:**

*Vídeo brincando, passeando ou apenas fazendo carinho no pet)*

*Depois de um dia corrido, nada como esse momento.*

**Exemplo 2:**

*Selfie com o pet ou vídeo dele fazendo algo fofo/divertido*

*Quem aí também tem um pet que não desgruda?*

➡ **Enquete:** *"Você tem pet?"* [Sim!] | [Ainda não, mas quero]`,
  },
  {
    dia: 16,
    nome: "Desafio do dia",
    categoria: "educacao",
    roteiro: `Este script é para quem deseja **engajar a audiência** com desafios práticos e interativos, estimulando a **participação ativa e aprendizado** através da prática. Ideal para gerar **engajamento, curiosidade e retenção de conhecimento**.

**Story 1**

Desafie a audiência com uma atividade prática.

Desafio do dia: [algo geralmente deixado de lado do seu nicho, mas que pode ajudar a alcançar resultado]

***Exemplo***

*Desafio do dia: faça 10 minutos de mobilidade antes do treino!*

**Story 2**

Explique a importância da atividade e o impacto positivo.

Fazer [atividade desafiadora] é importante porque [razão não óbvia que estimule as pessoas a fazerem].

***Exemplo***

*Fazer exercícios de mobilidade antes do treino melhora a performance e ajuda na prevenção de lesões, além de otimizar seus resultados de hipertrofia.*

**Story 3**

Mostre o passo a passo da atividade.

Aqui está como você pode realizar a atividade em etapas simples

[Passo 1]
[Passo 2]
[Passo 3]

***Exemplo***

Aqui está como você pode realizar a atividade em etapas simples

1. Alongue os quadris.
2. Mobilize ombros e coluna.
3. Foque nos tornozelos.

**Story 4**

Peça para a audiência reagir se topa cumprir o desafio
Toque na mãozinha ✋🏼 pra eu saber que você topou o desafio.

**Story 5**

Incentive a audiência a compartilhar o cumprimento do desafio no direct.

E aí? Fez [ação solicitada no desafio]? Manda pra mim no direct.

***Exemplo***

E aí, fez a mobilidade? Manda no direct que eu quero ver!

**Story 6**

Compartilhe resultados enviados no direct.

**Story 7**

Finalize a sequência chamando para conhecer a sua consultoria, que ajuda a cumprir não somente o que foi feito no desafio, como traz uma transformação mais completa.

***Exemplo***

Meu programa não só inclui mobilidade, mas também treinos que trazem resultados visíveis. Comenta “RESULTADO” que eu te explico mais!`,
  },
  {
    dia: 17,
    nome: "Sem filtro",
    categoria: "autoridade",
    roteiro: `**A ideia desta sequência é gerar confiança através das caixinhas de perguntas respondidas “sem filtro” sobre um tema específico.**

*Lembre-se de responder de forma estratégica criando uma linha lógica que desperte interesse em um dos seus produtos ou serviços.*

**Story 01**

Preciso confessar

Estou cansado(a) desse negócio de [tema que discorda dentro do seu nicho].

você sabe por quê? 

[enquete SIM | NÃO]

***Exemplo***

*Preciso confessar.*

*Estou cansado(a) desse negócio de "quanto mais cardio, melhor".*

*Sabe por quê?*

*[Enquete: SIM | NÃO]*

**Story 02**

Explique os motivos de defender essa posição. Lembre-se de ser sucinto. 

***Exemplo***

Exatamente porque:

- *O treino de força é mais eficiente para queima de gordura a longo prazo;*
- *Cardio excessivo pode prejudicar a recuperação muscular;*
- *A combinação de força + alimentação é o que gera resultados estéticos de verdade.*

**Story 03**

**Exemplo:**

Já que começamos a falar sobre esse assunto, o que acha de uma caixinha de pergunta SEM FILTRO?

[Sticker de reação de fogo]

**Story 04**

[Caixinha de perguntas: Eu e você num café, o que você me perguntaria?]

**Story 05, 06 e 07**

Responda as perguntas usando estímulos diferentes e elevando o nível de consciência de forma gradual.

**Story 08**

Você gostou dessa versão bate papo sincero? Devo fazer mais vezes? ****

[enquete: SIM | AMEI] ou [sticker de reação]`,
  },
  {
    dia: 18,
    nome: "Se você está",
    categoria: "venda",
    roteiro: `**Com essa sequência de stories, você iniciará com um sentimento forte e comum da sua audiência, se conectando emocionalmente com ela e dando um passo a passo, que são as entregas do seu produto ou serviço.**

*Ao final você vai detalhar o que a pessoa encontrará na sua solução e depois chamá-la para acessar um material disponível que tenha o objetivo de persuadí-la a fechar com você.*

**Story 01**

Se você _____ [problema], você precisa de _____ [passo 1 da solução]…

***Exemplo***

*Se você **não está vendo resultados no seu treino**, você precisa de **um plano de treino adequado**...*

Sugestões:

- **não está perdendo peso**, você precisa de **um ajuste na sua alimentação**.
- **não está conseguindo ganhar massa muscular**, você precisa de **treino focado e progressão de carga**.

.jpg)

**Story 02**

Se você não sabe _____ [problema], você precisa de _____ [passo 1 da solução]…

Se você tem ____ [passo 1 da solução], você precisa _____ [passo 2 da solução]… 

***Exemplo***

*Se você não sabe **como ajustar sua alimentação**, você precisa de **um plano personalizado**...*

*Se você tem **um plano**, você precisa **seguir com consistência**...*

Sugestões:

- **como montar seu treino**, você precisa de **orientação profissional**.
- **um plano de treino**, você precisa **de disciplina para seguir e ajustar**.

**Story 03**

Se você tem ____ [solução], chegou a hora de _____ [passo 3 da solução]…

***Exemplo***

*Se você tem **consistência**, chegou a hora de **alcançar resultados incríveis**...*

Sugestões:

- **como organizar sua dieta**, você precisa de **um nutricionista**...
- **um bom plano**, você precisa **otimizar sua rotina para resultados mais rápidos**...

**Story 04**

____ [passo 1] + _____ [passo 2] + _____ [passo 3]

É exatamente isso o que eu vou te entregar.

***Exemplo***

**Treino + Consistência + Resultados**

*É exatamente isso que eu vou te entregar.*

Sugestões:

- **Dieta + Treino + Acompanhamento**
- **Plano de ação + Disciplina + Evolução**

**Story 05**

______ [benefício 1]

______ [benefício 2]

______ [benefício 3]

***Exemplo***

**Plano de treino personalizado**

**Acompanhamento constante**

**Correção de postura e execução**

Sugestões:

- **Resultados visíveis em semanas**
- **Acompanhamento 100% online**
- **Orientação específica para suas metas**

**Story 06**

_______ [promessa do seu produto/serviço]

***Exemplo***

**Tenha um acompanhamento e mesmo a distancia vou te acompanhar melhor que o seu personal da academia. Resultados no seu corpo em menos de 8 semanas.**

Sugestões:

- **Alcance o corpo que sempre sonhou com um programa personalizado.**
- **Transforme seus treinos e veja resultados reais.**

> Obs: aqui você precisa por a sua promessa, então algo que você sempre fala nos stories
> 

**Story 07**

*Você pode ter acesso a todos os detalhes da [NOME DA CONSULTORIA] agora.*

*Clique 🔥 e **eu te explico como conseguir o corpo que você deseja***.

Sugestões:

- **eu vou te chamar pessoalmente no direct para explicar como funciona.**
- **eu vou te guiar no caminho para alcançar seus objetivos.**`,
  },
  {
    dia: 19,
    nome: "Como Seria…",
    categoria: "quebra_objecao",
    roteiro: `Essa sequência busca mostrar para a **audiência que existe um caminho simples** para não sofrer com determinado problema, é possível alcançar um **desejo** sem continuar sofrendo com esse problema.

**Story 01**

Aqui você vai fazer a pessoa se imaginar sem o problema que ela enfrenta e quer se livrar.

Já imaginou como seria mais fácil se você não precisasse passar por [problema enfrentado]?

[enquete: Sim | Nunca tinha pensado]

***Exemplo***

*Já imaginou como seria mais fácil se você não precisasse passar por **anos de dieta sem ver resultados reais?***

*[Enquete: Sim | Nunca tinha pensado]*

Sugestões:

- *passar por **aquela sensação de frustração após treinar sem resultados visíveis?***
- *lidar com **a culpa após cada refeição livre?***

**Story 02**

Um [desejo da audiência] não precisa de [consequência 1 do problema].

Não precisa de [consequência 2 do problema].

***Exemplo***

*Um **corpo saudável e definido** não precisa de **dietas restritivas o tempo todo**.*

*Não precisa de **horas intermináveis de cardio sem resultados**.*

**Story 03**

O que você precisa é [sua solução única].

***Exemplo***

*O que você precisa é de um **plano de treino com acompanhamento diario e alimentação focada no seu objetivo***

Sugestões:

- *um acompanhamento personalizado que entenda seu corpo e suas necessidades.*`,
  },
  {
    dia: 20,
    nome: "Isso já aconteceu com você | bandeira",
    categoria: "conexao",
    roteiro: `A ideia dessa sequência é fazer a pessoa **identificar** coisas negativas do seu mercado e, por fim, passar a **enxergar você como alguém diferente**, em que ela pode **confiar**

**Story 01**

Aqui a ideia é trazer uma mensagem que você recebeu, ou print de uma notícia que saiu, ou comentário que você viu em algum perfil gigante do seu mercado a respeito de um tema específico que você não concorda.

O print precisa conter informações que mostrem o quão negativo é aquilo que você também não concorda.

Lembre-se, você vai plantar uma ideia na mente da sua audiência, importante trazer temas que dividem opiniões e que façam a sua audiência até sentir "repulsa” daquilo que você está se posicionando contrário.

***Exemplo***

**⚠️** *Segura para ler...*

[Print de uma postagem, notícia ou comentário negativo sobre um tema que você discorda, como "Dietas extremas para emagrecimento rápido" ou "Exercícios milagrosos para perder peso sem esforço."]

*Você também já viu isso por aí?*

[Enquete: *Sim* | *Não*]

**Sugestões:**

- *Você já ouviu falar desse tipo de “treino mágico” que promete resultados sem esforço?*
- *Isso me faz pensar... quantas vezes você já viu algo assim e ficou em dúvida se funcionava?*
- *Você também já caiu nesse tipo de promessa e se arrependeu?*

**Story 02** 

*Eu, definitivamente, não acredito nesse tipo de “estratégia rápida” para emagrecimento que muitos vendem por aí. E você?*

[Enquete: *Eu concordo* | *Eu também não acredito*]

**Sugestões:**

- *Eu realmente não acredito nesses “exercícios fáceis” que prometem resultados sem esforço. E você?*
- *Eu não concordo com essas dietas malucas que prometem milagres em poucos dias. E você, o que acha?*
- *Esse tipo de método que promete resultados rápidos me soa falso. O que você pensa?*

**Story 03**

Aqui você vai trazer a sua posição, o que você defende e acredita. Lembre-se de ilustrar o story com uma imagem ou vídeo da experiência proporcionada que revele o que acredita. Use uma música inspiradora de fundo.

Eu acredito [descreva o que você acredita de maneira inspiradora].

***Exemplo***

*Aqui está o que eu acredito de verdade: eu acredito em progresso constante, em treinos que desafiam o corpo e em uma alimentação que nutre de verdade. Resultados sólidos vêm com dedicação, paciência e consistência. Esse é o caminho que traz mudanças reais.*

[Foto/vídeo seu treinando, acompanhando alunas ou mostrando uma alimentação saudável]

**Sugestões:**

- *Eu acredito que só com disciplina e foco você vai alcançar o corpo que deseja. Não existem atalhos.*
- *Acredito que o melhor treino é aquele que você faz todos os dias, com esforço e dedicação.*
- *Eu acredito que resultados duradouros vêm com esforço contínuo, não com promessas vazias.*`,
  },
  {
    dia: 21,
    nome: "Compartilhando alguma curiosidade",
    categoria: "rotina",
    roteiro: `**Story 1**

Pouca gente sabe disso, mas…
(Imagem ou vídeo de fundo com algo relacionado à curiosidade que será contada)

**Story 2**

Antes de começar a treinar/ser personal, eu [falar a curiosidade: já tive outro trabalho, odiava academia, era muito magro, etc.].
(Imagem ou vídeo antigo, se tiver)

**Story 3**

Se me dissessem naquela época que um dia eu estaria aqui, vivendo disso, eu riria na cara da pessoa kkkk.

**Story 4**

Mas a vida dá voltas, e quando você se permite tentar algo novo, descobre que pode gostar muito mais do que imaginava.
(Imagem ou vídeo atual, contrastando com a fase antiga)

**Story 5**

E você? Já mudou de ideia sobre algo na vida? Me conta aí!
(Caixinha de perguntas para engajar)`,
  },
  {
    dia: 22,
    nome: "Storytelling com avaliação postural",
    categoria: "consultoria",
    roteiro: `[Exemplo 01](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2001%20257670d4146d811981e7d6c01bbecdea.md)

[Exemplo 02](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2002%20257670d4146d81829532ce614a8cfe37.md)

[Exemplo 03](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2003%20257670d4146d81bf828dc826623748a0.md)

[Exemplo 04](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2004%20257670d4146d81c3905fec67cc6753dd.md)

[Exemplo 05](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2005%20257670d4146d81dcb960d10d7e1a6d7a.md)

[Exemplo 06](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2006%20257670d4146d81a0b49dfc114be03e6c.md)

[Exemplo 07](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2007%20257670d4146d810b92dff72ea2930aed.md)

[Exemplo 08](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2008%20257670d4146d8162a50ff51cf2f7837a.md)

[Exemplo 09](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2009%20257670d4146d8177bc57e3bfe7b2cf5c.md)

[Exemplo 09](Storytelling%20com%20avalia%C3%A7%C3%A3o%20postural/Exemplo%2009%20257670d4146d814c98c9c7bb99ac0e13.md)`,
  },
  {
    dia: 23,
    nome: "Ponto de desejo",
    categoria: "story_unico",
    roteiro: `**Story 01**

[desejo da sua audiência] seria bom para você?

Exemplo:

*Ter **um corpo mais definido** seria bom para você?*

Se sim, clica aqui [colocar sticker de reação] que vou te ajudar e você não vai se arrepender, apenas clique.

Sugestões:

- *Ver **resultados rápidos nos treinos** seria bom para você?*
- *Conseguir **ganhar massa muscular** seria bom para você?*`,
  },
  {
    dia: 24,
    nome: "Conscientizando do problema",
    categoria: "educacao",
    roteiro: `**Este conteúdo tem como objetivo revelar ao seu público um problema no seu nicho.**

*Vamos contextualizar esse problema para trazer mais consciência sobre ele e, por fim, oferecer uma solução que talvez não tenha sido considerada anteriormente. A ideia é apresentar algo que o seu público não imaginava ser possível para resolver esse problema de forma eficaz.*

**Story 01**

____ [público], 

você precisa entender que…

***Exemplo***

Mulheres que buscam definição e emagrecimento,
vocês precisam entender que…

**Story 02**

Existe um processo para que  ___[ação desejada]… 

***Exemplo***

Existe um processo para alcançar o corpo definido e tonificado que vocês sempre desejam…

**Story 03**

E se você quebra esse processo…

**Story 04**

quebra o ___[motivo 1]

___[motivo 2]

___[motivo 3]

***Exemplo***

Quebra a rotina de alimentação no meio da semana
não faz cardio necessario para queimar caloria,
e não busca treinar perto da falha.

**Story 05**

Assim, fica muito mais difícil alcançar o corpo que você tanto quer.

**Story 06**

Qual desses motivos está te prejudicando nos treinos? Me conta no direct, e eu vou trazer soluções aqui nos stories.

**Story 07**

Vamos aos prints e as soluções?

[Sticker de reação 🔥]

**Story 08, 09 e 10**

[print do direct]

____ [coloque a solução para cada motivo. “O que fazer"]

Use um print para cada story + uma solução com “O que fazer”, o como fazer somente com a consultoria

Use o contexto dessas soluções como gancho para a consultoria

Não se limite a 3 stories com soluções. Analise cada motivo enviado e se consegue fazer esse gancho para ofertar os seus produtos.

 ***OBS:** Aproveite as mensagens que você recebeu no direct das pessoas mencionando os problemas para conduzir vendas no direct. Use o 1 a 1 a seu favor.*`,
  },
  {
    dia: 25,
    nome: "Contar um segredo (Persona transformada)",
    categoria: "autoridade",
    roteiro: `***Mostre** que você entende a melhor forma de fazer porque já **testou e validou**, seja consigo ou com outras pessoas.*

 **Story 01**

Eu preciso te contar um segredo…

 **Story 02**

Muitas pessoas me perguntam como ___ para conseguir ___ [resultado desejado]

***Exemplo*** 

Muitas pessoas me perguntam como consegui transformar meu corpo de maneira tão eficiente e consistente.

 **Importante**

Se você é a persona transformada, é fundamental que as pessoas identifiquem em você o desejo que elas possuem. Você precisa ser o exemplo do que você vende. 

 **Story 03**

Uma coisa é certa, eu ____[tempo/dinheiro/desgaste] para conseguir ___[resultado desejado]

Mas você não precisa esperar por todo esse tempo…

***Exemplo*** 

*Uma coisa é certa: eu levei anos testando diferentes métodos e ajustando minha rotina de treino e alimentação para conseguir resultados visíveis.*

*Mas você não precisa esperar por todo esse tempo…*

 **Story 04**

Eu conheço o melhor caminho, afinal eu sei o que funciona e o que não funciona.

---

Você não vai precisar se perder pelo caminho até encontrar uma solução.

---

Eu conheço os atalhos e vou te mostrar o que é realmente essencial para você ___ [resultado desejado]

***Exemplo*** 

*Eu conheço os atalhos que realmente funcionam e vou te mostrar o que é essencial para alcançar o físico que você deseja sem perder tempo.*

**Story 05**

Será que eu deveria liberar ___ [elemento chave do que você vai entregar no seu produto]?

Reage esse story só para eu saber quem gostaria de ter acesso.

***Exemplo*** 

*Será que eu deveria liberar 5 horarios na minha agenda para dar o direcionamento ao vivo para vocês?*

*Reage esse story **[Sticker de Reação]** só para eu saber quem gostaria desse direcionamento.*`,
  },
  {
    dia: 26,
    nome: "Faria diferença?",
    categoria: "venda",
    roteiro: `Use o **resultado do seu cliente** para ancorar as possibilidades de ganho que quem ainda não comprou poderá alcançar.

**Story 01**

Faria diferença [gancho do depoimento]?

Enquete: SIM | NÃO

***Exemplo*** 

*Faria diferença **ver resultados visíveis no seu corpo em apenas 8 semanas**?*

*[Enquete: SIM | NÃO]*

Sugestões:

- **ganhar 5kg de massa muscular em 3 meses**
- **perder 5kg de gordura sem dieta restritiva**

 **Story 02**

“Melhor do que fazer ___ [desejo linkado com o depoimento] é fazer ___ ****[desejo ampliado]”

***Exemplo*** 

*Melhor do que **esperar meses para ver resultados**, é **ter um acompanhamento que te leve ao resultado mais rápido**.*

Sugestões:

- **treinar por conta própria**, é **ter um plano ajustado para sua necessidade**
- **seguir dietas da moda**, é **comer de forma balanceada e ver mudanças**

 **Story 03**

É exatamente isso que aconteceu com ___ [depoimento].

***Exemplo*** 

É exatamente isso que aconteceu com **minha aluna [NOME DA ALUNA], que transformou seu corpo em X semanas**.

 **Story 04**

Se você quer [DESEJO]?

[clique aqui]

***Exemplo*** 

*Se você quer **transformar seu físico de forma saudável**, [clique aqui]*.

Sugestões:

- **ver resultados mais rápidos e duradouros**
- **seguir o caminho certo para alcançar suas metas**`,
  },
  {
    dia: 27,
    nome: "Incentivando a decisão",
    categoria: "quebra_objecao",
    roteiro: `*Você vai mostrar que existem pessoas que passam pelo problema que o seu **produto/serviço** ajuda a resolver e você vai incentivar a **tomada de decisão**.*

 **Story 01**

Vejo muitas [cliente dos sonhos] que reclamam que [dor do público].

***Exemplo*** 

Eu vejo muitas **mulheres** que reclamam que **treinam tanto e ainda não veem os resultados que querem.**

 **Story 02**

E sabe onde mora o problema?

A maioria delas não sabe ___ [erro primário].

***Exemplo*** 

*E sabe onde mora o problema?*

*A maioria delas não sabe **que só seguir o treino básico não vai levar ao resultado desejado**.*

 **Story 03**

Acreditam que só fazer o básico já é o bastante. Mas não é!

As pessoas não querem mais só [o que é básico].

***Exemplo*** 

*Elas acreditam que só fazer o básico na academia já é o bastante. Mas não é!*

*As mulheres não querem mais só um treino básico que não traz resultados visíveis.*

**Story 04**

Se você quer daqui a ___[tempo para alcançar um resultado com o seu produto] ___[DESEJO]. Você precisa ___ [promessa do seu produto]

***Exemplo*** 

Se você quer daqui a **30 dias** começar a ver **seu corpo transformado**, você precisa **seguir uma periodização de treino , com acompanhamento diario, correções e dieta 100% individualizada.**

 **Story 05**

É exatamente isso que você vai aprender/ter acesso dentro do ____[nome do produto]

Comente [palavra-chave] que vou te mostrar como funciona.

***Exemplo*** 

É exatamente isso que você vai ter acesso dentro da consultoria PREMIUM. 

Clica aqui [botão de reação] e veja magica acontecer 🪄`,
  },
  {
    dia: 28,
    nome: "Não é só mais um story clichê",
    categoria: "conexao",
    roteiro: `**Neste conteúdo, você vai usar frases que ninguém mais consegue ouvir para chamar atenção do seu público e criar conexão.**

*O objetivo dessa sequência é mostrar que nada é impossível para a sua audiência e que o resultado que eles querem foi alcançado por você. Você tem o mapa desse caminho e sabe exatamente como eles se sentem. Uma forma diferente de abordar um clichê motivacional e que vai gerar uma conexão forte com eles.*

**Story 01**

Esse não é só mais um story de bom dia com clichês motivacionais…

E nem estou aqui para te convencer de nada, mas…

**Story 02**

O fato é que [frase clichê motivacional comum pra sua audiência - de acordo com o seu universo de conteúdo].

***Exemplo***

*O fato é que “quem não se compromete com seus treinos, nunca verá os resultados que tanto deseja…”*

**Sugestões:**

- *O fato é que “o treino que você pula é o resultado que você nunca vai ver…”*
- *O fato é que “não existe atalho para ganhar massa muscular, só consistência.”*
- *O fato é que “treinar só de vez em quando não transforma seu corpo.”*

**Story 03**

E sabe por que estou falando isso?

Eu sei que [ação/pensamento da sua audiência que comprove a frase clichê].

E que você está cansada de escutar isso sempre.

Os clichês são “frases batidas e muito comuns” por algum motivo, não acha? 

***Exemplo***

*E sabe por que estou falando isso?*

*Eu sei que muitas vezes você começa empolgada, mas quando o cansaço aparece, você pensa em desistir.*

*E que você está cansada de escutar isso sempre.*

*Os clichês são “frases batidas e muito comuns” por algum motivo, não acha?*

**Sugestões:**

- *Eu sei que você sempre diz que vai começar a treinar “segunda-feira” e depois desiste…*
- *Eu sei que no começo do mês você faz promessas para si mesma, mas a motivação vai embora na primeira semana…*
- *Você está cansada de ouvir que "só com consistência vem os resultados", mas é verdade.*

**Story 04**

Eles são reais e podem doer mais do que imagina.

Você sabe que as pessoas que estão no topo, tendo a vida que você quer ter, não desistiram um só dia.

***Exemplo***

*Eles são reais e podem doer mais do que imagina.*

*Você sabe que as pessoas que estão no topo, com o corpo que você quer ter, não desistiram um só dia.*

**Sugestões:**

- *As pessoas que conquistam resultados incríveis não param por preguiça ou falta de motivação.*
- *Quem tem o corpo que você admira não pula treinos nem faz dieta de qualquer jeito.*
- *Os resultados que você sonha não vêm com desculpas, mas com disciplina.*

**Story 05**

E neste exato momento alguém __[ação de alguém que está no processo de transformação].

Essa pessoa acordou hoje e decidiu dar mais um passo,

subir mais um degrau.

***Exemplo***

*E neste exato momento alguém não desistiu e está indo treinar, mesmo cansada.*

*Essa pessoa acordou hoje e decidiu dar mais um passo, subir mais um degrau.*

**Sugestões:**

- *Agora mesmo, alguém que tinha mil desculpas escolheu ir treinar e está construindo o corpo que deseja.*
- *Neste exato momento, alguém está aumentando suas cargas, enquanto muitos desistem no meio do caminho.*
- *Alguém está fazendo seu treino agora, mesmo com chuva lá fora, e você?*

**Story 06**

Mas, a maioria das pessoas vai ler tudo isso e mais uma vez "deixar pra lá".

Essas são as mesmas pessoas que reclamam da própria vida todos os dias.

***Exemplo***

*Mas, a maioria das pessoas vai ler tudo isso e mais uma vez "deixar pra lá".*

*Essas são as mesmas pessoas que reclamam da própria vida todos os dias.*

**Sugestões:**

- *A maioria vai ver essa mensagem e continuar dizendo que “amanhã começa”, mas amanhã nunca chega...*
- *Muitos vão ver isso e continuar a buscar atalhos que não funcionam…*
- *A maioria desiste e depois reclama que nunca vê mudanças no espelho...*

**Story 07**

Quando eu percebi que [o que gerou mudança de chave] e parar de [ação negativa] era ai que eu começaria a [resultado].

Eu realmente teria que [ações de conclusão].

***Exemplo***

*Quando eu percebi que parar de arrumar desculpas e começar a agir era o que faria toda a diferença, eu comecei a ver resultados reais.*

*Eu realmente teria que me comprometer todos os dias para transformar meu corpo.*

**Sugestões:**

- *Quando eu entendi que consistência era o segredo, tudo começou a mudar…*
- *Foi quando eu parei de tentar atalhos e foquei na disciplina que meu corpo começou a se transformar.*
- *Eu percebi que, sem foco diário, eu nunca teria o corpo que sonhava…*

**Story 08**

Quem me vê [seus resultados], não imagina o que passei lá atrás e o que tive que abrir mão.

**A Zona de Conforto nunca me faria chegar onde cheguei.**

***Exemplo*** 

*Quem me vê agora, com o corpo definido e treinando todos os dias, não imagina o que passei lá atrás e o que tive que abrir mão.*

*A Zona de Conforto nunca me faria chegar onde cheguei.*

**Sugestões:**

- *Quem me vê hoje atingindo minhas metas no treino não sabe das vezes que pensei em desistir...*
- *Quem vê meus resultados não imagina as vezes que me superei para treinar mesmo sem vontade.*
- *Quem olha meu corpo hoje, não imagina o quanto eu me dediquei e saí da minha zona de conforto.*

**Story 09**

É muito fácil viver a minha vida hoje…

mas até chegar aqui… não foi fácil.

Mas, a vida que eu levava também não era nada fácil de ter.

Eu sacrificava os meus próprios sonhos!

***Exemplo*** 

*É muito fácil viver a minha vida hoje...*

*Mas até chegar aqui... não foi fácil.*

*Mas, a vida que eu levava também não era nada fácil de ter.*

*Eu sacrificava os meus próprios sonhos!*

**Sugestões:**

- *Hoje, ter disciplina faz parte da minha vida, mas eu sei como é difícil no começo.*
- *Chegar até aqui foi difícil, mas desistir de mim mesmo era ainda pior.*
- *Eu sei que você também pode alcançar seus objetivos, mas precisa sair da zona de conforto.*

[https://app.notion.com](https://app.notion.com)

**Story 10**

EU sempre vou repetir [frase motivacional]

Decida hoje. Faça hoje. Construa hoje

Só assim [resultado].

[sticker de reação de 🔥]

***Exemplo*** 

*EU sempre vou repetir: quem para no meio do caminho, não constrói nada.*

*Decida hoje. Faça hoje. Construa hoje.*

*Só assim você vai conquistar o corpo que sempre quis.*

[Sticker de reação de 🔥]

**Sugestões:**

- *EU sempre vou repetir: o treino de hoje é o resultado de amanhã. Decida hoje. Faça hoje. Construa hoje.*
- *EU sempre vou repetir: quem não se compromete com o processo, nunca verá o progresso. Decida hoje. Faça hoje. Construa hoje.*
- *EU sempre vou repetir: só com disciplina diária vem o resultado. Decida hoje. Faça hoje. Construa hoje.*`,
  },
  {
    dia: 29,
    nome: "Postando suas refeições",
    categoria: "rotina",
    roteiro: `📌

**Como usar este Storie:**

Mostrar o que está comendo no dia a dia, seja uma refeição equilibrada ou um momento de "off". Isso gera engajamento, inspira seguidores e reforça a importância da alimentação no treino.

**Story 1 *(Foto bem iluminada do prato ou vídeo curto mostrando a comida)***

Almoço pronto! Hoje fui de [descrever brevemente].

**Story 2** *(Vídeo pegando um garfo)*

Comer bem não precisa ser complicado. O básico bem feito sempre funciona!

➡ **Enquete:** Você se alimenta bem no dia a dia? 

[Sim, tento manter] | [Preciso melhorar]`,
  },
  {
    dia: 30,
    nome: "Storytelling com correção de exercício",
    categoria: "consultoria",
    roteiro: `[**Exemplo 01**](Storytelling%20com%20corre%C3%A7%C3%A3o%20de%20exerc%C3%ADcio/Exemplo%2001%20257670d4146d811492e9f29f7324f39f.md)

[**Exemplo 02**](Storytelling%20com%20corre%C3%A7%C3%A3o%20de%20exerc%C3%ADcio/Exemplo%2002%20257670d4146d81979076dae8e1279103.md)

[**Exemplo 03**](Storytelling%20com%20corre%C3%A7%C3%A3o%20de%20exerc%C3%ADcio/Exemplo%2003%20257670d4146d8162a56beba8f4bb841a.md)

[**Exemplo 04**](Storytelling%20com%20corre%C3%A7%C3%A3o%20de%20exerc%C3%ADcio/Exemplo%2004%20257670d4146d81908b0fce5884cf609c.md)

[**Exemplo 05**](Storytelling%20com%20corre%C3%A7%C3%A3o%20de%20exerc%C3%ADcio/Exemplo%2005%20257670d4146d81e4a79ce80f7bb4c826.md)

[**Exemplo 06**](Storytelling%20com%20corre%C3%A7%C3%A3o%20de%20exerc%C3%ADcio/Exemplo%2006%20257670d4146d81cf9d0fd3cb8e1250a8.md)`,
  },
  {
    dia: 31,
    nome: "Mudar tudo",
    categoria: "story_unico",
    roteiro: `Esta **sequência rápida** é para trazer consciência que uma **decisão** pode fazer muita diferença, e o gancho usado aqui será uma **frase de impacto**.

**Story 01**

O passo que você está com medo/dúvida de dar, pode ser aquele que vai mudar tudo.

**Story 02**

Caso você tenha um depoimento recente, use o print ou o vídeo para mostrar como o que você vende levou a pessoa de um ponto A para o B.

[print]

Foi exatamente uma decisão que mudou tudo com o/a [nome do cliente], e o próximo pode ser você.

[link]

***Exemplo*** 

*[print do depoimento]*

*Foi exatamente uma decisão que mudou tudo com a **[NOME DA ALUNA]**, e a próxima pode ser você.*

*[Link personalizado: toque aqui]*`,
  },
  {
    dia: 32,
    nome: "Você sabia?",
    categoria: "educacao",
    roteiro: `**Este script é ideal para compartilhar informações educativas e envolver sua audiência de forma interativa.**

*Utilize-o para ensinar conceitos importantes, compartilhar dados relevantes ou desmistificar mitos dentro do seu nicho. Cada story tem um propósito específico para manter o engajamento e promover a participação ativa do público, aumentando sua autoridade no assunto.*

**Story 1**

Comece com uma pergunta intrigante, com preferência com um dado curioso.

Você sabia que [constatação de um problema comum da sua audiência] …

e qual o problema disso?

***Exemplo 1***

"Você sabia que 80% das pessoas que treinam não conseguem ver resultados no físico desejado? E qual o problema disso?”

**Story 2**

Divulgue uma estatística ou fato surpreendente.

De acordo com estudos recentes, X% das pessoas que [ação] conseguem [resultado].

***Exemplo***

"De acordo com estudos recentes, 60% das pessoas que aplicam técnicas de progressão de carga corretamente conseguem ganhar massa muscular em menos tempo.”

**Story 3**

Explique o motivo por trás do dado apresentado e sua importância.

Isso acontece porque [explicação]. Por isso, é fundamental [ação].

***Exemplo***

*Isso acontece porque sem progressão adequada, o corpo não é estimulado o suficiente para crescer. Por isso, é fundamental seguir uma estratégia correta de aumento de carga.*

**Story 4**

Forneça uma dica prática ou uma solução relacionada ao tema.

Uma forma simples de [ação] é [dica].

***Exemplo***

"Uma forma simples de garantir a progressão é anotar as cargas que você levanta e sempre tentar aumentar 1 a 2 kg por semana nos principais exercícios."

**Story 5**

Use um sticker de pergunta ou enquete para engajar a audiência.

Você já aplica isso no seu dia a dia?

[enquete: SIM | NÃO]

***Exemplo***

"Você já segue uma estratégia de progressão de cargas nos seus treinos?"

*[enquete: SIM | NÃO]"*

**Story 6**

Responda perguntas da audiência ou compartilhe mais dicas baseadas nas respostas.

"Você pode estar se perguntando agora: Como começar a fazer isso de forma realmente eficiente…"

***Exemplo***

"Você pode estar se perguntando: como garantir que estou progredindo corretamente? Acompanhe seus treinos semanalmente e ajuste as cargas, pode também ser usado o método de periodização”

**Story 7**

Em um vídeo rápido, mostre exemplos de como aplicar a progressão de carga em diferentes exercícios.

**Story 8**

*Agora que você já sabe como fazer isso, vai se comprometer a não fazer mais parte dos 80% que não vêem resultados?*

Clica 🔐 [botão de reação]`,
  },
  {
    dia: 33,
    nome: "Maior dificuldade",
    categoria: "autoridade",
    roteiro: `**Story 1**

Faça uma enquete sucinta com foco na dor da audiência.

Qual das opções você não[problema]?

***Exemplo***

*Qual das opções você não consegue ter disciplina?*

*[Enquete: Dieta | Treino]*

**Story 2**

Continue a sequência agora com foco no desejo da audiência.

Já imaginou conseguir [desejo]?

***Exemplo***

*Já imaginou conseguir fazer dieta sem sofrer?*

*[Enquete: SIM | NÃO]*

**Story 3**

Você tem o poder de oferecer uma solução com base na dificuldade das pessoas. Então mostre que, para cada dificuldade, você terá uma solução.

[Caixinha de perguntas: Qual a sua principal dificuldade com [tema mais votado na enquete inicial?

***Exemplo***

*Me conta qual a sua principal dificuldade com dieta?*

[caixinha]

**Story 4, 5, 6 e 7**

Responda as perguntas que teve na sua caixinha gerando autoridade e reforçando a necessidade do que você vende.

No story 7 você pode falar sobre um caminho para solucionar e linkar com o seu produto/serviço. Inclusive mostrando os diferenciais e o que a pessoa recebe ao fechar com você.`,
  },
  {
    dia: 34,
    nome: "Quando as pessoas acham",
    categoria: "venda",
    roteiro: `**Essa sequência é para você quebrar e desmistificar algo preconceituoso ou limitado em relação ao que você vende e mostrar para a pessoa que existe um caminho diferente do que talvez elas pensavam.**

*É importante que essa sequência seja montada com fotos contextualizadas, de preferência suas e do seu ambiente de trabalho. Ou, se possível, você pode gravar um take longo seu trabalhando e dividir no aplicativo “Split Video” cortando esse take longo em 4 stories complementares para você usar como fundo desta sequência.*

**Story 01**

Quando as pessoas acham que você [descrição / caracterização limitada ou preconceito em relação ao que você faz] 

mas na verdade…

***Exemplo***

*Quando as pessoas acham que você **é só uma personal trainer de Instagram**, mas na verdade…*

Sugestões:

- **é só alguém que posta dicas de treino aleatórias**
- **faz exercícios só para likes e views**

**Story 02**

você [desejo da audiência] só [objeção da audiência].

**Exemplo**

Você **quer resultados rápidos**, só **que acha que precisa de horas intermináveis de treino e uma dieta radical.**

Sugestões:

- **quer um corpo definido**, só **que acha que precisa sofrer em dietas malucas.**
- **quer ganhar massa muscular**, só **que acha que precisa treinar 7 dias por semana sem descanso.**

**Story 03**

Eu não [descrição / caracterização limitada ou preconceito em relação ao que você faz].

E você também não precisa ser/fazer para [desejo principal da audiência].

*Eu não **sou só uma personal trainer de Instagram**.E você também não precisa **seguir dietas restritivas ou treinos sem fim para ver resultados.***

Sugestões:

- **faço apenas treinos básicos.**
- **precisa treinar horas por dia para conseguir resultados.**

**Story 04**

Me manda um direct com "EU QUERO" que eu te explico como alcançar seus resultados sem complicações!`,
  },
  {
    dia: 35,
    nome: "É realmente possível?",
    categoria: "quebra_objecao",
    roteiro: `Aqui o objetivo é fazer uma **pergunta de contra-senso** instigando a sua audiência a entender o motivo por trás de um **resultado ou afirmação.**

**Story 01**

_______ [afirmação de contra-senso]

É realmente possível fazer isso?

Enquete: Sim/Não

***Exemplo***

*“Treinar menos e ganhar mais massa magra.”*

*É realmente possível?*

*[Enquete: Sim/Não]*

 **Story 02**

Nós últimos dias eu ________ [fato inusitado] 

[A ideia é complementar contando uma história, veja o exemplo abaixo]

Mesmo assim, isso aqui continuou acontecendo … [Aqui você pode adaptar para o resultado que você prometeu no começo]

**Exemplo:**

*Nos últimos dias, eu **reduzi minhas idas à academia de 6 para 4 vezes por semana**.*

*Mesmo assim, isso aqui continuou acontecendo…*

*[Foto ou vídeo de resultados físicos visíveis]*

**Story 3**

Eu consegui ________ [resultado] enquanto eu _______ [fato inusitado]
Esse resultado parece interessante pra você?
[Emoji de reação]

***Exemplo***

*Eu consegui **definir melhor o corpo** enquanto **diminui o tempo de treino**.*

*Esse resultado parece interessante pra você?*

*[Emoji de reação]*

**Story 4**

Conseguir_________ [afirmação de contra-senso] é muito simples. Você só precisa seguir _______ [Passos do seu método/do que defende]

***Exemplo***

Conseguir **mais resultado treinando menos** é muito simples. Você só precisa seguir **um plano focado na progressão de carga e descanso estratégico**.

**Story 5**

Algumas pessoas já estão fazendo isso na prática … 

[Print depoimento]

**Story 6**

Se você quer entender como ______ [Afirmação de contra-senso] toque no link abaixo

[Link]

***Exemplo***

*Se você quer entender como **reduzir o tempo de treino e aumentar os resultados**, toque no link abaixo.*

*[Link]*`,
  },
  {
    dia: 36,
    nome: "Ganhando depoimento",
    categoria: "conexao",
    roteiro: `**A ideia desta sequência é se colocar numa posição de alguém que a audiência pode confiar e se abrir sem aquela sensação de distanciamento.**

*Com ela você vai entender os motivos que fazem as pessoas comprarem de você, é uma excelente forma de entender os fatores intangíveis da compra, assim você consegue fortalecer ainda mais esses pontos levantados pelo seu público em todos os formatos de conteúdo.*

**Story 01**

Com um vídeo dos seus bastidores de fundo, mencione o que você fez ou está fazendo + o seguinte texto:
e queria te perguntar algo muito importante, você me responde com sinceridade?

[Enquete: SIM | NÃO]

**Exemplo**

*Com um vídeo dos bastidores de seu treino ou ajustando o treino de uma aluna ao fundo...*

*“Acabei de ajustar o treino de uma das minhas alunas, e queria te perguntar algo muito importante. Você me responde com sinceridade?”*

[Enquete: **SIM | NÃO**]

**Sugestões:**

- *“Acabei de terminar o treino do dia, e queria te perguntar algo super importante. Me responde com sinceridade?”*
- *“Estou aqui no meu espaço de treinos, e queria te fazer uma pergunta bem sincera. Me responde?”*
- *“Enquanto preparo o próximo treino, quero te perguntar algo que faz toda a diferença. Responde com sinceridade?”*

**Story 02**

Pergunta principal: O que te levou a se tornar meu/minha [aluna/cliente/fã/seguidora]?
E se você não se tornou ainda, compartilha comigo também o motivo

**Exemplo**

*“O que te levou a se tornar minha aluna/minha seguidora?*

*E, se você ainda não começou, compartilha comigo o motivo. Vou adorar saber.”*

**Sugestões:**

- *“O que fez você decidir treinar comigo ou me seguir? E se ainda não começou, qual o motivo? Me conta.”*
- *“Por que você decidiu me acompanhar nos treinos? Se ainda não, o que falta para começar?”*
- *“O que te fez seguir meu perfil e começar a acompanhar meus treinos? E se não começou, me fala o porquê.”*

**Story 03**

Selecione uma das respostas sinceras que mais te gerem autoridade e compartilhe.

Estou recebendo tanta coisa incrível…

[print]

**Exemplo**

*Compartilhe uma das respostas sinceras que gerem mais autoridade:*

*“Estou recebendo tanta coisa incrível...”*

[Print de uma resposta destacando o reconhecimento do trabalho]

**Sugestões:**

- *“As respostas estão incríveis! Aqui está uma que me deixou super feliz…”*
- *“Estou recebendo tantas mensagens incríveis, olha essa que me motivou ainda mais!”*
- *“Olha só essa resposta, ela me fez ver que estou no caminho certo ajudando vocês…”*

 ***OBS**: Se as pessoas que não compraram te responderem é uma excelente forma de entender as objeções do seu público para abordar no 1 a 1 e tentar contornar, além de poder criar conteúdos baseados nessas objeções.*`,
  },
  {
    dia: 37,
    nome: "Quantidade das suas refeições",
    categoria: "rotina",
    roteiro: `📌

**Como usar este Storie:**

Postar uma foto do prato e adicionar **linhas indicando a quantidade** de cada alimento (ex: 150g de frango, 200g de arroz, 50g de abacate). Isso gera curiosidade sobre a dieta do personal e cria conexão com a audiência.`,
  },
  {
    dia: 38,
    nome: "Storytelling com explicação técnica",
    categoria: "consultoria",
    roteiro: `[Exemplo 01](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2001%20257670d4146d81f4926addce6be88342.md)

[Exemplo 02](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2002%20257670d4146d8133b778ffc2f96b2f7a.md)

[Exemplo 03](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2003%20257670d4146d818aaaa1c16cb758f432.md)

[Exemplo 04](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2004%20257670d4146d8155b9fff9358399176c.md)

[Exemplo 05](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2005%20257670d4146d811bb868e6b66e069b12.md)

[Exemplo 06](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2006%20257670d4146d816da51df37b3875001c.md)

[Exemplo 07](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2007%20257670d4146d81a792d1f16ce4224c9c.md)

[Exemplo 08](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2008%20257670d4146d8143b93ce794a5c3f59b.md)

[Exemplo 09](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2009%20257670d4146d81b2ac4ac4f1634acb40.md)

[Exemplo 10](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2010%20257670d4146d817a84aad6454d22500c.md)

[Exemplo 11](Storytelling%20com%20explica%C3%A7%C3%A3o%20t%C3%A9cnica/Exemplo%2011%20257670d4146d81148c14c4d7d2e75990.md)`,
  },
  {
    dia: 39,
    nome: "Motivando",
    categoria: "story_unico",
    roteiro: `Todas as pessoas gostam daqueles que as **inspiram e a motivam a serem melhores**, com uma frase no começo do dia, **inspire as pessoas** a clicarem no sticker se estão **dispostas a fazer o que você propôs** na mensagem. Importante que e**ste story saia bem cedo**, entre 06h e 07h.

**Story único:**

Aqui neste exemplo eu inspirei e disse para a minha audiência pegar a sua xícara de café (que é um símbolo da minha marca) representada não só na foto como no sticker de reação.

***Exemplo***

*Mais um dia começando, mais uma chance de conquistar o seu melhor corpo! Pegue seu café (ou sua garrafinha de água) e vamos juntos dar o primeiro passo hoje. Quem está comigo?*

[Use uma foto sua com a xícara ou garrafinha e um sticker de reação]

**Sugestões:**

- *Mais um dia para focar no seu treino e na sua evolução! Pegue seu café e vamos nessa!*
- *Bora começar o dia com tudo? Café na mão e mente focada! Quem tá comigo?*
- *Hoje é o dia perfeito para começar! Pegue seu café e vamos fazer acontecer no treino!*`,
  },
  {
    dia: 40,
    nome: "Nunca imaginei",
    categoria: "educacao",
    roteiro: `**Nesta sequência, você começará provocando a curiosidade com uma afirmação intrigante que já revela um resultado.**

*Ao longo dos stories, abordará um problema comum da sua audiência, compartilhando insights e sintomas que identificou ao enfrentar esse desafio em sua jornada. A ideia é gerar identificação, confiança e mostrar que existem soluções para isso.*

---

**Story 01**

_____ [comece com uma afirmação intrigante sobre mudanças recentes que você experimentou].

***Exemplo 1***

*Eu nunca imaginei que uma pequena mudança nos meus treinos pudesse trazer resultados tão rápidos…*

***Exemplo 2***

Eu nunca imaginei que ajustar um simples detalhe na minha alimentação poderia transformar meus resultados...

**Story 02**

Percebi que ______ [descreva um problema comum que você percebeu] que, na verdade, não estava me ajudando em nada para ______ [alguma meta, objetivo ou resultado desejado].

***Exemplo***

*Percebi que muitas pessoas cometem um erro comum: não dar atenção à quantidade de proteína ingerida. Isso estava prejudicando o ganho de massa muscular.*

**Story 03**

Você sente que passa não só por isso, mas também por:

- ____ [sintoma 1]
- ____ [sintoma 2]
- ____ [sintoma 3]

***Exemplo***

Você se identifica com algum desses problemas?

- Comer de forma inconsistente
- Falta de progresso nos treinos
- Sentir-se cansado após os treinos

**Story 04**

Reconheceu alguns desses sinais _____ [convide o público a refletir]?

[Enquete: 

Sim! Pelo menos um deles!

Com certeza! Passo por todos!

Não passo por isso!]

***Exemplo***

*“Você reconhece algum desses sinais em sua rotina?”*

*[Enquete:* 

*Sim! Pelo menos um deles!*

*Com certeza! Passo por todos!*

*Não passo por isso!]*

**Story 05**

Isso é mais comum do que se imagina!

E se eu dissesse que ______ [explique o insight ou a mudança de perspectiva que teve sobre esse problema].

***Exemplo***

*“*Isso é mais comum do que se imagina!”

*E se eu dissesse que a chave está em ajustar sua alimentação para otimizar seus treinos e resultados?*

**Story 06**

[Aqui você vai usar situações reais enfrentadas por seus clientes e como resolveram, ou situações hipotéticas usando nome de alguém + problema + caminho de solução]

***Exemplo***

*"A Mariana ajustou suas refeições pré e pós-treino e, em poucas semanas, viu uma grande diferença na sua definição muscular.”*

**Story 07**

[Crie um vídeo tutorial rápido e narrando o passo a passo, seja num ipad, folha, ou bloco de notas para mudar o estímulo da sequência até aqui.]

**Story 08:**

Gostou do conteúdo?

Clica aqui [botão de reação]`,
  },
  {
    dia: 41,
    nome: "Quanto tempo mais?",
    categoria: "autoridade",
    roteiro: `**Story 01**

Por quanto tempo você pretende continuar _____[problema inconsciente]?

***Exemplo*** 

*Por quanto tempo você pretende continuar treinando sem ver os resultados que deseja?*

**Story 02**

Mostre que existe outra saída que a pessoa está perdendo a oportunidade de explorar.

***Exemplo***

*Existem estratégias que você ainda não está aplicando, e elas podem ser a chave para transformar o seu corpo.*

*[print ou imagem mostrando exemplos de resultados que podem ser atingidos]*

**Story 03**

Diga que você sabe que a pessoa pode estar fazendo aquilo por desconhecimento, mencione que irá ajudá-la.

***Exemplo***

Eu sei que você pode não saber como fazer isso corretamente, e eu vou te ajudar agora de forma GRATUITA!

**Story 04**

Abra uma caixinha de perguntas para tirar 4 dúvidas. Ao final das caixinhas respondidas faça uma chamada para o seu produto/serviço com uma promessa atraente como uma solução definitiva para os problemas ou as dúvidas levantadas na caixinha.`,
  },
  {
    dia: 42,
    nome: "Relembrando problema",
    categoria: "venda",
    roteiro: `**Antecipe o tema do produto,** pontuando as dores e dificuldades que a sua **audiência** tem que o seu produto é **capaz de ajudar**.

 **Story 01**

Esse tipo de mensagem tem se repetido muito mais do que deveria…

[print ou frase do que você tem ouvido para contextualizar a narrativa que gere identificação com quem ver o seu story]

***Exemplo***

*“Eu treino há meses, mas não vejo resultados no meu corpo.”*

Sugestões:

- *“Já tentei várias dietas, mas não consigo perder peso.”*
- *“Me mato na academia e não ganho massa muscular.”*

 **Story 02**

Você também passa por isso?

[enquete SIM | NÃO]

 **Story 03**

Se você está passando por isso, você está cometendo algum desses erros…

[liste os erros que as pessoas cometem em 1 ou 2 stories no máximo]

1. *Treinar sem um plano estruturado*
2. *Não seguir uma progressão de carga*
3. *Focar apenas em cardio sem treinar força*
4. 

Sugestões:

- *Não ajustar a alimentação*
- *Falta de acompanhamento*

 **Story 04**

Agora eu preciso te contar que é simples de resolver isso..

*Você só precisa entender mais sobre a [NOME DA CONSULTORIA]*

*Responde este story com “quero entender” que te explico no direct*

*ou*

*Para resolver isso de uma vez por todas, clica aqui [sticker de reação]*`,
  },
  {
    dia: 43,
    nome: "Dificuldades",
    categoria: "quebra_objecao",
    roteiro: `Essa sequência foi pensada para você abrir **caminho para um dos desejos** que o seu público tem mostrando quais são as causas que impedem o seu público de atingir e depois apresentar o que você vende como um **mecanismo para solucionar todas as dificuldades**.

**Story 01**

O que a sua audiência quer?

- *Você quer [DESEJO]?*

**Exemplo**

*Você quer **conquistar o corpo dos seus sonhos** sem passar horas na academia?*

Sugestões:

- *Quer perder peso sem dietas restritivas?*
- *Quer aumentar sua massa muscular sem treinos diários exaustivos?*

**Story 02**

O que dificulta as pessoas alcançarem o que elas querem? 

- *Mas não é fácil, exatamente por causa de [FATORES DIFICULTORES]*

**Exemplo**

*Mas eu sei, não é fácil. Tudo isso é complicado por causa de **falta de tempo, desmotivação, e planos de treino que não funcionam**.*

Sugestões:

- *Por causa de tanta informação contraditória na internet.*
- *Por causa da dificuldade em manter uma rotina constante de exercícios*

**Story 03**

A melhor maneira de alcançar o que quer é com o seu método/produto/metodologia/forma de pensar.

- *A melhor maneira é fazendo [MECANISMO]*

**Exemplo**

*A melhor maneira de alcançar seu objetivo é seguindo um **treino personalizado e focado na progressão de carga**.*

Sugestões:

- *...é combinando um plano de treinos específico para o seu corpo e seus objetivos.*
- *...é priorizando a qualidade dos exercícios e não a quantidade.*

**Story 04**

Descreva os motivos pelos quais é o que melhor funciona.

- *Por que [MECANISMO] funciona?*

**Exemplo**

*Por que isso funciona? Porque **adapta o treino ao seu ritmo e objetivos, maximizando seus ganhos em menos tempo**.*

Sugestões:

- *Porque garante que seu corpo continue progredindo de forma sustentável e sem estagnação.*
- *Porque você terá um acompanhamento que ajusta seu treino à medida que você avança.*

**Story 05**

Direcione para onde a pessoa deve ir se quiser ter acesso ao que você mencionou antes.

- *Você quer [DESEJO] de forma simples através de [MECANISMO]?
Então me manda 🔥 no direct.*

**Exemplo**

*Quer **resultados visíveis de forma prática** através de um plano eficiente? Então me manda 🔥 no direct.*

Sugestões:

- *Quer começar a ver mudanças reais no espelho em 30 dias?*
- *Pronto para finalmente conquistar o corpo que você sempre quis?*`,
  },
  {
    dia: 44,
    nome: "No trânsito, indo para a academia",
    categoria: "rotina",
    roteiro: `**Story 1** *(Foto no carro/ônibus/metrô segurando o volante ou mochila no banco ao lado)*

“Bora ali treinar! *Porque quem espera a motivação chegar, nunca sai do lugar!"*`,
  },
  {
    dia: 45,
    nome: "Storytelling com feedback",
    categoria: "consultoria",
    roteiro: `[Exemplo 01](Storytelling%20com%20feedback/Exemplo%2001%20257670d4146d814da74deae1881c9eb6.md)

[Exemplo 02](Storytelling%20com%20feedback/Exemplo%2002%20257670d4146d8114b7d4d1fc12613ef0.md)

[Exemplo 03](Storytelling%20com%20feedback/Exemplo%2003%20257670d4146d8199b558cd5c67832fd3.md)

[Exemplo 04](Storytelling%20com%20feedback/Exemplo%2004%20257670d4146d818c96b4ef2311b3788e.md)

[Exemplo 05](Storytelling%20com%20feedback/Exemplo%2005%20257670d4146d81cfa0e8f2eacd0216e6.md)`,
  },
  {
    dia: 46,
    nome: "Lembrete do dia",
    categoria: "story_unico",
    roteiro: `**Com uma frase que faça sentido ao seu negócio e que gere identificação para o seu público crie um lembrete do dia.**

*Esse tipo de conteúdo é ideal para começar o dia, postar entre 07 e 08 da manhã e engajar a audiência com os seus stories. Caso a frase seja curta ou que sirva como "indireta” para que a sua audiência compartilhe com outras pessoas também é muito valioso.*

**Story único**

*Lembrete do dia!*

*O resultado que você quer não vai aparecer com desculpas, só com ação.*

[**Fez sentido pra você? / Doeu aí? / Concorda?**]

[Use sticker de reação 🔥 ou 👍]

---

**Sugestões:**

- *Lembrete do dia!*
    
    *O treino que você pula hoje é o resultado que você não verá amanhã.*
    
    [**Fez sentido pra você? / Concorda? / Vai fazer o seu hoje?**]
    
    [Use sticker de reação]
    
- *Lembrete do dia!*
    
    *Quem espera a motivação perfeita, nunca começa.*
    
    [**Do que você está esperando? / Fez sentido?**]
    
    [Use sticker de reação]
    
- *Lembrete do dia!*
    
    *A consistência sempre vence a perfeição.*
    
    [**Você concorda? / Te impactou?**]
    
    [Use sticker de reação]`,
  },
  {
    dia: 47,
    nome: "Descobrindo e Solucionando um Vilão Comum",
    categoria: "educacao",
    roteiro: `**Story 01**

____ [público],

Você já parou para pensar que talvez esteja enfrentando um desafio invisível?

[enquete: Como assim? | Nunca pensei]

***Exemplo***

*Mulheres que buscam emagrecimento ou definição,*

você já parou para pensar que talvez esteja enfrentando um desafio invisível?

*[enquete: Como assim? | Nunca pensei]*

**Story 02**

Este desafio é ____ [Vilão Comum mas pouco identificado], algo que muitos de nós enfrentamos, mas poucos sabem como resolver de forma eficiente...

***Exemplo***

*Este desafio é a falta de consistência no treino e na alimentação, algo que muitas enfrentam, mas poucas sabem como resolver de forma eficiente...*

**Story 03**

E se eu te dissesse que a solução é simples e está _____ [algo relacionado ao que você oferece em seu produto]?

***Exemplo***

E se eu te dissesse que a solução é simples e está na maneira como você organiza seu treino e alimentação?

**Story 04**

Ignorar isso pode levar a:

1. ___[problema 1]
2. ___[problema 2]
3. ___[problema 3]

***Exemplo***

Ignorar isso pode levar a:

1. Falta de resultados,
2. Desmotivação,
3. Frustração com o processo.

**Story 05**

Confrontar e superar este desafio pode transformar completamente ____ [resultado esperado]. E eu vou te ajudar com isso nos próximos stories…

***Exemplo***

Confrontar e superar esse desafio pode transformar completamente seus resultados. Vou te ajudar com isso nos próximos stories…

**Story 06**

Quero saber de você: Quais desses problemas você mais tem enfrentado?

Vou printar e trazer soluções aqui no direct.

*[aguardar até que as interações sejam feitas no direct].*

**Story 07**

Agora, vamos ver o que vocês estão enfrentando e como podemos resolver?! [*Sticker de reação 🔥*]

Envia no direct que vou te dar a solução

**Story 08 e 09**

Use um print de resposta para cada story + uma solução simplificada com “[Ação recomendada]” 

***Exemplo***

*[print] "Estou desmotivada porque não vejo resultados"*

Uma solução é ajustar a progressão de carga nos treinos, garantindo evolução semanal, isso vai te ajudar a se motivar!

Caso **não tenha feedbacks** pode escrever de outro instagram e tampar o rosto

**Story 10** 

[A ideia é você ir adicionando cada frase em um novo story].

O problema que você acha difícil de resolver não é só seu. 

**Story 11**

O desânimo pode bater, mas estou aqui para te ajudar, 

pois eu já passei por cada um desses problemas e consegui superá-los para conquistar os resultados que tenho hoje.

**Story 12**

Conte comigo!

[sticker de reação de 🔥]`,
  },
  {
    dia: 48,
    nome: "Te explico como",
    categoria: "venda",
    roteiro: `Aqui a ideia é um **story direto** com um depoimento de alto valor + trecho do ganho obtido pelo seu cliente + CTA que pode ser para **comentar e receber** **uma mensagem automática no direct** ou um link personalizado para **comprar de você**.

**Story 01**

Já [desejo do seu público]?

[enquete: Sim | Não]

***Exemplo***

*Já está chegando perto do corpo que tanto sonha?*

*Sim | Não*

**Story 02**

O/A [se possível o nome do cliente ou como você chama seus clientes] já!

[resultado obtido pelo cliente que é um desejo da sua audiência].

[print com prova]

***Exemplo***

*O/A **Joana** já!*

*Ela já está vendo resultados incríveis, como perder 3kg em 4 semanas!*

*[Print com prova]*

Sugestões:

- *A **Patrícia** está conseguindo aumentar a força em cada treino.*
- *O **Marcelo** já atingiu o objetivo de ganhar 5kg de massa muscular*

**Story 03**

Se você quer saber como ter resultados como [seu cliente do depoimento anterior] sem [objeção]. Comenta Eu quero que te explico como no direct.

***Exemplo***

*Se você quer saber como ter resultados como **a Joana**, sem precisar seguir uma dieta super restritiva, comenta "EU QUERO" que te explico como no direct.*

Sugestões:

- **o Marcelo**, sem precisar passar horas na academia...
- **a Patrícia**, sem precisar gastar uma fortuna com suplementos...`,
  },
  {
    dia: 49,
    nome: "Já trilhei o caminho",
    categoria: "quebra_objecao",
    roteiro: `Aqui a ideia é mostrar pra sua audiência que você já **acertou/errou e validou** muita coisa por ela. E que ela só precisa seguir o **passo a passo do seu método**. Você irá gerar aumentar o nível de consciência e **gerar desejo no produto.**

**Story 01**

Muitas pessoas me perguntam como eu consegui _________ [Resultado], mas eu preciso te contar um segredo …

***Exemplo***

*Muitas pessoas me perguntam como eu consegui **transformar minha rotina de treinos e atingir meus objetivos**, mas eu preciso te contar um segredo...*

Sugestões:

- *...como eu consegui definir meu corpo sem passar horas na academia.*
- *...como eu consegui crescer meu negócio online.*

**Story 02**

Embora eu tenha investido muito (em mim e no meu negócio), levando tempo para conquistar esse número e desacreditado de mim algumas vezes durante o processo, você não precisa passar por tudo isso!

***Exemplo***

*Embora eu tenha investido muito em **treinos e alimentação personalizada**, levando tempo para conquistar esse resultado e desacreditado de mim algumas vezes durante o processo, você não precisa passar por tudo isso!*

Sugestões:

- *...investido em diversos cursos e consultorias para conseguir montar um plano eficiente.*
- *...dedicado tempo e energia sem ver os resultados imediatos.*
    
    
    

**Story 03**

Por ter trilhado esse caminho, eu já descobri os atalhos.

- Já estudei por você
- Já errei por você
- Já aprendi por você

Agora depois de ter percorrido essa jornada, eu posso te guiar…

***Exemplo***

*Por ter trilhado esse caminho, eu já descobri os atalhos:*

- *Já ajustei os treinos por você*
- *Já testei as melhores estratégias por você*
- *Já errei e aprendi por você*

*Agora, posso te guiar para resultados mais rápidos.*

**Story 04**

Manda sua melhor dúvida que eu vou dar meu melhor conselho …

[Abrir caixinha de perguntas]

***Exemplo***

Manda sua melhor dúvida sobre **treinos ou alimentação**, e eu vou dar meu melhor conselho...

[Abrir caixinha de perguntas]

**Stories seguintes**

Responda 3 a 4 caixinhas falando sobre o seu produto e depois faça uma chamada para venda.`,
  },
  {
    dia: 50,
    nome: "Preparando a marmita",
    categoria: "rotina",
    roteiro: `📌

**Como usar este Storie:**

Tire foto montando as marmitas para a semana, isso gera conexão e você vira autoridade mostrando que você vive aquilo que vende!`,
  },
  {
    dia: 51,
    nome: "Vou selecionar…",
    categoria: "story_unico",
    roteiro: `**Com uma frase que faça sentido ao seu negócio e que gere identificação para o seu público crie um lembrete do dia.**

*Esse tipo de conteúdo é ideal para começar o dia, postar entre 07 e 08 da manhã e engajar a audiência com os seus stories. Caso a frase seja curta ou que sirva como "indireta” para que a sua audiência compartilhe com outras pessoas também é muito valioso.*

**Story único**

*ATENÇÃO!*

*Irei selecionar [5 mulheres/homens] pra fazer uma análise completa de toda a rotina de treino e alimentação, e identificar os pontos que irão te ajudar a maximizar o resultado.*

*Tenho visto que a falta de resultados de muitas de vocês é por não ter um planejamento que esteja 100% de acordo com o objetivo.*

*E por isso, QUERO AJUDAR VOCÊS.*

*Basta clicar aqui no [emoji da reação] que irei te chamar.*

*[Use sticker de reação]*

💡

Iniciar o social selling com aquelas pessoas que reagiram:

*Oi fulana, tudo bem?*

*Você foi uma das primeiras que você reagiu ao meu story, que turno fica melhor para marcamos um bate papo, manhã tarde ou noite?*`,
  },
  {
    dia: 52,
    nome: "Receita",
    categoria: "educacao",
    roteiro: `**Este script é para quem deseja educar a audiência de forma criativa e inovadora, utilizando uma metáfora inesperada para explicar conceitos importantes.**

*Ideal para gerar engajamento e tornar o aprendizado divertido e memorável.*

**Story 1**

Introduza a metáfora de forma intrigante.
Você já imaginou que [atividade do seu nicho] é como preparar uma receita de bolo?

***Exemplo***

Você já imaginou que ter um acompanhamento individualizado no treino é como preparar uma receita de bolo?

**Story 2**

Explique a metáfora, destacando a importância de cada elemento.
Assim como em uma receita gourmet, [atividade] exige [elemento crucial] porque [razão importante].

***Exemplo***

Assim como em uma receita de bolo, seu treino exige atenção a cada detalhe, porque cada corpo responde de forma única.

**Story 3**

Descreva o "ingrediente" inicial e sua importância.
O primeiro ingrediente é [ingrediente inicial]. Sem ele, [consequência negativa].

***Exemplo***

O primeiro ingrediente é uma avaliação completa. Sem ela, é impossível entender exatamente o que seu corpo precisa.

**Story 4**

Passe para o próximo "ingrediente" e sua aplicação.
O próximo ingrediente é [ingrediente]. Ele deve ser [ação específica] para [resultado desejado].

***Exemplo***

O próximo ingrediente é o plano de ação individual. Ele deve ser ajustado frequentemente para garantir que você continue evoluindo.

**Story 5**

Mostre o "ingrediente" final e como ele completa a "receita".
O último ingrediente é [ingrediente]. Ele é crucial porque [razão].

***Exemplo***

O último ingrediente é o acompanhamento constante. Ele é essencial para corrigir, adaptar e otimizar seus resultados.

**Story 6**

Incentive a audiência a experimentar a "receita" e compartilhar seus resultados.

Agora que você conhece a receita para um acompanhamento exclusivo, vai começar a transformar seus treinos?

[Enquete: Sim | Não]`,
  },
  {
    dia: 53,
    nome: "Venda velada",
    categoria: "venda",
    roteiro: `A ideia aqui é fazer com que a sua **audiência** contribua com a **criação de algum infoproduto/campanha ou ação nova** que você queira fazer. E com isso, você fazer uma “**venda velada**” no direct para sua audiência

**Story 01**

Estou precisando da sua ajuda! 

Você pode me ajudar? 
Enquete [Sim/Não] 

 **Story 02**

Estou querendo saber qual sua maior dúvida sobre  _____[seu tema].

1 - Dúvida 
2 - Dúvida  

3 - Dúvida

[Responde aqui no meu direct com o número]

***Exemplo***

*Estou querendo saber qual sua maior dúvida sobre **treino e dieta***

1. **Como criar um treino eficaz para definição?**
2. **Qual a alimentação ideal para ganhar massa muscular?**
3. **Como manter a consistência nos treinos?**

*[Enquete]*

**Abordagem após interação:**

*Vi que você tem dúvidas sobre **[tema mencionado]**, me conta um pouquinho mais sobre isso…*

*Quem sabe eu consigo te ajudar*`,
  },
  {
    dia: 54,
    nome: "A sua vida dos sonhos",
    categoria: "quebra_objecao",
    roteiro: `**Nesta sequência vamos mostrar que adiar decisões importantes impede a realização de sonhos e objetivos.**

*Vamos trazer sentimentos e pensamentos comuns que impedem a sua audiência de agir. No final, uma chamada para ação direta convida o seu público a se engajar e buscar a sua ajuda , promovendo seu produto ou serviço.*

---

**Story 01**

Imagine ter _____ [comece com uma afirmação impactante para chamar a atenção].

***Exemplo***

*Já imaginou como seria mais fácil **conquistar o corpo dos seus sonhos** sem ter que passar horas intermináveis na academia?*

Sugestões:

- *...como seria mais fácil ganhar força e definição com treinos rápidos e eficientes?*
- *...como seria mais fácil perder peso sem dietas restritivas?*

**Story 02**

Se todo dia você deixar para _____ [explicação sobre o adiar decisões]

***Exemplo***

*Se todo dia você deixar para começar **na próxima segunda**, ou depois daquela viagem, ou só no mês que vem...*

Sugestões:

- *...ou só quando o trabalho estiver mais tranquilo...*
- *...ou quando você tiver mais tempo disponível...*

**Story 03**

Aprenda uma coisa de uma vez por todas _____ [apresente uma verdade universal ou clichê que ressoe com o público].

É hoje que você pode decidir começar a  ____ [incentive a tomar a decisão hoje]

***Exemplo***

*Aprenda uma coisa de uma vez por todas: **o tempo certo nunca vai aparecer sozinho**. É hoje que você pode decidir começar a **mudar sua rotina e alcançar seus objetivos**.*

Sugestões:

- *...se preparar de forma inteligente e realista para mudanças duradouras.*
- *...tomar decisões que realmente trazem resultados.*

**Story 04**

Agora você está vendo este story e pode _____ [crie uma oportunidade imediata de mudança].

Mas eu sei que a maioria vai ler isso e pensar “____ [pensamento que não dá importância a decisão].

***Exemplo***

*Agora você está vendo este story e pode **dar o primeiro passo que mudaria tudo daqui pra frente**.*

*Mas eu sei que a maioria vai ler isso e pensar "depois eu começo, agora não dá".*

Sugestões:

- *...pensar "talvez não funcione para mim".*
- *...pensar "isso não é para mim, não agora".*

**Story 05**

_____ [explique o diferencial entre a maioria e os poucos que alcançam o resultado].

***Exemplo***

*A diferença entre os que alcançam resultados e os que ficam no mesmo lugar é simples: **os que alcançam tomam decisões e agem**.*

Sugestões:

- *...os que mudam suas vidas enfrentam o desafio e agem.*
- *...os que conseguem sabem que esperar não traz resultados.*

**Story 06**

A maioria _____ [motivo 1].

A maioria deixa _____ [motivo 2]

A maioria  _____ [motivo 3]

***Exemplo***

- *A maioria não faz nada.*
- *A maioria vê outras pessoas alcançando resultados, mas continuam sem fazer nada.*
- *A maioria quer resultado, sem esforço.*

*A maioria:*

- *Adia decisões importantes.*
- *Desiste na primeira dificuldade.*
- *Busca resultados sem querer passar pelo processo.*
- Quer ter resultado mas não busca ajuda de um especialista.

**Story 07**

Quando percebi, _____ [compartilhe um ponto de virada pessoal ou uma história de decisão importante], tinha duas opções: aceitar a realidade ou agir para construir uma nova via.

[Enquete: Qual delas você acha que eu escolhi?]

1ª opção | 2ª opção

***Exemplo***

*Quando percebi que **meus hábitos estavam sabotando meus resultados**, eu tinha duas opções: continuar como estava ou agir para mudar.*

*Enquete: Qual delas você acha que eu escolhi?*

*1ª opção | 2ª opção*

**Story 08**

Hoje é fácil olhar e _____ [reforce a satisfação atual devido à decisão tomada].

Hoje é fácil ____ [resultado]

Hoje é fácil ____ [resultado]

***Exemplo***

*Hoje é fácil olhar para trás e ver como **minha saúde, disposição e autoestima** melhoraram drasticamente.*

- *Hoje é fácil sentir confiança no meu corpo.*
- *Hoje é fácil perceber que cada esforço valeu a pena.*

**Story 09**

Mas já foi muito difícil _____ [dificuldade inicial 1].

Já foi muito difícil _____ [dificuldade inicial 2]

***Exemplo***

*Mas já foi muito difícil **encontrar motivação** nos primeiros meses...*

- *Já foi muito difícil resistir às tentações e manter o foco no objetivo.*

**Story 10**

É por isso que eu não me canso de dizer: _____ [conclua com um incentivo à ação imediata e ofereça ajuda].

O que há é ____ [características de quem toma decisão assertiva]

Você tem esses dois?

Mande aqui no direct o código ____ [código do Manychat] para receber a minha ajuda e começar HOJE.

***Exemplo***

*É por isso que eu sempre digo: **a mudança é possível, mas precisa de atitude**.*

*Você tem a vontade?*

*Clique aqui [BOTÃO DE REAÇÃO]  e eu vou te mostrar como começar HOJE.*`,
  },
  {
    dia: 55,
    nome: "Postar a agenda do dia",
    categoria: "rotina",
    roteiro: `📌

**Como usar este Storie:**

Compartilhar a agenda diária com treinos, atendimentos e outras atividades para mostrar organização e disciplina. Isso cria conexão com seguidores e inspira produtividade.

***Obs: não citar aulas de presencial***

**Storie**

Agenda do dia: 
☑ Treinar

☑ Café da manha

☑ Correçoes dos alunos

☑ Gravar conteúdo`,
  },
  {
    dia: 56,
    nome: "Pequenos passos",
    categoria: "educacao",
    roteiro: `**Pequenos Passos**

*Este script é para quem deseja educar sua audiência sobre a importância de começar pequeno para alcançar grandes objetivos. Ele é ideal para mostrar que qualquer grande conquista começa com um primeiro passo, gerando motivação e engajamento.*

**Story 1**

Inicie com uma pergunta desafiadora.
Você já se perguntou como [grande conquista] começa?

***Exemplo***

Você já se perguntou como um corpo transformado e definido começa?

**Story 2**

Revele que tudo começa com um primeiro passo simples.
Tudo começa com um pequeno passo, como [ação simples].

***Exemplo***

Tudo começa com um pequeno passo, como dar prioridade ao seu treino e focar na constância.

**Story 3**

Compartilhe uma história inspiradora de alguém que começou pequeno.
Vou te contar a história de [nome] que começou com [ação simples] e alcançou [grande conquista].

***Exemplo***

Vou te contar a história da Ana, que começou treinando 3 vezes por semana e, com disciplina, conquistou o corpo que sempre quis.

**Story 4**

Mostre os desafios iniciais e como foram superados.
No início, [nome] enfrentou muitos desafios, como [desafios], mas superou com [solução].

***Exemplo***

No início, Ana enfrentou desafios, como a falta de tempo e motivação, mas superou com um plano de treino eficiente e acompanhamento individualizado.

**Story 5**

Descreva os passos práticos que sua audiência pode seguir.

Aqui estão alguns passos que você pode seguir para começar:
[Ação 1]
[Ação 2]
[Ação 3]

***Exemplo***

Aqui estão alguns passos que você pode seguir para começar:

1. Defina uma meta clara de transformação corporal.
2. Siga um treino bem estruturado.
3. Priorize a progressão de carga e a alimentação.

**Story 6**

Incentive a audiência a compartilhar seus próprios primeiros passos ou dúvidas.

***Exemplo***

Qual foi o seu primeiro passo para alcançar o corpo que você deseja?

 Me conta no direct!`,
  },
  {
    dia: 57,
    nome: "Análise",
    categoria: "venda",
    roteiro: `Neste destaque a intenção é gerar **confiança no seu conhecimento**, você vai fazer uma análise que seja relacionada a algo que você entrega em um dos seus **produtos**.

**Story 01**

Hoje vou liberar uma análise [tema relacionado ao produto] Você quer ser o(a) sortudo(a)? [Enquete: Sim | Me escolhe].

***Exemplo***

*Hoje vou liberar uma análise de **postura e execução de exercícios**. Você quer ser o(a) sortudo(a)?*

*[Enquete: Sim | Me escolhe]*

No direct, enviar:

“Me envia aqui um **vídeo seu executando um exercício** .”

**Story 02**

Espera 1h pelo menos para ter várias interações e retoma com - Preparado(a) para analisar comigo? [enquete]

[Enquete: Sim | Não vejo a hora!]

**Story 03**

Mostre o que será analisado e peça para as pessoas dizerem onde está o primeiro erro.

***Exemplo***  

*Vamos começar! Me diga, onde você acha que está o primeiro erro na execução desse exercício?*

**Story 04**

Fale sobre o primeiro erro no fim  e como ajustaria. Já finalize conectando com o segundo, para fazer as pessoas querem acompanhar a linha de raciocínio.

***Exemplo*** 

*O primeiro erro está na **posição da coluna durante o agachamento**. Ajustaria isso para garantir que não haja sobrecarga na lombar. E agora, vamos ver o segundo erro.*

**Story 05**

Mostre o segundo erro e como você ajustaria

***Exemplo*** 

*O segundo erro está no **alinhamento dos joelhos**. Corrigiria isso para evitar lesões a longo prazo.*

**Story 06**

Apresente o terceiro erro e como você ajustaria;

***Exemplo*** 

*O terceiro erro está na **amplitude de movimento**. Vamos ajustá-lo para garantir melhor ativação muscular.*

**Story 07**

Traga luz sobre uma objeção do porque a sua audiência continua tendo dificuldade com esses itens analisados também. - *Mas eu sei que [problema que o seu produto soluciona] pode parecer uma tarefa difícil…*

***Exemplo*** 

*Mas eu sei que ajustar **a postura e a execução** pode parecer uma tarefa difícil, principalmente sem alguém para te guiar…*

**Story 08**

*Eu liberei para você [promessa do produto], é só clicar aqui.*

***Exemplo*** 

*Por isso, liberei 4 vagas para você ter uma oferta especial da minha consultoria e ter eu te acompanhando todos os dias e garantindo seu RESULTADO…*

[Link personalizado: clica aqui para desbloquear a oferta]`,
  },
  {
    dia: 58,
    nome: "Um detalhe muda tudo",
    categoria: "quebra_objecao",
    roteiro: `**Este script é para quem deseja educar sua audiência de maneira inovadora, saindo do óbvio e mostrando o impacto transformador do seu conhecimento.**

*Ideal para criar uma conexão emocional e gerar curiosidade sobre o valor que você pode oferecer.*

**Story 1**

Desafie a audiência com uma afirmação provocativa.
Aposto que você nunca imaginou que [ação simples] poderia mudar tudo!

***Exemplo***

*Aposto que você nunca imaginou que **ajustar sua postura durante os treinos** poderia mudar tudo!*

Sugestões:

- *Aposto que você nunca imaginou que treinar com mais intensidade, sem aumentar o tempo, poderia mudar tudo!*
- *Aposto que você nunca imaginou que pequenas correções na execução dos exercícios poderiam mudar tudo!*

**Story 2**

Compartilhe uma história surpreendente de transformação.
Vou te contar sobre a [transformação] que vi acontecer com [nome].

***Exemplo***

*Vou te contar sobre a **transformação** que vi acontecer com a **Carla**, uma das minhas alunas.*

Sugestões:

- *Vou te contar sobre a transformação que vi acontecer com a Fernanda.*
- *Vou te contar sobre como a Juliana mudou completamente seus resultado*

**Story 3**

Mostre a situação antes da transformação com uma foto ou descrição.
Antes de conhecer [conceito], [nome] estava assim...

***Exemplo***

*Antes de conhecer **minha consultoria PREMIUM,** **Carla** estava desmotivada com a academia e sem resultados claros.*

Sugestões:

- *Antes de conhecer meu método, Fernanda não conseguia emagrecer, mesmo treinando.*
- *Antes de corrigir sua postura, Juliana vivia com dores e lesões constantes.*

**Story 4**

Revele o ponto de virada e como o conhecimento foi aplicado.
Então, ela descobriu [conceito próprio] e decidiu aplicar [ação específica].

***Exemplo***

*Então, ela decidiu aplicar as técnicas de **progressão de carga** e melhorar sua **execução** que eu ensinei.*

Sugestões:

- *Ela aplicou a técnica de progressão de carga corretamente.*
- *Ela começou a focar mais na intensidade e controle dos exercícios.*

**Story 5**

Mostre o resultado após a transformação com uma foto ou descrição.
Olha só a transformação que ela conseguiu!

***Exemplo***

*Olha só a transformação que a **Carla** conseguiu em apenas **3 meses**! [antes e depois]*

Sugestões:

- *Veja o que a Fernanda alcançou com esse método em 3 meses!*
- *Olha só a evolução da Juliana ao corrigir sua postura!*

**Story 6**

Finalize com uma chamada para ação pedindo que sua audiência envie dúvidas ou sugestões.
Quer saber mais sobre como [conceito próprio] pode te ajudar? Deixe sua pergunta na caixinha!

***Exemplo***

*Quer saber mais sobre treino e dieta e como pode ajudar você a ter resultados parecidos com esses?*

*Deixe sua pergunta na caixinha!*

Sugestões:

- *Quer saber mais sobre como ajustes simples podem acelerar seus resultados?*
- *Deixe sua pergunta na caixinha e vamos falar sobre como progredir no treino!*

**Story 7**

Aproveite as dúvidas apresentadas para quebrar objeções dos seus clientes. Dois tipos de pergunta são importantes para serem respondidas:

1. Como funciona? Essa pergunta é ideal para você mostrar a sua entrega, o que a pessoa recebe e os benefícios.
2. No meu caso, como seria possível? Essa pergunta é a hora de defender o seu método, mostrar que é eficiente por X motivos e que é garantido o resultado.`,
  },
  {
    dia: 59,
    nome: "Momento Off (Netflix, Livro, Musica)",
    categoria: "rotina",
    roteiro: `(Netflix, Livro, Musica)

📌

**Como usar este Storie:**

Mostrar que, além dos treinos e trabalho, também existe um tempo para relaxar. Isso humaniza o conteúdo e gera conexão com a audiência.`,
  },
  {
    dia: 60,
    nome: "Mito refutado",
    categoria: "educacao",
    roteiro: `**Este script é ideal para desmistificar conceitos errados e promover conhecimento dentro do seu nicho.**

*Utilize-o para corrigir informações falsas, educar sua audiência e fortalecer sua autoridade no assunto.*

**Story 1**

Comece com uma afirmação comum, mas errada, no seu nicho.

Muitas pessoas acreditam que [mito] é verdade. Mas será que é mesmo?"

***Exemplo***

Muitas pessoas acreditam que fazer mais cardio é o segredo para emagrecer rápido. Mas será que é mesmo?

**Story 2**

Explique por que essa crença é um mito.

Isso não é verdade porque [explicação com sua visão].

***Exemplo***

Isso não é verdade porque *o excesso de cardio pode até atrapalhar a perda de gordura, especialmente quando não é combinado com treino de força.*

**Story 3**

Apresente um fato que contradiz o mito.

**De acordo com [fonte], [fato].**

***Exemplo***

De acordo com estudos da Harvard Health, o treino de força é essencial para aumentar o metabolismo e queimar gordura de forma mais eficiente.

**Story 4**

Dê um exemplo prático de como aplicar o conhecimento correto.

Uma maneira de [ação correta] é [dica].

***Exemplo***

Uma maneira de otimizar seu treino é *combinar sessões curtas de cardio com treino de força focado em progressão de carga.*

**Story 5**

Use uma enquete para engajar a audiência.

Você já sabia disso? [enquete: SIM | NÃO]`,
  },
  {
    dia: 61,
    nome: "Dúvida comum com social selling",
    categoria: "quebra_objecao",
    roteiro: `**Neste conteúdo, você vai criar um contexto baseado em uma dúvida comum da sua audiência para gerar uma necessidade sobre o seu produto/serviço.**

*Chame atenção com uma dúvida recorrente, revelando uma estratégia única que só pode ser executada por alguém que tem o seu produto/serviço e depois use uma enquete para criar uma lista de pessoas interessadas em saber mais sobre o que você vende.*

**Story 01**

Quando eu quero [resultado desejado pela audiência], é isso que eu faço …

***Exemplo*** 

*Quando eu quero **ganhar mais massa muscular**, é isso que eu faço…*

Sugestões:

- *Quando eu quero acelerar a minha queima de gordura, é isso que eu faço…*
- *Quando eu quero melhorar minha definição muscular, é isso que eu faço…*

**Story 02**

[ação/estratégia relacionada ao que você vende]. 

***Exemplo*** 

*Eu **sigo uma periodização de treino e tento a carga gradualmente** em todos os exercícios e foco na técnica correta.*

Sugestões

- *Faço um treino focado em progressão de carga.*
- *Ajusto minha alimentação com mais proteínas.*

**Story 03**

Talvez você tenha dificuldade em [meio para alcançar o que deseja]

***Exemplo*** 

*Talvez você tenha dificuldade em **manter consistência** nos treinos…*

Sugestões:

- *Talvez você tenha dificuldade em manter um déficit calórico para perder gordura.*
- *Talvez você tenha dificuldade em evoluir na carga dos exercícios…*

**Story 04**

Isso acontece porque [problema que a audiência passa com outros métodos]

Nos últimos [tempo] usando[nome da sua estratégia/ método] esse foi o resultado…

[print com prova]

***Exemplo*** 

*Isso acontece porque **muitos treinos não são feitos para você e são feitos sem avaliar a sua postura***

*Nos últimos **60 dias**, com a metodologia **do meu acompanhamento**, esse foi o resultado da **Fernanda**…*

Sugestões:

- *Isso acontece porque você pode não estar controlando a intensidade do treino…*
- *Nos últimos 30 dias com o método X, olha os resultados do Rafael…*

**Story 05**

Quer descobrir como ter esse mesmo resultado? 

[Enquete: Sim | Não, quero continuar na mesma]

 ***OBS**: Quem votou em “sim” na enquete será abordado por você no 1 a 1 para que você entenda melhor a situação da pessoa no momento e em seguida você pode indicar o melhor produto ou serviço para a necessidade da pessoa.*

*Lembre-se, se a pessoa disser que não consegue pagar valor X, ofereça um outro produto ou reduza os entregáveis do produto mais cara para adequar a um valor que a pessoa está disposta a pagar. Assim, você vende no direct de forma personalizada e pode influenciar e muito na decisão de compra.*

**Story 06**

Estou de olho em quem está votando em "Sim", pensando até em liberar um presente.

 ***OBS**: Esse presente pode ser um bônus, um desconto, um combo ou uma oportunidade exclusiva.*`,
  },
  {
    dia: 62,
    nome: "Batendo meta diária de água",
    categoria: "rotina",
    roteiro: `📌

**Como usar este Storie:**

Mostrar a importância da hidratação na rotina e incentivar seguidores a beberem mais água. Isso cria engajamento e reforça bons hábitos.

**Exemplo 1** 

*(Foto da garrafa d’água quase vazia ou do celular com o app de controle de hidratação)*

*"Meta de hoje: ✅ 3L de água!*

---

**Exemplo 2**

(Vídeo curto dando um gole na garrafa ou mostrando a quantidade de água que ainda falta)

"Últimos goles pra fechar a meta do dia! Bora manter o corpo bem hidratado!”`,
  },
];

export function scriptsDaCategoria(cat: ArsenalCategoria): ArsenalScript[] {
  return ARSENAL_SCRIPTS.filter(s => s.categoria === cat).sort((a, b) => a.dia - b.dia);
}

export function scriptDoDia(dia: number): ArsenalScript | undefined {
  return ARSENAL_SCRIPTS.find(s => s.dia === dia);
}
