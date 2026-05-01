import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";
import Modal from "../components/shared/Modal";
import TaskForm from "../components/shared/TaskForm";
import Badge from "../components/shared/Badge";
import EmptyState from "../components/shared/EmptyState";
import { Task } from "../types";

const STATUS_OPTIONS = ["", "todo", "in-progress", "review", "done"];
const STATUS_LABELS: Record<string, string> = {
  "": "All Statuses",
  "todo": "To Do",
  "in-progress": "In Progress",
  "review": "Review",
  "done": "Done",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const overdue = d < now;
  return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), overdue };
}

function getProjectName(task: Task): string {
  if (!task.project) return "—";
  if (typeof task.project === "string") return task.project;
  return task.project.name;
}

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState("");
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks({ status: statusFilter || undefined });
  const { projects } = useProjects();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleCreate = async (data: {
    title: string;
    description: string;
    projectId: string;
    priority: string;
    dueDate: string;
  }) => {
    await createTask({
      title: data.title,
      description: data.description || undefined,
      projectId: data.projectId,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
    });
    setShowCreate(false);
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    setUpdatingStatus(task._id);
    try {
      await updateTask(task._id, { status: newStatus });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget._id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 h-20 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={statusFilter ? "No tasks match this filter." : "Create your first task to get started."}
          action={!statusFilter ? { label: "+ New Task", onClick: () => setShowCreate(true) } : undefined}
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const due = task.dueDate ? formatDate(task.dueDate) : null;
            return (
              <div
                key={task._id}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-sm transition"
              >
                {/* Status selector */}
                <select
                  value={task.status}
                  disabled={updatingStatus === task._id}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer min-w-[100px]"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>

                {/* Title + project */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{getProjectName(task)}</p>
                </div>

                {/* Priority */}
                <Badge value={task.priority} type="priority" />

                {/* Due date */}
                {due && (
                  <span className={`text-xs font-medium ${due.overdue && task.status !== "done" ? "text-red-500" : "text-gray-400"}`}>
                    {due.label}
                  </span>
                )}

                {/* Assignee avatar */}
                {task.assignee && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0" title={task.assignee.name}>
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(task)}
                  className="text-gray-300 hover:text-red-500 transition text-base flex-shrink-0"
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <TaskForm
          projects={projects}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Create Task"
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Task" maxWidth="max-w-sm">
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
