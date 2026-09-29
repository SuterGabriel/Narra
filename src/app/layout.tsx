import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Literata } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Narra · Mario und der Zauberer",
  description:
    "Lernbegleiter für Thomas Manns Novelle: Überblick, Schlüsselpassagen, Fragen mit Seitenbeleg, Hörbuch und Quiz.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#17161d" },
  ],
};

// Applies a stored theme choice before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('narra-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${bricolage.variable} ${figtree.variable} ${literata.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-surface font-sans text-ink lg:bg-paper">
        <div className="lg:flex">
          <Sidebar />
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-paper md:border-x md:border-line lg:max-w-none lg:min-w-0 lg:flex-1 lg:border-0">
            <main className="flex flex-1 flex-col">{children}</main>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
