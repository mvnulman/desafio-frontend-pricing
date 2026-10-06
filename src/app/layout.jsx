import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

export const metadata = {
  title: "Painel de Margem do Catálogo",
  description: "Desafio técnico frontend — Volix",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
