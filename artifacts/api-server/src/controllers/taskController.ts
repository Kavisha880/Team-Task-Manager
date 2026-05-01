import { Request, Response } from "express";
import { Task } from "../models/Task";
import { AuthRequest } from "../middlewares/auth";

export async function listTasks(req: AuthRequest, res: Response): Promise<void> {
  const { projectId, status, assigneeId } = req.query;

  const filter: Record<string, unknown> = {};
  if (projectId) filter.project = projectId;
  if (status) filter.status = status;
  if (assigneeId) filter.assignee = assigneeId;

  const tasks = await Task.find(filter)
    .populate("assignee", "name email avatar")
    .populate("createdBy", "name email")
    .populate("project", "name")
    .sort({ createdAt: -1 });

  res.json({ tasks });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const task = await Task.findById(req.params.id)
    .populate("assignee", "name email avatar")
    .populate("createdBy", "name email")
    .populate("project", "name");

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.json({ task });
}

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  const { title, description, priority, projectId, assigneeId, dueDate, tags } = req.body;

  const task = await Task.create({
    title,
    description,
    priority,
    project: projectId,
    assignee: assigneeId || undefined,
    createdBy: req.user?.id,
    dueDate,
    tags: tags || [],
  });

  await task.populate("assignee", "name email avatar");
  await task.populate("createdBy", "name email");
  await task.populate("project", "name");

  res.status(201).json({ task });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const { title, description, status, priority, assigneeId, dueDate, tags } = req.body;

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(assigneeId !== undefined && { assignee: assigneeId || null }),
      ...(dueDate !== undefined && { dueDate }),
      ...(tags !== undefined && { tags }),
    },
    { new: true, runValidators: true },
  )
    .populate("assignee", "name email avatar")
    .populate("createdBy", "name email")
    .populate("project", "name");

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.json({ task });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  res.json({ message: "Task deleted" });
}

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  const [total, todo, inProgress, review, done] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: "todo" }),
    Task.countDocuments({ status: "in-progress" }),
    Task.countDocuments({ status: "review" }),
    Task.countDocuments({ status: "done" }),
  ]);

  const myTasks = await Task.countDocuments({ assignee: req.user?.id });

  res.json({
    stats: {
      total,
      byStatus: { todo, inProgress, review, done },
      assignedToMe: myTasks,
    },
  });
}
