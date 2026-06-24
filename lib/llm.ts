// Helpers compartilhados das rotas que chamam o modelo (tira boilerplate duplicado).
import type Anthropic from "@anthropic-ai/sdk";

// extrai o texto puro de uma resposta do Anthropic
export const textOf = (r: Anthropic.Message) =>
  r.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("");

// recorta o primeiro objeto JSON {...} de um texto (modelo às vezes embrulha em prosa/```)
export const extractJson = (t: string) => t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1);

// recorta o primeiro array JSON [...] de um texto
export const extractArray = (t: string) => t.slice(t.indexOf("["), t.lastIndexOf("]") + 1);

// sorteia n itens aleatórios sem mutar o array original
export function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}
