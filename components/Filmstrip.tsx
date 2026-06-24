"use client";

import { useRef } from "react";
import CarouselCard from "@/components/CarouselCard";
import type { Card } from "@/lib/types";

const fsBtn: React.CSSProperties = { fontSize: 10, lineHeight: 1, background: "rgba(0,0,0,.72)", color: "#fff", border: "none", borderRadius: 3, padding: "2px 5px", cursor: "pointer" };

export default function Filmstrip({ cards, selected, onSelect, onAdd, onDuplicate, onDelete, onReorder }: {
  cards: Card[];
  selected: number | null;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onDuplicate: (i: number) => void;
  onDelete: (i: number) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const drag = useRef<number | null>(null);
  if (!cards.length) return null;
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 5, background: "linear-gradient(180deg,#111a2e,#0c1322)", border: "1px solid #2a3552", borderRadius: 12, padding: "9px 12px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center", overflowX: "auto", boxShadow: "0 4px 14px rgba(0,0,0,.5)" }}>
      <span className="dg-kicker" style={{ flexShrink: 0, marginRight: 2 }}>Cards</span>
      {cards.map((c, i) => {
        const on = selected === i;
        return (
          <div key={c.id} draggable
            onDragStart={() => { drag.current = i; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag.current != null && drag.current !== i) onReorder(drag.current, i); drag.current = null; }}
            onClick={() => onSelect(i)}
            title={`Card ${i + 1} — clica pra editar, arrasta pra reordenar`}
            style={{ flexShrink: 0, position: "relative", cursor: "pointer", borderRadius: 6, overflow: "hidden", border: "2px solid " + (on ? "#ef476f" : "#2a3552"), width: 72, height: 90, background: "#000" }}>
            <div style={{ transform: "scale(0.0667)", transformOrigin: "top left", pointerEvents: "none", width: 1080, height: 1350 }}>
              <CarouselCard card={c} grain={false} />
            </div>
            <span style={{ position: "absolute", left: 3, top: 2, fontSize: 9, color: "#fff", background: "rgba(0,0,0,.62)", borderRadius: 3, padding: "0 4px", fontWeight: 700 }}>{i + 1}</span>
            {on && (
              <div style={{ position: "absolute", right: 2, top: 2, display: "flex", gap: 2 }}>
                <button onClick={(e) => { e.stopPropagation(); onDuplicate(i); }} title="duplicar card" style={fsBtn}>⧉</button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(i); }} title="remover card" style={{ ...fsBtn, color: "#ff7a9a" }}>×</button>
              </div>
            )}
          </div>
        );
      })}
      <button onClick={onAdd} title="adicionar card" style={{ flexShrink: 0, width: 72, height: 90, borderRadius: 6, border: "1.5px dashed #4a5a7a", background: "transparent", color: "#8a93a8", fontSize: 24, cursor: "pointer" }}>+</button>
    </div>
  );
}
