// components/TeacherHeader.jsx
import React from "react";
import { Bell, Search, Plus } from "lucide-react";

const TeacherHeader = ({ toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#1a1527]">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-md hover:bg-white/3" onClick={toggleSidebar}>
          {/* hamburger */}
          <svg className="w-6 h-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="relative">
          <input
            placeholder="Search classes, students, assignments..."
            className="w-64 md:w-96 bg-[#0b0713] px-4 py-2 rounded-lg text-sm placeholder:text-slate-400 outline-none border border-transparent focus:border-cyan-500/40"
          />
          <Search className="absolute right-3 top-2.5 text-slate-400" />
        </div>
      </div>

      <div className="flex items-center gap-4">

        <button className="p-2 rounded-md hover:bg-white/3 relative">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-[#071026] font-semibold">
            A
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium">{`${JSON.parse(localStorage.getItem("user")).fullName || "Teacher Aria"}`}</div>
            <div className="text-xs text-slate-400">Mathematics</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TeacherHeader;
