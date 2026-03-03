import { Search, User, Menu, X } from "lucide-react";

const Header = ({ sidebarOpen, toggleSidebar }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-8 bg-[#0d0620]/80 backdrop-blur-sm z-10 relative">
      
      {/* Left: Hamburger + Welcome */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-md transition"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <h1 className="text-2xl font-bold">
          Welcome back,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {user?.fullName || "Student"}
          </span>
        </h1>
      </div>

      {/* Right: Search + Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-48"
          />
        </div>

        {/* Profile icon + student name */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/80 to-purple-500/80 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-200 truncate max-w-[120px] md:max-w-[160px]">
            {user?.fullName || "Student"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
