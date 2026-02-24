import { useState } from 'react';
import ClassCard from './ClassCard';
import JoinClassroomModal from './JoinClassroomModal';
import { Plus } from 'lucide-react';

const ClassroomGrid = ({ classes = [], classesLoading = false, classesError = null, onJoinSuccess }) => {
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

      {/* Loading / Error / Empty */}
      {classesLoading && (
        <div className="py-8 text-center text-gray-400">Loading your classes…</div>
      )}
      {!classesLoading && classesError && (
        <div className="py-8 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-center">
          {classesError}
        </div>
      )}
      {!classesLoading && !classesError && classes.length === 0 && (
        <div className="py-12 px-4 rounded-xl bg-white/5 border border-white/10 text-center text-gray-400">
          <p className="mb-2">You haven’t joined any class yet.</p>
          <p className="text-sm">Use the join link shared by your teacher or the &quot;Join Class&quot; button above.</p>
        </div>
      )}

      {/* Class Cards Grid */}
      {!classesLoading && !classesError && classes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {classes.map((cls) => (
            <ClassCard key={cls.id} data={cls} />
          ))}
        </div>
      )}

      {/* Join Class Modal */}
      <JoinClassroomModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)}
        onJoinSuccess={onJoinSuccess}
      />
    </>
  );
};


export default ClassroomGrid;