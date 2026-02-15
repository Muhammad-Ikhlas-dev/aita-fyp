import React from "react";
import { TrendingUp, GraduationCap, FileWarning, ClipboardList, BarChart3, AlertTriangle } from "lucide-react";
import ResultCard from "./components/ResultCard";     
import ScoreBar from "./components/ScoreBar";         

const StudentResult = () => {

  // Mock Data — You will replace with API later
  const quizResults = [
    { title: "Quiz 1: AI Fundamentals", score: 18, total: 20, status: "pass" },
    { title: "Quiz 2: Neural Networks", score: 14, total: 20, status: "pass" },
    { title: "Quiz 3: CNN Models", score: 9, total: 20, status: "fail" }
  ];

  const assignmentResults = [
    { title: "Edge Detection Report", score: 92, total: 100, status: "pass" },
    { title: "Backpropagation Essay", score: 78, total: 100, status: "pass" }
  ];

  const midsResults = [
    { title: "Midterm Exam 2025", score: 41, total: 60, status: "pass" }
  ];

  const plagiarismReports = [
    { title: "Quantum Lab Report", plag: 18 },
    { title: "Computer Vision Project", plag: 4 }
  ];

  return (
    <div className="w-full min-h-screen pb-20 animate-fade-in font-sans text-white">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Your Performance Overview</h2>
        <p className="text-gray-400 mt-1">Track your marks, scores, and plagiarism insights.</p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT SIDE (Results) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Quiz Results */}
          <ResultCard 
            title="Quiz Results"
            icon={<ClipboardList className="text-cyan-400" size={20} />}
          >
            <div className="space-y-5">
              {quizResults.map((item, idx) => (
                <ScoreBar key={idx} item={item} />
              ))}
            </div>
          </ResultCard>

          {/* Assignment Results */}
          <ResultCard 
            title="Assignment Results"
            icon={<GraduationCap className="text-purple-400" size={20} />}
          >
            <div className="space-y-5">
              {assignmentResults.map((item, idx) => (
                <ScoreBar key={idx} item={item} />
              ))}
            </div>
          </ResultCard>

          {/* Midterm Results */}
          <ResultCard 
            title="Midterm Exam Result"
            icon={<BarChart3 className="text-orange-400" size={20} />}
          >
            <div className="space-y-5">
              {midsResults.map((item, idx) => (
                <ScoreBar key={idx} item={item} />
              ))}
            </div>
          </ResultCard>
        </div>


        {/* RIGHT SIDE (Plagiarism + Summary Stats) */}
        <div className="lg:col-span-4 space-y-8">

          {/* SUMMARY CARD */}
          <div className="bg-[#150a2e] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-cyan-600/10 blur-[80px] rounded-full"></div>

            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-cyan-400" />
              Overall Performance
            </h3>

            <p className="text-gray-400 text-sm mb-4">Based on all quizzes, assignments, and exams.</p>

            <div className="text-4xl font-extrabold text-white mb-3">84%</div>

            <div className="text-sm text-gray-400">Great job! Keep improving 🔥</div>
          </div>

          {/* PLAGIARISM CARD */}
          <ResultCard 
            title="Plagiarism Reports"
            icon={<FileWarning className="text-red-400" size={20} />}
          >
            <div className="space-y-4">
              {plagiarismReports.map((i, id) => (
                <div 
                  key={id} 
                  className="bg-[#0d0620] border border-white/10 px-4 py-3 rounded-xl flex justify-between items-center hover:border-red-400/30 transition"
                >
                  <div>
                    <h4 className="font-semibold text-white text-sm">{i.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">Plagiarism detected</p>
                  </div>

                  <div className={`px-3 py-1 rounded-lg text-sm font-semibold 
                    ${i.plag > 15 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
                  `}>
                    {i.plag}%
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

        </div>

      </div>
    </div>
  );
};

export default StudentResult;
