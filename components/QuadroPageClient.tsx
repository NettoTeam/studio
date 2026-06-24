"use client";

import { useRouter } from "next/navigation";
import Board from "@/components/Board";
import { setIntent } from "@/lib/handoff";

export default function QuadroPageClient() {
  const router = useRouter();

  return (
    <Board
      onOpen={(carousel) => {
        setIntent({ kind: "open", carousel });
        router.push("/criar");
      }}
      onCreate={(post) => {
        setIntent({ kind: "hook", post });
        router.push("/criar");
      }}
    />
  );
}
