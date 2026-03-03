import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Send, AlertCircle, CheckCircle, Brain, ChevronRight } from "lucide-react";

const API_BASE = "http://localhost:5001";

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]); // [{ questionId, studentAnswer }]
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 1. Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/quizzes/${quizId}`);
        const data = await res.json();
        if (data.success) {
          setQuiz(data.quiz);
          setTimeLeft(data.quiz.timeLimit * 60);
          // Pre-fill answer state
          setAnswers(data.quiz.questions.map(q => ({ 
            questionId: q._id, 
            studentAnswer: "" 
          })));
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // 2. Submit Function
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isFinished) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/quizzes/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          studentId: user.id,
          answers
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setIsFinished(true);
        // If the quiz contains open-ended questions, trigger the AI grader
        if (data.needsAiGrading) {
          fetch(`${API_BASE}/api/quizzes/ai-grade`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId: data.submission._id }),
          });
        }
      }
    } catch (err) {
      alert("Submission failed. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, quizId, isSubmitting, isFinished, user.id]);

  // 3. Timer Logic
  useEffect(() => {
    if (timeLeft <= 0 || isFinished) {
      if (timeLeft === 0 && quiz && !isFinished) handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, handleSubmit, quiz]);

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => prev.map(a => a.questionId === qId ? { ...a, studentAnswer: val } : a));
  };

  if (!quiz) return <div className="p-10 text-center text-slate-400">Loading Quiz...</div>;

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 bg-[#0b0713] border border-[#1f1830] rounded-3xl text-center shadow-2xl">
        <CheckCircle className="text-emerald-500 mx-auto mb-4" size={60} />
        <h2 className="text-2xl font-bold text-white mb-2">Quiz Submitted!</h2>
        <p className="text-slate-400 mb-8">Your responses have been recorded. You can view your marks in the class dashboard.</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all">
          Return to Class
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-200">
      {/* Timer Header */}
      <div className="sticky top-4 z-50 flex items-center justify-between p-4 bg-[#161025]/80 backdrop-blur-md border border-white/10 rounded-2xl mb-10 shadow-2xl">
        <div className="flex items-center gap-3">
          <Brain className="text-purple-400" size={24} />
          <h2 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{quiz.title}</h2>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${timeLeft < 60 ? "border-red-500 text-red-500 animate-pulse" : "border-purple-500/30 text-purple-400"}`}>
          <Clock size={20} />
          <span className="font-mono text-xl font-black">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-8">
        {quiz.questions.map((q, idx) => (
          <div key={q._id} className="p-8 rounded-3xl bg-[#0b0713] border border-[#1f1830] shadow-xl">
            <div className="flex gap-4 mb-6">
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black">
                {idx + 1}
              </span>
              <p className="text-xl font-medium leading-relaxed">{q.questionText}</p>
            </div>

            {q.type === "mcq" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-14">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerChange(q._id, opt)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                      answers[idx]?.studentAnswer === opt 
                      ? "border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                      : "border-[#1f1830] bg-[#161025] hover:border-slate-600 text-slate-400"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[idx]?.studentAnswer === opt ? "border-purple-400" : "border-slate-600"}`}>
                      {answers[idx]?.studentAnswer === opt && <div className="w-2.5 h-2.5 bg-purple-400 rounded-full" />}
                    </div>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="ml-0 md:ml-14">
                <textarea
                  placeholder="Type your detailed answer here..."
                  className="w-full p-5 rounded-2xl bg-[#161025] border-2 border-[#1f1830] focus:border-purple-500/50 outline-none transition-all min-h-[150px] text-slate-200"
                  value={answers[idx]?.studentAnswer}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-12 mb-20 flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-purple-900/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : <><Send size={20} /> Finish Quiz</>}
        </button>
      </div>
    </div>
  );
};

export default TakeQuiz;