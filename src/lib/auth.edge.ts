import { decode } from "next-auth/jwt";

export async function getServerSession(req: Request) {
  const token = await decode({
    token: getCookie(req, "next-auth.session-token"),
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "",
    salt: "next-auth.session-token",
  });
  if (!token) return null;

  return {
    user: {
      id: token.id as string,
      email: token.email as string,
      name: token.name as string,
      role: token.role as string,
    },
  };
}

function getCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return undefined;
  for (const c of cookieHeader.split(";")) {
    const [key, ...val] = c.trim().split("=");
    if (key === name) return val.join("=");
  }
  return undefined;
}
