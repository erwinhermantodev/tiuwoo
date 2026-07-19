import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Pill } from "@/components/ui/badge";
import { format } from "date-fns";

function startOfDay(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(d: Date) {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getStatusPill(status: string) {
  if (status === "paid") return <Pill color="sage">Paid</Pill>;
  if (status === "unpaid") return <Pill color="clay">Unpaid</Pill>;
  return <Pill color="taupe">Booked</Pill>;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user?.role as string;

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [
    todayBookingsCount,
    unpaidCount,
    newMembersCount,
    openComplaintsCount,
    todayBookings,
    recentComplaints,
    recentMembers,
  ] = await Promise.all([
    prisma.booking.count({
      where: { scheduledDate: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.bookingTreatment.count({
      where: {
        paymentStatus: "unpaid",
        booking: { transaction: null },
      },
    }),
    prisma.membership.count({
      where: { memberSince: { gte: weekStart } },
    }),
    prisma.complaint.count({
      where: { resolution: null },
    }),
    prisma.booking.findMany({
      where: { scheduledDate: { gte: todayStart, lte: todayEnd } },
      include: {
        customer: true,
        bookingTreatment: {
          include: { treatment: true, staff: true },
        },
      },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.complaint.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.membership.findMany({
      include: { customer: true },
      orderBy: { memberSince: "desc" },
      take: 3,
    }),
  ]);

  const stats = [
    { label: "Today's bookings", value: todayBookingsCount, delta: null },
    { label: "Unpaid transactions", value: unpaidCount, delta: `Rp ${(unpaidCount * 350000).toLocaleString()} outstanding` },
    { label: "New members", value: newMembersCount, delta: newMembersCount > 0 ? "Threshold hit this week" : null },
    { label: "Open complaints", value: openComplaintsCount, delta: openComplaintsCount > 0 ? "Needs attention" : null },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3.5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E6DAD3] rounded-[10px] p-4"
          >
            <p className="text-[11.5px] text-[#B8ABA0] mb-2">{stat.label}</p>
            <p className="font-[family-name:var(--font-display)] text-[26px] leading-none">{stat.value}</p>
            {stat.delta && (
              <p className="font-[family-name:var(--font-mono)] text-[11px] mt-1.5 text-[#4A4038]">
                {stat.delta}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-4">
        <div className="bg-white border border-[#E6DAD3] rounded-[10px] p-5">
          <p className="font-[family-name:var(--font-display)] text-[16px] mb-3.5">
            Today, {format(today, "EEEE MMM d")}
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[10.5px] font-semibold tracking-[0.05em] uppercase text-[#B8ABA0] pb-2.5 pr-3 border-b border-[#E6DAD3]">Time</th>
                <th className="text-left text-[10.5px] font-semibold tracking-[0.05em] uppercase text-[#B8ABA0] pb-2.5 pr-3 border-b border-[#E6DAD3]">Customer</th>
                <th className="text-left text-[10.5px] font-semibold tracking-[0.05em] uppercase text-[#B8ABA0] pb-2.5 pr-3 border-b border-[#E6DAD3]">Treatment</th>
                <th className="text-left text-[10.5px] font-semibold tracking-[0.05em] uppercase text-[#B8ABA0] pb-2.5 pr-3 border-b border-[#E6DAD3]">Staff</th>
                <th className="text-left text-[10.5px] font-semibold tracking-[0.05em] uppercase text-[#B8ABA0] pb-2.5 border-b border-[#E6DAD3]">Status</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.map((b) => {
                const bt = b.bookingTreatment[0];
                return (
                  <tr key={b.id} className="hover:bg-[#F6E3E1] transition-colors">
                    <td className="py-3 pr-3 border-b border-[#E6DAD3] font-[family-name:var(--font-mono)] text-[12.5px]">{format(new Date(b.scheduledDate), "HH:mm")}</td>
                    <td className="py-3 pr-3 border-b border-[#E6DAD3] text-[13px]">{b.customer.name}</td>
                    <td className="py-3 pr-3 border-b border-[#E6DAD3] text-[13px]">{bt?.treatment.name || "-"}</td>
                    <td className="py-3 pr-3 border-b border-[#E6DAD3] text-[13px]">{bt?.staff.name || "-"}</td>
                    <td className="py-3 border-b border-[#E6DAD3]">{bt ? getStatusPill(bt.paymentStatus) : null}</td>
                  </tr>
                );
              })}
              {todayBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[13px] text-[#4A4038]">
                    No bookings scheduled for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-[#E6DAD3] rounded-[10px] p-5">
          <p className="font-[family-name:var(--font-display)] text-[16px] mb-3.5">Recent activity</p>
          <div className="space-y-0">
            {recentComplaints.map((c) => (
              <div key={c.id} className="flex gap-2.5 py-2 border-b border-[#E6DAD3] text-[12.5px] last:border-b-0">
                <div className="size-[6px] rounded-full bg-[#8E4A50] mt-[5px] shrink-0" />
                <div>
                  Complaint filed for {c.customer.name}
                  <div className="text-[11px] text-[#B8ABA0]">{format(new Date(c.createdAt), "HH:mm '·' MMM d")}</div>
                </div>
              </div>
            ))}
            {recentMembers.filter(m => m.memberSince >= weekStart).map((m) => (
              <div key={m.id} className="flex gap-2.5 py-2 border-b border-[#E6DAD3] text-[12.5px] last:border-b-0">
                <div className="size-[6px] rounded-full bg-[#4E5C43] mt-[5px] shrink-0" />
                <div>
                  {m.customer.name} hit member threshold
                  <div className="text-[11px] text-[#B8ABA0]">{format(new Date(m.memberSince), "HH:mm '·' MMM d")}</div>
                </div>
              </div>
            ))}
            {recentComplaints.length === 0 && recentMembers.filter(m => m.memberSince >= weekStart).length === 0 && (
              <div className="py-4 text-center text-[13px] text-[#4A4038]">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
