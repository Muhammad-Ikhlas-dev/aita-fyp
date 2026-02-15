// pages/Teacher/TeacherLayout.jsx
import { Outlet } from "react-router-dom";
import { useState } from "react";
import TeacherSidebar from "./components/TeacherSidebar";
import TeacherHeader from "./components/TeacherHeader";

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-[#0d0620] text-white">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden flex transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <TeacherSidebar onClose={() => setSidebarOpen(false)} mobile />
        <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <TeacherSidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-auto relative">
        <TeacherHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
