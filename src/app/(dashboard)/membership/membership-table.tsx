"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pill } from "@/components/ui/badge";
import { format } from "date-fns";

const THRESHOLD = 500;

type MembershipRow = {
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  totalSpent: number;
  memberSince: string | null;
  thresholdMetAt: string | null;
};

export function MembershipTable({ memberships }: { memberships: MembershipRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Total spent</TableHead>
          <TableHead>Threshold</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((m) => {
          const progress = Math.min(100, Math.round((m.totalSpent / THRESHOLD) * 100));
          const met = m.totalSpent >= THRESHOLD;
          return (
            <TableRow key={m.customerId}>
              <TableCell className="font-medium">{m.customerName}</TableCell>
              <TableCell className="font-[family-name:var(--font-mono)] text-[12.5px]">
                Rp {m.totalSpent.toLocaleString()}
              </TableCell>
              <TableCell className="font-[family-name:var(--font-mono)] text-[12.5px]">
                Rp {THRESHOLD.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="h-[6px] rounded-[999px] bg-[#EFE7E1] overflow-hidden w-[110px]">
                  <div
                    className="h-full rounded-[999px] bg-[#4E5C43] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </TableCell>
              <TableCell>
                {met ? (
                  <Pill color="sage">
                    {m.memberSince ? `Member since ${format(new Date(m.memberSince), "MMM ''yy")}` : "Member"}
                  </Pill>
                ) : progress > 50 ? (
                  <Pill color="clay">{progress}% to go</Pill>
                ) : (
                  <Pill color="taupe">{progress}% to go</Pill>
                )}
              </TableCell>
            </TableRow>
          );
        })}
        {memberships.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-[#4A4038] py-8">No customers found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
