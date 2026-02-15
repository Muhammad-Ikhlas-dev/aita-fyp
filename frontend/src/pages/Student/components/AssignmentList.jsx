import { FileText, ChevronRight } from 'lucide-react';

const AssignmentList = () => (
  <div className="lg:col-span-2 bg-[#150a2e]/60 border border-white/5 rounded-2xl p-4 sm:p-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
      <h3 className="font-semibold text-lg sm:text-xl">Upcoming Due Dates</h3>
      <span className="text-xs sm:text-sm text-gray-400 cursor-pointer hover:text-white">View All</span>
    </div>

    {/* Assignment Rows */}
    <div className="space-y-3 sm:space-y-4">
      <AssignmentRow subject="Computer Vision" title="Edge Detection Algorithm" due="Today, 11:59 PM" status="Urgent" />
      <AssignmentRow subject="Neural Networks" title="Backpropagation Essay" due="Tomorrow, 5:00 PM" status="Pending" />
      <AssignmentRow subject="Quantum Physics" title="Schrödinger Equation" due="Oct 24" status="Normal" />
    </div>
  </div>
);

const AssignmentRow = ({ subject, title, due, status }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 hover:bg-white/5 rounded-xl transition cursor-pointer group gap-2 sm:gap-0">
    
    {/* Left: Icon + Details */}
    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
      <div className={`p-2 rounded-lg flex-shrink-0 ${status === 'Urgent' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
        <FileText size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate group-hover:text-cyan-400 transition">{title}</h4>
        <p className="text-xs sm:text-sm text-gray-400 truncate">{subject}</p>
      </div>
    </div>

    {/* Right: Due + Chevron */}
    <div className="flex items-center justify-end mt-2 sm:mt-0 gap-1 sm:gap-2 w-full sm:w-auto">
      <span className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${status === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-gray-400'}`}>
        {due}
      </span>
      <ChevronRight size={16} className="text-gray-600" />
    </div>
  </div>
);

export default AssignmentList;
