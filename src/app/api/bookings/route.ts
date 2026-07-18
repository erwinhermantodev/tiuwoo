import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const bookings = await prisma.booking.findMany({
    include: {
      customer: true,
      bookingTreatment: { include: { treatment: true, staff: true } },
    },
    orderBy: { scheduledDate: "asc" },
  });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["manager", "cs", "front_office"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { bookingTreatments, ...bookingData } = body;
  const booking = await prisma.booking.create({
    data: {
      ...bookingData,
      createdById: session.user!.id,
      bookingTreatment: {
        create: bookingTreatments,
      },
    },
    include: {
      customer: true,
      bookingTreatment: { include: { treatment: true, staff: true } },
    },
  });
  return NextResponse.json(booking, { status: 201 });
}
