import { connectDatabase } from "./config/db.js";
import { seedDatabase } from "./services/seedService.js";

async function runSeed() {
  await connectDatabase();
  await seedDatabase();
  console.log("Seed complete");
  process.exit(0);
}

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
