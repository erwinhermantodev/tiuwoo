import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["manager", "cs", "front_office"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const { bookingTreatments, ...bookingData } = body;

  if (bookingTreatments) {
    await prisma.bookingTreatment.deleteMany({ where: { bookingId: id } });
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      ...bookingData,
      ...(bookingTreatments && {
        bookingTreatment: { create: bookingTreatments },
      }),
    },
    include: {
      customer: true,
      bookingTreatment: { include: { treatment: true, staff: true } },
    },
  });
  return NextResponse.json(booking);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
