"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { BookingDialog } from "./booking-dialog";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  customer: { id: string; name: string; whatsapp: string };
  bookingTreatment: BookingTreatment[];
};

type Treatment = { id: string; name: string; price: number; category: string | null };
type Staff = { id: string; name: string; role: string; commissionRate: number };
type Customer = { id: string; name: string; whatsapp: string };

type Props = {
  bookings: Booking[];
  treatments: Treatment[];
  staff: Staff[];
  customers: Customer[];
  role: string;
};

export function SchedulingCalendar({ bookings, treatments, staff, customers, role }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const canEdit = ["manager", "cs", "front_office"].includes(role);

  const events: Event[] = bookings.map((b) => ({
    id: b.id,
    title: `${b.customer.name}${b.bookingTreatment.length ? ` - ${b.bookingTreatment.map(bt => bt.treatment.name).join(", ")}` : ""}`,
    start: new Date(b.scheduledDate),
    end: new Date(b.scheduledDate),
    resource: b,
  }));

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    if (!canEdit) return;
    setSelectedDate(start);
    setSelectedBooking(null);
    setDialogOpen(true);
  }, [canEdit]);

  const handleSelectEvent = useCallback((event: Event) => {
    if (!canEdit) return;
    setSelectedBooking(event.resource as Booking);
    setSelectedDate(null);
    setDialogOpen(true);
  }, [canEdit]);

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        views={["month", "week", "day"]}
        defaultView="month"
      />
      <BookingDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) { setSelectedBooking(null); setSelectedDate(null); } }}
        booking={selectedBooking}
        defaultDate={selectedDate}
        treatments={treatments}
        staff={staff}
        customers={customers}
        onSaved={() => { setDialogOpen(false); setSelectedBooking(null); setSelectedDate(null); router.refresh(); }}
      />
    </div>
  );
}
