"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Toaster from "@/components/Toaster";

// menu lateral + barra de título. Cada item é um LINK de verdade (abre em aba nova, favorito, voltar funciona).
const GROUPS = [
  ["", [["hoje", "Hoje"]]],
  ["Criação", [["criar", "Criar"], ["kit", "Kit da Marca"]]],
  ["Pipeline", [["quadro", "Quadro"], ["calendario", "Calendário"]]],
  ["Inteligência", [["marca", "Marca"], ["fontes", "Fontes"], ["biblioteca", "Biblioteca"], ["cerebro", "Cérebro"], ["vault", "Vault"]]],
] as const;

const TITLES: Record<string, [string, string]> = {
  hoje: ["HOJE", "sua casa — o ritmo, os ganchos e o que falta"],
  criar: ["CRIAR", "monte o carrossel na voz da marca"],
  kit: ["KIT DA MARCA", "seus estilos salvos — ver, renomear, excluir"],
  quadro: ["QUADRO", "pipeline do conteúdo"],
  calendario: ["CALENDÁRIO", "agenda de publicação"],
  marca: ["MARCA", "identidade, pilares e pautas"],
  fontes: ["FONTES", "PDFs e artigos pra embasar o conteúdo"],
  biblioteca: ["BIBLIOTECA", "fotos por categoria + identidade visual"],
  cerebro: ["CÉREBRO", "o lado técnico — régua, voz, estrutura, ciência"],
  vault: ["VAULT", "desempenho & aprendizado"],
};

// ícones de linha (stroke = currentColor) — consistentes, herdam a cor do item (rosa quando ativo)
function Icon({ name }: { name: string }) {
  const c = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "hoje": return (<svg {...c}><path d="M3 9.5 12 3l9 6.5" /><path d="M5 8.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5" /><path d="M9.5 21v-6h5v6" /></svg>);
    case "criar": return (<svg {...c}><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>);
    case "kit": return (<svg {...c}><rect x="3" y="6" width="13" height="13" rx="2" /><path d="M8 6V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-2" /><circle cx="9.5" cy="12.5" r="2" /></svg>);
    case "quadro": return (<svg {...c}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></svg>);
    case "calendario": return (<svg {...c}><rect x="3" y="4.5" width="18" height="16.5" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>);
    case "marca": return (<svg {...c}><path d="M6 3h12l3.5 6L12 21 2.5 9z" /><path d="M2.5 9h19M9 3 6.5 9 12 21M15 3l2.5 6L12 21" /></svg>);
    case "fontes": return (<svg {...c}><path d="M3 4.5h6a3 3 0 0 1 3 3V21a2.5 2.5 0 0 0-2.5-2.5H3z" /><path d="M21 4.5h-6a3 3 0 0 0-3 3V21a2.5 2.5 0 0 1 2.5-2.5H21z" /></svg>);
    case "biblioteca": return (<svg {...c}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>);
    case "cerebro": return (<svg {...c}><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>);
    case "vault": return (<svg {...c}><path d="M6 20v-6M12 20V8M18 20v-9" /><path d="M3 20h18" /></svg>);
    default: return null;
  }
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cur = (pathname?.split("/")[1] || "hoje");
  const [title, sub] = TITLES[cur] || TITLES.hoje;

  return (
    <div style={{ minHeight: "100vh" }}>
      <aside className="dg-sidebar">
        {/* MARCA — logo grande em cima, nome embaixo (sem caixa branca) */}
        <Link href="/hoje" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, padding: "0 6px 18px", borderBottom: "1px solid var(--dg-line-soft)", marginBottom: 14 }}>
          <img src="/logo/cn-logo.png" alt="Netto Company" style={{ width: 168, maxHeight: 120, objectFit: "contain", filter: "drop-shadow(0 2px 10px rgba(0,0,0,.45))" }}
            onError={(e) => { e.currentTarget.style.display = "none"; const s = e.currentTarget.nextElementSibling as HTMLElement | null; if (s) s.style.display = "block"; }} />
          <span style={{ display: "none", fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: "#fff", letterSpacing: 1, lineHeight: 1 }}>CN</span>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#fff", letterSpacing: 1 }}>NETTO COMPANY</span>
            <span className="dg-kicker" style={{ marginTop: 4, fontSize: 11 }}>Studio</span>
          </div>
        </Link>

        {/* NAV */}
        {GROUPS.map(([grupo, itens]) => (
          <div key={grupo || "top"}>
            {grupo && <div style={{ fontSize: 9.5, color: "var(--dg-faint)", textTransform: "uppercase", letterSpacing: 2.5, padding: "16px 14px 6px", fontWeight: 700 }}>{grupo}</div>}
            {itens.map(([v, label]) => {
              const active = cur === v;
              return (
                <Link key={v} href={`/${v}`} className={"dg-nav" + (active ? " active" : "")} style={{ textDecoration: "none" }}>
                  <span className="ico" style={{ display: "flex", alignItems: "center", color: active ? "var(--dg-red)" : "inherit" }}><Icon name={v} /></span>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "var(--dg-faint)", padding: "16px 8px 0" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--dg-red)", display: "block" }} />
          Netto Company Studio
        </div>
      </aside>

      <main className="dg-main" style={{ minWidth: 0, padding: "34px 44px 56px", maxWidth: 1400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 18, marginBottom: 26, borderBottom: "1px solid var(--dg-line-soft)" }}>
          <span style={{ width: 4, height: 34, background: "var(--dg-red)", borderRadius: 2, flexShrink: 0 }} />
          <h1 className="dg-title" style={{ fontSize: 40, margin: 0, lineHeight: 1 }}>{title}</h1>
          <span style={{ color: "var(--dg-faint)", fontSize: 13.5, alignSelf: "flex-end", paddingBottom: 3 }}>{sub}</span>
        </div>
        {children}
      </main>
      <Toaster />
    </div>
  );
}
