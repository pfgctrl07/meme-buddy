import cors from "cors";
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import discoverRoutes from "./routes/discoverRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { env } from "./config/env.js";

export const app = express();
app.locals.dbReady = false;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowedOrigin =
        env.allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("https://localhost:");

      if (isAllowedOrigin) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "Meme Buddy API",
    status: "running",
    dbReady: app.locals.dbReady,
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "meme-buddy-api", dbReady: app.locals.dbReady });
});

app.use((req, res, next) => {
  if (!app.locals.dbReady && req.path.startsWith("/api")) {
    return res.status(503).json({
      message: "Database not connected yet. Start MongoDB to enable data routes.",
    });
  }

  return next();
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/profile", profileRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});
