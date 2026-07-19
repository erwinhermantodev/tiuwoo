"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ? "Invalid credentials" : "";
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.csrfToken))
      .catch(() => {});
  }, []);

  return (
    <form
      action="/api/auth/callback/credentials?callbackUrl=/dashboard"
      method="POST"
    >
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="callbackUrl" value="/dashboard" />
      <div className="mb-3.5">
        <label className="block text-[12px] font-semibold text-[#4A4038] mb-1.5" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@tiuwoo.com"
          className="w-full font-[family-name:var(--font-ui)] text-[13.5px] px-3 py-2.5 rounded-[6px] border border-[#B8ABA0] bg-white text-[#2B2420] outline-none focus:border-[#8E4A50] focus:ring-3 focus:ring-[#F6E3E1]"
        />
      </div>
      <div className="mb-3.5">
        <label className="block text-[12px] font-semibold text-[#4A4038] mb-1.5" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full font-[family-name:var(--font-ui)] text-[13.5px] px-3 py-2.5 rounded-[6px] border border-[#B8ABA0] bg-white text-[#2B2420] outline-none focus:border-[#8E4A50] focus:ring-3 focus:ring-[#F6E3E1]"
        />
      </div>
      {error && <p className="text-[#C97B4E] text-xs mb-3">{error}</p>}
      <button
        type="submit"
        className="w-full flex justify-center bg-[#8E4A50] text-[#FBF3F1] font-semibold text-[12.5px] py-2.5 px-4 rounded-[999px] border-none cursor-pointer mt-1.5 hover:bg-[#8E4A50]/80 transition-colors"
      >
        Sign in
      </button>
    </form>
  );
}
