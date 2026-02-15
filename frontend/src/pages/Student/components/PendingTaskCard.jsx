import React from "react";
import { UploadCloud, Clock } from "lucide-react";

const PendingTaskCard = ({ task, onClick }) => {
  return (
    <div
      className="bg-[#150a2e]/60 border border-white/5 p-5 rounded-xl flex items-center justify-between hover:bg-white/5 transition"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-1 h-12 rounded-full ${
            task.status === "Urgent"
              ? "bg-red-500"
              : task.status === "Pending"
              ? "bg-orange-500"
              : "bg-cyan-500"
          }`}
        ></div>

        <div>
          <h4 className="font-bold text-white text-sm">{task.title}</h4>
          <p className="text-xs text-gray-400">{task.class}</p>

          <div className="flex items-center gap-2 mt-2">
            <Clock size={12} className="text-gray-500" />
            <span className="text-xs text-gray-500">Due: {task.due}</span>
          </div>
        </div>
      </div>

      <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:bg-cyan-600/20 transition">
        <UploadCloud size={18} />
      </button>
    </div>
  );
};

export default PendingTaskCard;
