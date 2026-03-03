import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ArrowRightCircle, Users } from "lucide-react";

const API_BASE = "http://localhost:5000";

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API: GET /api/classes (with createdBy for teacher) — load list of classes for My Classes page
  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const url =
        user.role === "teacher" && user.id
          ? `${API_BASE}/api/classes?createdBy=${user.id}`
          : `${API_BASE}/api/classes`;
      const res = await fetch(url);
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Failed to load classes");
        setClasses([]);
        return;
      }
      setClasses(result.classes || []);
    } catch (err) {
      console.error("Fetch classes error:", err);
      setError("Network error. Please try again.");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Event: delete class — call DELETE /api/classes/:id then remove from local state
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/classes/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "Failed to delete class");
        return;
      }
      setClasses((prev) => prev.filter((cls) => cls._id !== id));
    } catch (err) {
      console.error("Delete class error:", err);
      alert("Network error. Please try again.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">My Classes</h1>
        <div className="text-center text-slate-400 py-10">Loading classes…</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Classes</h1>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
      )}

      {classes.length === 0 ? (
        <div className="text-center text-slate-400 py-10">
          No classes found. Create a new class to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl overflow-hidden hover:border-cyan-600/40 transition group"
            >
              {cls.cover ? (
                <div className="aspect-video bg-[#1f1830]">
                  <img
                    src={`${API_BASE}${cls.cover}`}
                    alt={cls.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-[#1f1830] flex items-center justify-center text-slate-500 text-sm">
                  No cover
                </div>
              )}
              <div className="p-5 flex flex-col gap-3">
                <h2 className="text-lg font-semibold group-hover:text-cyan-300 transition">
                  {cls.title}
                </h2>

                <p className="text-sm text-slate-400">
                  Subject: <span className="text-slate-300">{cls.subject || "—"}</span>
                </p>

                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={16} className="text-cyan-300" />
                  <span>{cls.studentCount ?? 0} students</span>
                </div>

                <p className="text-xs text-slate-500">
                  Created on: {formatDate(cls.createdAt)}
                </p>

                <div className="flex justify-between mt-4">
                  <Link
                    to={`/teacher/classes/${cls._id}`}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    <ArrowRightCircle size={18} />
                    View Class
                  </Link>

                  <button
                    onClick={() => handleDelete(cls._id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
