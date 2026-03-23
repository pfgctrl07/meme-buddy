import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function createToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, env.jwtSecret, {
    expiresIn: "7d",
  });
}
