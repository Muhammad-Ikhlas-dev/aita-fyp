import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  Plus,
  CheckCircle2, 
  Clock, 
  Layout, 
  ListOrdered, 
  BrainCircuit,
  Save,
  AlertCircle
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const UploadQuiz = () => {
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  
  // Quiz State
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    deadline: "",
    timeLimit: 30,
    quizType: "mcq", // mcq, open-ended, hybrid
    difficulty: "medium",
    questionCount: 5,
    selectedClassIds: [],
  });

  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch Classes on Mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id) return;
        
        const res = await fetch(`${API_BASE}/api/classes?createdBy=${user.id}`);
        const data = await res.json();
        if (data.success) setClasses(data.classes);
      } catch (err) {
        console.error("Failed to fetch classes", err);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const toggleClass = (id) => {
    setQuizData(prev => ({
      ...prev,
      selectedClassIds: prev.selectedClassIds.includes(id)
        ? prev.selectedClassIds.filter(i => i !== id)
        : [...prev.selectedClassIds, id]
    }));
  };

  // Handle manual question edits
  const handleQuestionEdit = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // 1. Trigger AI Generation
  const handleGenerateAI = async () => {
    if (!quizData.title.trim()) {
      setMessage({ type: "error", text: "Please enter a topic or title first." });
      return;
    }
    
    setIsGenerating(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE}/api/quizzes/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions: quizData.description || quizData.title,
          difficulty: quizData.difficulty,
          questionCount: quizData.questionCount,
          quizType: quizData.quizType
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        setMessage({ type: "success", text: "AI generated questions successfully! Review them below." });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection to AI failed. Check backend console." });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Publish Quiz to Database
  const handlePublish = async () => {
    if (questions.length === 0) return alert("Generate questions first!");
    if (quizData.selectedClassIds.length === 0) return alert("Select at least one class to publish to.");
    if (!quizData.deadline) return alert("Please set a submission deadline.");

    setIsPublishing(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      const res = await fetch(`${API_BASE}/api/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quizData,
          classIds: quizData.selectedClassIds,
          createdBy: user.id,
          questions: questions
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Quiz successfully published to selected classes!" });
        // Reset after success
        setTimeout(() => {
          setQuestions([]);
          setQuizData(prev => ({ 
            ...prev, 
            title: "", 
            description: "", 
            selectedClassIds: [],
            deadline: ""
          }));
          setMessage({ type: "", text: "" });
        }, 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Publishing failed. Check network connection." });
    } finally {
      setIsPublishing(false);
    }
  };

  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-sky-500/20 rounded-lg">
            <BrainCircuit className="text-sky-400" size={28} />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Smart Quiz Generator
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          <section className="p-5 rounded-2xl bg-[#0b0713] border border-[#1f1830] shadow-xl">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-sky-400 mb-4 uppercase tracking-wider">
              <Layout size={16} /> Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 ml-1">Quiz Topic/Title</label>
                <input 
                  name="title" 
                  value={quizData.title} 
                  onChange={handleInputChange}
                  placeholder="e.g., Object Oriented Programming"
                  className="w-full mt-1 p-3 rounded-xl bg-[#161025] border border-[#2d2445] focus:border-sky-500/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 ml-1">Time Limit (Minutes)</label>
                <input 
                  type="number"
                  name="timeLimit" 
                  value={quizData.timeLimit} 
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 rounded-xl bg-[#161025] border border-[#2d2445] outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 ml-1">Quiz Type</label>
                <select 
                  name="quizType" 
                  value={quizData.quizType} 
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 rounded-xl bg-[#161025] border border-[#2d2445] outline-none"
                >
                  <option value="mcq">Multiple Choice (MCQs)</option>
                  <option value="open-ended">Open Ended (Short Answer)</option>
                  <option value="hybrid">Mixed Mode</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-slate-500 ml-1">Difficulty</label>
                    <select name="difficulty" value={quizData.difficulty} onChange={handleInputChange} className="w-full mt-1 p-3 rounded-xl bg-[#161025] border border-[#2d2445] text-sm">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-500 ml-1">Questions</label>
                    <input type="number" name="questionCount" value={quizData.questionCount} onChange={handleInputChange} className="w-full mt-1 p-3 rounded-xl bg-[#161025] border border-[#2d2445] text-sm" />
                </div>
              </div>

              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-900/20 disabled:opacity-50 transition-all"
              >
                {isGenerating ? <Clock className="animate-spin" /> : <Sparkles size={20} />}
                {isGenerating ? "AI is Thinking..." : "Generate with AI"}
              </button>
            </div>
          </section>

          {/* Class Assignment Section */}
          <section className="p-5 rounded-2xl bg-[#0b0713] border border-[#1f1830]">
             <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Assign to Classes</h3>
             <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {loadingClasses ? (
                  <p className="text-xs text-slate-500 animate-pulse">Loading classes...</p>
                ) : classes.length === 0 ? (
                  <p className="text-xs text-red-400">No classes found. Create one first!</p>
                ) : (
                  classes.map(c => (
                    <div 
                        key={c._id} 
                        onClick={() => toggleClass(c._id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            quizData.selectedClassIds.includes(c._id) 
                            ? "bg-sky-500/10 border-sky-500/50 text-sky-100" 
                            : "bg-[#161025] border-[#2d2445] text-slate-400"
                        }`}
                    >
                        <span className="text-sm">{c.title}</span>
                        {quizData.selectedClassIds.includes(c._id) ? <CheckCircle2 size={16} /> : <Plus size={16} className="opacity-30" />}
                    </div>
                  ))
                )}
             </div>
          </section>
        </div>

        {/* Right Column: Questions Preview & Edit */}
        <div className="lg:col-span-2 space-y-6">
          {questions.length === 0 ? (
            <div className="h-full min-h-[450px] border-2 border-dashed border-[#1f1830] rounded-3xl flex flex-col items-center justify-center text-slate-500 bg-[#0b0713]/50">
               <div className="p-4 bg-[#161025] rounded-full mb-4">
                 <ListOrdered size={40} />
               </div>
               <p className="text-lg">No questions generated yet.</p>
               <p className="text-sm">Enter a topic and generate with AI to begin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  Review & Edit Questions <AlertCircle size={16} className="text-slate-500" />
                </h3>
                <span className="text-xs bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full border border-sky-500/30">
                    {questions.length} Questions Ready
                </span>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {questions.map((q, idx) => (
                  <div key={idx} className="group p-5 rounded-2xl bg-[#0b0713] border border-[#1f1830] hover:border-sky-500/30 transition-all relative">
                    <button 
                        onClick={() => removeQuestion(idx)}
                        className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    
                    <div className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#161025] border border-[#2d2445] flex items-center justify-center text-sky-400 font-bold text-sm">
                            {idx + 1}
                        </span>
                        <div className="flex-1 space-y-4">
                            {/* Editable Question Text */}
                            <textarea 
                              value={q.questionText}
                              onChange={(e) => handleQuestionEdit(idx, 'questionText', e.target.value)}
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-sky-500 outline-none transition-all text-slate-100 font-medium resize-none overflow-hidden"
                              rows="2"
                            />
                            
                            {q.type === 'mcq' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <input 
                                            value={opt}
                                            onChange={(e) => {
                                              const newOpts = [...q.options];
                                              newOpts[i] = e.target.value;
                                              handleQuestionEdit(idx, 'options', newOpts);
                                            }}
                                            className={`flex-1 p-2 rounded-lg text-xs border bg-[#161025] border-[#2d2445] outline-none transition-all ${opt === q.correctAnswer ? "border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/20" : "text-slate-400 focus:border-slate-600"}`}
                                          />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                                    <p className="text-[10px] text-indigo-400 uppercase font-bold mb-1">Reference Answer (For AI Grading)</p>
                                    <textarea 
                                      value={q.correctAnswer}
                                      onChange={(e) => handleQuestionEdit(idx, 'correctAnswer', e.target.value)}
                                      className="w-full bg-transparent text-sm text-slate-300 italic outline-none resize-none"
                                      rows="2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deadline and Final Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1f1830]">
                 <div>
                    <label className="text-xs text-slate-500 mb-1 block">Submission Deadline</label>
                    <input 
                        type="datetime-local" 
                        name="deadline"
                        value={quizData.deadline}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-xl bg-[#0b0713] border border-[#1f1830] outline-none focus:border-sky-500 transition-all"
                    />
                 </div>
                 <div className="flex items-end">
                    <button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                    >
                        {isPublishing ? <Clock className="animate-spin" /> : <Save size={20} />}
                        {isPublishing ? "Publishing..." : "Publish to Classes"}
                    </button>
                 </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {message.text && (
            <div className={`p-4 rounded-xl text-center text-sm font-medium transition-all ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
                {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadQuiz;