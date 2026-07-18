import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || !["manager", "cs", "front_office"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const complaints = await prisma.complaint.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(complaints);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["manager", "cs"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const complaint = await prisma.complaint.create({ data: body });
  return NextResponse.json(complaint, { status: 201 });
}
