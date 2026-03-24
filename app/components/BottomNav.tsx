"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home", icon: "⚡" },
  { href: "/dispatch", label: "Dispatch", icon: "📅" },
  { href: "/technicians", label: "Techs", icon: "👷" },
  { href: "/people", label: "People", icon: "👥" },
  { href: "/finance", label: "Finance", icon: "💰" },
  { href: "/marketing", label: "Ads", icon: "📣" },
  { href: "/actions", label: "Actions", icon: "✅" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950 border-t border-gray-800">
      <div className="flex overflow-x-auto scrollbar-hide">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 min-w-[50px] py-2 px-1 text-center transition-colors ${
                active ? "text-white bg-gray-800" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-tight">{item.icon}</span>
              <span className="text-[10px] font-semibold mt-0.5 leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
