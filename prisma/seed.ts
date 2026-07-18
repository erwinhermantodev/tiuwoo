import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt-ts";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@tiuwlo.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@tiuwlo.com",
      passwordHash: password,
      role: "manager",
    },
  });
  console.log("Seed done: admin@tiuwlo.com / admin123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
