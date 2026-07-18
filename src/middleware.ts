import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const roleRoutes: Record<string, string[]> = {
  "/leads": ["manager", "cs"],
  "/scheduling": ["manager", "cs", "front_office", "staff"],
  "/transactions": ["manager", "cs", "front_office"],
  "/membership": ["manager", "cs", "front_office"],
  "/complaints": ["manager", "cs", "front_office"],
  "/staff": ["manager"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session) {
    const allowedRoles = Object.entries(roleRoutes).find(([route]) =>
      pathname.startsWith(route)
    );
    if (allowedRoles && !allowedRoles[1].includes(session.user?.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (session.user?.role === "staff" && !pathname.startsWith("/scheduling")) {
      return NextResponse.redirect(new URL("/scheduling", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
