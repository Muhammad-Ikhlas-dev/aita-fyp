// pages/Teacher/TeacherDashboard.jsx
import React from "react";
import TeacherCard from "./components/TeacherCard";
import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  // placeholder data (replace with API calls)
  const classes = [
    { id: 1, name: "Computer Vision", students: 36, nextDue: "Today, 11:59 PM" },
    { id: 2, name: "Neural Networks", students: 28, nextDue: "Fri, 5:00 PM" },
    { id: 3, name: "Quantum Computing", students: 19, nextDue: "Mon, 9:00 AM" },
  ];

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
          <div className="space-y-3">
            {classes.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-md bg-[#0b0713] border border-[#1f1830]">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.students} students</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-sky-300">{c.nextDue}</div>
                  <div className="mt-2 flex gap-2">
                    <Link to={`/teacher/dashboard`} className="text-xs px-2 py-1 rounded bg-white/3">View</Link>
                    <Link to={`/teacher/assignments`} className="text-xs px-2 py-1 rounded border border-slate-700">Assign</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TeacherCard>

        <TeacherCard title="Assignments Created" subtitle="Recent & drafts">
          <div className="flex flex-col gap-3">
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
          <div className="space-y-3">
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
