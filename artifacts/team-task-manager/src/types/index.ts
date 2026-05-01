export type UserRole = "admin" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export type ProjectStatus = "active" | "completed" | "on-hold" | "archived";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  owner: User;
  members: User[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: { _id: string; name: string } | string;
  assignee?: User;
  createdBy: { _id: string; name: string; email: string };
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  byStatus: {
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
  assignedToMe: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
