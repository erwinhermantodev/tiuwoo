"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

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
    <aside className="w-[220px] bg-[#2B2420] flex flex-col shrink-0">
      <div className="flex items-center gap-2.5 px-5 pt-7 pb-9">
        <div className="size-[34px] rounded-full flex items-center justify-center shrink-0"
          style={{
            background: "radial-gradient(circle at 32% 28%, #D98C93 0%, #8E4A50 80%)",
          }}
        >
          <span className="font-[family-name:var(--font-display)] italic font-semibold text-[#FBF3F1] text-[15px]">柳</span>
        </div>
        <span className="font-[family-name:var(--font-display)] italic text-[19px] text-[#FBF3F1]">Tiuwoo</span>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-[6px] px-3 py-2.5 text-[13.5px] font-medium no-underline transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-[rgba(217,140,147,0.18)] text-[#F4D9D8]"
                  : "text-[#C9BCB3] hover:bg-[rgba(217,140,147,0.1)] hover:text-[#E6DAD3]"
              )}
            >
              {item.label}
            </Link>
          ))}
      </nav>
      <div className="px-3 pb-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full rounded-[6px] px-3 py-2.5 text-[13.5px] font-medium text-[#C9BCB3] hover:bg-[rgba(217,140,147,0.1)] hover:text-[#E6DAD3] transition-colors"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
