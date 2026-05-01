import { Request, Response } from "express";
import { User } from "../models/User";

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { name, email, role, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(avatar !== undefined && { avatar }),
    },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ user });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ message: "User deleted" });
}
