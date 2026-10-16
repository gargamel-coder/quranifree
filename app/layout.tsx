import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "Quranifree — Al-Qur'an murottal. Gratis, tanpa akun.",
  description: "Al-Qur'an murottal. Gratis, tanpa akun.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-base text-white antialiased md:pl-56">
        <Nav />
        {children}
      </body>
    </html>
  );
}
