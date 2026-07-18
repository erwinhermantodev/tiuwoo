import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StaffTable } from "./staff-table";

export default async function StaffPage() {
  const session = await auth();
  if (session?.user?.role !== "manager") {
    redirect("/");
  }
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Staff Management</h1>
      <StaffTable
        staff={JSON.parse(JSON.stringify(staff))}
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}
