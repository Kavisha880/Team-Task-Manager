import { useState } from "react";
import { Link } from "wouter";
import { useProjects } from "../hooks/useProjects";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/shared/Modal";
import ProjectForm from "../components/shared/ProjectForm";
import Badge from "../components/shared/Badge";
import EmptyState from "../components/shared/EmptyState";
import { Project } from "../types";

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Projects() {
  const { user } = useAuth();
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (data: { name: string; description: string; dueDate: string }) => {
    await createProject({ name: data.name, description: data.description || undefined, dueDate: data.dueDate || undefined });
    setShowCreate(false);
  };

  const handleEdit = async (data: { name: string; description: string; dueDate: string }) => {
    if (!editTarget) return;
    await updateProject(editTarget._id, { name: data.name, description: data.description, dueDate: data.dueDate || undefined });
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget._id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 h-36 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing your team's work."
          action={{ label: "+ New Project", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project._id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <Link href={`/projects/${project._id}`}>
                    <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer transition">
                      {project.name}
                    </h3>
                  </Link>
                </div>
                <Badge value={project.status} />
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{project.members.length} member{project.members.length !== 1 ? "s" : ""}</span>
                {project.dueDate && (
                  <>
                    <span>·</span>
                    <span>Due {formatDate(project.dueDate)}</span>
                  </>
                )}
              </div>
              {(user?.role === "admin" || project.owner.id === user?.id) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setEditTarget(project)}
                    className="text-xs text-gray-500 hover:text-blue-600 font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitLabel="Create Project" />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Project">
        {editTarget && (
          <ProjectForm
            initial={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project" maxWidth="max-w-sm">
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
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
