"use client";

import { useRouter } from "next/navigation";
import Vault from "@/components/Vault";
import { setIntent } from "@/lib/handoff";

export default function VaultPageClient() {
  const router = useRouter();

  return (
    <Vault
      onOpen={(carousel) => {
        setIntent({ kind: "open", carousel });
        router.push("/criar");
      }}
    />
  );
}
