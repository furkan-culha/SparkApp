import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const NotificationPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications(user?.uid);

  const handleOpen = () => {
    if (unreadCount > 0) markAllRead();
  };

  const getIcon = (type) => {
    const icons = { like: "❤️", comment: "💬", follow: "👥" };
    return icons[type] || "🔔";
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return "şimdi";
    if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}s`;
    return `${Math.floor(diff / 86400)}g`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onAnimationStart={handleOpen}
            className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Bildirimler</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-violet-400 font-medium">
                  {unreadCount} yeni
                </span>
              )}
            </div>

            {/* Liste */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 text-sm">
                  Henüz bildirim yok 🔔
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    to={notif.postId ? `/post/${notif.postId}` : `/profile/${notif.fromUid}`}
                    onClick={onClose}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50
                      ${!notif.read ? "bg-violet-500/5" : ""}`}
                  >
                    <span className="text-xl shrink-0">{getIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 leading-snug">{notif.message}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{formatTime(notif.createdAt)}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;