import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Netto Company Studio",
    short_name: "N² Studio",
    description: "Criador de carrosséis da Netto Company.",
    start_url: "/hoje",
    scope: "/",
    display: "standalone",
    background_color: "#0e0e11",
    theme_color: "#ef476f",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
