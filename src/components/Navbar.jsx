import { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import NotificationPanel from "./NotificationPanel";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.uid);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Çıkış yapıldı!");
  };

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">
            ✦
          </div>
          <span className="font-mono font-bold text-white text-lg tracking-tight">
            Spark
          </span>
        </Link>
<Link
  to="/explore"
  className="text-zinc-400 hover:text-white text-sm transition-colors hidden sm:block"
>
  🔍 Keşfet
</Link>
        {/* Sağ taraf */}
        <div className="flex items-center gap-3">

          {/* Bildirim Butonu */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-violet-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          <Link
            to={`/profile/${user?.uid}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
              {(user?.displayName || user?.email || "?").charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-zinc-400 hidden sm:block">
              {user?.displayName}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs border border-zinc-700 hover:border-red-500 hover:text-red-400 text-zinc-400 rounded-lg transition-colors cursor-pointer"
          >
            Çıkış
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;