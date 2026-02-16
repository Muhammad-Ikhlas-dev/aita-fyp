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

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState(null);

  // API: GET /api/classes?createdBy= — load teacher's classes for "Your Classes" card on mount
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      setClassesError(null);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
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

  const recentSubmissions = [
    { id: 1, student: "Sara Khan", assignment: "Edge Detection", time: "2h ago", grade: "Pending" },
    { id: 2, student: "Ali Nawaz", assignment: "Backpropagation Essay", time: "1d ago", grade: "A-" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome back, Aria</h1>
        <div className="flex gap-2">
          <Link to="/teacher/create-class" className="px-4 py-2 rounded-lg bg-sky-600/90 hover:bg-sky-600">
            Create Class
          </Link>
          <Link to="/teacher/assignments" className="px-4 py-2 rounded-lg border border-slate-700">
            Assignments
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TeacherCard title="Your Classes" subtitle="Active classes & quick actions">
          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
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
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[280px] pr-1">
            <div className="p-3 bg-[#0b0713] rounded-md border border-[#1f1830] flex items-center justify-between">
              <div>
                <div className="font-medium">Edge Detection Algorithm</div>
                <div className="text-xs text-slate-400">Computer Vision • Draft</div>
              </div>
              <div className="text-xs text-slate-400">Due: Today</div>
            </div>

            <div className="p-3 bg-[#0b0713] rounded-md border border-[#1f1830] flex items-center justify-between">
              <div>
                <div className="font-medium">Backpropagation Essay</div>
                <div className="text-xs text-slate-400">Neural Networks • Published</div>
              </div>
              <div className="text-xs text-slate-400">Due: Tomorrow</div>
            </div>

            <div className="pt-2">
              <Link to="/teacher/assignments" className="text-sm text-sky-300">View all assignments →</Link>
            </div>
          </div>
        </TeacherCard>

        <TeacherCard title="Quizzes & AI Check" subtitle="Upload quizzes and let AI pre-check submissions">
          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
            <div className="p-3 bg-[#0b0713] rounded-md border border-[#1f1830]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Weekly MCQ - 1</div>
                  <div className="text-xs text-slate-400">Class: Neural Networks</div>
                </div>
                <div className="text-xs text-slate-400">AI Check: Enabled</div>
              </div>
            </div>

            <div>
              <Link to="/teacher/quizzes" className="text-sm text-sky-300">Manage quizzes →</Link>
            </div>
          </div>
        </TeacherCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeacherCard title="Recent Submissions" subtitle="Quick grade & review">
          <div className="space-y-2">
            {recentSubmissions.map((s) => (
              <div key={s.id} className="p-3 bg-[#0b0713] rounded-md border border-[#1f1830] flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.student}</div>
                  <div className="text-xs text-slate-400">{s.assignment} • {s.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-300">{s.grade}</div>
                  <button className="px-3 py-1 bg-sky-600/90 rounded text-sm">Review</button>
                </div>
              </div>
            ))}
          </div>
        </TeacherCard>

        <TeacherCard title="Upcoming Deadlines" subtitle="Keep track">
          <ul className="space-y-3">
            <li className="flex justify-between text-slate-300">Edge Detection Algorithm <span className="text-sm">Today, 11:59 PM</span></li>
            <li className="flex justify-between text-slate-300">Backpropagation Essay <span className="text-sm">Tomorrow, 5:00 PM</span></li>
            <li className="flex justify-between text-slate-300">Weekly MCQ <span className="text-sm">Fri, 9:00 AM</span></li>
          </ul>
        </TeacherCard>
      </div>
    </div>
  );
};

export default TeacherDashboard;
