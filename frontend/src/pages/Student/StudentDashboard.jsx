import React, { useState, useEffect, useCallback } from 'react';
import ClassroomGrid from './components/ClassroomGrid';
import AssignmentList from './components/AssignmentList';
import StatsWidget from './components/StatsWidget';

const API_BASE = "http://localhost:5000";

const GRADIENTS = [
  "from-purple-600 to-blue-600",
  "from-cyan-600 to-teal-600",
  "from-pink-600 to-rose-600",
  "from-amber-600 to-orange-600",
  "from-emerald-600 to-teal-600",
  "from-violet-600 to-purple-600",
];

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchEnrolledClasses = useCallback(async () => {
    if (user.role !== "student" || !user.id) {
      setClasses([]);
      setClassesLoading(false);
      return;
    }
    setClassesLoading(true);
    setClassesError(null);
    try {
      const res = await fetch(`${API_BASE}/api/classes?enrolledStudent=${encodeURIComponent(user.id)}`);
      const result = await res.json();
      if (!res.ok) {
        setClassesError(result.message || "Failed to load classes");
        setClasses([]);
        return;
      }
      const raw = result.classes || [];
      setClasses(
        raw.map((c, i) => ({
          id: c._id,
          name: c.title || "—",
          instructor: c.subject || "—",
          gradient: GRADIENTS[i % GRADIENTS.length],
          teacherName: c.teacherName || "—",
          studentCount: c.studentCount ?? 0,
          cover: c.cover || null,
          coverUrl: c.cover ? `${API_BASE}${c.cover}` : null,
        }))
      );
    } catch (err) {
      console.error("Fetch enrolled classes error:", err);
      setClassesError("Network error. Please try again.");
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, [user.id, user.role]);

  useEffect(() => {
    fetchEnrolledClasses();
  }, [fetchEnrolledClasses]);

  // Fetch assignments from all enrolled classes, merge and sort by deadline (nearest first)
  useEffect(() => {
    if (!classes.length) {
      setAssignments([]);
      return;
    }
    setAssignmentsLoading(true);
    const classIds = classes.map((c) => c.id).filter(Boolean);
    Promise.all(
      classIds.map((classId) =>
        fetch(`${API_BASE}/api/assignments?classId=${encodeURIComponent(classId)}`).then((r) => r.json())
      )
    )
      .then((results) => {
        const byId = new Map();
        results.forEach((data) => {
          (data.assignments || []).forEach((a) => {
            if (a._id && !byId.has(a._id)) byId.set(a._id, a);
          });
        });
        const now = new Date();
        const list = Array.from(byId.values())
          .filter((a) => a.deadline && new Date(a.deadline) >= now)
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setAssignments(list);
      })
      .catch(() => setAssignments([]))
      .finally(() => setAssignmentsLoading(false));
  }, [classes]);

  return (
    <div className="flex h-screen bg-[#0d0620] overflow-hidden font-sans text-white">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-purple-900/10 blur-[120px] pointer-events-none"></div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <ClassroomGrid
            classes={classes}
            classesLoading={classesLoading}
            classesError={classesError}
            onJoinSuccess={fetchEnrolledClasses}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AssignmentList
              assignments={assignments}
              classes={classes}
              loading={assignmentsLoading}
            />
            <StatsWidget studentId={user.id} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
