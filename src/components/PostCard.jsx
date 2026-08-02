import { useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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

const PostCard = ({ post, currentUser }) => {
  const isLiked = post.likes?.includes(currentUser?.uid);
  const isOwn = post.uid === currentUser?.uid;
  const [likeLoading, setLikeLoading] = useState(false);

 const handleLike = async () => {
  if (likeLoading) return;
  setLikeLoading(true);
  try {
    const postRef = doc(db, "posts", post.id);
    await updateDoc(postRef, {
      likes: isLiked
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid),
    });

    // Beğeni bildirimi gönder
    if (!isLiked) {
      await sendNotification({
        toUid: post.uid,
        fromUid: currentUser.uid,
        fromName: currentUser.displayName || currentUser.email.split("@")[0],
        type: "like",
        postId: post.id,
      });
    }
  } catch {
    toast.error("Bir hata oluştu");
  } finally {
    setLikeLoading(false);
  }
};

  const handleDelete = async () => {
    if (!window.confirm("Bu gönderiyi silmek istiyor musun?")) return;
    try {
      await deleteDoc(doc(db, "posts", post.id));
      toast.success("Gönderi silindi");
    } catch {
      toast.error("Silinemedi");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.uid}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
            {(post.displayName || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{post.displayName}</p>
            <p className="text-xs text-zinc-500">{formatTime(post.createdAt)}</p>
          </div>
        </Link>
        {isOwn && (
          <button
            onClick={handleDelete}
            className="text-zinc-600 hover:text-red-400 transition-colors text-sm cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* İçerik */}
      <div className="px-4 pb-3">
        <p className="text-zinc-100 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>
      </div>

      {/* Resim */}
      {post.imageUrl && (
        <div className="overflow-hidden">
          <img
            src={post.imageUrl}
            alt="post"
            className="w-full max-h-96 object-cover"
            onError={(e) => e.target.style.display = "none"}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-zinc-800">
        {/* Beğeni */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
          disabled={likeLoading}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          <span className={`text-lg transition-transform ${isLiked ? "scale-110" : "group-hover:scale-110"}`}>
            {isLiked ? "❤️" : "🤍"}
          </span>
          <span className={`text-sm font-medium ${isLiked ? "text-pink-400" : "text-zinc-500"}`}>
            {post.likes?.length || 0}
          </span>
        </motion.button>

        {/* Yorum */}
        <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 group">
          <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
          <span className="text-sm font-medium text-zinc-500">
            {post.commentCount || 0}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;