import React, { useState, useEffect } from 'react';

function AttendanceResults({ results, capturedImage, onClose, onSave }) {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [filter, setFilter] = useState('all'); // 'all' | 'present' | 'absent'

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (students.length > 0 && results) {
            const initialAttendance = {};
            students.forEach(student => {
                const recognized = results.recognized.find(r => r.name === student.name);
                initialAttendance[student.name] = {
                    status: recognized ? 'present' : 'absent',
                    confidence: recognized ? recognized.confidence : 0,
                    matched: !!recognized
                };
            });
            setAttendance(initialAttendance);
        }
    }, [students, results]);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/students');
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const toggleAttendance = (studentName) => {
        setAttendance(prev => ({
            ...prev,
            [studentName]: {
                ...prev[studentName],
                status: prev[studentName].status === 'present' ? 'absent' : 'present'
            }
        }));
    };

    const handleSave = () => {
        const presentStudents = Object.entries(attendance)
            .filter(([_, data]) => data.status === 'present')
            .map(([name, data]) => ({
                name,
                confidence: data.confidence,
                matched: data.matched
            }));

        onSave(presentStudents);
    };

    const presentCount = Object.values(attendance).filter(a => a.status === 'present').length;
    const absentCount = students.length - presentCount;

    // Filter students based on selected tab
    const displayedStudents = students.filter(student => {
        const status = attendance[student.name]?.status;
        if (filter === 'present') return status === 'present';
        if (filter === 'absent') return status !== 'present';
        return true; // 'all'
    });

    if (!results || students.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-50 overflow-y-auto animate-fadeIn">
            <div className="min-h-screen p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400 mb-2">
                                Attendance Session
                            </h2>
                            <p className="text-slate-400 font-light flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                Review and confirm attendance
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">Total Students</span>
                                <span className="text-purple-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </span>
                            </div>
                            <div className="text-4xl font-bold text-white">{students.length}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex items-end justify-between mb-2 relative z-10">
                                <span className="text-green-400 font-medium uppercase tracking-wider text-sm">Present</span>
                                <span className="text-green-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                            </div>
                            <div className="text-4xl font-bold text-green-300 relative z-10">{presentCount}</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 backdrop-blur-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex items-end justify-between mb-2 relative z-10">
                                <span className="text-red-400 font-medium uppercase tracking-wider text-sm">Absent</span>
                                <span className="text-red-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                            </div>
                            <div className="text-4xl font-bold text-red-300 relative z-10">{absentCount}</div>
                        </div>
                    </div>

                    {/* Main Content - Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                        {/* Left: Captured Image */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-lg flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Live Capture</h3>
                                </div>
                                <div className="relative aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/5 shadow-inner flex items-center justify-center group">
                                    {capturedImage ? (
                                        <>
                                            <img
                                                src={capturedImage}
                                                alt="Captured attendance"
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                                                    Captured at {new Date().toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span>No image captured</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-slate-400">Detected Faces</span>
                                        <span className="text-white font-mono font-bold bg-white/10 px-3 py-1 rounded-lg">{results.recognized.length + results.unknown}</span>
                                    </div>
                                    {results.unknown > 0 && (
                                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3 text-yellow-200">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <span className="text-sm font-medium">{results.unknown} unassigned face(s) found</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Student Grid */}
                        <div className="lg:col-span-7 bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col h-[600px]">
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Attendance List</h3>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'all'
                                                ? 'bg-white/10 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilter('present')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${filter === 'present'
                                                ? 'bg-green-600/80 text-white shadow-sm'
                                                : 'text-green-400/80 hover:text-green-300'
                                            }`}
                                    >
                                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                        Present ({presentCount})
                                    </button>
                                    <button
                                        onClick={() => setFilter('absent')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${filter === 'absent'
                                                ? 'bg-red-600/80 text-white shadow-sm'
                                                : 'text-red-400/80 hover:text-red-300'
                                            }`}
                                    >
                                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                        Absent ({absentCount})
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {displayedStudents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-lg font-medium">
                                            No {filter === 'present' ? 'present' : filter === 'absent' ? 'absent' : 'matching'} students
                                        </p>
                                    </div>
                                ) : (
                                    displayedStudents.map((student) => {
                                        const studentAttendance = attendance[student.name] || {};
                                        const isPresent = studentAttendance.status === 'present';
                                        const wasMatched = studentAttendance.matched;

                                        return (
                                            <div
                                                key={student.name}
                                                onClick={() => toggleAttendance(student.name)}
                                                className={`group flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${isPresent
                                                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30 hover:border-green-500/50'
                                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                {/* Student Photo */}
                                                <div className="relative">
                                                    <img
                                                        src={`http://localhost:5000${student.url}`}
                                                        alt={student.name}
                                                        className={`w-14 h-14 rounded-xl object-cover border-2 transition-all ${isPresent ? 'border-green-500/50' : 'border-slate-700'
                                                            }`}
                                                    />
                                                    {isPresent && (
                                                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-slate-900 shadow-sm">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Student Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4
                                                            className={`font-semibold text-lg capitalize truncate transition-colors ${isPresent ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                                                }`}
                                                        >
                                                            {student.name.replace(/_/g, ' ')}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-2 h-5">
                                                        {wasMatched ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/30">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Matched {Math.round(studentAttendance.confidence)}%
                                                            </span>
                                                        ) : isPresent ? (
                                                            <span className="text-xs text-green-400/80 font-medium">Marked Manually</span>
                                                        ) : (
                                                            <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                                                Click to mark present
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Toggle Switch */}
                                                <div
                                                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 relative ${isPresent ? 'bg-green-500' : 'bg-slate-700 group-hover:bg-slate-600'
                                                        }`}
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isPresent ? 'translate-x-5' : 'translate-x-0'
                                                            }`}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 left-0 right-0 p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 z-50">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="text-slate-400 text-sm hidden md:block">
                                <span className="font-semibold text-white">{presentCount}</span> students marked present out of{' '}
                                <span className="text-slate-300">{students.length}</span>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={onClose}
                                    className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold border border-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Save Attendance</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttendanceResults;