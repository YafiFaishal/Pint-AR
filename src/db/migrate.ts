import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index";

async function main() {
  console.log("⏳ Menjalankan migrasi database...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migrasi selesai.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migrasi gagal:", err);
  process.exit(1);
});
