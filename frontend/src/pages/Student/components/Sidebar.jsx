import React from "react";
import {
  BookOpen,
  FileText,
  Calendar,
  Clock,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Nav items array
  const navItems = [
    { label: "My Classes", icon: <BookOpen size={20} />, to: "/student/dashboard" },
    { label: "Assignments", icon: <FileText size={20} />, to: "/student/assignment" },
    { label: "Results", icon: <Calendar size={20} />, to: "/student/result" },
  ];

  return (
    <aside className="w-64 bg-[#150a2e]/50 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between h-full relative z-50">

      {/* Mobile Close Button */}
      {onClose && (
        <button
          className="md:hidden absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      )}

      <div>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold">
            A
          </div>
          <span className="hidden lg:block ml-3 font-bold text-xl tracking-wide">
            AITA
          </span>
        </div>

        {/* Nav Links (Loop) */}
        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item, idx) => (
            <NavItem
              key={idx}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={location.pathname === item.to} // ✅ Dynamic active highlighting
            />
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <NavItem icon={<Settings size={20} />} label="Settings" to="/student/settings" />

        {/* Logout Button */}
        <button onClick={() => navigate("/")}>
          <NavItem icon={<LogOut size={20} />} label="Logout" to="#" />
        </button>
      </div>
    </aside>
  );
};

// Reusable Nav Item
const NavItem = ({ icon, label, to, active = false }) => (
  <Link
    to={to}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
      ${
        active
          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" // Active styling
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }
    `}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default Sidebar;
