import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadsTable } from "./leads-table";

export default async function LeadsPage() {
  const session = await auth();
  if (!session || !["manager", "cs"].includes(session.user?.role as string)) {
    redirect("/");
  }
  const leads = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leads / Customer Profiles</h1>
      <LeadsTable leads={JSON.parse(JSON.stringify(leads))} role={session.user?.role as string} />
    </div>
  );
}
