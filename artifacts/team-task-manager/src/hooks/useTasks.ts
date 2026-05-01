import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Task } from "../types";

interface TaskFilters {
  projectId?: string;
  status?: string;
  assigneeId?: string;
}

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = (f: TaskFilters) => {
    const params = new URLSearchParams();
    if (f.projectId) params.set("projectId", f.projectId);
    if (f.status) params.set("status", f.status);
    if (f.assigneeId) params.set("assigneeId", f.assigneeId);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ tasks: Task[] }>(`/tasks${buildQuery(filters)}`);
      setTasks(data.tasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.projectId, filters.status, filters.assigneeId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (body: {
    title: string;
    description?: string;
    projectId: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
    tags?: string[];
  }) => {
    const data = await api.post<{ task: Task }>("/tasks", body);
    setTasks((prev) => [data.task, ...prev]);
    return data.task;
  };

  const updateTask = async (id: string, body: Record<string, unknown>) => {
    const data = await api.patch<{ task: Task }>(`/tasks/${id}`, body);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    return data.task;
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}
