import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal PM — Gestão de Projetos",
  description: "Sistema pessoal de gestão de projetos com BI integrado",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
