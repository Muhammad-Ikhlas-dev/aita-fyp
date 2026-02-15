import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Pencil, Trash2, X, ClipboardCheck, ClipboardList, Calendar } from "lucide-react";

const API_BASE = "http://localhost:5000";

function formatDateDMY(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${day}/${month}/${year}, ${time}`;
}

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "", rollNo: "" });
  const [addError, setAddError] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceFilterDate, setAttendanceFilterDate] = useState("");
  const [attendanceFilterInput, setAttendanceFilterInput] = useState("");

  const fetchAttendanceRecords = async () => {
    if (!classId) return;
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const res = await fetch(`${API_BASE}/api/attendance?classId=${encodeURIComponent(classId)}`);
      const result = await res.json();
      if (!res.ok) {
        setAttendanceError(result.message || "Failed to load attendance");
        setAttendanceRecords([]);
        return;
      }
      setAttendanceRecords(result.attendance || []);
    } catch (err) {
      console.error("Fetch attendance error:", err);
      setAttendanceError("Network error. Please try again.");
      setAttendanceRecords([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchClassStudents = async () => {
    if (!classId) return;
    setStudentsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/classes/${classId}/students`);
      const result = await res.json();
      if (!res.ok) {
        setStudents([]);
        return;
      }
      setStudents(result.students || []);
    } catch (err) {
      console.error("Fetch class students error:", err);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    const fetchClass = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/classes/${classId}`);
        const result = await res.json();
        if (!res.ok) {
          setError(result.message || "Failed to load class");
          setClassDetail(null);
          setStudents([]);
          return;
        }
        setClassDetail(result.class);
        await fetchClassStudents();
      } catch (err) {
        console.error("Fetch class error:", err);
        setError("Network error. Please try again.");
        setClassDetail(null);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchClass();
  }, [classId]);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ fullName: "", email: "", rollNo: "" });
    setAddError(null);
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingId(student.id);
    setForm({
      fullName: student.fullName,
      email: student.email,
      rollNo: student.rollNo,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ fullName: "", email: "", rollNo: "" });
    setAddError(null);
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    if (editingId) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingId ? { ...s, ...form } : s
        )
      );
      closeModal();
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      const email = form.email.trim();
      if (!email) {
        setAddError("Email is required.");
        setAddLoading(false);
        return;
      }
      const res = await fetch(
        `${API_BASE}/api/students/lookup?email=${encodeURIComponent(email)}`
      );
      const result = await res.json();
      if (!res.ok) {
        setAddError(result.message || "Could not find student.");
        setAddLoading(false);
        return;
      }
      const student = result.student;
      const enrollRes = await fetch(
        `${API_BASE}/api/classes/${classId}/students`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: student.id || student._id }),
        }
      );
      const enrollResult = await enrollRes.json();
      if (!enrollRes.ok) {
        setAddError(enrollResult.message || "Could not add student to class.");
        setAddLoading(false);
        return;
      }
      setStudents((prev) => [
        ...prev,
        {
          id: enrollResult.student.id || enrollResult.student._id,
          fullName: enrollResult.student.fullName,
          email: enrollResult.student.email,
          rollNo: enrollResult.student.rollNo ?? "",
        },
      ]);
      closeModal();
    } catch (err) {
      console.error("Lookup student error:", err);
      setAddError("Network error. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/classes/${classId}/students/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const result = await res.json();
        alert(result.message || "Could not remove student.");
        return;
      }
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Remove student error:", err);
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="text-slate-400 py-10">Loading class…</div>
      </div>
    );
  }

  if (error || !classDetail) {
    return (
      <div>
        <p className="text-red-400 mb-4">{error || "Class not found"}</p>
        <Link
          to="/teacher/classes"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft size={18} />
          Back to My Classes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/teacher/classes"
        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-6"
      >
        <ArrowLeft size={18} />
        Back to My Classes
      </Link>

      {/* Class details */}
      <div className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl overflow-hidden mb-8">
        {classDetail.cover ? (
          <div className="aspect-[3/1] w-full bg-[#1f1830]">
            <img
              src={`${API_BASE}${classDetail.cover}`}
              alt={classDetail.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video max-h-48 bg-[#1f1830] flex items-center justify-center text-slate-500">
            No cover
          </div>
        )}
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-white mb-2">{classDetail.title}</h1>
          <p className="text-slate-400 text-sm mb-1">
            Subject: <span className="text-slate-300">{classDetail.subject || "—"}</span>
          </p>
          {classDetail.schedule && (
            <p className="text-slate-400 text-sm mb-2">
              Schedule: <span className="text-slate-300">{classDetail.schedule}</span>
            </p>
          )}
          {classDetail.description && (
            <p className="text-slate-400 text-sm">{classDetail.description}</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() =>
                navigate("/teacher/attendance", {
                  state: {
                    classId: classDetail._id,
                    className: classDetail.title,
                    subject: classDetail.subject,
                  },
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
            >
              <ClipboardCheck size={18} />
              Mark attendance
            </button>
            <button
              onClick={() => {
                setShowAttendanceModal(true);
                fetchAttendanceRecords();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
            >
              <ClipboardList size={18} />
              Show attendance
            </button>
          </div>
        </div>
      </div>

      {/* Students section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Students</h2>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
        >
          <UserPlus size={18} />
          Add student
        </button>
      </div>

      <div className="border border-[#1f1830] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1f1830] text-slate-400 text-sm">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Roll No</th>
              <th className="p-3 font-medium text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentsLoading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400 text-sm">
                  Loading students…
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500 text-sm">
                  No students added yet. Click &quot;Add student&quot; to add one.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-[#1f1830] hover:bg-white/5 transition"
                >
                  <td className="p-3 text-slate-200">{s.fullName}</td>
                  <td className="p-3 text-slate-300 text-sm">{s.email}</td>
                  <td className="p-3 text-slate-300 text-sm">{s.rollNo}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s.id)}
                      className="p-1.5 ml-1 text-slate-400 hover:text-red-400 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit student modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? "Edit student" : "Add student"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmitStudent} className="space-y-4">
              {addError && (
                <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">
                  {addError}
                </p>
              )}
              {editingId ? (
                <>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Full name</label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg bg-[#0b0713] border border-[#1f1830] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg bg-[#0b0713] border border-[#1f1830] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Roll No</label>
                    <input
                      name="rollNo"
                      value={form.rollNo}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-[#0b0713] border border-[#1f1830] text-white"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Student email (must be registered on the platform)
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="student@example.com"
                    className="w-full p-3 rounded-lg bg-[#0b0713] border border-[#1f1830] text-white"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-[#1f1830] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
                  disabled={addLoading}
                >
                  {addLoading ? "Checking…" : editingId ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance records modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1f1830]">
              <h3 className="text-lg font-semibold text-white">Attendance records</h3>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              {attendanceLoading ? (
                <p className="text-slate-400 text-sm py-6 text-center">Loading records…</p>
              ) : attendanceError ? (
                <p className="text-red-400 text-sm py-4">{attendanceError}</p>
              ) : attendanceRecords.length === 0 ? (
                <p className="text-slate-500 text-sm py-6 text-center">No attendance records yet. Mark attendance to see records here.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar size={18} className="text-cyan-400" />
                        Filter by date (dd/mm/yyyy)
                      </span>
                      <input
                        type="date"
                        value={attendanceFilterInput}
                        onChange={(e) => setAttendanceFilterInput(e.target.value)}
                        className="p-2 rounded-lg bg-[#0b0713] border border-[#1f1830] text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setAttendanceFilterDate(attendanceFilterInput)}
                        disabled={!attendanceFilterInput}
                        className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm"
                      >
                        Apply
                      </button>
                    </div>
                    {attendanceFilterDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setAttendanceFilterDate("");
                          setAttendanceFilterInput("");
                        }}
                        className="text-sm text-cyan-400 hover:text-cyan-300 ml-auto"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                  {(() => {
                    const filtered = attendanceFilterDate
                      ? attendanceRecords.filter((log) => {
                          if (!log.timestamp) return false;
                          const d = new Date(log.timestamp);
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, "0");
                          const day = String(d.getDate()).padStart(2, "0");
                          return `${y}-${m}-${day}` === attendanceFilterDate;
                        })
                      : attendanceRecords;
                    if (filtered.length === 0) {
                      return (
                        <p className="text-slate-500 text-sm py-6 text-center">
                          No records on this date.
                        </p>
                      );
                    }
                    const totalPresent = filtered.reduce(
                      (sum, log) => sum + (log.students?.length ?? log.count ?? 0),
                      0
                    );
                    return (
                <>
                <p className="text-slate-300 text-sm mb-3">
                  Total students present: {totalPresent}
                </p>
                <div className="border border-[#1f1830] rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#1f1830] text-slate-400 text-sm">
                        <th className="p-3 font-medium">Date & time</th>
                        <th className="p-3 font-medium">Students marked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((log) => (
                        <tr key={log._id} className="border-t border-[#1f1830] hover:bg-white/5">
                          <td className="p-3 text-slate-200 text-sm">
                            {log.timestamp ? formatDateDMY(log.timestamp) : "—"}
                          </td>
                          <td className="p-3 text-slate-300 text-sm">
                            {log.students && log.students.length
                              ? log.students.map((s) => s.name).join(", ")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClassDetail;
