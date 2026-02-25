/**
 * Seed script — creates the first admin account.
 *
 * Usage:
 *   npx tsx src/db/seed.ts
 *
 * Set DATABASE_URL in .env.local before running.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import { admins } from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const email = "";
  const password = "";

  const passwordHash = await hash(password, 12);

  await db
    .insert(admins)
    .values({ email, passwordHash })
    .onConflictDoNothing({ target: admins.email });

  console.log(`✅ Admin seeded: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   ⚠️  Change this password immediately!`);
}

seed().catch(console.error);
