import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { seedDatabase } from "./services/seedService.js";

async function boot() {
  try {
    await connectDatabase();
    await seedDatabase();
    app.locals.dbReady = true;
    console.log("MongoDB connected and seed complete");
  } catch (error) {
    app.locals.dbReady = false;
    console.warn("MongoDB not available, starting API in scaffold mode");
    console.warn(error.message);
  }

  app.listen(env.port, () => {
    console.log(`Meme Buddy API listening on port ${env.port}`);
  });
}

boot().catch((error) => {
  console.error("Failed to boot API", error);
  process.exit(1);
});
