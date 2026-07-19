"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Transaction = {
  id: string;
  bookingId: string;
  paidAt: string;
  nextVisitDate: string | null;
  editNotes: string | null;
  booking: {
    id: string;
    scheduledDate: string;
    customer: { id: string; name: string; whatsapp: string };
    bookingTreatment: {
      id: string;
      priceAtBooking: number;
      paymentStatus: string;
      treatment: { id: string; name: string };
    }[];
  };
};

type UnpaidBooking = {
  id: string;
  scheduledDate: string;
  customer: { id: string; name: string };
  bookingTreatment: {
    id: string;
    priceAtBooking: number;
    paymentStatus: string;
    treatment: { id: string; name: string };
    staff: { id: string; name: string };
  }[];
};

type Props = {
  transactions: Transaction[];
  unpaidBookings: UnpaidBooking[];
  role: string;
};

export function TransactionsTable({ transactions, unpaidBookings, role }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
  const [nextVisitDate, setNextVisitDate] = useState("");
  const canEdit = role === "manager" || role === "front_office";

  async function handlePay() {
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: selectedBookingId,
        paidAt: new Date(paidAt).toISOString(),
        nextVisitDate: nextVisitDate ? new Date(nextVisitDate).toISOString() : null,
      }),
    });
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button disabled={!canEdit || unpaidBookings.length === 0}>Mark Payment</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Unpaid Booking</Label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                >
                  <option value="">Select booking...</option>
                  {unpaidBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.customer.name} - {format(new Date(b.scheduledDate), "dd MMM yyyy")} (${b.bookingTreatment.reduce((s, bt) => s + Number(bt.priceAtBooking), 0)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Paid At</Label>
                <Input type="datetime-local" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Next Visit Date</Label>
                <Input type="date" value={nextVisitDate} onChange={(e) => setNextVisitDate(e.target.value)} />
              </div>
              <Button onClick={handlePay} disabled={!selectedBookingId}>Confirm Payment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Treatments</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Paid At</TableHead>
            <TableHead>Next Visit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">{tx.booking.customer.name}</TableCell>
              <TableCell>
                {tx.booking.bookingTreatment.map(bt => bt.treatment.name).join(", ")}
              </TableCell>
              <TableCell>
                ${tx.booking.bookingTreatment.reduce((s, bt) => s + Number(bt.priceAtBooking), 0).toFixed(2)}
              </TableCell>
              <TableCell>{format(new Date(tx.paidAt), "dd MMM yyyy HH:mm")}</TableCell>
              <TableCell>
                {tx.nextVisitDate ? format(new Date(tx.nextVisitDate), "dd MMM yyyy") : "-"}
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">No transactions yet</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
