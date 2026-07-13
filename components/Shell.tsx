"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState, type ChangeEvent } from "react";
import Toaster from "@/components/Toaster";

// menu lateral + barra de título. Cada item é um LINK de verdade (abre em aba nova, favorito, voltar funciona).
const NAV_ITEMS = [
  ["hoje", "Hoje"],
  ["perfil", "Perfil"],
  ["quadro", "Quadro"],
  ["calendario", "Calendário"],
  ["vault", "Caixa Preta"],
] as const;

const CREATION_ITEMS = [
  ["criar", "Carrossel"],
  ["reels", "Reel"],
  ["stories", "Stories"],
  ["direct", "Direct"],
] as const;

const JARVIS_ITEMS = [
  ["biblioteca", "Biblioteca"],
  ["marca", "Marca"],
  ["fontes", "Fontes"],
  ["cerebro", "Cérebro"],
] as const;

const TITLES: Record<string, [string, string]> = {
  hoje: ["Bem Vindo ao Netto Studio", ""],
  criar: ["CARROSSEL", "roteiro, gancho e carrossel"],
  stories: ["STORIES", "ideias e sequências do dia a dia"],
  reels: ["REEL", "banco de ideias para gravar"],
  perfil: ["PERFIL", "insights do Instagram + análise"],
  direct: ["DIRECT", "assistente de DM/venda e parcerias"],
  kit: ["KIT DA MARCA", "seus estilos salvos: ver, renomear, excluir"],
  quadro: ["QUADRO", "pipeline do conteúdo"],
  calendario: ["CALENDÁRIO", "agenda de publicação"],
  marca: ["MARCA", "identidade, pilares e pautas"],
  fontes: ["FONTES", "PDFs e artigos de base"],
  biblioteca: ["BIBLIOTECA", "fotos por categoria + identidade visual"],
  cerebro: ["CÉREBRO", "lado técnico, voz e estrutura"],
  vault: ["CAIXA PRETA", "desempenho & aprendizado"],
};

type ThemeMode = "light" | "system" | "dark";

type ShellSettings = {
  menuLogo: string;
  menuTitle: string;
  menuSubtitle: string;
  footerTitle: string;
  footerSubtitle: string;
  themeMode: ThemeMode;
};

const SHELL_SETTINGS_KEY = "n2shell.settings.v1";

const DEFAULT_SHELL_SETTINGS: ShellSettings = {
  menuLogo: "",
  menuTitle: "NETTO COMPANY",
  menuSubtitle: "Studio",
  footerTitle: "Netto Company Studio",
  footerSubtitle: "Painel de criação",
  themeMode: "dark",
};

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "system", label: "Automático" },
  { value: "dark", label: "Escuro" },
];

function normalizeShellSettings(input: unknown): ShellSettings {
  if (!input || typeof input !== "object") return DEFAULT_SHELL_SETTINGS;
  const data = input as Partial<ShellSettings>;
  const themeMode: ThemeMode = data.themeMode === "light" || data.themeMode === "system" || data.themeMode === "dark"
    ? data.themeMode
    : DEFAULT_SHELL_SETTINGS.themeMode;

  return {
    menuLogo: typeof data.menuLogo === "string" ? data.menuLogo : DEFAULT_SHELL_SETTINGS.menuLogo,
    menuTitle: typeof data.menuTitle === "string" && data.menuTitle.trim() ? data.menuTitle : DEFAULT_SHELL_SETTINGS.menuTitle,
    menuSubtitle: typeof data.menuSubtitle === "string" ? data.menuSubtitle : DEFAULT_SHELL_SETTINGS.menuSubtitle,
          footerTitle: typeof data.footerTitle === "string" && data.footerTitle.trim() ? data.footerTitle : DEFAULT_SHELL_SETTINGS.footerTitle,
    footerSubtitle: typeof data.footerSubtitle === "string" ? data.footerSubtitle : DEFAULT_SHELL_SETTINGS.footerSubtitle,
    themeMode,
  };
}

function readShellSettings(): ShellSettings {
  if (typeof window === "undefined") return DEFAULT_SHELL_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SHELL_SETTINGS_KEY);
    return normalizeShellSettings(raw ? JSON.parse(raw) : DEFAULT_SHELL_SETTINGS);
  } catch {
    return DEFAULT_SHELL_SETTINGS;
  }
}

function resolveTheme(mode: ThemeMode, systemDark: boolean) {
  if (mode === "system") return systemDark ? "dark" : "light";
  return mode;
}

