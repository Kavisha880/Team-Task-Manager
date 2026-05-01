import { Request, Response } from "express";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";

function sanitizeUser(user: InstanceType<typeof User>) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: "Email already registered" });
    return;
  }

  const user = await User.create({ name, email, password, role: role || "member" });
  const token = signToken({ id: String(user._id), role: user.role });

  res.status(201).json({ token, user: sanitizeUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = signToken({ id: String(user._id), role: user.role });
  res.json({ token, user: sanitizeUser(user) });
}

export async function getMe(req: Request & { user?: { id: string; role: string } }, res: Response): Promise<void> {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user: sanitizeUser(user) });
}
