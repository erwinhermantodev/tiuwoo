"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";
import type { NotificationItem } from "@/app/(dashboard)/layout";

const iconMap = {
  complaint: "bg-[#C97B4E]",
  member: "bg-[#4E5C43]",
  unpaid: "bg-[#8E4A50]",
  lead: "bg-[#B8ABA0]",
};

export function Topbar({ name, role, notifications }: { name: string; role: string; notifications: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-[#E6DAD3] bg-white">
      <div className="flex items-center gap-2 bg-[#FBF6F2] border border-[#E6DAD3] rounded-[999px] px-4 py-2 w-[280px]">
        <Search className="size-3.5 text-[#B8ABA0]" />
        <span className="text-[12.5px] text-[#B8ABA0]">Search customer, booking...</span>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="relative size-8 rounded-full bg-[#FBF6F2] border border-[#E6DAD3] flex items-center justify-center cursor-pointer hover:bg-[#EFE7E1] transition-colors"
          >
            <Bell className="size-3.5 text-[#4A4038]" />
            {notifications.length > 0 && (
              <div className="absolute top-[6px] right-[7px] size-[6px] rounded-full bg-[#C97B4E]" />
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-10 w-[320px] bg-white rounded-[10px] border border-[#E6DAD3] shadow-[0_12px_40px_-16px_rgba(43,36,32,0.3)] z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E6DAD3]">
                <p className="text-[13px] font-semibold text-[#2B2420]">Notifications</p>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12.5px] text-[#B8ABA0]">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#FBF6F2] transition-colors no-underline border-b border-[#E6DAD3] last:border-b-0"
                    >
                      <div className={`mt-1 size-[6px] rounded-full shrink-0 ${iconMap[n.type]}`} />
                      <div className="min-w-0">
                        <p className="text-[12.5px] text-[#2B2420] leading-snug truncate">{n.message}</p>
                        <p className="text-[11px] text-[#B8ABA0] mt-0.5">{n.subtitle}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className="size-[30px] rounded-full"
            style={{
              background: "radial-gradient(circle at 32% 28%, #8A9A7E 0%, #4E5C43 80%)",
            }}
          />
          <div className="text-left">
            <div className="text-[12px] text-[#4A4038] leading-tight">{name}</div>
            <div className="text-[10.5px] text-[#B8ABA0] leading-tight">{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
