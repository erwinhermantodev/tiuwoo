import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { parse } from "pg-connection-string";

const connectionConfig = parse(process.env.DATABASE_URL!);
const pool = new pg.Pool({
  host: connectionConfig.host ?? undefined,
  port: connectionConfig.port ? parseInt(connectionConfig.port) : undefined,
  database: connectionConfig.database ?? undefined,
  user: connectionConfig.user ?? undefined,
  password: connectionConfig.password ?? undefined,
  ssl: { rejectUnauthorized: false },
  max: 10,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
