import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { PublicHeader, PublicFooter } from "@/components/shells";
import { AuthProvider } from "@/lib/auth/auth-context";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Police unique du re-skin Bara : Hanken Grotesk (corps + display).
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Petits jobs et recrutement en Côte d'Ivoire`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Bara met en relation ceux qui cherchent un petit job et ceux qui recrutent en Côte d'Ivoire. Créez votre CV, publiez votre profil, trouvez votre bara.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fr_CI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={hanken.variable}>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <PublicHeader />

          {children}

          <PublicFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
