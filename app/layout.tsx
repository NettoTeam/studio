import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "Netto Company Studio",
  description: "Criador de carrosséis da Netto Company — consultoria fitness feminina, foco em glúteo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full"><Shell>{children}</Shell></body>
    </html>
  );
}
