import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { sendNotification } from "../firebase/notifications";
const formatTime = (ts) => {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "şimdi";
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}s`;
  return `${Math.floor(diff / 86400)}g`;
};

const PostPage = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Gönderiyi çek
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "posts", postId), (snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [postId]);

  // Yorumları dinle
  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [postId]);

  const handleComment = async () => {
    if (!text.trim()) return toast.error("Yorum yazın");
    if (!post) return toast.error("Gönderi yükleniyor...");
    try {
      setLoading(true);
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: text.trim(),
        uid: user.uid,
        displayName: user.displayName || user.email.split("@")[0],
        createdAt: serverTimestamp(),
      });
      // Yorum bildirimi gönder
      await sendNotification({
        toUid: post.uid,
        fromUid: user.uid,
        fromName: user.displayName || user.email.split("@")[0],
        type: "comment",
        postId: post.id,
      });
      console.log("postId:", postId);
      const postRef = doc(db, "posts", postId);
      console.log("postRef:", postRef);
      await updateDoc(postRef, {
        commentCount: increment(1),
      });
      console.log("increment çalıştı!");

      setText("");
      toast.success("Yorum eklendi!");
    } catch (err) {
      console.log("HATA:", err.message);
      toast.error("Yorum eklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Yorumu sil?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId, "comments", commentId));
      await updateDoc(doc(db, "posts", postId), {
        commentCount: increment(-1),
      });
      toast.success("Yorum silindi");
    } catch {
      toast.error("Silinemedi");
    }
  };

  if (!post)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Geri */}
        <Link
          to="/"
          className="text-zinc-500 hover:text-white text-sm transition-colors flex items-center gap-1"
        >
          ← Feed'e dön
        </Link>

        {/* Gönderi */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
              {(post.displayName || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {post.displayName}
              </p>
              <p className="text-xs text-zinc-500">
                {formatTime(post.createdAt)}
              </p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-zinc-100 text-sm leading-relaxed whitespace-pre-wrap">
              {post.text}
            </p>
          </div>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="post"
              className="w-full max-h-96 object-cover"
            />
          )}
        </div>

        {/* Yorum Yaz */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {(user?.displayName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Yorum yaz..."
              rows={2}
              className="w-full bg-transparent text-white placeholder-zinc-500 text-sm outline-none resize-none leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={handleComment}
                disabled={loading || !text.trim()}
                className="px-4 py-2 bg-linear-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-sm font-bold transition-all cursor-pointer"
              >
                {loading ? "Gönderiliyor..." : "Yorum Yap"}
              </button>
            </div>
          </div>
        </div>

        {/* Yorumlar */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-400">
            {comments.length} Yorum
          </p>
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {(comment.displayName || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {comment.displayName}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    {comment.uid === user?.uid && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-zinc-600 hover:text-red-400 text-xs transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
