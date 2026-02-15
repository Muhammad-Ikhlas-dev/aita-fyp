// components/TeacherCard.jsx
import React from "react";

const TeacherCard = ({ title, subtitle, children, accent = "from-sky-500 to-cyan-400" }) => {
  return (
    <div className="rounded-xl bg-[#0f0b17] border border-[#1f1830] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {/* optional accent vertical bar */}
        <div className="w-1 h-12 rounded-md" style={{ background: "linear-gradient(180deg,#06b6d4,#38bdf8)" }} />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default TeacherCard;
