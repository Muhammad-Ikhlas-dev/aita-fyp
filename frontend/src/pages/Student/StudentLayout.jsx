import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const StudentLayout = () => {
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
        {/* Sidebar */}
        <Sidebar onClose={() => setSidebarOpen(false)} />

        {/* Dark overlay */}
        <div
          className="flex-1 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-auto relative">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* Student dashboard or other pages */}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
