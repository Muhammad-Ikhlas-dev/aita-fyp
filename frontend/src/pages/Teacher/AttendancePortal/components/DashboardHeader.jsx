import React from 'react';

function DashboardHeader({ studentCount}) {
    return (
        <div className="mb-8 animate-fadeIn">
            {/* Main Header */}
            <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6 shadow-2xl">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r text-white mb-2">
                            Attendance Portal
                        </h1>
                        <p className="text-slate-400 text-lg font-light">
                            AI-Powered Face Recognition System
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Student Count Card */}
                        <div className="flex flex-col items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <span className="text-3xl font-bold text-white mb-1">{studentCount}</span>
                            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium"> {`student${studentCount>1 ? 's': ''}`}</span>
                        </div>

                        {/* Status Card */}
                        <div className="flex flex-col items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-sm font-semibold text-green-400">Online</span>
                            </div>
                            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium group-hover:text-purple-300 transition-colors">System Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardHeader;
