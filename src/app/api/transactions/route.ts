import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || !["manager", "cs", "front_office"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const transactions = await prisma.transaction.findMany({
    include: {
      booking: {
        include: {
          customer: true,
          bookingTreatment: { include: { treatment: true } },
        },
      },
    },
    orderBy: { paidAt: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["manager", "front_office"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { bookingId, paidAt, nextVisitDate, editNotes } = body;

  const transaction = await prisma.transaction.create({
    data: {
      bookingId,
      paidAt: new Date(paidAt),
      nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
      editedById: session.user!.id,
      editNotes,
    },
  });

  await prisma.bookingTreatment.updateMany({
    where: { bookingId, paymentStatus: "unpaid" },
    data: { paymentStatus: "paid" },
  });

  return NextResponse.json(transaction, { status: 201 });
}
