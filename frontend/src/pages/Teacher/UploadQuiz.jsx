// pages/Teacher/UploadQuiz.jsx
import React, { useState } from "react";

const UploadQuiz = () => {
  const [form, setForm] = useState({ classId: "", title: "", aiCheck: true });
  const [file, setFile] = useState(null);

  const classes = [
    { id: "1", name: "Computer Vision" },
    { id: "2", name: "Neural Networks" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFile = (e) => setFile(e.target.files[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send quiz file + aiCheck flag to backend that triggers AI pre-check
    console.log("upload quiz", form, file);
    alert("Upload quiz action: check console (implement API).");
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Upload Quiz</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Select Class</label>
          <select name="classId" value={form.classId} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]">
            <option value="">Choose a class</option>
            {classes.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-300">Quiz Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
        </div>

        <div>
          <label className="text-sm text-slate-300">Upload Quiz File (PDF / DOCX)</label>
          <input type="file" onChange={handleFile} className="w-full mt-2 text-sm text-slate-300" />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="aiCheck" checked={form.aiCheck} onChange={handleChange} />
            <span className="text-sm text-slate-300">Enable AI Pre-check (auto grading hints & plagiarism scan)</span>
          </label>
        </div>

        <div>
          <p className="text-xs text-slate-500">AI Pre-check will run a best-effort auto-grader and flag suspect answers. You still review final grades.</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600/90">Upload Quiz</button>
          <button type="button" className="px-4 py-2 rounded-lg border border-slate-700">Save Draft</button>
        </div>
      </form>
    </div>
  );
};

export default UploadQuiz;
