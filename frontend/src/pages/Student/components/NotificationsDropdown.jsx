import { useState, useEffect } from "react";
import { X } from "lucide-react";

const NotificationsDropdown = ({ notifications, onClose, onMarkRead }) => {
  const [notifs, setNotifs] = useState(notifications);

  // Update local state if parent notifications change
  useEffect(() => {
    setNotifs(notifications);
  }, [notifications]);

  const markRead = (id) => {
    const updated = notifs.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifs(updated);
    onMarkRead(updated); // notify parent
  };

  const markAllRead = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setNotifs(updated);
    onMarkRead(updated); // notify parent
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-h-96 bg-[#150a2e] border border-white/10 rounded-2xl shadow-lg z-50 animate-in fade-in duration-200 flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <span className="font-semibold text-white">Notifications</span>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-xs text-cyan-400 hover:underline"
          >
            Mark all read
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
            <X size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {notifs.length === 0 && (
          <div className="p-4 text-gray-400 text-sm text-center">
            No notifications
          </div>
        )}

        {notifs.map((notif) => (
          <div
            key={notif.id}
            onClick={() => !notif.read && markRead(notif.id)}
            className={`px-4 py-3 border-b border-white/10 cursor-pointer transition flex flex-col ${
              notif.read ? "bg-[#150a2e]" : "bg-white/5"
            } hover:bg-white/10`}
          >
            <span className="text-sm font-medium text-white">{notif.title}</span>
            <span className="text-xs text-gray-400 mt-1">{notif.time}</span>
            {!notif.read && (
              <span className="mt-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
