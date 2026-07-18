import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SchedulingCalendar } from "./scheduling-calendar";

export default async function SchedulingPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user?.role as string;

  const bookings = await prisma.booking.findMany({
    include: { customer: true, bookingTreatment: { include: { treatment: true, staff: true } } },
    orderBy: { scheduledDate: "asc" },
  });
  const treatments = await prisma.treatment.findMany();
  const staff = await prisma.staff.findMany();
  const customers = await prisma.customer.findMany();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scheduling</h1>
      <SchedulingCalendar
        bookings={JSON.parse(JSON.stringify(bookings))}
        treatments={JSON.parse(JSON.stringify(treatments))}
        staff={JSON.parse(JSON.stringify(staff))}
        customers={JSON.parse(JSON.stringify(customers))}
        role={role}
      />
    </div>
  );
}
