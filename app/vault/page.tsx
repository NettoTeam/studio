"use client";

import { useRouter } from "next/navigation";
import Vault from "@/components/Vault";
import { setIntent } from "@/lib/handoff";

export default function VaultPage() {
  const router = useRouter();
  return <Vault onOpen={(c) => { setIntent({ kind: "open", carousel: c }); router.push("/criar"); }} />;
}
