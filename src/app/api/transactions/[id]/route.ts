import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["manager", "front_office"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const { paidAt, nextVisitDate, editNotes } = body;

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      paidAt: paidAt ? new Date(paidAt) : undefined,
      nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
      editedById: session.user!.id,
      editNotes,
    },
  });
  return NextResponse.json(transaction);
}
