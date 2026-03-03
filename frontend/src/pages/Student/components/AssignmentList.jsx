import { Link } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';

/**
 * Format deadline for display: Today/Tomorrow with time, or date only.
 * Returns { text, isUrgent } where isUrgent is true for today or tomorrow.
 */
function formatDeadline(deadline) {
  if (!deadline) return { text: '—', isUrgent: false };
  const d = new Date(deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (dueDate.getTime() === today.getTime()) {
    return { text: `Today, ${timeStr}`, isUrgent: true };
  }
  if (dueDate.getTime() === tomorrow.getTime()) {
    return { text: `Tomorrow, ${timeStr}`, isUrgent: true };
  }
  const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return { text: dateStr, isUrgent: false };
}

/** Resolve subject (and class id for link) from assignment classIds and classes list. */
function getSubjectAndClassId(assignment, classes) {
  const classIds = assignment.classIds || [];
  if (classIds.length === 0) return { subject: '—', classId: null };
  const firstId = String(classIds[0]);
  const cls = classes.find((c) => String(c.id) === firstId);
  return {
    subject: cls?.instructor ?? '—',
    classId: cls?.id ?? null,
  };
}

const AssignmentRow = ({ assignment, classes }) => {
  const { subject, classId } = getSubjectAndClassId(assignment, classes);
  const { text: dueText, isUrgent } = formatDeadline(assignment.deadline);
  const href = classId ? `/student/classes/${classId}` : '#';
  const content = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 hover:bg-white/5 rounded-xl transition cursor-pointer group gap-2 sm:gap-0">
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div
          className={`p-2 rounded-lg flex-shrink-0 ${
            isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
          }`}
        >
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate group-hover:text-cyan-400 transition">
            {assignment.title || '—'}
          </h4>
          <p className="text-xs sm:text-sm text-gray-400 truncate">{subject}</p>
        </div>
      </div>
      <div className="flex items-center justify-end mt-2 sm:mt-0 gap-1 sm:gap-2 w-full sm:w-auto">
        <span
          className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${
            isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400'
          }`}
        >
          {dueText}
        </span>
        <ChevronRight size={16} className="text-gray-600" />
      </div>
    </div>
  );
  if (href !== '#') {
    return <Link to={href} className="block">{content}</Link>;
  }
  return content;
};

const AssignmentList = ({ assignments = [], classes = [], loading = false }) => (
  <div className="lg:col-span-2 bg-[#150a2e]/60 border border-white/5 rounded-2xl p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
      <h3 className="font-semibold text-lg sm:text-xl">Upcoming Due Dates</h3>
      <span className="text-xs sm:text-sm text-gray-400 cursor-pointer hover:text-white">View All</span>
    </div>

    <div className="space-y-3 sm:space-y-4">
      {loading ? (
        <p className="text-sm text-gray-400 py-4">Loading assignments…</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No upcoming assignments.</p>
      ) : (
        assignments.map((a) => (
          <AssignmentRow key={a._id} assignment={a} classes={classes} />
        ))
      )}
    </div>
  </div>
);

export default AssignmentList;
