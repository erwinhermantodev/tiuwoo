import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/leads");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF6F2]">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="font-[family-name:var(--font-display)] italic text-4xl font-medium text-center text-[#2B2420]">Tiuwoo</h1>
        <p className="text-[#4A4038] text-center text-sm">
          Sign in to your account
        </p>
        <Suspense fallback={<div className="text-center text-sm text-[#4A4038]">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
