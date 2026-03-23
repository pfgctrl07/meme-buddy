import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/meme-buddy",
  jwtSecret: process.env.JWT_SECRET || "meme-buddy-secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  allowedOrigins,
};
