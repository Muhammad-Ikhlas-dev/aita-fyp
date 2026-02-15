// components/TeacherSidebar.jsx
import React from "react";
import {
  Home,
  BookOpen,
  PlusSquare,
  FileText,
  CheckSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const navItems = [
  { title: "Dashboard", to: "/teacher/dashboard", icon: <Home size={18} /> },
  { title: "My Classes", to: "/teacher/classes", icon: <BookOpen size={18} /> },
  { title: "Create Class", to: "/teacher/create-class", icon: <PlusSquare size={18} /> },
  { title: "Assignments", to: "/teacher/assignments", icon: <FileText size={18} /> },
  { title: "Quizzes", to: "/teacher/quizzes", icon: <CheckSquare size={18} /> },
  { title: "Settings", to: "/teacher/settings", icon: <Settings size={18} /> },
];

const TeacherSidebar = ({ onClose, mobile = false }) => {
  const location = useLocation();

  return (
    <aside
      className={`w-72 bg-[#0f0b1a] border-r border-[#1f1830] p-5 flex flex-col z-50 ${
        mobile ? "h-full" : "h-screen"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-600 to-cyan-400 flex items-center justify-center font-bold text-[#071026]">
          T
        </div>
        <div>
          <div className="text-lg font-semibold">Teacher Portal</div>
          <div className="text-xs text-slate-400">Manage classes & assignments</div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <Link
              to={item.to}
              key={item.to}
              onClick={() => mobile && onClose?.()}
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? "bg-gradient-to-r from-sky-700/30 to-cyan-500/20 border border-cyan-700/30"
                  : "hover:bg-white/5"
              }`}
            >
              <div className={`text-cyan-300`}>{item.icon}</div>
              <div
                className={`text-sm ${
                  isActive ? "text-white font-medium" : "text-slate-300"
                }`}
              >
                {item.title}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-[#1f1830]">
        <Link to="/">
        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5">
          <LogOut size={18} />
          <span className="text-sm text-slate-300">
            Logout
          </span>
        </button>
        </Link>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
