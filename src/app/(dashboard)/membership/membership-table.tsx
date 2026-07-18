"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
          <TableHead>WhatsApp</TableHead>
          <TableHead>Total Spent</TableHead>
          <TableHead>Member Since</TableHead>
          <TableHead>Threshold</TableHead>
          <TableHead>Progress</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((m) => {
          const progress = Math.min(100, Math.round((m.totalSpent / THRESHOLD) * 100));
          const met = m.totalSpent >= THRESHOLD;
          return (
            <TableRow key={m.customerId}>
              <TableCell className="font-medium">{m.customerName}</TableCell>
              <TableCell>{m.customerWhatsapp}</TableCell>
              <TableCell>${m.totalSpent.toFixed(2)}</TableCell>
              <TableCell>
                {m.memberSince ? format(new Date(m.memberSince), "dd MMM yyyy") : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={met ? "default" : "secondary"}>
                  {met ? "Met" : `${(THRESHOLD - m.totalSpent).toFixed(2)} remaining`}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {memberships.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">No customers found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
