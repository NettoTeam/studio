// Seed da VOZ-OURO — grava exemplos reais de como o Netto escreve no kv "gold_voice".
// A IA usa esses textos como alvo de CADÊNCIA (não copia tema, imita o jeito de escrever).
// Rodar: node scripts/seed-voice.mjs   (SOBRESCREVE o gold_voice atual com a lista abaixo)
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => { const m = env.match(new RegExp("^" + k + '="?([^"\\n]+)"?', "m")); return m ? m[1] : null; };
const url = get("SUPABASE_URL") || get("NEXT_PUBLIC_SUPABASE_URL");
const key = get("SUPABASE_SERVICE_ROLE_KEY") || get("SUPABASE_SECRET_KEY");
if (!url || !key) { console.error("faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env.local"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const now = new Date().toISOString();
const TEXTS = [
  { note: "voz base", text: `Muita mulher acha que o problema do glúteo é exercício

Não é

Se fosse exercício, bastava trocar a ficha que o resultado apareceria

O problema é que a maioria nunca permanece tempo suficiente em uma estratégia para gerar adaptação

Toda semana muda alguma coisa

Troca exercício

Troca treino

Troca método

Troca objetivo

Mas não dá tempo para o corpo responder

Hipertrofia não acontece porque você sentiu o treino

Hipertrofia acontece porque o músculo recebeu um estímulo, se recuperou e precisou se adaptar para suportar uma carga maior no futuro

É por isso que progressão sempre será mais importante do que variedade

Você não precisa de mais exercícios

Precisa ficar melhor nos exercícios que já faz

Precisa produzir mais tensão

Precisa ficar mais forte

Precisa parar de confundir novidade com evolução

Porque o corpo não responde ao que é diferente

O corpo responde ao que é eficiente` },
  { note: "exemplo 01", text: `Muita mulher acredita que mudar exercício gera evolução

Por isso vive trocando a ficha

O problema é que adaptação muscular leva tempo

Quando o exercício começa a ficar produtivo, ela troca

Quando começa a dominar a execução, ela troca

Quando começa a entender a progressão, ela troca

No final do ano treinou muito

E evoluiu pouco` },
  { note: "exemplo 02", text: `Você sabe exatamente quanto pesa hoje na balança

Mas não sabe quanto fez no agachamento semana passada

Depois tenta entender por que seu corpo não muda

A maioria controla o resultado

Poucas controlam o processo que gera o resultado` },
  { note: "exemplo 03", text: `Glúteo não é um músculo mágico

Ele responde aos mesmos princípios que qualquer outro músculo do corpo

Tensão mecânica

Progressão

Recuperação

O mercado criou dezenas de atalhos

A fisiologia continua a mesma` },
  { note: "exemplo 04", text: `Tem mulher que passa mais tempo procurando treino do que treinando

Assiste vídeo

Salva postagem

Troca exercício

Muda estratégia

Pesquisa de novo

Enquanto isso o básico continua sem ser executado` },
  { note: "exemplo 05", text: `Se eu pegar seu treino de hoje e comparar com o de seis meses atrás

O que mudou

A carga

As repetições

A execução

Ou apenas os exercícios

Porque existe uma diferença enorme entre mudança e evolução` },
  { note: "exemplo 06", text: `A maioria das mulheres não treina pesado

Não porque falta força

Mas porque nunca aprendeu o que realmente significa treinar pesado

Quando descobrem, normalmente percebem que estavam muito longe do que eram capazes de fazer` },
  { note: "exemplo 07", text: `Você não precisa descobrir um exercício novo toda semana

Precisa descobrir como extrair mais resultado dos exercícios que já faz` },
  { note: "exemplo 08", text: `Toda mulher quer um glúteo maior

Poucas acompanham as variáveis que fazem ele crescer

Carga

Execução

Volume

Progressão

Sem isso, expectativa vira torcida` },
  { note: "exemplo 09", text: `O corpo não entende motivação

Não entende promessa

Não entende vontade

O corpo entende estímulo

E responde ao estímulo que recebe repetidamente` },
  { note: "exemplo 10", text: `Existe uma razão para mulheres avançadas parecerem fazer o básico

Porque depois de um tempo elas entendem que resultado vem da repetição bem feita

Não da novidade` },
  { note: "exemplo 11", text: `Muitas mulheres acreditam que o treino está funcionando porque saem cansadas

Só que cansaço e resultado não são a mesma coisa

E confundir os dois custa anos de evolução` },
  { note: "exemplo 12", text: `Quando alguém diz que tentou de tudo

Normalmente não tentou a mesma estratégia por tempo suficiente` },
  { note: "exemplo 13", text: `Se você treina há dois anos

Mas continua usando as mesmas cargas

Seu corpo recebeu praticamente o mesmo motivo para continuar igual` },
  { note: "exemplo 14", text: `A internet criou uma geração de mulheres especialistas em salvar treinos

E iniciantes em aplicar o que salvam` },
  { note: "exemplo 15", text: `A pergunta mais importante do seu treino não é qual exercício você faz

É se você está melhor nele hoje do que estava há três meses` },
  { note: "exemplo 16", text: `O glúteo que você quer daqui seis meses depende mais do que você faz hoje do que do treino que pretende começar segunda feira` },
  { note: "exemplo 17", text: `A maior parte dos resultados acima da média parece simples quando vista de fora

Porque os fundamentos quase nunca parecem impressionantes` },
  { note: "exemplo 18", text: `Treinar próximo da falha assusta muita gente

Mas continuar sem resultado deveria assustar mais` },
  { note: "exemplo 19", text: `Tem mulher que troca de estratégia sempre que encontra dificuldade

E tem mulher que aprende a resolver a dificuldade dentro da estratégia

Normalmente os resultados acompanham essa decisão` },
  { note: "exemplo 20", text: `Quanto mais você entende treinamento

Menos procura segredos

E mais valor dá para aquilo que realmente gera adaptação` },
];

const value = TEXTS.map((t) => ({ text: t.text.trim(), createdAt: now, note: t.note }));
const { error } = await sb.from("kv").upsert({ key: "gold_voice", value });
if (error) { console.error("ERRO:", error.message); process.exit(1); }
console.log(`✓ ${value.length} exemplos de voz gravados no gold_voice.`);
