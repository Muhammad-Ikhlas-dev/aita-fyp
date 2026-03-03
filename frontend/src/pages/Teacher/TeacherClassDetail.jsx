import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, X, ClipboardCheck, ClipboardList, Calendar, FileText, Users, HelpCircle, Download, Link2, Copy, Check, FolderOpen, Eye, ShieldAlert, MessageSquare } from "lucide-react";

const API_BASE = "http://localhost:5001";

function formatDateDMY(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${day}/${month}/${year}, ${time}`;
}

function toDateTimeLocal(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceFilterDate, setAttendanceFilterDate] = useState("");
  const [attendanceFilterInput, setAttendanceFilterInput] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editDeadline, setEditDeadline] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [activeTab, setActiveTab] = useState("students"); // "students" | "assignments" | "quizzes"
  const [joinLinkCopied, setJoinLinkCopied] = useState(false);

  const [submissionsModal, setSubmissionsModal] = useState(null); // { assignmentId, title }
  const [submissionsList, setSubmissionsList] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [plagiarismLoading, setPlagiarismLoading] = useState(false);
  const [plagiarismResults, setPlagiarismResults] = useState(null); // { assignmentTitle, totalSubmissions, results, studentSummary }
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  const [showAssignmentMarks, setShowAssignmentMarks] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(null); // { studentName, feedback }

  // API: GET /api/attendance?classId= — load attendance logs for "Show attendance" modal
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

  // API: GET /api/classes/:classId/students — load enrolled students for this class
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

  const openEditAssignment = (a) => {
    setEditingAssignmentId(a._id);
    setEditDeadline(toDateTimeLocal(a.deadline || new Date()));
  };

  const closeEditAssignment = () => {
    setEditingAssignmentId(null);
    setEditDeadline("");
  };

  const openSubmissionsModal = (a) => {
    setSubmissionsModal({ assignmentId: a._id, title: a.title });
    setSubmissionsList([]);
    setPlagiarismResults(null);
    setShowAssignmentMarks(false);
  };

  const exportResultsToCsv = () => {
    if (!submissionsModal?.title || !showAssignmentMarks) return;
    const escapeCsv = (v) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = "Student Name,Roll No,Marks";
    const rows = submissionsList.map((s) => {
      const name = escapeCsv(s.studentName);
      const rollNo = escapeCsv(s.rollNo ?? s.roll_no ?? "");
      const marks = (s.score != null || s.aiGrade?.score != null) ? String(Number(s.score ?? s.aiGrade?.score)) : "—";
      return `${name},${rollNo},${escapeCsv(marks)}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${submissionsModal.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeSubmissionsModal = () => {
    setSubmissionsModal(null);
    setSubmissionsList([]);
    setPlagiarismResults(null);
  };

  const checkPlagiarism = async () => {
    if (!submissionsModal?.assignmentId) return;
    setPlagiarismLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/plagiarism/check?assignmentId=${encodeURIComponent(submissionsModal.assignmentId)}`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to check plagiarism');
        return;
      }
      setPlagiarismResults(data);
      setShowPlagiarismModal(true);
    } catch (err) {
      console.error('Plagiarism check error:', err);
      alert('Network error. Please try again.');
    } finally {
      setPlagiarismLoading(false);
    }
  };

  useEffect(() => {
    if (!submissionsModal?.assignmentId) return;
    let cancelled = false;
    setSubmissionsLoading(true);
    fetch(`${API_BASE}/api/submissions/list?assignmentId=${encodeURIComponent(submissionsModal.assignmentId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.success) setSubmissionsList(data.submissions || []);
      })
      .catch(() => {
        if (!cancelled) setSubmissionsList([]);
      })
      .finally(() => {
        if (!cancelled) setSubmissionsLoading(false);
      });
    return () => { cancelled = true; };
  }, [submissionsModal?.assignmentId]);

  const saveEditDeadline = async (e) => {
    e.preventDefault();
    if (!editingAssignmentId || !editDeadline) return;
    setEditLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/assignments/${editingAssignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: editDeadline }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update deadline");
        setEditLoading(false);
        return;
      }
      setAssignments((prev) =>
        prev.map((x) =>
          x._id === editingAssignmentId ? { ...x, deadline: data.assignment.deadline } : x
        )
      );
      closeEditAssignment();
    } catch (err) {
      console.error("Update assignment error:", err);
      alert("Network error. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const deleteAssignment = async (a) => {
    if (!window.confirm(`Delete assignment "${a.title}"? This cannot be undone.`)) return;
    setDeleteLoadingId(a._id);
    try {
      const res = await fetch(`${API_BASE}/api/assignments/${a._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete assignment");
        setDeleteLoadingId(null);
        return;
      }
      setAssignments((prev) => prev.filter((x) => x._id !== a._id));
    } catch (err) {
      console.error("Delete assignment error:", err);
      alert("Network error. Please try again.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // API: GET /api/assignments?classId= & createdBy= — load teacher's assignments for this class
  const fetchAssignments = async () => {
    if (!classId) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "teacher" || !user.id) return;
    setAssignmentsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/assignments?classId=${encodeURIComponent(classId)}&createdBy=${encodeURIComponent(user.id)}`
      );
      const result = await res.json();
      if (!res.ok) {
        setAssignments([]);
        return;
      }
      setAssignments(result.assignments || []);
    } catch (err) {
      console.error("Fetch assignments error:", err);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  // API: GET /api/classes/:id + class students + assignments — load class detail and roster when classId changes
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
        await fetchAssignments();
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

  // Event: remove student from class — DELETE /api/classes/:classId/students/:studentId
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
          {classDetail.joinCode && (
            <div className="mt-4 pt-4 border-t border-[#1f1830]">
              <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Link2 size={16} /> Student join link (share so students can join this class)
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`${window.location.origin}/join/${classDetail.joinCode}`}
                  className="flex-1 max-w-md p-2 rounded bg-black/30 border border-slate-700 text-slate-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/join/${classDetail.joinCode}`;
                    navigator.clipboard.writeText(url).then(() => {
                      setJoinLinkCopied(true);
                      setTimeout(() => setJoinLinkCopied(false), 2000);
                    });
                  }}
                  className="p-2 rounded-lg border border-slate-600 hover:border-slate-500 flex items-center gap-1 text-sm text-slate-300"
                >
                  {joinLinkCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  {joinLinkCopied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-[#1f1830] mb-6 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition ${
            activeTab === "students"
              ? "bg-[#1f1830] text-cyan-400 border border-[#1f1830] border-b-0 -mb-px"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Users size={18} />
          Students
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("assignments")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition ${
            activeTab === "assignments"
              ? "bg-[#1f1830] text-cyan-400 border border-[#1f1830] border-b-0 -mb-px"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <FileText size={18} />
          Assignments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quizzes")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition ${
            activeTab === "quizzes"
              ? "bg-[#1f1830] text-cyan-400 border border-[#1f1830] border-b-0 -mb-px"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <HelpCircle size={18} />
          Quizzes
        </button>
      </div>

      {/* Tab content: Students */}
      {activeTab === "students" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Students</h2>
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
                      No students in this class yet. Share the join link above so students can join.
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
                          onClick={() => handleDeleteStudent(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded"
                          title="Remove from class"
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
        </>
      )}

      {/* Tab content: Assignments */}
      {activeTab === "assignments" && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Assignments</h2>
          {assignmentsLoading ? (
            <p className="text-slate-400 text-sm py-4">Loading assignments…</p>
          ) : assignments.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No assignments published to this class yet.</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((a) => (
                <div
                  key={a._id}
                  className="flex gap-4 p-4 rounded-xl bg-[#0b0713] border border-[#1f1830]"
                >
                  {/* Preview / Download: same file teacher uploaded (pdf, docx, txt) */}
                  {a.attachmentPath || a.attachmentOriginalName ? (
                    <a
                      href={`${API_BASE}/api/assignments/${a._id}/download`}
                      download={a.attachmentOriginalName || undefined}
                      className="w-28 h-28 shrink-0 rounded-lg bg-[#1f1830] border border-[#2a2340] flex flex-col items-center justify-center text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10 transition overflow-hidden"
                      title={`Download ${a.attachmentOriginalName || "assignment"}`}
                    >
                      <Download size={28} className="mb-1" />
                      <span className="text-[10px] px-1 text-center truncate w-full">
                        {a.attachmentOriginalName ? a.attachmentOriginalName.replace(/\.[^/.]+$/, "") : "Download"}
                      </span>
                    </a>
                  ) : (
                    <div className="w-28 h-28 shrink-0 rounded-lg bg-[#1f1830] border border-[#2a2340] flex flex-col items-center justify-center text-slate-500 overflow-hidden">
                      <FileText size={32} className="text-cyan-500/70 mb-1" />
                      <span className="text-[10px] px-1 text-center truncate w-full">No file</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-white truncate">{a.title}</h3>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                      <Calendar size={14} className="shrink-0 text-cyan-400" />
                      Due: {a.deadline ? formatDateDMY(a.deadline) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={() => openSubmissionsModal(a)}
                      className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition"
                      title="View submissions"
                    >
                      <FolderOpen size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditAssignment(a)}
                      className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition"
                      title="Edit deadline"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAssignment(a)}
                      disabled={deleteLoadingId === a._id}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition disabled:opacity-50"
                      title="Delete assignment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit assignment deadline modal */}
      {editingAssignmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit deadline</h3>
              <button
                type="button"
                onClick={closeEditAssignment}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={saveEditDeadline} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">New deadline</label>
                <input
                  type="datetime-local"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-[#0b0713] border border-[#1f1830] text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditAssignment}
                  className="px-4 py-2 rounded-lg border border-[#1f1830] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
                >
                  {editLoading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View submissions modal */}
      {submissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1f1830]">
              <h3 className="text-lg font-semibold text-white">
                Submissions — {submissionsModal.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentMarks(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-600/30 text-sm transition"
                  title="Show AI marks for each submission"
                >
                  <ClipboardCheck size={16} />
                  Check assignments
                </button>
                <button
                  type="button"
                  onClick={checkPlagiarism}
                  disabled={plagiarismLoading || submissionsList.length < 2}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/40 hover:bg-amber-600/30 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title={submissionsList.length < 2 ? 'Need at least 2 submissions' : 'Check plagiarism across all submissions'}
                >
                  <ShieldAlert size={16} />
                  {plagiarismLoading ? 'Checking…' : 'Check Plagiarism'}
                </button>
                <button
                  type="button"
                  onClick={closeSubmissionsModal}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1">
              {submissionsLoading ? (
                <p className="text-slate-400 text-sm py-6 text-center">Loading submissions…</p>
              ) : submissionsList.length === 0 ? (
                <p className="text-slate-500 text-sm py-6 text-center">No submissions yet for this assignment.</p>
              ) : (
                <ul className="space-y-3">
                  {submissionsList.map((s) => (
                    <li
                      key={s._id}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{s.studentName}</p>
                        <p className="text-slate-400 text-sm truncate">
                          Roll No: {(s.rollNo ?? s.roll_no ?? "").trim() || "—"}
                        </p>
                        <p className="text-slate-400 text-sm truncate">{s.email}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {s.originalName} — {s.submittedAt ? formatDateDMY(s.submittedAt) : "—"}
                        </p>
                      </div>
                      {showAssignmentMarks && (
                        <span className="shrink-0 w-12 text-center font-semibold text-cyan-400">
                          {(s.score != null || s.aiGrade?.score != null)
                            ? `${Number(s.score ?? s.aiGrade?.score)}/10`
                            : "—"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setFeedbackModal({ studentName: s.studentName, feedback: s.aiGrade?.feedback ?? "" })}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/40 hover:bg-violet-600/30 text-sm transition"
                        title="View AI feedback"
                      >
                        <MessageSquare size={16} />
                        View AI feedback
                      </button>
                      <a
                        href={`${API_BASE}/api/submissions/${s._id}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-600/30 text-sm"
                      >
                        <Eye size={16} />
                        Preview
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t border-[#1f1830] flex justify-end">
              <button
                type="button"
                onClick={exportResultsToCsv}
                disabled={!showAssignmentMarks || submissionsList.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
                title={!showAssignmentMarks ? "Click 'Check assignments' first to export" : "Download results as CSV (opens in Excel)"}
              >
                <Download size={18} />
                Export results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI feedback modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1f1830]">
              <h3 className="text-lg font-semibold text-white">
                AI feedback — {feedbackModal.studentName}
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <p className="text-slate-300 whitespace-pre-wrap">
                {feedbackModal.feedback.trim() || "No feedback available for this submission."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab content: Quizzes */}
      {activeTab === "quizzes" && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Quizzes</h2>
          <p className="text-slate-500 text-sm py-8 text-center rounded-xl bg-[#0b0713] border border-[#1f1830]">
            No quizzes for this class yet.
          </p>
        </div>
      )}

      {/* Plagiarism results modal */}
      {showPlagiarismModal && plagiarismResults && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1f1830]">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShieldAlert size={20} className="text-amber-400" />
                  Plagiarism Report — {plagiarismResults.assignmentTitle}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {plagiarismResults.totalSubmissions} submission{plagiarismResults.totalSubmissions !== 1 ? 's' : ''} analysed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlagiarismModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 space-y-6">
              {plagiarismResults.results.length === 0 ? (
                <p className="text-slate-500 text-sm py-6 text-center">
                  {plagiarismResults.message || 'No pairs to compare.'}
                </p>
              ) : (
                <>
                  {/* Per-student summary */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Student Summary</h4>
                    <div className="border border-[#1f1830] rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-[#1f1830] text-slate-400">
                            <th className="p-3 font-medium">Student</th>
                            <th className="p-3 font-medium">Max Similarity</th>
                            <th className="p-3 font-medium">Most Similar To</th>
                            <th className="p-3 font-medium">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plagiarismResults.studentSummary.map((s, idx) => (
                            <tr key={idx} className="border-t border-[#1f1830] hover:bg-white/5">
                              <td className="p-3">
                                <p className="text-white font-medium">{s.studentName}</p>
                                <p className="text-slate-500 text-xs">{s.email}</p>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 rounded-full bg-[#1f1830] overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        s.level === 'high' ? 'bg-red-500' :
                                        s.level === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${s.maxSimilarity}%` }}
                                    />
                                  </div>
                                  <span className={`font-semibold ${
                                    s.level === 'high' ? 'text-red-400' :
                                    s.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>{s.maxSimilarity}%</span>
                                </div>
                              </td>
                              <td className="p-3 text-slate-300">{s.mostSimilarTo}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  s.level === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                  s.level === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                }`}>
                                  {s.level === 'high' ? 'High Risk' : s.level === 'medium' ? 'Medium Risk' : 'Low Risk'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pairwise comparison */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Pairwise Comparison</h4>
                    <div className="border border-[#1f1830] rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-[#1f1830] text-slate-400">
                            <th className="p-3 font-medium">Student A</th>
                            <th className="p-3 font-medium">Student B</th>
                            <th className="p-3 font-medium">Similarity</th>
                            <th className="p-3 font-medium">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plagiarismResults.results.map((pair, idx) => (
                            <tr key={idx} className="border-t border-[#1f1830] hover:bg-white/5">
                              <td className="p-3 text-slate-200">{pair.studentA.name}</td>
                              <td className="p-3 text-slate-200">{pair.studentB.name}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-2 rounded-full bg-[#1f1830] overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        pair.level === 'high' ? 'bg-red-500' :
                                        pair.level === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${pair.similarityPercent}%` }}
                                    />
                                  </div>
                                  <span className={`font-medium ${
                                    pair.level === 'high' ? 'text-red-400' :
                                    pair.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>{pair.similarityPercent}%</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  pair.level === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                  pair.level === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                }`}>
                                  {pair.level === 'high' ? 'High' : pair.level === 'medium' ? 'Medium' : 'Low'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> High Risk ≥ 70%</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Medium Risk 40–69%</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Low Risk &lt; 40%</span>
                  </div>
                </>
              )}
            </div>
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
