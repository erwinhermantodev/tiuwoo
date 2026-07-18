import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || !["manager", "cs", "front_office"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const customers = await prisma.customer.findMany({
    include: {
      membership: true,
      bookings: {
        include: {
          bookingTreatment: true,
          transaction: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const memberships = customers.map((customer) => {
    const totalSpent = customer.bookings
      .filter((b) => b.transaction)
      .flatMap((b) => b.bookingTreatment)
      .filter((bt) => bt.paymentStatus === "paid")
      .reduce((sum, bt) => sum + Number(bt.priceAtBooking), 0);

    return {
      customerId: customer.id,
      customerName: customer.name,
      customerWhatsapp: customer.whatsapp,
      totalSpent,
      memberSince: customer.membership?.memberSince || null,
      thresholdMetAt: customer.membership?.thresholdMetAt || null,
    };
  });

  return NextResponse.json(memberships);
}
