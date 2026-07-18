import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || !["manager", "cs"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const leads = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["manager", "cs"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const lead = await prisma.customer.create({ data: body });
  return NextResponse.json(lead, { status: 201 });
}
