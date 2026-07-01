"use client";

import { useEffect, useState } from "react";
import CarouselCard from "@/components/CarouselCard";
import type { Card } from "@/lib/types";

type Kit = { name: string; style: Partial<Card> };
const KEY = "n2_brand_kits";

// card de exemplo pra visualizar o kit aplicado
function sample(style: Partial<Card>): Card {
  return { id: "k", layout: "text", kicker: "N² SQUAD", headline: "SEU\nTÍTULO", body: "Texto de exemplo no estilo deste kit", index: "", ...style };
}

export default function KitPage() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setKits(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const persist = (list: Kit[]) => { setKits(list); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} };
  const rename = (i: number) => { const nv = prompt("Novo nome do kit:", kits[i].name); if (nv) persist(kits.map((k, idx) => (idx === i ? { ...k, name: nv.trim() } : k))); };
  const del = (i: number) => { if (confirm(`Excluir o kit "${kits[i].name}"?`)) persist(kits.filter((_, idx) => idx !== i)); };

  return (
    <div>
      <div style={{ fontSize: 13.5, color: "var(--dg-grey)", marginBottom: 22, maxWidth: 760, lineHeight: 1.6 }}>
        Os kits que você salva em <b style={{ color: "#fff" }}>Criar → Kit da marca</b> ficam aqui. Cada um guarda <b style={{ color: "#fff" }}>fonte, cores (incl. destaque), sombras, espaçamento, alinhamento, fundo e nick</b>. Pra <b style={{ color: "#fff" }}>aplicar</b>, use os botões dentro do editor de um card. Aqui você <b style={{ color: "#fff" }}>visualiza, renomeia ou exclui</b>.
      </div>

      {ready && kits.length === 0 ? (
        <div className="dg-panel" style={{ padding: 44, textAlign: "center", color: "var(--dg-faint)", fontSize: 14, lineHeight: 1.7 }}>
          Nenhum kit salvo ainda.<br />Vá em <b style={{ color: "#cfcfcf" }}>Criar</b>, deixe um card do jeito que você quer e clique em <b style={{ color: "#cfcfcf" }}>💾 salvar estilo atual como kit</b>.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 220px)", gap: 18, justifyContent: "flex-start" }}>
          {kits.map((k, i) => (
            <div key={k.name + i} className="dg-card" style={{ width: 220, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ width: 220, height: 275, overflow: "hidden", position: "relative", borderBottom: "1px solid var(--dg-line)", background: "#000" }}>
                <div style={{ width: 1080, height: 1350, transform: "scale(0.20371)", transformOrigin: "top left" }}>
                  <CarouselCard card={sample(k.style)} grain={false} />
                </div>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, color: "#fff", letterSpacing: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.name}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {([["título", k.style.titleColor], ["texto", k.style.bodyColor], ["destaque", k.style.highlightColor], ["fundo", k.style.bg]] as [string, string | undefined][])
                    .filter(([, c]) => c)
                    .map(([lbl, c]) => (
                      <span key={lbl} title={`${lbl}: ${c}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--dg-faint)" }}>
                        <span style={{ width: 13, height: 13, borderRadius: 4, background: c, border: "1px solid var(--dg-line)" }} />{lbl}
                      </span>
                    ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--dg-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {k.style.titleFont || "Anton"} · {k.style.bodyFont || "Inter"}{k.style.nicks?.filter(Boolean).length ? ` · ${k.style.nicks.filter(Boolean).join(" ")}` : ""}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                  <button onClick={() => rename(i)} className="dg-btn" style={{ flex: 1, padding: "7px", fontSize: 12.5 }}>✏️ renomear</button>
                  <button onClick={() => del(i)} className="dg-btn" style={{ padding: "7px 11px", fontSize: 12.5, color: "#e0738c", borderColor: "#3a1c28" }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
