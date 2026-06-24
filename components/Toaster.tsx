"use client";

import { useEffect, useState } from "react";

type T = { id: number; message: string; kind: "ok" | "err" };

export default function Toaster() {
  const [toasts, setToasts] = useState<T[]>([]);
  useEffect(() => {
    let n = 0;
    function onToast(e: Event) {
      const { message, kind } = (e as CustomEvent).detail as { message: string; kind: "ok" | "err" };
      const id = ++n;
      setToasts((ts) => [...ts, { id, message, kind: kind || "ok" }]);
      setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 2800);
    }
    window.addEventListener("dg-toast", onToast);
    return () => window.removeEventListener("dg-toast", onToast);
  }, []);

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", pointerEvents: "none" }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.kind === "err" ? "#2a1018" : "#0f2118",
          border: "1px solid " + (t.kind === "err" ? "#5a1c2c" : "#2c4c28"),
          color: t.kind === "err" ? "#ff9ab0" : "#9ee08a",
          padding: "11px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
          boxShadow: "0 6px 24px rgba(0,0,0,.5)", maxWidth: 340, animation: "dgToastIn .18s ease-out",
        }}>
          {t.message}
        </div>
      ))}
      <style>{`@keyframes dgToastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
