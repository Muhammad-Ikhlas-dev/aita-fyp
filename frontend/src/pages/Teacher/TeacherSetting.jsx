import { useState } from "react";
import { User, Lock, Bell, Shield, Save, Upload } from "lucide-react";

const TeacherSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");

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
            {tabButton("notifications", "Notifications", <Bell size={18} />)}
            {tabButton("privacy", "Privacy", <Shield size={18} />)}
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-[#140b2e] p-6 rounded-2xl border border-white/10">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">

              <h2 className="text-xl font-semibold">Profile Information</h2>

              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <img
                  src="https://via.placeholder.com/80"
                  alt="profile"
                  className="w-20 h-20 rounded-full border border-cyan-500/20"
                />
                <button className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition flex items-center gap-2">
                  <Upload size={16} />
                  Change Avatar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="yourname@email.com"
                  />
                </div>
              </div>

              <button className="px-6 py-3 bg-cyan-600 rounded-xl hover:bg-cyan-700 transition flex items-center gap-2">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Security Settings</h2>

              <div>
                <label className="text-sm text-gray-300">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg bg-[#1b1338] border border-white/10"
                  />
                </div>
              </div>

              <button className="px-6 py-3 bg-cyan-600 rounded-xl hover:bg-cyan-700 transition flex items-center gap-2">
                <Save size={18} />
                Update Password
              </button>
            </div>
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
