"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Hoje from "@/components/Hoje";
import { setIntent, readDraft, type Draft } from "@/lib/handoff";

export default function HojePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => { setDraft(readDraft()); }, []);

  const hasDraft = !!(draft?.roteiro?.trim() || draft?.carousel?.cards?.length || draft?.content?.trim());
  const draftLabel = draft?.roteiro?.trim()
    ? draft.roteiro.replace(/\*\*/g, "").slice(0, 180)
    : (draft?.carousel?.tema || draft?.content?.slice(0, 180) || "");

  return (
    <Hoje
      hasDraft={hasDraft}
      draftLabel={draftLabel}
      onNovo={() => { setIntent({ kind: "novo" }); router.push("/criar"); }}
      onResume={() => { setIntent({ kind: "resume" }); router.push("/criar"); }}
      onPede={(r) => { setIntent({ kind: "pede", registro: r }); router.push("/criar"); }}
      onHook={(post) => { setIntent({ kind: "hook", post }); router.push("/criar"); }}
      onGoto={(v) => router.push(`/${v}`)}
    />
  );
}
