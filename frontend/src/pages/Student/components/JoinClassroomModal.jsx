import { useState, useEffect } from 'react';
import {
  X,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  School,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

/**
 * Extract join code from a class join link.
 * Supports: https://host/join/CODE, http://host/join/CODE, /join/CODE
 */
function getCodeFromJoinLink(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      const match = url.pathname.match(/\/join\/([^/?#]+)/i);
      return match ? match[1].trim() : null;
    }
    const match = trimmed.match(/\/join\/([^/?#]+)/i) || trimmed.match(/^([A-Za-z0-9]{6,})$/);
    return match ? match[1].trim() : (trimmed.length >= 6 ? trimmed : null);
  } catch {
    return trimmed.length >= 6 ? trimmed : null;
  }
}

const JoinClassroomModal = ({ isOpen, onClose, onJoinSuccess }) => {
  const [linkInput, setLinkInput] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle'); // 'idle' | 'searching' | 'found' | 'error' | 'joining' | 'joined'
  const [foundClass, setFoundClass] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setLinkInput('');
        setSearchStatus('idle');
        setFoundClass(null);
        setErrorMessage('');
      }, 300);
    }
  }, [isOpen]);

  const handleLookup = async (e) => {
    e.preventDefault();
    const code = getCodeFromJoinLink(linkInput);
    if (!code) {
      setSearchStatus('error');
      setErrorMessage('Please paste the full class join link (e.g. https://.../join/XXXX) or the join code.');
      return;
    }

    setSearchStatus('searching');
    setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE}/classes/join/${encodeURIComponent(code)}`);
      const result = await res.json();
      if (!res.ok) {
        setSearchStatus('error');
        setFoundClass(null);
        setErrorMessage(result.message || 'Invalid or expired link. Please check and try again.');
        return;
      }
      setFoundClass({
        classId: result.class?.classId,
        title: result.class?.title,
        joinCode: result.class?.joinCode,
      });
      setSearchStatus('found');
    } catch (err) {
      console.error('Lookup join code error:', err);
      setSearchStatus('error');
      setFoundClass(null);
      setErrorMessage('Network error. Please try again.');
    }
  };

  const handleJoin = async () => {
    if (!foundClass?.classId) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'student') {
      setErrorMessage('You must be logged in as a student to join.');
      return;
    }

    setSearchStatus('joining');
    setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE}/classes/${foundClass.classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setErrorMessage('You are already in this class.');
        } else {
          setErrorMessage(result.message || 'Could not join class.');
        }
        setSearchStatus('found');
        return;
      }
      setSearchStatus('joined');
      setTimeout(() => {
        onClose();
        if (typeof onJoinSuccess === 'function') onJoinSuccess();
      }, 1500);
    } catch (err) {
      console.error('Join class error:', err);
      setErrorMessage('Network error. Please try again.');
      setSearchStatus('found');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[#0d0620]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-md bg-[#150a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />

        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Join Classroom</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {searchStatus === 'joined' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-xl font-bold text-white">Successfully joined!</h4>
              <p className="text-gray-400 mt-2">The class has been added to My Classes.</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleLookup} className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Class join link</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Paste the link shared by your teacher (e.g. https://.../join/XXXX)"
                    className="w-full bg-[#0d0620] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none transition text-sm"
                    value={linkInput}
                    onChange={(e) => {
                      setLinkInput(e.target.value);
                      if (searchStatus === 'error') {
                        setSearchStatus('idle');
                        setErrorMessage('');
                      }
                    }}
                    disabled={searchStatus === 'searching' || searchStatus === 'joining' || searchStatus === 'found'}
                  />
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                  {(searchStatus === 'searching' || searchStatus === 'joining') && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-cyan-400" size={18} />
                    </div>
                  )}
                </div>
                {(searchStatus === 'error' && errorMessage) && (
                  <p className="text-red-400 text-xs mt-2 ml-1">{errorMessage}</p>
                )}
              </form>

              {searchStatus === 'found' && foundClass && (
                <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                      <School size={24} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-lg leading-tight">{foundClass.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">Click &quot;Join class&quot; to enroll. No photo required from here.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {searchStatus !== 'joined' && (
          <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#0d0620]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition text-sm font-medium"
            >
              Cancel
            </button>
            {searchStatus === 'found' ? (
              <button
                type="button"
                onClick={handleJoin}
                disabled={searchStatus === 'joining'}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-900/20 transition-all active:scale-95 disabled:opacity-70"
              >
                {searchStatus === 'joining' ? 'Joining…' : 'Join class'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLookup}
                disabled={!linkInput.trim() || searchStatus === 'searching'}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchStatus === 'searching' ? 'Looking up…' : 'Look up class'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinClassroomModal;
