import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API_BASE = "http://localhost:5001/api";

export default function JoinClass() {
  const { code } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (!code || !code.trim()) {
      setError("Invalid join link.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/classes/join/${encodeURIComponent(code.trim())}`);
        const result = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(result.message || "Invalid or expired join code.");
          setLoading(false);
          return;
        }
        setClassInfo(result.class);
      } catch (err) {
        if (!cancelled) {
          setError("Network error. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (e.g. JPG, PNG).");
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    setError(null);
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleJoin = async () => {
    if (!classInfo?.classId || !user?.id) return;
    if (!photoFile) {
      setError("Please upload your photo first. It will be used for attendance in this class.");
      return;
    }
    setJoining(true);
    setError(null);
    try {
      // Enroll first; only upload photo if student is not already in the class
      const res = await fetch(`${API_BASE}/classes/${classInfo.classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setError("You are already in this class.");
          setJoining(false);
          return;
        }
        setError(result.message || "Could not join class.");
        setJoining(false);
        return;
      }

      // Enrollment succeeded — now store photo so it appears in Mark Attendance for this class
      const formData = new FormData();
      formData.append("image", photoFile);
      const name = (user.fullName || user.email || "Student").trim();
      const uploadUrl = `${API_BASE}/upload?name=${encodeURIComponent(name)}&classId=${encodeURIComponent(classInfo.classId)}`;
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok || !uploadResult.success) {
        setError(uploadResult.message || "Photo upload failed. Please try again.");
        setJoining(false);
        return;
      }
      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      console.error("Join class error:", err);
      setError("Network error. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a001a] via-[#1a0033] to-[#0f0020] flex items-center justify-center text-white">
        <p>Loading…</p>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a001a] via-[#1a0033] to-[#0f0020] flex items-center justify-center text-white p-4">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">{error || "Invalid or expired join code."}</p>
          <Link to="/student/dashboard" className="text-[#9B37FF] hover:underline">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a001a] via-[#1a0033] to-[#0f0020] flex items-center justify-center text-white p-4">
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-2">Join class</h1>
        <p className="text-slate-300 mb-6">You’re about to join: <strong className="text-white">{classInfo.title}</strong></p>

        {/* Photo for attendance (same storage as Mark Attendance upload) */}
        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-2">Your photo for attendance (required)</label>
          <p className="text-xs text-slate-500 mb-2">This photo will appear on the teacher’s Mark Attendance page for this class.</p>
          <div className="flex flex-col items-center gap-3">
            <label className="w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 hover:border-[#9B37FF]/50 bg-white/5 p-6 cursor-pointer transition">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-white/20" />
              ) : (
                <span className="text-4xl mb-2">📷</span>
              )}
              <span className="text-sm text-slate-400">{photoFile ? photoFile.name : "Choose a photo"}</span>
            </label>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="px-4 py-2 rounded-lg bg-[#9B37FF] hover:bg-[#8a2ee6] disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join class"}
          </button>
          <Link to="/student/dashboard" className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
