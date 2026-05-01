import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { DashboardStats } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api
      .get<{ stats: DashboardStats }>("/tasks/stats")
      .then((d) => setStats(d.stats))
      .catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome back, {user?.name}
      </h1>
      <p className="text-sm text-gray-500 mb-6 capitalize">
        Role: {user?.role}
      </p>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Tasks", value: stats.total, color: "bg-blue-50 text-blue-700" },
            { label: "To Do", value: stats.byStatus.todo, color: "bg-yellow-50 text-yellow-700" },
            { label: "In Progress", value: stats.byStatus.inProgress, color: "bg-orange-50 text-orange-700" },
            { label: "Done", value: stats.byStatus.done, color: "bg-green-50 text-green-700" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl p-4 ${item.color}`}
            >
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="text-sm font-medium mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500 text-sm">
          Use the navigation to manage your projects and tasks.
        </p>
      </div>
    </div>
  );
}
