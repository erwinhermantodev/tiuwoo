import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export type NotificationItem = {
  id: string;
  type: "complaint" | "member" | "unpaid" | "lead";
  message: string;
  subtitle: string;
  href: string;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user?.role as string;
  const name = session.user?.name || "User";

  const canOps = ["manager", "cs", "front_office", "staff"].includes(role);
  const canRel = ["manager", "cs", "front_office"].includes(role);
  const canLeads = ["manager", "cs"].includes(role);

  const [
    leadCount,
    todayBookingCount,
    complaintCount,
    recentComplaints,
    recentMembers,
    unpaidBookings,
    newLeads,
  ] = await Promise.all([
    canLeads ? prisma.customer.count() : Promise.resolve(undefined),
    canOps
      ? prisma.booking.count({
          where: {
            scheduledDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(24, 0, 0, 0)),
            },
          },
        })
      : Promise.resolve(undefined),
    canRel ? prisma.complaint.count({ where: { resolution: null } }) : Promise.resolve(undefined),
    canRel
      ? prisma.complaint.findMany({
          include: { customer: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
    canRel
      ? prisma.membership.findMany({
          include: { customer: true },
          orderBy: { memberSince: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
    canOps
      ? prisma.bookingTreatment.findMany({
          where: { paymentStatus: "unpaid", booking: { transaction: null } },
          include: { booking: { include: { customer: true } }, treatment: true },
          orderBy: { booking: { scheduledDate: "desc" } },
          take: 3,
        })
      : Promise.resolve([]),
    canLeads
      ? prisma.customer.findMany({
          where: { status: "new", bookingSuccess: false },
          orderBy: { createdAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
  ]);

  const notifications: NotificationItem[] = [
    ...recentComplaints.map((c) => ({
      id: `complaint-${c.id}`,
      type: "complaint" as const,
      message: `Complaint filed for ${c.customer.name}`,
      subtitle: c.resolution ? "Resolved" : "Unresolved",
      href: "/complaints",
    })),
    ...recentMembers.map((m) => ({
      id: `member-${m.id}`,
      type: "member" as const,
      message: `${m.customer.name} hit member threshold`,
      subtitle: new Date(m.memberSince).toLocaleDateString(),
      href: "/membership",
    })),
    ...unpaidBookings.map((bt) => ({
      id: `unpaid-${bt.id}`,
      type: "unpaid" as const,
      message: `${bt.booking.customer.name} — ${bt.treatment.name}`,
      subtitle: "Unpaid",
      href: "/transactions",
    })),
    ...newLeads.map((l) => ({
      id: `lead-${l.id}`,
      type: "lead" as const,
      message: `New lead: ${l.name}`,
      subtitle: l.acquisitionChannel || "No channel",
      href: "/leads",
    })),
  ];

  const roleLabel = role === "manager" ? "Manager" : role === "cs" ? "Customer Service" : role === "front_office" ? "Front Desk" : "Staff";

  return (
    <div className="flex h-screen">
      <Sidebar
        role={role}
        counts={{ leads: leadCount, scheduling: todayBookingCount, complaints: complaintCount }}
        userName={name}
        userRole={roleLabel}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar name={name} role={roleLabel} notifications={notifications} />
        <main className="flex-1 overflow-y-auto p-8 bg-[#FBF6F2]">{children}</main>
      </div>
    </div>
  );
}
