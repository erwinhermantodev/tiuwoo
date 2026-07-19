import { getServerSession } from "@/lib/auth.edge";
import { NextRequest, NextResponse } from "next/server";

const roleRoutes: Record<string, string[]> = {
  "/leads": ["manager", "cs"],
  "/scheduling": ["manager", "cs", "front_office", "staff"],
  "/transactions": ["manager", "cs", "front_office"],
  "/membership": ["manager", "cs", "front_office"],
  "/complaints": ["manager", "cs", "front_office"],
  "/staff": ["manager"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getServerSession(req as unknown as Request);

  if (!session && pathname !== "/login") {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    const allowedRoles = Object.entries(roleRoutes).find(([route]) =>
      pathname.startsWith(route)
    );
    if (allowedRoles && !allowedRoles[1].includes(session.user?.role as string)) {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
    if (session.user?.role === "staff" && !pathname.startsWith("/scheduling")) {
      const schedulingUrl = req.nextUrl.clone();
      schedulingUrl.pathname = "/scheduling";
      return NextResponse.redirect(schedulingUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
