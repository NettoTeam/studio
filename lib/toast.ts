// Confirmação visual global — qualquer botão, em qualquer tela, chama toast("...") e aparece um aviso.
// O <Toaster/> mora no Shell (layout) e escuta este evento.
export function toast(message: string, kind: "ok" | "err" = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dg-toast", { detail: { message, kind } }));
}
