import { Request, Response } from "express";
import { Project } from "../models/Project";
import { AuthRequest } from "../middlewares/auth";

export async function listProjects(req: AuthRequest, res: Response): Promise<void> {
  const filter =
    req.user?.role === "admin"
      ? {}
      : { members: req.user?.id };

  const projects = await Project.find(filter)
    .populate("owner", "name email avatar")
    .populate("members", "name email avatar")
    .sort({ createdAt: -1 });

  res.json({ projects });
}

export async function getProject(req: AuthRequest, res: Response): Promise<void> {
  const project = await Project.findById(req.params.id)
    .populate("owner", "name email avatar")
    .populate("members", "name email avatar");

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  res.json({ project });
}

export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  const { name, description, dueDate, memberIds } = req.body;

  const project = await Project.create({
    name,
    description,
    dueDate,
    owner: req.user?.id,
    members: memberIds || [],
  });

  await project.populate("owner", "name email avatar");
  await project.populate("members", "name email avatar");

  res.status(201).json({ project });
}

export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  const { name, description, status, dueDate, memberIds } = req.body;

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate }),
      ...(memberIds !== undefined && { members: memberIds }),
    },
    { new: true, runValidators: true },
  )
    .populate("owner", "name email avatar")
    .populate("members", "name email avatar");

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  res.json({ project });
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }
  res.json({ message: "Project deleted" });
}
