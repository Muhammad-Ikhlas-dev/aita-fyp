// pages/Teacher/UploadAssignment.jsx
import React, { useState, useEffect, useRef } from "react";
import { FolderInput, FileText, X, Eye, Sparkles, Download } from "lucide-react";

const API_BASE = "http://localhost:5000";

const UploadAssignment = () => {
  const [form, setForm] = useState({ title: "", instructions: "", deadline: "" });
  const [files, setFiles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [instructionAttachments, setInstructionAttachments] = useState([]);
  const [difficulty, setDifficulty] = useState("medium");
  const [outputFormat, setOutputFormat] = useState("pdf"); // "pdf" | "docx" | "simple"
  const [messages, setMessages] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null); // index of message being downloaded
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const instructionFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const instructionAttachmentsRef = useRef(instructionAttachments);
  instructionAttachmentsRef.current = instructionAttachments;

  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const url =
          user.role === "teacher" && user.id
            ? `${API_BASE}/api/classes?createdBy=${user.id}`
            : `${API_BASE}/api/classes`;
        const res = await fetch(url);
        const result = await res.json();
        if (res.ok && result.classes) {
          setClasses(result.classes);
        } else {
          setClasses([]);
        }
      } catch (err) {
        console.error("Fetch classes error:", err);
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleFiles = (e) => setFiles(Array.from(e.target.files));
  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleClassToggle = (classId) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleInstructionFiles = (e) => {
    const chosen = Array.from(e.target.files || []);
    setInstructionAttachments((prev) => [
      ...prev,
      ...chosen.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ]);
    e.target.value = "";
  };

  const removeInstructionFile = (id) => {
    setInstructionAttachments((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item && item.url) URL.revokeObjectURL(item.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      instructionAttachmentsRef.current.forEach((a) => a.url && URL.revokeObjectURL(a.url));
    };
  }, []);

  const handleGetAiResponse = async () => {
    const instructions = (form.instructions || "").trim();
    if (!instructions && instructionAttachments.length === 0) {
      setAiError("Type something or attach a file first.");
      return;
    }
    setAiError(null);
    const userContent = instructions || "(No text; see attachments)";
    setMessages((prev) => [...prev, { role: "user", content: userContent }]);
    setForm((s) => ({ ...s, instructions: "" }));
    setAiLoading(true);
    try {
      const hasPdfs = instructionAttachments.length > 0;
      const pdfFiles = instructionAttachments.map((a) => a.file);

      let res;
      if (hasPdfs && pdfFiles.every((f) => f && f.type === "application/pdf")) {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("instructions", userContent);
        formData.append("difficulty", difficulty);
        formData.append("outputFormat", outputFormat);
        formData.append("history", JSON.stringify(messages.map((m) => ({ role: m.role, content: m.content }))));
        pdfFiles.forEach((file) => formData.append("pdfs", file));
        res = await fetch(`${API_BASE}/api/ai/assignment-response`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/api/ai/assignment-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            instructions: userContent,
            attachmentNames: instructionAttachments.map((a) => a.file.name),
            difficulty,
            outputFormat,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => prev.slice(0, -1));
        setForm((s) => ({ ...s, instructions: userContent }));
        setAiError(data.message || "Failed to get AI response");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.response ?? "", outputFormat }]);
      if (instructionAttachments.length > 0) {
        setInstructionAttachments((prev) => {
          prev.forEach((a) => a.url && URL.revokeObjectURL(a.url));
          return [];
        });
      }
    } catch (err) {
      console.error("AI response error:", err);
      setMessages((prev) => prev.slice(0, -1));
      setForm((s) => ({ ...s, instructions: userContent }));
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleInstructionsKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGetAiResponse();
    }
  };

  const handleDownloadResponse = async (content, format, messageIndex) => {
    if (!content || (format !== "pdf" && format !== "docx")) return;
    setDownloadingId(messageIndex);
    try {
      const res = await fetch(`${API_BASE}/api/ai/export-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, format }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const filename = format === "pdf" ? "assignment-response.pdf" : "assignment-response.docx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setAiError("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccess(false);

    if (!form.title.trim()) {
      setPublishError("Assignment title is required.");
      return;
    }
    if (selectedClassIds.length === 0) {
      setPublishError("Select at least one class.");
      return;
    }
    if (!form.deadline) {
      setPublishError("Deadline is required.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "teacher" || !user.id) {
      setPublishError("You must be logged in as a teacher to publish.");
      return;
    }

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    const instructionsText = lastAssistant ? lastAssistant.content : (form.instructions || "").trim();

    setPublishLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("instructions", instructionsText);
      formData.append("deadline", form.deadline);
      formData.append("classIds", JSON.stringify(selectedClassIds));
      formData.append("createdBy", user.id);
      if (files.length > 0 && files[0]) {
        formData.append("file", files[0]);
      }

      const res = await fetch(`${API_BASE}/api/assignments`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || "Failed to publish assignment");
        return;
      }
      setPublishSuccess(true);
      setForm({ title: "", instructions: "", deadline: "" });
      setMessages([]);
      setSelectedClassIds([]);
      setFiles([]);
    } catch (err) {
      console.error("Publish assignment error:", err);
      setPublishError("Network error. Please try again.");
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Upload Assignment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Select class(es)</label>
          {classesLoading ? (
            <p className="mt-2 text-slate-400 text-sm">Loading classes…</p>
          ) : classes.length === 0 ? (
            <p className="mt-2 text-slate-400 text-sm">No classes yet. Create a class first.</p>
          ) : (
            <div className="mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830] max-h-48 overflow-y-auto space-y-2">
              {classes.map((c) => (
                <label key={c._id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded p-2 -m-2">
                  <input
                    type="checkbox"
                    checked={selectedClassIds.includes(c._id)}
                    onChange={() => handleClassToggle(c._id)}
                    className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  <span className="text-slate-200">{c.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-300">Assignment Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm text-slate-300">Instructions</label>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                Response format
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="rounded-lg border border-[#1f1830] bg-[#0b0713] text-slate-200 px-3 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500/50"
                >
                  <option value="pdf">.pdf</option>
                  <option value="docx">.docx</option>
                  <option value="simple">Simple response</option>
                </select>
              </label>
              <label className="text-sm text-slate-300 flex items-center gap-2">
                Difficulty of assignment
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="rounded-lg border border-[#1f1830] bg-[#0b0713] text-slate-200 px-3 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500/50"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
              <input
                ref={instructionFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleInstructionFiles}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => instructionFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1f1830] bg-[#0b0713] text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 text-sm"
              >
                <FolderInput size={18} />
                Attach PDF
              </button>
            </div>
          </div>
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            onKeyDown={handleInstructionsKeyDown}
            rows="5"
            placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
            className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]"
          />
          {instructionAttachments.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-slate-400">Attached to instructions:</p>
              <ul className="space-y-1.5">
                {instructionAttachments.map(({ id, file, url }) => (
                  <li key={id} className="flex items-center gap-2 p-2 rounded-lg bg-[#0b0713] border border-[#1f1830]">
                    <FileText size={16} className="text-cyan-400 shrink-0" />
                    <span className="text-slate-200 text-sm truncate flex-1 min-w-0" title={file.name}>{file.name}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      <Eye size={14} />
                      Preview
                    </a>
                    <button
                      type="button"
                      onClick={() => removeInstructionFile(id)}
                      className="p-1 text-slate-400 hover:text-red-400 rounded"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {aiError && <p className="text-sm text-red-400 mt-2">{aiError}</p>}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleGetAiResponse}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 disabled:opacity-50 text-white text-sm"
            >
              <Sparkles size={18} />
              {aiLoading ? "Getting response…" : "Get AI response"}
            </button>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="space-y-4 mt-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-cyan-600/20 border border-cyan-500/30 text-slate-100"
                      : "bg-[#0b0713] border border-[#1f1830] text-slate-200"
                  }`}
                >
                  <p className="text-xs font-medium text-slate-400 mb-1">{msg.role === "user" ? "You" : "AI"}</p>
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  {msg.role === "assistant" && (() => {
                    const format = msg.outputFormat ?? outputFormat;
                    if (format !== "pdf" && format !== "docx") return null;
                    return (
                      <div className="mt-3 pt-3 border-t border-[#1f1830]">
                        <button
                          type="button"
                          onClick={() => handleDownloadResponse(msg.content, format, i)}
                          disabled={downloadingId === i}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-sm disabled:opacity-50"
                        >
                          <Download size={16} />
                          {downloadingId === i ? "Preparing…" : (format === "pdf" ? "assignment-response.pdf" : "assignment-response.docx")}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl px-4 py-3 bg-[#0b0713] border border-[#1f1830] text-slate-400 text-sm">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {messages.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#1f1830]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm text-slate-300">Instructions</label>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  Response format
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="rounded-lg border border-[#1f1830] bg-[#0b0713] text-slate-200 px-3 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500/50"
                  >
                    <option value="pdf">.pdf</option>
                    <option value="docx">.docx</option>
                    <option value="simple">Simple response</option>
                  </select>
                </label>
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  Difficulty of assignment
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="rounded-lg border border-[#1f1830] bg-[#0b0713] text-slate-200 px-3 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500/50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <input
                  ref={instructionFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleInstructionFiles}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => instructionFileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1f1830] bg-[#0b0713] text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 text-sm"
                >
                  <FolderInput size={18} />
                  Attach PDF
                </button>
              </div>
            </div>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              onKeyDown={handleInstructionsKeyDown}
              rows="5"
              placeholder="Continue the conversation… (Enter to send, Shift+Enter for new line)"
              className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]"
            />
            {instructionAttachments.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-slate-400">Attached to instructions:</p>
                <ul className="space-y-1.5">
                  {instructionAttachments.map(({ id, file, url }) => (
                    <li key={id} className="flex items-center gap-2 p-2 rounded-lg bg-[#0b0713] border border-[#1f1830]">
                      <FileText size={16} className="text-cyan-400 shrink-0" />
                      <span className="text-slate-200 text-sm truncate flex-1 min-w-0" title={file.name}>{file.name}</span>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm">
                        <Eye size={14} /> Preview
                      </a>
                      <button type="button" onClick={() => removeInstructionFile(id)} className="p-1 text-slate-400 hover:text-red-400 rounded" title="Remove">
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiError && <p className="text-sm text-red-400 mt-2">{aiError}</p>}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleGetAiResponse}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 disabled:opacity-50 text-white text-sm"
              >
                <Sparkles size={18} />
                {aiLoading ? "Getting response…" : "Get AI response"}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-300">Deadline</label>
            <input name="deadline" type="datetime-local" value={form.deadline} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-[#0b0713] border border-[#1f1830]" />
          </div>

          <div>
            <label className="text-sm text-slate-300">Assignment file (PDF, DOCX, TXT)</label>
            <p className="text-xs text-slate-500 mt-0.5">Optional. This file will be downloadable in the class view.</p>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
              onChange={handleFiles}
              className="w-full mt-2 text-sm text-slate-300"
            />
          </div>
        </div>

        {publishError && (
          <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{publishError}</p>
        )}
        {publishSuccess && (
          <p className="text-sm text-emerald-400 bg-emerald-900/20 px-3 py-2 rounded-lg">
            Assignment published. It will appear in the selected class(es).
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={publishLoading}
            className="px-4 py-2 rounded-lg bg-sky-600/90 hover:bg-sky-600 disabled:opacity-50"
          >
            {publishLoading ? "Publishing…" : "Publish Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadAssignment;
