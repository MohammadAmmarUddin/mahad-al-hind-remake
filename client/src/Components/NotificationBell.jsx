import { useState, useEffect, useRef } from "react";
import { IoIosNotifications } from "react-icons/io";
import { Link } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import { API } from "../config/api";

const NotificationBell = () => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = user?.token;

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        "x-access-token": token,
      }
    : {};

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      /* ignore */
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API}/api/notifications/unread-count`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`${API}/api/notifications/read/${id}`, {
        method: "PATCH",
        headers,
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: "PATCH",
        headers,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="dropdown dropdown-end" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-ghost btn-circle hover:bg-white/20 transition relative"
      >
        <IoIosNotifications className="text-3xl text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="card card-compact dropdown-content mt-3 w-80 sm:w-96 shadow-xl bg-white z-[100] rounded-box">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">
                  No notifications yet.
                </p>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${
                      !n.read ? "bg-blue-50/60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-700 leading-snug">
                          {n.link ? (
                            <Link
                              to={n.link}
                              onClick={() => handleMarkAsRead(n._id)}
                              className="hover:text-primary"
                            >
                              {n.message}
                            </Link>
                          ) : (
                            n.message
                          )}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n._id)}
                          className="shrink-0 rounded-full bg-primary/10 p-1 hover:bg-primary/20"
                          title="Mark as read"
                        >
                          <span className="block w-2 h-2 rounded-full bg-primary" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
