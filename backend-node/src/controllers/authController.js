import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { createToken } from "../services/tokenService.js";

export async function register(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    achievements: ["Fresh Operator"],
  });

  return res.status(201).json({
    token: createToken(user),
    user: serializeUser(user),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    token: createToken(user),
    user: serializeUser(user),
  });
}

export async function me(req, res) {
  return res.json({ user: serializeUser(req.user) });
}

function serializeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    points: user.points,
  };
}
