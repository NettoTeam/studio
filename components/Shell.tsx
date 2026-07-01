"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Toaster from "@/components/Toaster";

// menu lateral + barra de título. Cada item é um LINK de verdade (abre em aba nova, favorito, voltar funciona).
const NAV_ITEMS = [
  ["hoje", "Hoje"],
  ["criar", "Criar"],
  ["stories", "Stories"],
  ["reels", "Reels"],
  ["quadro", "Quadro"],
  ["calendario", "Calendário"],
  ["marca", "Marca"],
  ["fontes", "Fontes"],
  ["biblioteca", "Biblioteca"],
  ["cerebro", "Cérebro"],
  ["vault", "Vault"],
] as const;

const TITLES: Record<string, [string, string]> = {
  hoje: ["Bem Vindo ao Netto Studio", ""],
  criar: ["CRIAR", "roteiro, gancho e carrossel"],
  stories: ["STORIES", "ideias e sequências do dia a dia"],
  reels: ["REELS", "banco de ideias para gravar"],
  kit: ["KIT DA MARCA", "seus estilos salvos: ver, renomear, excluir"],
  quadro: ["QUADRO", "pipeline do conteúdo"],
  calendario: ["CALENDÁRIO", "agenda de publicação"],
  marca: ["MARCA", "identidade, pilares e pautas"],
  fontes: ["FONTES", "PDFs e artigos de base"],
  biblioteca: ["BIBLIOTECA", "fotos por categoria + identidade visual"],
  cerebro: ["CÉREBRO", "lado técnico, voz e estrutura"],
  vault: ["VAULT", "desempenho & aprendizado"],
};

// ícones de linha (stroke = currentColor): consistentes, herdam a cor do item (rosa quando ativo)
function Icon({ name }: { name: string }) {
  const c = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.55, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "hoje": return (<svg {...c}><path d="M3 9.5 12 3l9 6.5" /><path d="M5 8.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5" /><path d="M9.5 21v-6h5v6" /></svg>);
    case "criar": return (<svg {...c}><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>);
    case "stories": return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="m10 8.5 5.5 3.5-5.5 3.5z" /></svg>);
    case "kit": return (<svg {...c}><rect x="3" y="6" width="13" height="13" rx="2" /><path d="M8 6V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-2" /><circle cx="9.5" cy="12.5" r="2" /></svg>);
    case "quadro": return (<svg {...c}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></svg>);
    case "calendario": return (<svg {...c}><rect x="3" y="4.5" width="18" height="16.5" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>);
    case "marca": return (<svg {...c}><path d="M6 3h12l3.5 6L12 21 2.5 9z" /><path d="M2.5 9h19M9 3 6.5 9 12 21M15 3l2.5 6L12 21" /></svg>);
    case "fontes": return (<svg {...c}><path d="M3 4.5h6a3 3 0 0 1 3 3V21a2.5 2.5 0 0 0-2.5-2.5H3z" /><path d="M21 4.5h-6a3 3 0 0 0-3 3V21a2.5 2.5 0 0 1 2.5-2.5H21z" /></svg>);
    case "biblioteca": return (<svg {...c}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>);
    case "cerebro": return (<svg {...c}><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>);
    case "vault": return (<svg {...c}><path d="M4 10V8l8-5 8 5v2" /><path d="M5.5 10h13v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z" /><path d="M9 15h6M12 12v6" /></svg>);
    case "reels": return (<svg {...c}><rect x="2" y="2" width="20" height="20" rx="4" /><path d="m10 8 6 4-6 4V8z" /><path d="M2 12h2M20 12h2M12 2v2M12 20v2" /></svg>);
    default: return null;
  }
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cur = (pathname?.split("/")[1] || "hoje");
  const [title, sub] = TITLES[cur] || TITLES.hoje;
  const hidePageHead = cur === "stories" || cur === "reels";

  return (
    <div className="dg-shell">
      <aside className="dg-sidebar">
        <Link href="/hoje" className="dg-brand">
          <img src="/logo/cn-logo.png" alt="Netto Company" className="dg-brand-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; const s = e.currentTarget.nextElementSibling as HTMLElement | null; if (s) s.style.display = "block"; }} />
          <span className="dg-brand-fallback">CN</span>
          <div className="dg-brand-copy">
            <span>NETTO COMPANY</span>
            <small>Studio</small>
          </div>
        </Link>

        <nav className="dg-nav-list" aria-label="Menu principal">
          {NAV_ITEMS.map(([v, label]) => {
            const active = cur === v;
            return (
              <Link key={v} href={`/${v}`} className={"dg-nav" + (active ? " active" : "")}>
                <span className="ico"><Icon name={v} /></span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="dg-user-card">
          <div
            className="dg-user-avatar"
            aria-hidden="true"
            style={{ background: 'url("/logo/cn-logo.png") center / 32px auto no-repeat, radial-gradient(circle at 50% 50%, rgba(239,71,111,0.10), rgba(6,7,10,0.9) 68%)' }}
          >
            <span />
          </div>
          <div>
            <strong>Netto Company Studio</strong>
          </div>
        </div>
      </aside>

      <main className="dg-main">
        {!hidePageHead && (
          <div className="dg-page-head">
            <div className="dg-page-title">
              <span className="dg-page-mark" />
              <h1 className="dg-title">{title}</h1>
              {sub && <span>{sub}</span>}
            </div>
          </div>
        )}
        {children}
      </main>
      <Toaster />
    </div>
  );
}
