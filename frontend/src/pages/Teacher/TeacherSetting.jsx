import { useState, useEffect, useRef } from "react";
import { User, Lock, Bell, Shield, Save, Upload } from "lucide-react";

const API_BASE = "http://localhost:5000";

const TeacherSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const photoInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setPhotoPreview(user.photo ? `${API_BASE}${user.photo}` : null);
  }, [user.fullName, user.email, user.photo]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user.id) {
      setMessage({ type: "error", text: "Not logged in." });
      return;
    }
    setSaveLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("teacherId", user.id);
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim().toLowerCase());
      if (photoFile) formData.append("photo", photoFile);
      const res = await fetch(`${API_BASE}/api/teachers/me`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Failed to update profile." });
        setSaveLoading(false);
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent("userUpdated"));
      setPhotoFile(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
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
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teachers/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.id,
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
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: data.message || "Password updated successfully." });
    } catch (err) {
      setPasswordMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabButton = (id, label, icon) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
        activeTab === id
          ? "bg-cyan-500 text-white shadow-lg"
          : "bg-[#191230] text-gray-300 hover:bg-[#231a42]"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="w-full min-h-screen p-6 text-white bg-[#0d0620]">
      
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT TABS */}
        <div className="w-full lg:w-64 bg-[#140b2e] p-5 rounded-2xl border border-white/10">
          <div className="flex flex-col gap-3">
            {tabButton("profile", "Profile", <User size={18} />)}
            {tabButton("security", "Security", <Lock size={18} />)}
            {/* {tabButton("notifications", "Notifications", <Bell size={18} />)}
            {tabButton("privacy", "Privacy", <Shield size={18} />)} */}
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-[#140b2e] p-6 rounded-2xl border border-white/10">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>

              {message && (
                <p
                  className={`text-sm px-3 py-2 rounded-lg ${
                    message.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {message.text}
                </p>
              )}

              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <img
                  src={photoPreview || "https://via.placeholder.com/80"}
                  alt="profile"
                  className="w-20 h-20 rounded-full border border-cyan-500/20 object-cover"
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
                >
                  <Upload size={16} />
                  Change Avatar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="yourname@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="px-6 py-3 bg-cyan-600 rounded-xl hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saveLoading ? "Saving…" : "Save Changes"}
              </button>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <h2 className="text-xl font-semibold">Security Settings</h2>

              {passwordMessage && (
                <p
                  className={`text-sm px-3 py-2 rounded-lg ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {passwordMessage.text}
                </p>
              )}

              <div>
                <label className="text-sm text-gray-300">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-3 bg-cyan-600 rounded-xl hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {passwordLoading ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Notifications</h2>

              <div className="space-y-3">
                {[
                  "New student submission",
                  "Assignment deadline reminder",
                  "New student message",
                  "System updates",
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-center justify-between bg-[#1b1338] p-4 rounded-xl border border-white/10"
                  >
                    <span>{item}</span>
                    <input type="checkbox" className="w-5 h-5" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Privacy Preferences</h2>

              <div className="space-y-4">
                {[
                  "Show profile to students",
                  "Allow students to message you",
                  "Show online activity",
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-center justify-between bg-[#1b1338] p-4 rounded-xl border border-white/10"
                  >
                    <span>{item}</span>
                    <input type="checkbox" className="w-5 h-5" />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
