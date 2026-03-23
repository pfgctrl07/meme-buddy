import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    points: { type: Number, default: 1200 },
    eventsJoined: { type: Number, default: 0 },
    eventsCreated: { type: Number, default: 0 },
    winRate: { type: Number, default: 72 },
    achievements: { type: [String], default: [] },
    activitySeries: { type: [Number], default: [20, 26, 32, 30, 36, 44, 51] },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
