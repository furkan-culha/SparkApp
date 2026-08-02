import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

const AuthPage = () => {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password)
      return toast.error("Email ve şifre girin");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast.success("Hoş geldin! ✨");
    } catch (err) {
      toast.error(getErrorMsg(err.code));
    } finally {
      setLoading(false);
    }
  };

 const handleRegister = async (e) => {
    e.preventDefault();
    const trimmedUsername = form.username.trim();
    
    if (!form.name || !trimmedUsername || !form.email || !form.password)
      return toast.error("Tüm alanları doldurun");
    if (form.password.length < 6)
      return toast.error("Şifre en az 6 karakter olmalı");
    if (trimmedUsername.includes(" "))
      return toast.error("Kullanıcı adında boşluk olamaz");
   try {
  setLoading(true);
  console.log("1 - createUser başlıyor");
  const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
  console.log("2 - updateProfile başlıyor");
  await updateProfile(cred.user, { displayName: form.name });
  console.log("3 - setDoc başlıyor");
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    name: form.name,
    username: trimmedUsername.toLowerCase(),
    email: form.email,
    bio: "",
    avatar: "",
    followers: [],
    following: [],
    createdAt: serverTimestamp(),
  });
  console.log("4 - tamamlandı");
  toast.success("Hesap oluşturuldu! 🎉");
} catch (err) {
  console.log("HATA:", err);
  toast.error(getErrorMsg(err.code));
}
  };

  const getErrorMsg = (code) => {
    const map = {
      "auth/email-already-in-use": "Bu email zaten kullanılıyor",
      "auth/invalid-email": "Geçersiz email adresi",
      "auth/weak-password": "Şifre çok zayıf",
      "auth/invalid-credential": "Email veya şifre hatalı",
    };
    return map[code] || "Bir hata oluştu";
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-zinc-800">
            <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">
                    +
                </div>
                <h1 className="font-mono text-2xl font-bold text-white tracking-tight">
                    Spark
                </h1>
            </div>
            <p className="text-zinc-500 text-sm">Fikirlerini dünyayla paylaş</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
            {["login", "register"].map((t) => (
                <button
                key={t}
                onClick={() => setTab(t)}
                className={` flex-1 py-4 text-sm font-medium transition-colors relative cursor-pointer ${tab === t ? "text-white": "text-zinc-500 hover:text-zinc-300"}`}
                >
                {t === "login" ? "Giriş Yap" : "Kayıt Ol"}
                {tab === t && (
                    <motion.div
                    layoutId="tab-indicator" placeholder="••••••••"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500"
                    />
                )}
                </button>
            ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
            <motion.form
            key={tab}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            onSubmit={tab === "login" ? handleLogin : handleRegister}
            className="p-8 flex flex-col gap-4"
            >
            {tab === "register" && (
                <>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Ad Soyad
                    </label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Adın Soyadın" className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-violet-500 transition-colors text-sm"/>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label  className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Kullanıcı Adı
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                        <input name="username" value={form.username} onChange={handleChange} placeholder="kullanici_adi" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pe-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-violet-500 transition-colors text-sm" />
                    </div>
                </div>
                </>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Email
                </label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="ornek@email.com" className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-violet-500 transition-colors text-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold upeprcase tracking-wider text-zinc-500">
                    Şifre
                </label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-violet-500 transition-colors text-sm" />
            </div>

            <button 
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm tracking-wider transition-all cursor-pointer"
            >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Yükleniyor...
                </span>

            ): tab === "login" ? "GİRİŞ YAP" : "HESAP OLUŞTUR"}
            </button>
            </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
