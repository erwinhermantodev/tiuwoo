import { getToken } from "next-auth/jwt";

export async function getServerSession(req: Request) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token
    ? {
        user: {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
        },
      }
    : null;
}
