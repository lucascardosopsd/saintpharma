import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ptBR } from "@clerk/localizations";
import { Toaster } from "sonner";
import HeaderWithLives from "@/components/HeaderWithLives";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaintPharma",
  description: "Aprenda com quem sabe ensinar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body className="min-h-screen">
          <HeaderWithLives />
          <main>{children}</main>
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
