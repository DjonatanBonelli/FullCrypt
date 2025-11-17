import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Full Crypt",
  description: "Full Crypt - Cloud e compartilhamento de arquivos com criptografia ponta a ponta",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "antialiased",
          "min-h-screen",
          "overflow-x-hidden",
        ].join(" ")}
      >
       <ThemeProvider>
        <div className="min-h-screen w-full flex flex-col">
          <Header />
          <main className="flex-1 w-full px-6 py-6">
            {children}
          </main>
          <Footer />
        </div>
      </ThemeProvider>
      </body>
    </html>
  );
}
