import { 
  MoreVertical, 
  UploadCloud,  
  User 
} from 'lucide-react';

const ClassCard = ({ data }) => (
  <div className="group relative bg-[#150a2e] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg cursor-pointer">
    
    {/* Card Header */}
    <div className={`h-24 sm:h-28 bg-gradient-to-r ${data.gradient} p-3 sm:p-4 relative`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg sm:text-xl font-bold text-white truncate w-3/4">{data.name}</h3>
        <button className="p-1 hover:bg-black/20 rounded-full text-white/80 transition">
          <MoreVertical size={18} />
        </button>
      </div>
      <p className="text-white/80 text-xs sm:text-sm mt-1 flex items-center gap-1">
        <User size={12} /> {data.instructor}
      </p>
    </div>

    {/* Card Body */}
    <div className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-2 sm:gap-0">
        <div>
          <span className="text-xs sm:text-sm text-gray-400 block mb-1">Next Due</span>
          <span className="text-sm sm:text-base font-medium text-white">{data.nextDue}</span>
        </div>
        <div className="text-right">
          <span className="text-xs sm:text-sm text-gray-400 block mb-1">Grade</span>
          <span className="text-lg sm:text-xl font-bold text-cyan-400">{data.progress}%</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-white/5 pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2">
        <button className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm sm:text-base text-gray-300 transition">
          View Class
        </button>
        <button className="flex items-center justify-center w-full sm:w-12 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition border border-cyan-500/30" title="Upload Assignment">
          <UploadCloud size={18} />
        </button>
      </div>
    </div>
  </div>
);

export default ClassCard;