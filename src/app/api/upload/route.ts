import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["manager", "cs"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const blob = await put(`complaints/${Date.now()}-${file.name}`, file, {
    access: "public",
  });
  return NextResponse.json({ url: blob.url });
}
