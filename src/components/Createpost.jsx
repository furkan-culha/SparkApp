import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CreatePost = ({ user, onPost }) => {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!text.trim()) return toast.error("Bir şeyler yaz!");
    try {
      setLoading(true);
      await addDoc(collection(db, "posts"), {
        text: text.trim(),
        imageUrl: imageUrl.trim() || null,
        uid: user.uid,
        displayName: user.displayName || user.email.split("@")[0],
        likes: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
      setText("");
      setImageUrl("");
      setShowImageInput(false);
      toast.success("Gönderi paylaşıldı! ✨");
      onPost();
    } catch (err) {
      toast.error("Gönderi paylaşılamadı");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {(user?.displayName || "?").charAt(0).toUpperCase()}
        </div>

        {/* Input */}
        <div className="flex-1 flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ne düşünüyorsun?"
            rows={3}
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm outline-none resize-none leading-relaxed"
          />

          {/* Image URL Input */}
          <AnimatePresence>
            {showImageInput && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Resim URL'si yapıştır..."
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition-colors"
              />
            )}
          </AnimatePresence>

          {/* Image Preview */}
          <AnimatePresence>
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-xl overflow-hidden"
              >
                <img
                  src={imageUrl}
                  alt="preview"
                  className="w-full max-h-64 object-cover"
                  onError={() => { setImageUrl(""); toast.error("Geçersiz resim URL'si"); }}
                />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/80 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            {/* Araçlar */}
            <button
              onClick={() => setShowImageInput((v) => !v)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer
                ${showImageInput ? "text-violet-400 bg-violet-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              🖼️ Resim
            </button>

            {/* Paylaş */}
            <button
              onClick={handlePost}
              disabled={loading || !text.trim()}
              className="px-5 py-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-sm font-bold transition-all cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Paylaşılıyor...
                </span>
              ) : "Paylaş ✦"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;