import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ExplorePage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("popular");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
const cleanQuery = searchQuery.toLowerCase().replace("@", "");
  // Gönderileri çek
  useEffect(() => {
    setLoading(true);
    const q =
      tab === "popular"
        ? query(collection(db, "posts"), orderBy("likes", "desc"))
        : query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [tab]);

  // Kullanıcı arama
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const q = query(
          collection(db, "users"),
          where("username", ">=", cleanQuery),
          where("username", "<=", cleanQuery + "\uf8ff"),
        );
        const snap = await getDocs(q);
        setSearchResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Arama */}
        <div className="relative">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Kullanıcı ara... (@kullanici_adi)"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-2xl px-5 py-3 text-white placeholder-zinc-500 text-sm outline-none transition-colors"
          />

          {/* Arama Sonuçları */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-14 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-10"
              >
                {searching ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-sm">
                    Kullanıcı bulunamadı
                  </div>
                ) : (
                  searchResults.map((u) => (
                    <Link
                      key={u.id}
                      to={`/profile/${u.uid}`}
                      onClick={() => setSearchQuery("")}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {(u.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {u.name}
                        </p>
                        <p className="text-xs text-zinc-500">@{u.username}</p>
                      </div>
                    </Link>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          {[
            { id: "popular", label: "🔥 Popüler" },
            { id: "latest", label: "🆕 En Yeni" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer relative
                ${tab === t.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="explore-tab"
                  className="absolute inset-0 bg-linear-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30 rounded-xl"
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Gönderiler */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-zinc-600 text-sm">
            Henüz gönderi yok
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PostCard post={post} currentUser={user} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
