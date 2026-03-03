import { useState, useEffect } from "react";
import { User, Lock, Bell, Save } from "lucide-react";

const API_BASE = "http://localhost:5000";

const StudentSettings = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [fullName, setFullName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    setFullName(user.fullName || "");
  }, [user.fullName]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user.id) {
      setMessage({ type: "error", text: "Not logged in." });
      return;
    }
    setSaveLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/students/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id, fullName: fullName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Failed to update profile." });
        setSaveLoading(false);
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent("userUpdated"));
      setMessage({ type: "success", text: data.message || "Profile updated." });
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (!user.id) {
      setPasswordMessage({ type: "error", text: "Not logged in." });
      return;
    }
    if (!currentPassword.trim()) {
      setPasswordMessage({ type: "error", text: "Enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/students/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          currentPassword: currentPassword.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMessage({ type: "error", text: data.message || "Failed to update password." });
        setPasswordLoading(false);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage({ type: "success", text: data.message || "Password updated successfully." });
    } catch (err) {
      setPasswordMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0620] text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Profile Settings */}
        <form onSubmit={handleSaveProfile} className="bg-[#140b2e] rounded-2xl p-6 shadow-lg border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-cyan-400" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          {message && (
            <p
              className={`text-sm px-3 py-2 rounded-lg mb-4 ${
                message.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {message.text}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 bg-[#1b0f3a] border border-white/10 rounded-xl px-4 py-2 focus:border-cyan-500 outline-none"
                placeholder="Enter your name"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saveLoading}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 transition rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saveLoading ? "Saving…" : "Save Changes"}
          </button>
        </form>

        {/* Security Settings */}
        <form onSubmit={handleUpdatePassword} className="bg-[#140b2e] rounded-2xl p-6 shadow-lg border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-purple-400" />
            <h2 className="text-xl font-semibold">Password & Security</h2>
          </div>
          {passwordMessage && (
            <p
              className={`text-sm px-3 py-2 rounded-lg mb-4 ${
                passwordMessage.type === "success"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {passwordMessage.text}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full mt-1 bg-[#1b0f3a] border border-white/10 rounded-xl px-4 py-2 focus:border-purple-500 outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 bg-[#1b0f3a] border border-white/10 rounded-xl px-4 py-2 focus:border-purple-500 outline-none"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 transition rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {passwordLoading ? "Updating…" : "Update Password"}
          </button>
        </form>

        {/* Notifications */}
        <div className="bg-[#140b2e] rounded-2xl p-6 shadow-lg border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-pink-400" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>

          <div className="space-y-3 text-gray-300">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4" /> Email alerts for assignments
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4" /> Quiz reminders
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4" /> AI feedback notifications
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentSettings;