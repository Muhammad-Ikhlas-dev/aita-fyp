// pages/Teacher/CreateClass.jsx
import React, { useState, useRef } from "react";

const CreateClass = () => {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    schedule: "",
  });

  const coverInputRef = useRef(null);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subject", form.subject);
      formData.append("description", form.description);
      formData.append("schedule", form.schedule);
      if (user.role === "teacher" && user.id) {
        formData.append("createdBy", user.id);
      }
      const coverFile = coverInputRef.current?.files?.[0];
      if (coverFile) {
        formData.append("cover", coverFile);
      }
      const res = await fetch("http://localhost:5000/api/classes", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Failed to create class");
        return;
      }
      setForm({ title: "", subject: "", description: "", schedule: "" });
      if (coverInputRef.current) coverInputRef.current.value = "";
      alert(result.message || "Class created successfully.");
    } catch (err) {
      console.error("Create class error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Create New Class</h2>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Class Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
        </div>

        <div>
          <label className="text-sm text-slate-300">Subject</label>
          <input name="subject" value={form.subject} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
        </div>

        <div>
          <label className="text-sm text-slate-300">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
        </div>

        <div>
          <label className="text-sm text-slate-300">Cover Image</label>
          <input
            ref={coverInputRef}
            type="file"
            name="cover"
            accept="image/*"
            className="w-full mt-2 text-sm text-slate-300"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600/90" disabled={submitting}>
            {submitting ? "Creating…" : "Create Class"}
          </button>
          <button type="button" className="px-4 py-2 rounded-lg border border-slate-700">Save Draft</button>
        </div>
      </form>
    </div>
  );
};

export default CreateClass;
