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

  const doctors = staff.filter((s) => s.role === "doctor").length;
  const beauticians = staff.filter((s) => s.role === "beautician").length;
  const unassigned = staff.filter((s) => !s.role).length;
  const counts = [`${staff.length} team members`];
  if (doctors) counts.push(`${doctors} doctor${doctors > 1 ? "s" : ""}`);
  if (beauticians) counts.push(`${beauticians} beautician${beauticians > 1 ? "s" : ""}`);
  if (unassigned) counts.push(`${unassigned} unassigned`);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-medium">Staff management</h1>
      </div>
      <p className="text-[13px] text-[#4A4038] mb-6">{counts.join(" · ")}</p>
      <StaffTable
        staff={JSON.parse(JSON.stringify(staff))}
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}
