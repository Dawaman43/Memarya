import type { Metadata } from "next";
import { headers as nextHeaders } from "next/headers";
import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Montserrat,
  Raleway,
  Playfair_Display,
  Lora,
  Oswald,
  Bebas_Neue,
  Nunito,
  Merriweather,
  Roboto_Slab,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/layout/header";
import { auth } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Additional Google Fonts (exposed via CSS variables)
const inter = Inter({ variable: "--font-gf-inter", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-gf-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const montserrat = Montserrat({
  variable: "--font-gf-montserrat",
  subsets: ["latin"],
});
const raleway = Raleway({ variable: "--font-gf-raleway", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-gf-playfair",
  subsets: ["latin"],
});
const lora = Lora({ variable: "--font-gf-lora", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-gf-oswald", subsets: ["latin"] });
const bebasNeue = Bebas_Neue({
  variable: "--font-gf-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});
const nunito = Nunito({ variable: "--font-gf-nunito", subsets: ["latin"] });
const merriweather = Merriweather({
  variable: "--font-gf-merriweather",
  subsets: ["latin"],
});
const robotoSlab = Roboto_Slab({
  variable: "--font-gf-roboto-slab",
  subsets: ["latin"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-gf-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memarya - Master Your Knowledge",
  description:
    "A modern learning platform to help you memorize and master any topic",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico", // for old browsers
    apple: "/favicon.ico", // for iOS
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SSR: get session to avoid client pop-in
  const session = await auth.api.getSession({
    headers: new Headers(nextHeaders()),
  });
  const user = session?.user as
    | { name: string; email: string; image?: string }
    | undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          // Google Fonts variables
          inter.variable,
          poppins.variable,
          montserrat.variable,
          raleway.variable,
          playfair.variable,
          lora.variable,
          oswald.variable,
          bebasNeue.variable,
          nunito.variable,
          merriweather.variable,
          robotoSlab.variable,
          jetbrainsMono.variable,
          "antialiased",
        ].join(" ")}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <Header user={user} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
