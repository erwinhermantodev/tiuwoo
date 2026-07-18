import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
  throw new Error("DIRECT_URL is not set in environment");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: directUrl,
  },
});
