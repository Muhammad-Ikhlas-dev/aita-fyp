import React, { useState } from 'react';
import ClassroomGrid from './components/ClassroomGrid';
import AssignmentList from './components/AssignmentList';
import StatsWidget from './components/StatsWidget';

const StudentDashboard = () => {
  const [classes] = useState([
    {
      id: 1,
      name: "Advanced Computer Vision",
      instructor: "Dr. A. Smith",
      gradient: "from-purple-600 to-blue-600",
      assignmentsPending: 2,
      nextDue: "Today, 11:59 PM",
      progress: 75
    },
    {
      id: 2,
      name: "Quantum Physics 101",
      instructor: "Prof. R. Feynman",
      gradient: "from-cyan-600 to-teal-600",
      assignmentsPending: 0,
      nextDue: "Mon, 9:00 AM",
      progress: 92
    },
    {
      id: 3,
      name: "Neural Networks & AI",
      instructor: "Ms. Sarah Connor",
      gradient: "from-pink-600 to-rose-600",
      assignmentsPending: 1,
      nextDue: "Fri, 5:00 PM",
      progress: 45
    },
  ]);

  return (
    <div className="flex h-screen bg-[#0d0620] overflow-hidden font-sans text-white">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-purple-900/10 blur-[120px] pointer-events-none"></div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <ClassroomGrid classes={classes} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AssignmentList />
            <StatsWidget />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
