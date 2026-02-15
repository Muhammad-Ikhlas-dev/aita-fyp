import { useState } from 'react';
import ClassCard from './ClassCard';
import JoinClassroomModal from './JoinClassroomModal';
import { Plus } from 'lucide-react';

const ClassroomGrid = ({ classes }) => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <>
      {/* Header + Join Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-200">Enrolled Classrooms</h2>
        <button 
          onClick={() => setIsJoinModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition text-sm sm:text-base shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <Plus size={18} />
          <span>Join Class</span>
        </button>                
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
        {classes.map((cls) => (
          <ClassCard key={cls.id} data={cls} />
        ))}
      </div>

      {/* Join Class Modal */}
      <JoinClassroomModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </>
  );
};


export default ClassroomGrid;