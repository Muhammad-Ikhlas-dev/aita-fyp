// pages/Teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from "react";
import TeacherCard from "./components/TeacherCard";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000";

function formatScheduleTime(timeStr) {
  if (!timeStr || !timeStr.trim()) return "";
  const [hours, minutes] = timeStr.trim().split(":").map(Number);
  if (isNaN(hours)) return timeStr;
  const h = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  const m = minutes != null && !isNaN(minutes) ? String(minutes).padStart(2, "0") : "00";
  return `${h}:${m} ${ampm}`;
}

function formatDue(deadline) {
  if (!deadline) return "—";
  const d = new Date(deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dueDate.getTime() === today.getTime()) return "Today";
  if (dueDate.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

/** Date + time only (e.g. "14 Mar, 11:59 PM"), no "Today"/"Tomorrow"/weekday. */
function formatDueDateOnly(deadline) {
  if (!deadline) return "—";
  const d = new Date(deadline);
  const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${dateStr}, ${timeStr}`;
}

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState(null);
  const [submissionCounts, setSubmissionCounts] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // API: GET /api/classes?createdBy= — load teacher's classes for "Your Classes" card on mount
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      setClassesError(null);
      try {
        const url =
          user.role === "teacher" && user.id
            ? `${API_BASE}/api/classes?createdBy=${user.id}`
            : `${API_BASE}/api/classes`;
        const res = await fetch(url);
        const result = await res.json();
        if (!res.ok) {
          setClassesError(result.message || "Failed to load classes");
          setClasses([]);
          return;
        }
        setClasses(result.classes || []);
      } catch (err) {
        console.error("Fetch classes error:", err);
        setClassesError("Network error. Please try again.");
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // API: GET /api/assignments?createdBy= — load teacher's assignments for "Assignments Created" card
  useEffect(() => {
    const fetchAssignments = async () => {
      if (user.role !== "teacher" || !user.id) {
        setAssignments([]);
        setAssignmentsLoading(false);
        return;
      }
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      try {
        const res = await fetch(`${API_BASE}/api/assignments?createdBy=${encodeURIComponent(user.id)}`);
        const result = await res.json();
        if (!res.ok) {
          setAssignmentsError(result.message || "Failed to load assignments");
          setAssignments([]);
          return;
        }
        setAssignments(result.assignments || []);
      } catch (err) {
        console.error("Fetch assignments error:", err);
        setAssignmentsError("Network error. Please try again.");
        setAssignments([]);
      } finally {
        setAssignmentsLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // API: GET /api/quizzes?createdBy= — load teacher's published quizzes
  useEffect(() => {
    if (user.role !== "teacher" || !user.id) {
      setQuizzes([]);
      setQuizzesLoading(false);
      return;
    }
    setQuizzesLoading(true);
    fetch(`${API_BASE}/api/quizzes?createdBy=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.quizzes) setQuizzes(result.quizzes || []);
        else setQuizzes([]);
      })
      .catch(() => setQuizzes([]))
      .finally(() => setQuizzesLoading(false));
  }, []);

  // Fetch submission counts for upcoming assignments (future deadlines only)
  useEffect(() => {
    const now = new Date();
    const upcoming = (assignments || []).filter((a) => a.deadline && new Date(a.deadline) > now);
    const ids = upcoming.map((a) => a._id).filter(Boolean);
    if (ids.length === 0) {
      setSubmissionCounts({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/submissions/counts?assignmentIds=${ids.join(",")}`);
        const data = await res.json();
        if (!cancelled && data.counts) setSubmissionCounts(data.counts);
      } catch {
        if (!cancelled) setSubmissionCounts({});
      }
    })();
    return () => { cancelled = true; };
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome back, {user.fullName || "Aria"}</h1>
        <div className="flex gap-2">
          <Link to="/teacher/create-class" className="px-4 py-2 rounded-lg bg-sky-600/90 hover:bg-sky-600">
            Create Class
          </Link>
          <Link to="/teacher/assignments" className="px-4 py-2 rounded-lg border border-slate-700">
            Create Assignment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TeacherCard title="Your Classes" subtitle="Active classes & quick actions">
          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/30 [&::-webkit-scrollbar-thumb]:bg-cyan-400/80 [&::-webkit-scrollbar-thumb]:rounded-full">
            {classesLoading ? (
              <p className="text-sm text-slate-400 py-2">Loading classes…</p>
            ) : classesError ? (
              <p className="text-sm text-red-400 py-2">{classesError}</p>
            ) : classes.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No classes yet. Create a class to get started.</p>
            ) : (
              (() => {
                const rows = [];
                classes.forEach((c) => {
                  const slots = c.scheduleSlots?.length
                    ? c.scheduleSlots
                    : [c.scheduleDay != null || c.scheduleTime ? { day: c.scheduleDay || "", time: c.scheduleTime || "" } : null].filter(Boolean);
                  if (slots.length === 0) {
                    rows.push({ class: c, slot: null, key: c._id });
                  } else {
                    slots.forEach((slot, i) => rows.push({ class: c, slot, key: `${c._id}-${i}` }));
                  }
                });
                return rows.map(({ class: c, slot, key }) => {
                  const dayTime = slot
                    ? [slot.day, formatScheduleTime(slot.time)].filter(Boolean).join(", ") || "—"
                    : "—";
                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-md bg-[#0b0713] border border-[#1f1830]">
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-slate-400">{c.studentCount ?? 0} students</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-sky-300">{dayTime}</div>
                        <div className="mt-2 flex gap-2">
                          <Link to={`/teacher/classes/${c._id}`} className="text-xs px-2 py-1 rounded bg-white/3 hover:bg-white/5">View</Link>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </TeacherCard>

        <TeacherCard title="Assignments Created" subtitle="Recent & drafts">
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[280px] pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/30 [&::-webkit-scrollbar-thumb]:bg-cyan-400/80 [&::-webkit-scrollbar-thumb]:rounded-full">
            {assignmentsLoading ? (
              <p className="text-sm text-slate-400 py-2">Loading assignments…</p>
            ) : assignmentsError ? (
              <p className="text-sm text-red-400 py-2">{assignmentsError}</p>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No assignments yet. Create one from Assignments.</p>
            ) : (
              assignments.map((a) => {
                const classIds = a.classIds || [];
                const subjectLabel =
                  classIds.length === 0
                    ? "—"
                    : classIds.length === 1
                      ? (classes.find((c) => String(c._id) === String(classIds[0]))?.subject || "—")
                      : classIds
                          .map((id) => classes.find((c) => String(c._id) === String(id))?.subject)
                          .filter(Boolean)
                          .join(", ") || "—";
                return (
                  <div
                    key={a._id}
                    className="p-3 bg-[#0b0713] rounded-md border border-[#1f1830] flex items-center justify-between shrink-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{a.title}</div>
                      <div className="text-xs text-slate-400">{subjectLabel || "—"}</div>
                    </div>
                    <div className="text-xs text-slate-400 shrink-0 ml-2">Due: {formatDue(a.deadline)}</div>
                  </div>
                );
              })
            )}
          </div>
        </TeacherCard>

        <TeacherCard title="Quizzes & AI Check" subtitle="Published quizzes by class">
          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/30 [&::-webkit-scrollbar-thumb]:bg-cyan-400/80 [&::-webkit-scrollbar-thumb]:rounded-full">
            {quizzesLoading ? (
              <p className="text-sm text-slate-400 py-2">Loading quizzes…</p>
            ) : quizzes.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No quizzes published yet.</p>
            ) : (
              quizzes.map((q) => {
                const classIds = q.classIds || [];
                const classTitles = classIds
                  .map((id) => classes.find((c) => String(c._id) === String(id))?.title)
                  .filter(Boolean);
                const classLabel = classTitles.length ? classTitles.join(", ") : "—";
                const subjectLabel =
                  classIds.length === 0
                    ? "—"
                    : classIds.length === 1
                      ? (classes.find((c) => String(c._id) === String(classIds[0]))?.subject || "—")
                      : classIds
                          .map((id) => classes.find((c) => String(c._id) === String(id))?.subject)
                          .filter(Boolean)
                          .join(", ") || "—";
                return (
                  <div
                    key={q._id}
                    className="p-3 bg-[#0b0713] rounded-md border border-[#1f1830]"
                  >
                    <div className="font-medium text-white truncate">{q.title}</div>
                    <div className="text-xs text-slate-400 mt-1">Class: {classLabel}</div>
                    <div className="text-xs text-slate-400">Subject: {subjectLabel}</div>
                  </div>
                );
              })
            )}
          </div>
        </TeacherCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TeacherCard title="Upcoming Deadlines" subtitle="Keep track">
          <ul
            className="space-y-3 overflow-y-auto max-h-[280px] pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/30 [&::-webkit-scrollbar-thumb]:bg-cyan-400/80 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {assignmentsLoading ? (
              <li className="text-sm text-slate-400 py-2">Loading…</li>
            ) : (() => {
              const now = new Date();
              const sorted = [...(assignments || [])]
                .filter((a) => a.deadline && new Date(a.deadline) > now)
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
              if (sorted.length === 0) {
                return <li className="text-sm text-slate-400 py-2">No upcoming deadlines.</li>;
              }
              return sorted.map((a) => {
                const classIds = a.classIds || [];
                const classTitles = classIds
                  .map((id) => classes.find((c) => String(c._id) === String(id))?.title)
                  .filter(Boolean);
                const classLabel = classTitles.length ? classTitles.join(", ") : "—";
                const subjectLabel =
                  classIds.length === 0
                    ? "—"
                    : classIds.length === 1
                      ? (classes.find((c) => String(c._id) === String(classIds[0]))?.subject || "—")
                      : classIds
                          .map((id) => classes.find((c) => String(c._id) === String(id))?.subject)
                          .filter(Boolean)
                          .join(", ") || "—";
                const count = submissionCounts[a._id] ?? 0;
                return (
                  <li
                    key={a._id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-3 rounded-md bg-[#0b0713] border border-[#1f1830] text-slate-300"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{a.title}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                        <span>Class: {classLabel}</span>
                        <span>Subject: {subjectLabel}</span>
                        <span>Submissions: {count}</span>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400 shrink-0">{formatDueDateOnly(a.deadline)}</span>
                  </li>
                );
              });
            })()}
          </ul>
        </TeacherCard>
      </div>
    </div>
  );
};

export default TeacherDashboard;
