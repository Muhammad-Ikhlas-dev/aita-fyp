import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SCROLL_AMOUNT = 220;

function StudentList({students, fetchStudents, loading, error}) {
    const sliderRef = useRef(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const scrollLeft = () => {
        if (sliderRef.current) sliderRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    };
    const scrollRight = () => {
        if (sliderRef.current) sliderRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    };

    // Event: delete a labeled image — DELETE /api/students/:filename, then refetch list
    const handleDeleteStudent = async (student) => {
        if (!window.confirm(`Are you sure you want to delete ${student.name.replace(/_/g, ' ')}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/students/${student.filename}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                // Refresh the student list
                await fetchStudents();
            } else {
                console.error('Delete failed:', data);
                alert('Failed to delete student: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error deleting student:', err);
            alert('Error deleting student. Check console for details.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300">⚠️ {error}</p>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Students Yet</h3>
                <p className="text-slate-400">Upload student photos to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Registered Students</h2>
                    <p className="text-slate-400 mt-1">{students.length} student{students.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={fetchStudents}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 rounded-lg text-purple-300 font-medium transition-all shrink-0"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Horizontal slider with left/right buttons */}
            <div className="relative -mx-2 sm:-mx-4 flex items-center gap-2">
                <button
                    type="button"
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                    className="shrink-0 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600/30 border border-white/20 hover:border-purple-500/50 flex items-center justify-center text-white transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <div
                    ref={sliderRef}
                    className="overflow-x-auto overflow-y-hidden scroll-smooth flex-1 min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    <div className="flex gap-6 flex-nowrap w-max min-w-full py-2">
                        {students.map((student, index) => (
                            <div
                                key={index}
                                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 overflow-hidden shrink-0 w-36 sm:w-40 md:w-44"
                            >
                                {/* Gradient Background Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteStudent(student);
                                    }}
                                    className="absolute top-2 right-2 z-10 bg-red-500/80 hover:bg-red-600 text-white rounded-lg p-2 shadow-lg backdrop-blur-md transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
                                    title="Delete student"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                                {/* Student Photo */}
                                <div className="aspect-square mb-3 rounded-xl overflow-hidden bg-slate-900/50 border border-white/10 group-hover:border-purple-500/50 transition-all shadow-inner relative">
                                    <img
                                        src={`http://localhost:5000${student.url}`}
                                        alt={student.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl text-slate-600">👤</div>`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                {/* Student Name */}
                                <div className="text-center relative z-10">
                                    <h3 className="font-bold text-white capitalize truncate text-sm tracking-wide group-hover:text-purple-300 transition-colors">
                                        {student.name.replace(/_/g, ' ')}
                                    </h3>
                                    <div className="w-8 h-1 bg-purple-500/50 rounded-full mx-auto mt-2 group-hover:w-12 transition-all duration-300"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={scrollRight}
                    aria-label="Scroll right"
                    className="shrink-0 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600/30 border border-white/20 hover:border-purple-500/50 flex items-center justify-center text-white transition-all"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}

export default StudentList;
