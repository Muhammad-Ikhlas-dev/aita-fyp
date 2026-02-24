import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Calendar, Download, Upload, CheckCircle, Eye, Trash2 } from "lucide-react";

const API_BASE = "http://localhost:5000";

function formatDateDMY(date) {
  if (!date) return "—";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${day}/${month}/${year}, ${time}`;
}

const StudentClassDetail = () => {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isPastDeadline = (deadline) => deadline && new Date() > new Date(deadline);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [classRes, assignRes] = await Promise.all([
          fetch(`${API_BASE}/api/classes/${classId}`),
          fetch(`${API_BASE}/api/assignments?classId=${encodeURIComponent(classId)}`),
        ]);
        if (cancelled) return;

        const classData = await classRes.json();
        const assignData = await assignRes.json();

        if (!classRes.ok) {
          setError(classData.message || "Class not found");
          setClassInfo(null);
          setAssignments([]);
          setSubmissionsMap({});
          setLoading(false);
          return;
        }
        setClassInfo(classData.class);

        if (!assignRes.ok) {
          setAssignments([]);
          setSubmissionsMap({});
        } else {
          const list = assignData.assignments || [];
          setAssignments(list);
          if (user.role === "student" && user.id && list.length > 0) {
            const subs = await Promise.all(
              list.map((a) =>
                fetch(
                  `${API_BASE}/api/submissions?assignmentId=${encodeURIComponent(a._id)}&studentId=${encodeURIComponent(user.id)}`
                ).then((r) => r.json())
              )
            );
            if (cancelled) return;
            const map = {};
            list.forEach((a, i) => {
              if (subs[i]?.success && subs[i].submission) map[a._id] = subs[i].submission;
            });
            setSubmissionsMap(map);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Student class detail error:", err);
          setError("Network error. Please try again.");
          setClassInfo(null);
          setAssignments([]);
          setSubmissionsMap({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [classId, user.id, user.role]);

  const handleUploadClick = (assignment) => {
    setUploadError(null);
    if (isPastDeadline(assignment.deadline)) {
      setUploadError("Can't turn in - deadline has already reached.");
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.dataset.assignmentId = assignment._id;
      fileInputRef.current.click();
    }
  };

  const handleDeleteSubmission = async (assignmentId, submissionId) => {
    if (!submissionId || !user.id) return;
    if (!window.confirm("Remove this submission? You can turn in again before the deadline.")) return;
    setDeletingId(submissionId);
    setUploadError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/submissions/${submissionId}?studentId=${encodeURIComponent(user.id)}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (!res.ok) {
        setUploadError(result.message || "Failed to remove submission.");
        return;
      }
      setSubmissionsMap((prev) => {
        const next = { ...prev };
        delete next[assignmentId];
        return next;
      });
    } catch (err) {
      console.error("Delete submission error:", err);
      setUploadError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    const assignmentId = e.target.dataset?.assignmentId;
    e.target.value = "";
    e.target.dataset.assignmentId = "";
    if (!file || !assignmentId || !user.id) return;
    const assignment = assignments.find((x) => x._id === assignmentId);
    if (assignment && isPastDeadline(assignment.deadline)) {
      setUploadError("Can't turn in - deadline has already reached.");
      return;
    }
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".docx") && !file.name.toLowerCase().endsWith(".doc")) {
      setUploadError("Only PDF or DOCX files are allowed.");
      return;
    }
    setUploadingId(assignmentId);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignmentId);
      formData.append("studentId", user.id);
      const res = await fetch(`${API_BASE}/api/submissions`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        setUploadError(result.message || "Upload failed.");
        return;
      }
      setSubmissionsMap((prev) => ({
        ...prev,
        [assignmentId]: result.submission,
      }));
    } catch (err) {
      console.error("Upload submission error:", err);
      setUploadError("Network error. Please try again.");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  if (error || !classInfo) {
    return (
      <div className="p-8">
        <p className="text-red-400 mb-4">{error || "Class not found"}</p>
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft size={18} />
          Back to My Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        className="hidden"
        onChange={handleFileChange}
        data-assignment-id=""
      />

      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-6"
      >
        <ArrowLeft size={18} />
        Back to My Classes
      </Link>

      <h1 className="text-2xl font-semibold text-white mb-2">{classInfo.title}</h1>
      {classInfo.subject && (
        <p className="text-slate-400 text-sm mb-8">Subject: {classInfo.subject}</p>
      )}

      {uploadError && (
        <p className="mb-4 text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{uploadError}</p>
      )}

      <h2 className="text-xl font-semibold text-white mb-4">Assignments</h2>
      {assignments.length === 0 ? (
        <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center text-slate-400">
          No assignments for this class yet.
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const submission = submissionsMap[a._id];
            const pastDeadline = isPastDeadline(a.deadline);
            return (
              <div
                key={a._id}
                className="flex gap-4 p-4 rounded-xl bg-[#0b0713] border border-[#1f1830] hover:border-cyan-500/30 transition items-center"
              >
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
                  <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5">
                    <Calendar size={14} className="shrink-0 text-cyan-400" />
                    Due: {a.deadline ? formatDateDMY(a.deadline) : "—"}
                  </p>
                </div>

                {/* Right side: Upload or Turned in + Preview + Delete */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {submission ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-medium">
                        <CheckCircle size={16} />
                        Turned in
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`${API_BASE}/api/submissions/${submission._id}/file`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm"
                        >
                          <Eye size={16} />
                          Preview
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubmission(a._id, submission._id)}
                          disabled={deletingId === submission._id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 text-sm disabled:opacity-50"
                          title="Remove submission"
                        >
                          <Trash2 size={16} />
                          {deletingId === submission._id ? "Removing…" : "Delete"}
                        </button>
                      </div>
                    </>
                  ) : pastDeadline ? (
                    <p className="text-sm text-amber-400/90">Can&apos;t turn in — deadline has already reached.</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUploadClick(a)}
                      disabled={uploadingId === a._id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-600/30 transition text-sm font-medium disabled:opacity-50"
                    >
                      <Upload size={18} />
                      {uploadingId === a._id ? "Uploading…" : "Upload"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentClassDetail;
