import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TransactionsTable } from "./transaction-table";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session || !["manager", "cs", "front_office"].includes(session.user?.role as string)) {
    redirect("/");
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
  const unpaidBookings = await prisma.booking.findMany({
    where: {
      bookingTreatment: { some: { paymentStatus: "unpaid" } },
      transaction: null,
    },
    include: {
      customer: true,
      bookingTreatment: { include: { treatment: true, staff: true } },
    },
    orderBy: { scheduledDate: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <TransactionsTable
        transactions={JSON.parse(JSON.stringify(transactions))}
        unpaidBookings={JSON.parse(JSON.stringify(unpaidBookings))}
        role={session.user?.role as string}
      />
    </div>
  );
}
