"use client";

import { useRouter } from "next/navigation";
import Calendar from "@/components/Calendar";
import { setIntent } from "@/lib/handoff";

export default function CalendarioPage() {
  const router = useRouter();
  return (
    <Calendar
      onOpen={(c) => { setIntent({ kind: "open", carousel: c }); router.push("/criar"); }}
      onPede={(r) => { setIntent({ kind: "pede", registro: r }); router.push("/criar"); }}
    />
  );
}
