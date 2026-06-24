"use client";

import { useEffect } from "react";

// Quadro flutuante — salta na tela, escurece o resto e foca só naquele conteúdo.
// Fecha no ✕, no clique fora ou no Esc.
export default function Modal({ title, onClose, children, maxWidth = 560 }: { title?: React.ReactNode; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // trava o scroll do fundo
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div onMouseDown={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.64)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "7vh 20px 48px", overflowY: "auto" }}>
      <div onMouseDown={(e) => e.stopPropagation()} className="dg-panel" style={{ width: "100%", maxWidth, padding: 0, animation: "dgModalIn .16s ease-out", boxShadow: "0 24px 70px -20px rgba(0,0,0,0.9)" }}>
        {title != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 20px", borderBottom: "1px solid var(--dg-line-soft)" }}>
            <div style={{ flex: 1, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, fontSize: 19, color: "var(--dg-white)" }}>{title}</div>
            <button onClick={onClose} aria-label="fechar" style={{ background: "transparent", border: "1px solid var(--dg-line)", color: "var(--dg-grey)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 15, lineHeight: 1 }}>✕</button>
          </div>
        )}
        <div style={{ padding: 20 }}>{children}</div>
      </div>
      <style>{`@keyframes dgModalIn{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
