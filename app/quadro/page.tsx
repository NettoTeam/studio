"use client";

import { useRouter } from "next/navigation";
import Board from "@/components/Board";
import { setIntent } from "@/lib/handoff";

export default function QuadroPage() {
  const router = useRouter();
  return (
    <Board
      onOpen={(c) => { setIntent({ kind: "open", carousel: c }); router.push("/criar"); }}
      onCreate={(post) => { setIntent({ kind: "hook", post }); router.push("/criar"); }}
    />
  );
}
