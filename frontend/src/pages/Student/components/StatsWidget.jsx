import React from 'react';

const StatsWidget = () => (
  <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/10 rounded-2xl p-6">
    <h3 className="font-semibold text-lg mb-4">Academic Progress</h3>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">Overall GPA</span>
        <span className="text-2xl font-bold text-cyan-400">3.8</span>
      </div>
      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-400 to-purple-500 w-[85%] h-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-xs text-gray-400">Submitted</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">94%</div>
          <div className="text-xs text-gray-400">Attendance</div>
        </div>
      </div>
    </div>
  </div>
);

export default StatsWidget;
