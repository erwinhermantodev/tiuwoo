import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MembershipTable } from "./membership-table";

export default async function MembershipPage() {
  const session = await auth();
  if (!session || !["manager", "cs", "front_office"].includes(session.user?.role as string)) {
    redirect("/");
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Membership</h1>
      <MembershipTable memberships={JSON.parse(JSON.stringify(memberships))} />
    </div>
  );
}
