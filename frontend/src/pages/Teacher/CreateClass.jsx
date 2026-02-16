// pages/Teacher/CreateClass.jsx
import React, { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CreateClass = () => {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    schedule: "",
  });
  const [scheduleSlots, setScheduleSlots] = useState([{ day: "", time: "" }]);

  const coverInputRef = useRef(null);

  // Event: sync form fields (title, subject, description, schedule)
  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Event: update a single schedule slot's day or time
  const updateSlot = (index, field, value) => {
    setScheduleSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  };

  // Event: add another day/time slot
  const addSlot = () => setScheduleSlots((prev) => [...prev, { day: "", time: "" }]);

  // Event: remove a schedule slot (keep at least one)
  const removeSlot = (index) => {
    setScheduleSlots((prev) => (prev.length <= 1 ? [{ day: "", time: "" }] : prev.filter((_, i) => i !== index)));
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Event: submit create-class form — POST /api/classes with FormData (title, subject, description, scheduleSlots, cover, createdBy)
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
      formData.append("scheduleSlots", JSON.stringify(scheduleSlots.filter((s) => s.day || s.time)));
      if (user.role === "teacher" && user.id) {
        formData.append("createdBy", user.id);
      }
      const coverFile = coverInputRef.current?.files?.[0];
      if (coverFile) {
        formData.append("cover", coverFile);
      }
      // API: POST /api/classes — create class with optional cover and schedule slots
      // API: POST /api/classes — create class with optional cover and schedule slots
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
      setScheduleSlots([{ day: "", time: "" }]);
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-300">Schedule (day & time) — add multiple if class runs on several days/times</label>
            <button
              type="button"
              onClick={addSlot}
              className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
            >
              <Plus size={16} />
              Add slot
            </button>
          </div>
          <div className="space-y-3">
            {scheduleSlots.map((slot, index) => (
              <div key={index} className="flex flex-wrap items-end gap-3 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]">
                <div className="flex-1 min-w-[120px]">
                  <span className="text-xs text-slate-500">Day</span>
                  <select
                    value={slot.day}
                    onChange={(e) => updateSlot(index, "day", e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-[#0b0713] border border-[#1f1830] text-slate-200 text-sm"
                  >
                    <option value="">Select day</option>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[100px]">
                  <span className="text-xs text-slate-500">Time</span>
                  <input
                    type="time"
                    value={slot.time}
                    onChange={(e) => updateSlot(index, "time", e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-[#0b0713] border border-[#1f1830] text-slate-200 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="p-2 text-slate-400 hover:text-red-400 rounded"
                  title="Remove slot"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
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
