"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Beranda", icon: "🏠" },
  { href: "/surah", label: "Cari", icon: "🔍" },
  { href: "/library", label: "Pustaka", icon: "📚" },
  { href: "/reciters", label: "Qari", icon: "🎧" },
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 hidden w-56 flex-col bg-black p-4 md:flex">
        <Link href="/" className="mb-6 px-2 text-xl font-bold">Quranifree</Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive(n.href) ? "bg-surface2 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>{n.icon}</span> {n.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-white/10 bg-black/95 backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] ${
              isActive(n.href) ? "text-accent" : "text-neutral-400"
            }`}
          >
            <span className="text-lg">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
