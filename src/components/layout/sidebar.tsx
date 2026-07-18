"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/leads", label: "Leads", roles: ["manager", "cs"] },
  { href: "/scheduling", label: "Scheduling", roles: ["manager", "cs", "front_office", "staff"] },
  { href: "/transactions", label: "Transactions", roles: ["manager", "cs", "front_office"] },
  { href: "/membership", label: "Membership", roles: ["manager", "cs", "front_office"] },
  { href: "/complaints", label: "Complaints", roles: ["manager", "cs", "front_office"] },
  { href: "/staff", label: "Staff", roles: ["manager"] },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-6">Tiuwoo</h2>
      <nav className="flex-1 space-y-1">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded px-3 py-2 text-sm transition",
                pathname.startsWith(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-sm text-muted-foreground hover:text-foreground text-left"
      >
        Sign Out
      </button>
    </aside>
  );
}