// ícones de linha (stroke = currentColor): consistentes, herdam a cor do item (rosa quando ativo)
function Icon({ name }: { name: string }) {
  const c = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.55, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "hoje": return (<svg {...c}><path d="M3 9.5 12 3l9 6.5" /><path d="M5 8.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5" /><path d="M9.5 21v-6h5v6" /></svg>);
    case "criacao": return (<svg {...c}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 4v16" /><path d="M13 9h4M13 13h4M13 17h4" /></svg>);
    case "jarvis": return (<svg {...c}><rect x="5" y="6" width="14" height="12" rx="4" /><path d="M9 2v4M15 2v4M9.5 12h.01M14.5 12h.01M9 18l-2 3M15 18l2 3" /><path d="M10 15h4" /></svg>);
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
    case "perfil": return (<svg {...c}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1.2" /></svg>);
    case "direct": return (<svg {...c}><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" /></svg>);
    case "settings": return (<svg {...c}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.36 1.04V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.04-.36H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .36-1.04V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.6.21 1 .78 1 1.4v.2c0 .62-.4 1.19-1 1.4Z" /></svg>);
    default: return null;
  }
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cur = (pathname?.split("/")[1] || "hoje");
  const [title, sub] = TITLES[cur] || TITLES.hoje;
  const hidePageHead = cur === "stories" || cur === "reels";
  const creationActive = CREATION_ITEMS.some(([v]) => cur === v);
  const jarvisActive = JARVIS_ITEMS.some(([v]) => cur === v);
  const [creationOpen, setCreationOpen] = useState(creationActive);
  const [jarvisOpen, setJarvisOpen] = useState(jarvisActive);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [shellSettings, setShellSettings] = useState<ShellSettings>(DEFAULT_SHELL_SETTINGS);
  const [systemDark, setSystemDark] = useState(() => (
    typeof window === "undefined" ? true : window.matchMedia("(prefers-color-scheme: dark)").matches
  ));
  const creationVisible = creationOpen || creationActive;
  const jarvisVisible = jarvisOpen || jarvisActive;
  const resolvedTheme = resolveTheme(shellSettings.themeMode, systemDark);
  const logoSrc = shellSettings.menuLogo || "/logo/cn-logo.png";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      setShellSettings(readShellSettings());
      setSettingsLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themeMode = shellSettings.themeMode;
    document.documentElement.style.colorScheme = resolvedTheme;
    if (settingsLoaded && typeof window !== "undefined") {
      window.localStorage.setItem(SHELL_SETTINGS_KEY, JSON.stringify(shellSettings));
    }
  }, [resolvedTheme, shellSettings, settingsLoaded]);

  function updateShellSetting<K extends keyof ShellSettings>(key: K, value: ShellSettings[K]) {
    setShellSettings((current) => normalizeShellSettings({ ...current, [key]: value }));
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateShellSetting("menuLogo", reader.result);
    };
    reader.readAsDataURL(file);
    event.currentTarget.value = "";
  }

  function resetShellSettings() {
    setShellSettings(DEFAULT_SHELL_SETTINGS);
  }

  if (cur === "login") {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <div className="dg-shell">
      <aside className="dg-sidebar">
        <Link href="/hoje" className="dg-brand">
          <img src={logoSrc} alt="Netto Company" className="dg-brand-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; const s = e.currentTarget.nextElementSibling as HTMLElement | null; if (s) s.style.display = "block"; }} />
          <span className="dg-brand-fallback">CN</span>
          <div className="dg-brand-copy">
            <span>{shellSettings.menuTitle || DEFAULT_SHELL_SETTINGS.menuTitle}</span>
            <small>{shellSettings.menuSubtitle || DEFAULT_SHELL_SETTINGS.menuSubtitle}</small>
          </div>
        </Link>

        <nav className="dg-nav-list" aria-label="Menu principal">
          {NAV_ITEMS.map(([v, label]) => {
            const active = cur === v;
            return (
              <Fragment key={v}>
                <Link href={`/${v}`} className={"dg-nav" + (active ? " active" : "")}>
                  <span className="ico"><Icon name={v} /></span>
                  {label}
                </Link>

                {v === "perfil" && (
                  <div className={"dg-nav-group" + (creationVisible ? " open" : "") + (creationActive ? " active" : "")}>
                    <button
                      type="button"
                      className={"dg-nav dg-nav-accordion" + (creationActive ? " active" : "")}
                      onClick={() => setCreationOpen((open) => !open)}
                      aria-expanded={creationVisible}
                      aria-controls="creation-nav-items"
                    >
                      <span className="ico"><Icon name="criacao" /></span>
                      <span className="dg-nav-label">Criação</span>
                      <span className="dg-nav-chevron" aria-hidden="true">⌄</span>
                    </button>

                    {creationVisible && (
                      <div className="dg-nav-children" id="creation-nav-items">
                        {CREATION_ITEMS.map(([item, childLabel]) => {
                          const childActive = cur === item;
                          return (
                            <Link key={item} href={`/${item}`} className={"dg-nav dg-nav-child" + (childActive ? " active" : "")}>
                              <span className="ico"><Icon name={item} /></span>
                              {childLabel}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {v === "perfil" && (
                  <div className={"dg-nav-group" + (jarvisVisible ? " open" : "") + (jarvisActive ? " active" : "")}>
                    <button
                      type="button"
                      className={"dg-nav dg-nav-accordion" + (jarvisActive ? " active" : "")}
                      onClick={() => setJarvisOpen((open) => !open)}
                      aria-expanded={jarvisVisible}
                      aria-controls="jarvis-nav-items"
                    >
                      <span className="ico"><Icon name="jarvis" /></span>
                      <span className="dg-nav-label">JARVIS</span>
                      <span className="dg-nav-chevron" aria-hidden="true">⌄</span>
                    </button>

                    {jarvisVisible && (
                      <div className="dg-nav-children" id="jarvis-nav-items">
                        {JARVIS_ITEMS.map(([item, childLabel]) => {
                          const childActive = cur === item;
                          return (
                            <Link key={item} href={`/${item}`} className={"dg-nav dg-nav-child" + (childActive ? " active" : "")}>
                              <span className="ico"><Icon name={item} /></span>
                              {childLabel}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Fragment>
            );
          })}
        </nav>

        <footer className="dg-sidebar-footer">
          <div className="dg-user-card">
            <div className="dg-user-avatar" aria-hidden="true">
              <img src={logoSrc} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <span />
            </div>
            <div>
              <strong>{shellSettings.footerTitle || DEFAULT_SHELL_SETTINGS.footerTitle}</strong>
              <button className="dg-user-settings" type="button" onClick={() => setSettingsOpen(true)}>
                <span className="ico"><Icon name="settings" /></span>
                configurações
              </button>
            </div>
          </div>
        </footer>
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
      {settingsOpen && (
        <div className="dg-settings-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <section className="dg-settings-panel" role="dialog" aria-modal="true" aria-label="Configurações do menu">
            <div className="dg-settings-head">
              <div>
                <span>Configurações</span>
                <strong>Menu & aparência</strong>
              </div>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Fechar configurações">×</button>
            </div>

            <div className="dg-settings-grid">
              <div className="dg-settings-field dg-settings-field--logo">
                <span>Logo do menu</span>
                <div className="dg-logo-picker">
                  <div className="dg-logo-preview">
                    <img src={logoSrc} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  </div>
                  <div className="dg-logo-actions">
                    <input id="shell-logo-input" type="file" accept="image/*" onChange={handleLogoUpload} />
                    <label htmlFor="shell-logo-input">trocar logo</label>
                    <button type="button" onClick={() => updateShellSetting("menuLogo", "")}>usar padrão</button>
                  </div>
                </div>
              </div>

              <label className="dg-settings-field">
                <span>Título do menu</span>
                <input value={shellSettings.menuTitle} onChange={(event) => updateShellSetting("menuTitle", event.target.value)} />
              </label>

              <label className="dg-settings-field">
                <span>Subtítulo do menu</span>
                <input value={shellSettings.menuSubtitle} onChange={(event) => updateShellSetting("menuSubtitle", event.target.value)} />
              </label>

              <label className="dg-settings-field">
                <span>Rodapé</span>
                <input value={shellSettings.footerTitle} onChange={(event) => updateShellSetting("footerTitle", event.target.value)} />
              </label>

              <div className="dg-settings-field dg-settings-field--wide">
                <span>Tema</span>
                <div className="dg-theme-options" role="group" aria-label="Tema do site">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={shellSettings.themeMode === option.value ? "active" : ""}
                      onClick={() => updateShellSetting("themeMode", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="dg-settings-actions">
              <button type="button" onClick={resetShellSettings}>restaurar padrão</button>
              <button type="button" className="primary" onClick={() => setSettingsOpen(false)}>pronto</button>
            </div>
          </section>
        </div>
      )}
      <Toaster />
    </div>
  );
}
