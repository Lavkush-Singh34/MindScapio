import { useEffect, useState } from "react";
import api from "../../services/api";
import type { IClass } from "../../types";

// ─── Class Form ────────────────────────────────────────────────
const ClassForm = ({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<IClass>;
  onSave: (data: { name: string; grade: number; description: string }) => Promise<void>;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [grade, setGrade] = useState(initial?.grade ?? 1);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), grade, description: description.trim() });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {initial?._id ? "Edit Class" : "Create New Class"}
      </h3>

      <div className="space-y-4">
        {/* ── Grade ──────────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Grade <span className="text-red-400">*</span>
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            disabled={!!initial?._id}  // Grade not editable after creation
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Class {g}
              </option>
            ))}
          </select>
          {!!initial?._id && (
            <p className="text-xs text-gray-400 mt-1">
              Grade cannot be changed after creation
            </p>
          )}
        </div>

        {/* ── Name ───────────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Display Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Class 6"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
          />
        </div>

        {/* ── Description ────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description shown on class card"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 resize-none"
          />
        </div>

        {/* ── Error ──────────────────────────────────────────── */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* ── Actions ────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : initial?._id ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Class Row ─────────────────────────────────────────────────
const ClassRow = ({
  cls,
  onEdit,
  onDelete,
  onToggle,
}: {
  cls: IClass;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4 flex-wrap">
    <div className="flex items-center gap-4">
      {/* ── Grade Badge ─────────────────────────────────────── */}
      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
        <span className="text-xl font-bold text-indigo-600">{cls.grade}</span>
      </div>
      <div>
        <p className="font-semibold text-gray-800">{cls.name}</p>
        {cls.description && (
          <p className="text-xs text-gray-400 mt-0.5">{cls.description}</p>
        )}
      </div>
    </div>

    {/* ── Actions ─────────────────────────────────────────────── */}
    <div className="flex items-center gap-2">
      {/* ── Active toggle ───────────────────────────────────── */}
      <button
        onClick={onToggle}
        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${cls.isActive
            ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
            : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
          }`}
      >
        {cls.isActive ? "Active" : "Inactive"}
      </button>

      <button
        onClick={onEdit}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
      >
        ✏️ Edit
      </button>

      <button
        onClick={onDelete}
        className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-all"
      >
        🗑️ Delete
      </button>
    </div>
  </div>
);

// ─── Admin Classes Page ────────────────────────────────────────
const AdminClasses = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<IClass | null>(null);

  // ── Fetch all classes ──────────────────────────────────────
  const fetchClasses = async () => {
    try {
      const { data } = await api.get("/classes");
      setClasses(data.data);
    } catch {
      console.error("Failed to fetch classes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ── Create class ───────────────────────────────────────────
  const handleCreate = async (formData: {
    name: string;
    grade: number;
    description: string;
  }) => {
    await api.post("/classes", formData);
    setShowForm(false);
    fetchClasses();
  };

  // ── Update class ───────────────────────────────────────────
  const handleUpdate = async (formData: {
    name: string;
    grade: number;
    description: string;
  }) => {
    await api.patch(`/classes/${editingClass?._id}`, formData);
    setEditingClass(null);
    fetchClasses();
  };

  // ── Toggle active ──────────────────────────────────────────
  const handleToggle = async (cls: IClass) => {
    await api.patch(`/classes/${cls._id}`, { isActive: !cls.isActive });
    fetchClasses();
  };

  // ── Delete class ───────────────────────────────────────────
  const handleDelete = async (cls: IClass) => {
    if (!confirm(`Delete ${cls.name}? This will hide all its content.`)) return;
    await api.delete(`/classes/${cls._id}`);
    fetchClasses();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage Class 1–10
          </p>
        </div>
        {!showForm && !editingClass && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Class
          </button>
        )}
      </div>

      {/* ── Create Form ───────────────────────────────────────── */}
      {showForm && (
        <ClassForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Edit Form ─────────────────────────────────────────── */}
      {editingClass && (
        <ClassForm
          initial={editingClass}
          onSave={handleUpdate}
          onCancel={() => setEditingClass(null)}
        />
      )}

      {/* ── Classes List ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-20 animate-pulse"
            />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏫</p>
          <p>No classes yet. Create your first class!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes
            .sort((a, b) => a.grade - b.grade)
            .map((cls) => (
              <ClassRow
                key={cls._id}
                cls={cls}
                onEdit={() => {
                  setShowForm(false);
                  setEditingClass(cls);
                }}
                onDelete={() => handleDelete(cls)}
                onToggle={() => handleToggle(cls)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminClasses;
