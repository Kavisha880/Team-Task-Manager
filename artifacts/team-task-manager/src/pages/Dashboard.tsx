import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../hooks/useProjects";
import { useTasks } from "../hooks/useTasks";
import { api } from "../lib/api";
import { DashboardStats } from "../types";
import Badge from "../components/shared/Badge";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api
      .get<{ stats: DashboardStats }>("/tasks/stats")
      .then((d) => setStats(d.stats))
      .catch(() => {});
  }, [tasks]);

  const recentProjects = projects.slice(0, 4);
  const recentTasks = tasks.slice(0, 5);

  const statCards = stats
    ? [
        { label: "Total Tasks", value: stats.total, color: "bg-blue-50 text-blue-700 border-blue-100" },
        { label: "To Do", value: stats.byStatus.todo, color: "bg-gray-50 text-gray-700 border-gray-200" },
        { label: "In Progress", value: stats.byStatus.inProgress, color: "bg-orange-50 text-orange-700 border-orange-100" },
        { label: "Done", value: stats.byStatus.done, color: "bg-green-50 text-green-700 border-green-100" },
      ]
    : [];

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5 capitalize">
          Role: {user?.role} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats
          ? statCards.map((item) => (
              <div key={item.label} className={`rounded-xl border p-4 ${item.color}`}>
                <p className="text-3xl font-bold">{item.value}</p>
                <p className="text-xs font-medium mt-1 opacity-80">{item.label}</p>
              </div>
            ))
          : [1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 h-20 animate-pulse" />
            ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Projects</h2>
            <Link href="/projects" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {projectsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />)}
            </div>
          ) : recentProjects.length === 0 ? (
            <p className="text-sm text-gray-400">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((p) => (
                <Link key={p._id} href="/projects">
                  <div className="flex items-center justify-between rounded-lg hover:bg-gray-50 px-2 py-1.5 -mx-2 transition cursor-pointer">
                    <span className="text-sm text-gray-800 font-medium truncate">{p.name}</span>
                    <Badge value={p.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
            <Link href="/tasks" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />)}
            </div>
          ) : recentTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No tasks yet.</p>
          ) : (
            <div className="space-y-1">
              {recentTasks.map((t) => (
                <div key={t._id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2">
                  <span className={`flex-1 text-sm truncate ${t.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {t.title}
                  </span>
                  <Badge value={t.status} />
                  {t.dueDate && (
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(t.dueDate)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
