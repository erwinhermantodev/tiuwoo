import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ComplaintsTable } from "./complaints-table";

export default async function ComplaintsPage() {
  const session = await auth();
  if (!session || !["manager", "cs", "front_office"].includes(session.user?.role as string)) {
    redirect("/");
  }
  const complaints = await prisma.complaint.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Complaints</h1>
      <ComplaintsTable
        complaints={JSON.parse(JSON.stringify(complaints))}
        customers={JSON.parse(JSON.stringify(customers))}
        role={session.user?.role as string}
      />
    </div>
  );
}
