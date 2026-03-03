import React, { useState, useEffect } from 'react';
import { FileText, HelpCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const StatsWidget = ({ studentId }) => {
  const [stats, setStats] = useState({
    totalAssignments: 0,
    missedAssignments: 0,
    totalQuizzes: 0,
    missedQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/students/academic-stats?studentId=${encodeURIComponent(studentId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats({
            totalAssignments: data.totalAssignments ?? 0,
            missedAssignments: data.missedAssignments ?? 0,
            totalQuizzes: data.totalQuizzes ?? 0,
            missedQuizzes: data.missedQuizzes ?? 0,
          });
        }
      })
      .catch(() => setStats({ totalAssignments: 0, missedAssignments: 0, totalQuizzes: 0, missedQuizzes: 0 }))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/10 rounded-2xl p-6">
      <h3 className="font-semibold text-lg mb-4">Academic Progress</h3>
      {loading ? (
        <p className="text-sm text-gray-400 py-4">Loading…</p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Assignments */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-cyan-400" />
              <span className="text-sm font-medium text-gray-300">Assignments</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.totalAssignments}</span>
              <span className="text-gray-400 text-sm">total</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-gray-400">Missed:</span>
              <span className={`text-sm font-semibold ${stats.missedAssignments > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {stats.missedAssignments}
              </span>
            </div>
          </div>

          {/* Quizzes */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={18} className="text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Quizzes</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.totalQuizzes}</span>
              <span className="text-gray-400 text-sm">total</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-gray-400">Missed:</span>
              <span className={`text-sm font-semibold ${stats.missedQuizzes > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {stats.missedQuizzes}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsWidget;
