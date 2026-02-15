import { useState, useRef, useEffect } from "react";
import { Search, Bell, Menu, X } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

const Header = ({ sidebarOpen, toggleSidebar }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Assignment Uploaded", time: "2h ago", read: false },
    { id: 2, title: "Classroom Announcement", time: "5h ago", read: false },
    { id: 3, title: "New Grade Posted", time: "1d ago", read: true },
  ]);

  const notifRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if any unread notifications exist
  const hasUnread = notifications.some((n) => !n.read);

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
            Huzaifa
          </span>
        </h1>
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-4 md:gap-6 relative">
        <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-48"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-2 hover:bg-white/10 rounded-full transition"
            onClick={() => setIsNotifOpen((prev) => !prev)}
          >
            <Bell size={20} className="text-gray-300" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <NotificationsDropdown
              notifications={notifications}
              onClose={() => setIsNotifOpen(false)}
              onMarkRead={setNotifications} // updates parent state
            />
          )}
        </div>

        {/* Profile Avatar */}
        {/* <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-white/20"></div> */}
      </div>
    </header>
  );
};

export default Header;
