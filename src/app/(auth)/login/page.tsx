import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <div
        className="flex-1 flex flex-col justify-between p-12 text-[#FBF3F1]"
        style={{
          background: "radial-gradient(circle at 25% 22%, #D98C93 0%, #8E4A50 60%, #6E3439 100%)",
        }}
      >
        <div
          className="size-11 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(251,243,241,0.16)",
          }}
        >
          <span className="font-[family-name:var(--font-display)] italic font-semibold text-[19px]">柳</span>
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] italic text-[24px] leading-[1.3] max-w-[320px]">
            &ldquo;Klinik kecantikan ala Korea, tanpa kecanduan.&rdquo;
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.08em] uppercase opacity-70 mt-3.5">
            Dipati Ukur, Bandung
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-12 bg-[#FBF6F2]">
        <div className="w-full max-w-[300px]">
          <h3 className="font-[family-name:var(--font-display)] text-[24px] mb-1.5">Welcome back</h3>
          <p className="text-[13px] text-[#4A4038] mb-6">Sign in to manage today&apos;s bookings.</p>
          <Suspense fallback={<div className="text-center text-sm text-[#4A4038]">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
