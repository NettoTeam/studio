"use client";

import { useRouter } from "next/navigation";
import Marca from "@/components/Marca";
import { setIntent } from "@/lib/handoff";

export default function MarcaPage() {
  const router = useRouter();
  // guardar ideia no Quadro (sem sair da tela)
  async function addIdea(tema: string, context?: string) {
    await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tema, content: context || undefined, stage: "ideia", type: "carrossel", carousel: { tema, cards: [] } }) });
  }
  return (
    <Marca
      onUse={(tema, angulo) => { setIntent({ kind: "pauta", tema, angulo }); router.push("/criar"); }}
      onIdea={addIdea}
    />
  );
}
