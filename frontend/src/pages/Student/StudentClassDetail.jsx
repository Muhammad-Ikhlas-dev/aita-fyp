import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Upload,
  CheckCircle,
  Eye,
  Trash2,
  HelpCircle,
  Clock,
  PlayCircle
} from "lucide-react";

const API_BASE = "http://localhost:5000";

function formatDateDMY(date) {
  if (!date) return "—";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${day}/${month}/${year}, ${time}`;
}

const StudentClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("assignments");
  
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isPastDeadline = (deadline) =>
    deadline && new Date() > new Date(deadline);

  // Unified Data Fetching
  useEffect(() => {
    if (!classId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // We pass studentId to the quiz API so the backend can attach submission status
        const [classRes, assignRes, quizRes] = await Promise.all([
          fetch(`${API_BASE}/api/classes/${classId}`),
          fetch(`${API_BASE}/api/assignments?classId=${encodeURIComponent(classId)}`),
          fetch(`${API_BASE}/api/quizzes?classId=${encodeURIComponent(classId)}&studentId=${user.id}`)
        ]);

        if (cancelled) return;

        const classData = await classRes.json();
        if (!classRes.ok) throw new Error(classData.message || "Class not found");
        setClassInfo(classData.class);

        // Assignments Logic
        if (assignRes.ok) {
          const assignData = await assignRes.json();
          const list = assignData.assignments || [];
          setAssignments(list);

          // Fetch Assignment Submissions
          if (user.id && list.length > 0) {
            const subs = await Promise.all(
              list.map((a) =>
                fetch(`${API_BASE}/api/submissions?assignmentId=${a._id}&studentId=${user.id}`)
                  .then((r) => r.json()).catch(() => ({}))
              )
            );
            const aMap = {};
            list.forEach((a, i) => {
              if (subs[i]?.submission) aMap[a._id] = subs[i].submission;
            });
            setSubmissionsMap(aMap);
          }
        }

        // Quizzes Logic (Submission info is already inside the quiz objects from backend)
        if (quizRes.ok) {
          const quizData = await quizRes.json();
          setQuizzes(quizData.quizzes || []);
        }

      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [classId, user.id]);

  const handleUploadClick = (assignment) => {
    setUploadError(null);
    if (isPastDeadline(assignment.deadline)) {
      setUploadError("Deadline reached.");
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.dataset.assignmentId = assignment._id;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    const assignmentId = e.target.dataset?.assignmentId;
    if (!file || !assignmentId) return;
    setUploadingId(assignmentId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignmentId);
      formData.append("studentId", user.id);
      const res = await fetch(`${API_BASE}/api/submissions`, { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok) setSubmissionsMap(prev => ({ ...prev, [assignmentId]: result.submission }));
    } catch (err) { setUploadError("Upload failed."); } 
    finally { setUploadingId(null); }
  };

  if (loading) return <div className="p-12 text-slate-400 animate-pulse">Loading classroom...</div>;
  if (error) return <div className="p-12 text-red-400">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 text-slate-200">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-8 transition-colors">
        <ArrowLeft size={18} /> Back to My Classes
      </Link>

      {/* Class cover + title */}
      <div className="bg-[#0f0b1a] border border-[#1f1830] rounded-xl overflow-hidden mb-8">
        {classInfo?.cover ? (
          <div className="aspect-[3/1] w-full bg-[#1f1830] min-h-[140px]">
            <img
              src={`${API_BASE}${classInfo.cover}`}
              alt={classInfo.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[3/1] w-full max-h-40 bg-[#1f1830] flex items-center justify-center text-slate-500">
            No cover
          </div>
        )}
        <div className="p-4">
          <h1 className="text-4xl font-bold text-white mb-2">{classInfo?.title}</h1>
          <p className="text-slate-400 flex items-center gap-2">
             <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest">Subject</span>
             {classInfo?.subject || "General"}
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-white/5 mb-10 gap-8">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${
            activeTab === "assignments" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FileText size={18} /> Assignments
          {activeTab === "assignments" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${
            activeTab === "quizzes" ? "text-purple-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <HelpCircle size={18} /> Quizzes
          {activeTab === "quizzes" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full" />}
        </button>
      </div>

      {uploadError && <p className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{uploadError}</p>}

      {/* ASSIGNMENTS RENDER */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500">No assignments posted yet.</div>
          ) : (
            assignments.map((a) => {
              const submission = submissionsMap[a._id];
              const isExpired = isPastDeadline(a.deadline);
              return (
                <div key={a._id} className="flex flex-col md:flex-row gap-4 p-5 rounded-3xl bg-[#0b0713] border border-[#1f1830] hover:border-cyan-500/30 transition-all items-center shadow-xl">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-cyan-500/5 flex items-center justify-center text-cyan-500 border border-cyan-500/10">
                    <FileText size={28} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-white">{a.title}</h3>
                    <p className="text-slate-500 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                      <Calendar size={14} className="text-cyan-500/50" /> Due: {formatDateDMY(a.deadline)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {submission ? (
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase flex items-center gap-2">
                           <CheckCircle size={14} /> Turned In
                        </span>
                        <a href={`${API_BASE}/api/submissions/${submission._id}/file`} target="_blank" className="p-2 text-slate-400 hover:text-white transition"><Eye size={20}/></a>
                      </div>
                    ) : isExpired ? (
                      <span className="text-xs font-bold text-red-500/50 uppercase">Deadline Passed</span>
                    ) : (
                      <button onClick={() => handleUploadClick(a)} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all">Upload Task</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* QUIZZES RENDER */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500">No quizzes available for this class.</div>
          ) : (
            quizzes.map((q) => {
              // submission is now part of the quiz object thanks to our updated backend
              const submission = q.submission; 
              const isExpired = isPastDeadline(q.deadline);

              return (
                <div key={q._id} className="flex flex-col md:flex-row gap-4 p-6 rounded-3xl bg-[#0b0713] border border-[#1f1830] hover:border-purple-500/30 transition-all items-center shadow-xl">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-purple-500/5 flex items-center justify-center text-purple-500 border border-purple-500/10">
                    <HelpCircle size={28} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-white">{q.title}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                       <p className="text-slate-500 text-xs flex items-center gap-1.5"><Calendar size={14}/> {formatDateDMY(q.deadline)}</p>
                       <p className="text-slate-500 text-xs flex items-center gap-1.5"><Clock size={14}/> {q.timeLimit} Minutes</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {submission ? (
                      <div className="flex flex-col items-center md:items-end gap-1">
                        <span className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase flex items-center gap-2">
                           <CheckCircle size={14} /> Attempted
                        </span>
                        <p className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">
                          Score: {submission.score} / {submission.totalPoints}
                        </p>
                      </div>
                    ) : isExpired ? (
                      <span className="text-xs font-bold text-red-500/50 uppercase">Expired</span>
                    ) : (
                      <Link 
                        to={`/student/quiz/${q._id}`} 
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/40 flex items-center gap-2 transition-all"
                      >
                        <PlayCircle size={18}/> Start Quiz
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default StudentClassDetail;