// pages/Teacher/UploadAssignment.jsx
import React, { useState } from "react";

const UploadAssignment = () => {
  const [form, setForm] = useState({ classId: "", title: "", instructions: "", deadline: "" });
  const [files, setFiles] = useState([]);

  const classes = [
    { id: "1", name: "Computer Vision" },
    { id: "2", name: "Neural Networks" },
  ];

  const handleFiles = (e) => setFiles(Array.from(e.target.files));
  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call API to upload assignment
    console.log("upload", form, files);
    alert("Upload assignment action: check console (implement API).");
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Upload Assignment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Select Class</label>
          <select name="classId" value={form.classId} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]">
            <option value="">Choose a class</option>
            {classes.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-300">Assignment Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
        </div>

        <div>
          <label className="text-sm text-slate-300">Instructions</label>
          <textarea name="instructions" value={form.instructions} onChange={handleChange} rows="5" className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-300">Deadline</label>
            <input name="deadline" type="datetime-local" value={form.deadline} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
          </div>

          <div>
            <label className="text-sm text-slate-300">Attach Files</label>
            <input type="file" multiple onChange={handleFiles} className="w-full mt-2 text-sm text-slate-300" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600/90">Publish Assignment</button>
          <button type="button" className="px-4 py-2 rounded-lg border border-slate-700">Save Draft</button>
        </div>
      </form>
    </div>
  );
};

export default UploadAssignment;
