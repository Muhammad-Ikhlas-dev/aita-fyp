import { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Loader2, 
  CheckCircle, 
  School, 
  User 
} from 'lucide-react';

const JoinClassroomModal = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle'); // 'idle' | 'searching' | 'found' | 'error' | 'joined'
  const [foundClass, setFoundClass] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCode('');
        setSearchStatus('idle');
        setFoundClass(null);
      }, 300);
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSearchStatus('searching');
    
    // Simulate API Call
    setTimeout(() => {
      // Mock Success Logic
      if (code.length > 3) {
        setFoundClass({
          name: "Advanced React Patterns",
          instructor: "Dr. Emily Chen",
          students: 34,
          schedule: "Mon/Wed 10:00 AM"
        });
        setSearchStatus('found');
      } else {
        setSearchStatus('error');
      }
    }, 1500);
  };

  const handleJoin = () => {
    // Simulate Join API Call
    setSearchStatus('joined');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0d0620]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#150a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Join Classroom</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition p-1 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {searchStatus === 'joined' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-xl font-bold text-white">Successfully Enrolled!</h4>
              <p className="text-gray-400 mt-2">Redirecting you to the classroom...</p>
            </div>
          ) : (
            <>
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Class Code</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="e.g. PHYS101" 
                    className="w-full bg-[#0d0620] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none transition uppercase tracking-widest"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (searchStatus === 'error') setSearchStatus('idle');
                    }}
                    disabled={searchStatus === 'searching' || searchStatus === 'found'}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                  
                  {searchStatus === 'searching' && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       <Loader2 className="animate-spin text-cyan-400" size={18} />
                     </div>
                  )}
                </div>
                {searchStatus === 'error' && (
                  <p className="text-red-400 text-xs mt-2 ml-1">Invalid code. Please check and try again.</p>
                )}
              </form>

              {/* Found Class Result */}
              {searchStatus === 'found' && foundClass && (
                <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-white/10 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                      <School size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg leading-tight">{foundClass.name}</h4>
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                        <User size={12} /> {foundClass.instructor}
                      </p>
                      <div className="mt-3 flex gap-3 text-xs text-gray-500">
                        <span className="bg-white/5 px-2 py-1 rounded">{foundClass.students} Students</span>
                        <span className="bg-white/5 px-2 py-1 rounded">{foundClass.schedule}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        {searchStatus !== 'joined' && (
          <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#0d0620]/30">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition text-sm font-medium"
            >
              Cancel
            </button>
            
            {searchStatus === 'found' ? (
              <button 
                onClick={handleJoin}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
              >
                Enroll Now
              </button>
            ) : (
              <button 
                onClick={handleSearch}
                disabled={!code || searchStatus === 'searching'}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Find Class
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinClassroomModal