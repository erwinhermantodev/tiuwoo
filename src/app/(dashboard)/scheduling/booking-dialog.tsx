"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

type Treatment = { id: string; name: string; price: number; category: string | null };
type Staff = { id: string; name: string; role: string; commissionRate: number };
type Customer = { id: string; name: string; whatsapp: string };

type BookingTreatment = {
  id: string;
  treatmentId: string;
  staffId: string;
  priceAtBooking: number;
  discountType: string | null;
  discountAmount: number | null;
  paymentStatus: string;
  commissionAmount: number | null;
  treatment: { id: string; name: string; price: number };
  staff: { id: string; name: string };
};

type Booking = {
  id: string;
  customerId: string;
  scheduledDate: string;
  notes: string | null;
  packagePurchased: boolean;
  bookingTreatment: BookingTreatment[];
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: Booking | null;
  defaultDate: Date | null;
  treatments: Treatment[];
  staff: Staff[];
  customers: Customer[];
  onSaved: () => void;
};

export function BookingDialog({ open, onOpenChange, booking, defaultDate, treatments, staff, customers, onSaved }: Props) {
  const [customerId, setCustomerId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");
  const [packagePurchased, setPackagePurchased] = useState(false);
  const [treatmentLines, setTreatmentLines] = useState([{ treatmentId: "", staffId: "", priceAtBooking: "0", discountType: "", discountAmount: "0" }]);

  useEffect(() => {
    if (booking) {
      setCustomerId(booking.customerId);
      setScheduledDate(format(new Date(booking.scheduledDate), "yyyy-MM-dd'T'HH:mm"));
      setNotes(booking.notes || "");
      setPackagePurchased(booking.packagePurchased);
      setTreatmentLines(booking.bookingTreatment.map(bt => ({
        treatmentId: bt.treatmentId,
        staffId: bt.staffId,
        priceAtBooking: bt.priceAtBooking.toString(),
        discountType: bt.discountType || "",
        discountAmount: bt.discountAmount?.toString() || "0",
      })));
    } else if (defaultDate) {
      setScheduledDate(format(defaultDate, "yyyy-MM-dd'T'HH:mm"));
      setCustomerId("");
      setNotes("");
      setPackagePurchased(false);
      setTreatmentLines([{ treatmentId: "", staffId: "", priceAtBooking: "0", discountType: "", discountAmount: "0" }]);
    }
  }, [booking, defaultDate, open]);

  function addLine() {
    setTreatmentLines([...treatmentLines, { treatmentId: "", staffId: "", priceAtBooking: "0", discountType: "", discountAmount: "0" }]);
  }

  function updateLine(index: number, field: string, value: string) {
    const lines = [...treatmentLines];
    (lines[index] as any)[field] = value;
    if (field === "treatmentId") {
      const t = treatments.find(t => t.id === value);
      if (t) lines[index].priceAtBooking = t.price.toString();
    }
    setTreatmentLines(lines);
  }

  function removeLine(index: number) {
    setTreatmentLines(treatmentLines.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      customerId,
      scheduledDate: new Date(scheduledDate).toISOString(),
      notes,
      packagePurchased,
      bookingTreatments: treatmentLines.map((line) => ({
        treatmentId: line.treatmentId,
        staffId: line.staffId,
        priceAtBooking: parseFloat(line.priceAtBooking),
        discountType: line.discountType || null,
        discountAmount: line.discountAmount ? parseFloat(line.discountAmount) : null,
      })),
    };

    const url = booking ? `/api/bookings/${booking.id}` : "/api/bookings";
    const method = booking ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{booking ? "Edit Booking" : "New Booking"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={(v) => v && setCustomerId(v)} required>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.whatsapp})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Scheduled Date</Label>
            <Input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input type="checkbox" checked={packagePurchased} onChange={(e) => setPackagePurchased(e.target.checked)} />
              Package Purchased
            </Label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Treatments</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>+ Add</Button>
            </div>
            {treatmentLines.map((line, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Treatment</Label>
                  <Select value={line.treatmentId} onValueChange={(v) => v && updateLine(i, "treatmentId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {treatments.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name} (${t.price})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Staff</Label>
                  <Select value={line.staffId} onValueChange={(v) => v && updateLine(i, "staffId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="text-xs">Price</Label>
                  <Input type="number" step="0.01" value={line.priceAtBooking} onChange={(e) => updateLine(i, "priceAtBooking", e.target.value)} />
                </div>
                {treatmentLines.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(i)}>X</Button>
                )}
              </div>
            ))}
          </div>

          <Button type="submit">{booking ? "Update" : "Create"} Booking</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
