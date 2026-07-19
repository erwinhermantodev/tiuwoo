import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hash } from "bcrypt-ts";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
