import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { sendNotification } from "../firebase/notifications";
const ProfilePage = () => {
  const { uid } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioText, setBioText] = useState("");
  const isOwn = user?.uid === uid;
  const isFollowing = profile?.followers?.includes(user?.uid);

  // Profili çek
  useEffect(() => {
    const fetchProfile = async () => {
      console.log("uid:", uid);
      const snap = await getDoc(doc(db, "users", uid));
      console.log("exists:", snap.exists());
      console.log("data:", snap.data());
      if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchProfile();
  }, [uid]);

  // Gönderileri çek
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [uid]);

  const handleFollow = async () => {
    try {
      const profileRef = doc(db, "users", uid);
      const myRef = doc(db, "users", user.uid);

      if (isFollowing) {
        await updateDoc(profileRef, { followers: arrayRemove(user.uid) });
        await updateDoc(myRef, { following: arrayRemove(uid) });
        setProfile((p) => ({
          ...p,
          followers: p.followers.filter((f) => f !== user.uid),
        }));
        toast.success("Takipten çıkıldı");
      } else {
        await updateDoc(profileRef, { followers: arrayUnion(user.uid) });
        await updateDoc(myRef, { following: arrayUnion(uid) });
        setProfile((p) => ({
          ...p,
          followers: [...(p.followers || []), user.uid],
        }));

        // Takip bildirimi gönder
        await sendNotification({
          toUid: uid,
          fromUid: user.uid,
          fromName: user.displayName || user.email.split("@")[0],
          type: "follow",
          postId: null,
        });

        toast.success("Takip edildi! 🎉");
      }
    } catch {
      toast.error("Bir hata oluştu");
    }
  };
  const handleSaveBio = async () => {
    try {
      await updateDoc(doc(db, "users", uid), { bio: bioText });
      setProfile((p) => ({ ...p, bio: bioText }));
      setEditing(false);
      toast.success("Bio güncellendi! ✨");
    } catch {
      toast.error("Güncellenemedi");
    }
  };
  if (loading)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Kullanıcı bulunamadı</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Profil Kartı */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            {/* Avatar & İsim */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                {(profile.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{profile.name}</h1>
                <p className="text-sm text-zinc-500">@{profile.username}</p>

                {/* Bio */}
                {isOwn ? (
                  editing ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Kendini tanıt..."
                        rows={2}
                        maxLength={150}
                        className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none resize-none transition-colors"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveBio}
                          className="px-3 py-1.5 bg-linear-to-r from-violet-500 to-pink-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm text-zinc-300">
                        {profile.bio || "Bio ekle..."}
                      </p>
                      <button
                        onClick={() => {
                          setEditing(true);
                          setBioText(profile.bio || "");
                        }}
                        className="text-xs text-zinc-600 hover:text-violet-400 transition-colors cursor-pointer"
                      >
                        ✏️
                      </button>
                    </div>
                  )
                ) : (
                  profile.bio && (
                    <p className="text-sm text-zinc-300 mt-1">{profile.bio}</p>
                  )
                )}
              </div>
            </div>

            {/* Takip Butonu */}
            {!isOwn && (
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer
                  ${
                    isFollowing
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                      : "bg-linear-to-r from-violet-500 to-pink-500 text-white hover:from-violet-400 hover:to-pink-400"
                  }`}
              >
                {isFollowing ? "Takipten Çık" : "Takip Et"}
              </button>
            )}
          </div>

          {/* İstatistikler */}
          <div className="flex gap-6 mt-5 pt-5 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{posts.length}</p>
              <p className="text-xs text-zinc-500">Gönderi</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {profile.followers?.length || 0}
              </p>
              <p className="text-xs text-zinc-500">Takipçi</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {profile.following?.length || 0}
              </p>
              <p className="text-xs text-zinc-500">Takip</p>
            </div>
          </div>
        </motion.div>

        {/* Gönderiler */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-zinc-400">Gönderiler</p>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <p>Henüz gönderi yok</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
