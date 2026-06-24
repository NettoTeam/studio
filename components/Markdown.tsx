"use client";

import React from "react";

// renderizador leve — transforma o markdown do aprendizado (##, **, -, ---) em texto bonito.
function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    /^\*\*[^*]+\*\*$/.test(p)
      ? <strong key={i} style={{ color: "var(--dg-white)", fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

export default function Markdown({ text }: { text: string }) {
  const lines = (text || "").split("\n");
  const out: React.ReactNode[] = [];
  let bullets: React.ReactNode[] = [];
  const flush = () => {
    if (bullets.length) {
      out.push(<ul key={"u" + out.length} style={{ margin: "4px 0 12px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>{bullets}</ul>);
      bullets = [];
    }
  };
  lines.forEach((raw, i) => {
    const l = raw.trim();
    if (!l) { flush(); return; }
    if (/^---+$/.test(l)) { flush(); out.push(<hr key={"hr" + i} style={{ border: 0, borderTop: "1px solid var(--dg-line-soft)", margin: "12px 0" }} />); return; }
    if (/^#{1,6}\s/.test(l)) {
      flush();
      const level = l.match(/^#+/)![0].length;
      const size = level <= 1 ? 16.5 : level === 2 ? 14.5 : 13;
      out.push(
        <div key={"h" + i} style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.2, color: "var(--dg-white)", fontSize: size, marginTop: out.length ? 14 : 0, marginBottom: 5 }}>
          {inline(l.replace(/^#+\s/, ""))}
        </div>
      );
      return;
    }
    if (/^(-|•|\*)\s/.test(l)) {
      bullets.push(<li key={"b" + i} style={{ fontSize: 13.5, color: "var(--dg-text)", lineHeight: 1.5 }}>{inline(l.replace(/^(-|•|\*)\s/, ""))}</li>);
      return;
    }
    flush();
    out.push(<p key={"p" + i} style={{ fontSize: 13.5, color: "var(--dg-text)", lineHeight: 1.55, margin: "0 0 8px" }}>{inline(l)}</p>);
  });
  flush();
  return <div>{out}</div>;
}
