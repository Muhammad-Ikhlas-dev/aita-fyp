import { User, Lock, Bell, Palette } from "lucide-react";

const StudentSettings = () => {
  return (
    <div className="min-h-screen w-full bg-[#0d0620] text-white p-8 font-sans">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Profile Settings */}
        <div className="bg-[#140b2e] rounded-2xl p-6 shadow-lg border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-cyan-400" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Full Name</label>
              <input
                type="text"
                className="w-full mt-1 bg-[#1b0f3a] border border-white/10 rounded-xl px-4 py-2 focus:border-cyan-500 outline-none"
                placeholder="Enter your name"
              />
            </div>

          </div>

          <button className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 transition rounded-xl font-semibold">
            Save Changes
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-[#140b2e] rounded-2xl p-6 shadow-lg border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-purple-400" />
            <h2 className="text-xl font-semibold">Password & Security</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Current Password</label>
              <input
                type="password"
                className="w-full mt-1 bg-[#1b0f3a] border border-white/10 rounded-xl px-4 py-2 focus:border-purple-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">New Password</label>
              <input
                type="password"
                className="w-full mt-1 bg-[#1b0f3a] border border-white/10 rounded-xl px-4 py-2 focus:border-purple-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 transition rounded-xl font-semibold">
            Update Password
          </button>
        </div>

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