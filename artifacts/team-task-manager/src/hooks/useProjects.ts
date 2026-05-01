import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Project } from "../types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ projects: Project[] }>("/projects");
      setProjects(data.projects);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (body: {
    name: string;
    description?: string;
    dueDate?: string;
  }) => {
    const data = await api.post<{ project: Project }>("/projects", body);
    setProjects((prev) => [data.project, ...prev]);
    return data.project;
  };

  const updateProject = async (id: string, body: Partial<Project>) => {
    const data = await api.patch<{ project: Project }>(`/projects/${id}`, body);
    setProjects((prev) => prev.map((p) => (p._id === id ? data.project : p)));
    return data.project;
  };

  const deleteProject = async (id: string) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject };
}
