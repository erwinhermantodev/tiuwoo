import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const staff = await prisma.staff.create({ data: body });
  return NextResponse.json(staff, { status: 201 });
}
