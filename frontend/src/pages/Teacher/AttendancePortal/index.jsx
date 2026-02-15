import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AttendanceContentArea from './AttendanceContentArea';

function AttendancePortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const classContext = location.state || {};

  // Only allow access when opened from a class (Mark attendance button)
  useEffect(() => {
    if (!classContext.classId) {
      navigate('/teacher/classes', { replace: true });
    }
  }, [classContext.classId, navigate]);

  if (!classContext.classId) {
    return null; // or a brief loading state while redirecting
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <AttendanceContentArea
        classId={classContext.classId}
        className={classContext.className}
        subject={classContext.subject}
      />
    </div>
    





















    //   {/* <!-- Camera Modal / Capture Interface (hidden by default) --> */}
    //   <div id="camera-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    //     <div class="bg-zinc-950/90 border border-purple-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-purple-900/40">
    //       {/* <!-- Modal Header --> */}
    //       <div class="flex items-center justify-between px-6 py-4 border-b border-purple-900/30">
    //         <h3 class="text-xl font-semibold text-purple-300">Camera Capture</h3>
    //         <button id="close-camera" class="text-zinc-400 hover:text-white text-3xl leading-none">&times;</button>
    //       </div>
    
    //       {/* <!-- Video Preview --> */}
    //       <div class="relative aspect-square bg-black">
    //         <video 
    //           id="video" 
    //           autoplay 
    //           playsinline 
    //           class="w-full h-full object-cover"
    //         ></video>
    
    //         <canvas id="canvas" class="hidden"></canvas>
    
    //         {/* <!-- Scanning / Face Frame Overlay --> */}
    //         <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
    //           <div class="w-4/5 h-4/5 rounded-2xl border-4 border-purple-400/70 shadow-[0_0_25px_rgba(168,85,247,0.6)]"></div>
    //         </div>
    //       </div>
    
    //       {/* <!-- Controls --> */}
    //       <div class="p-6 flex items-center justify-center gap-4">
    //         <button 
    //           id="take-photo-btn"
    //           class="px-10 py-3 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-medium rounded-full transition shadow-lg shadow-purple-900/50"
    //         >
    //           Capture
    //         </button>
    
    //         <button 
    //           id="retake-btn"
    //           class="hidden px-8 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-full transition"
    //         >
    //           Retake
    //         </button>
    
    //         <button 
    //           id="save-captured-btn"
    //           class="hidden px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-full transition shadow-lg shadow-emerald-900/40"
    //         >
    //           Save Photo
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    
    //   {/* <!-- Image Preview (after upload or capture) --> */}
    //   <div id="preview-container" class="hidden mt-10 text-center">
    //     <img 
    //       id="preview-image" 
    //       alt="Attendance preview" 
    //       class="max-w-xs md:max-w-md mx-auto rounded-2xl border-4 border-purple-500/50 shadow-2xl shadow-purple-900/40 object-cover"
    //     />
    
    //     <div class="mt-6 flex items-center justify-center gap-4">
    //       <button 
    //         id="clear-preview"
    //         class="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition"
    //       >
    //         Clear
    //       </button>
    //       <button 
    //         id="confirm-upload"
    //         class="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-full transition shadow-lg shadow-purple-900/50"
    //       >
    //         Confirm & Mark
    //       </button>
    //     </div>
    //   </div>
    // </div>
  )
}

export default AttendancePortal
