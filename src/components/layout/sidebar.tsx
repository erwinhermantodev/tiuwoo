"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", roles: ["manager", "cs", "front_office", "staff"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/leads", label: "Leads", roles: ["manager", "cs"], countKey: "leads" as const },
      { href: "/scheduling", label: "Scheduling", roles: ["manager", "cs", "front_office", "staff"], countKey: "scheduling" as const },
      { href: "/transactions", label: "Transactions", roles: ["manager", "cs", "front_office"] },
    ],
  },
  {
    label: "Relationship",
    items: [
      { href: "/membership", label: "Membership", roles: ["manager", "cs", "front_office"] },
      { href: "/complaints", label: "Complaints", roles: ["manager", "cs", "front_office"], countKey: "complaints" as const },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/staff", label: "Staff", roles: ["manager"] },
    ],
  },
];

export function Sidebar({
  role,
  counts,
  userName,
  userRole,
}: {
  role: string;
  counts?: { leads?: number; scheduling?: number; complaints?: number };
  userName?: string;
  userRole?: string;
}) {
  const pathname = usePathname();

  const visibleGroups = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => i.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <aside className="w-[216px] bg-[#2B2420] flex flex-col shrink-0">
      <div className="flex items-center gap-2.5 px-5 pt-[26px] pb-[30px]">
        <div
          className="size-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: "radial-gradient(circle at 32% 28%, #D98C93 0%, #8E4A50 80%)",
          }}
        >
          <span className="font-[family-name:var(--font-display)] italic font-semibold text-[#FBF3F1] text-[14px]">柳</span>
        </div>
        <span className="font-[family-name:var(--font-display)] italic text-[18px] text-[#FBF3F1]">Tiuwoo</span>
      </div>

      <nav className="flex-1 flex flex-col px-3">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <div className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.1em] uppercase text-[#8A7D73] mx-2 mt-[18px] mb-2">
              {group.label}
            </div>
            <div className="flex flex-col gap-[1px]">
              {group.items.map((item) => {
                const count = item.countKey ? counts?.[item.countKey] : undefined;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-[6px] px-2.5 py-[9px] text-[13px] font-medium no-underline transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-[rgba(217,140,147,0.18)] text-[#F4D9D8]"
                        : "text-[#C9BCB3] hover:bg-[rgba(217,140,147,0.1)] hover:text-[#E6DAD3]"
                    )}
                  >
                    <span>{item.label}</span>
                    {count !== undefined && (
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#D98C93] bg-[rgba(217,140,147,0.14)] px-[6px] py-[1px] rounded-[8px]">
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-3 pb-6 pt-4 border-t border-[rgba(255,255,255,0.08)] mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 w-full rounded-[6px] px-2.5 py-2 text-left transition-colors hover:bg-[rgba(217,140,147,0.1)]"
        >
          <div
            className="size-7 rounded-full shrink-0"
            style={{
              background: "radial-gradient(circle at 32% 28%, #8A9A7E 0%, #4E5C43 80%)",
            }}
          />
          <div className="flex-1">
            <div className="text-[12px] text-[#C9BCB3] leading-tight">{userName || "User"}</div>
            <div className="text-[10.5px] text-[#8A7D73] leading-tight">{userRole || role}</div>
          </div>
          <LogOut className="size-3.5 text-[#8A7D73]" />
        </button>
      </div>
    </aside>
  );
}
