import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import PostCard from "./PostCard";
import { motion, AnimatePresence } from "framer-motion";

const PostList = ({user,refresh}) => {
    const [posts, setPosts] = useState([])
    const [loading,setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(db,"posts"), orderBy("createdAt", "desc"))
        const unsub = onSnapshot(q, (snap => {
            const data = snap.docs.map((doc) => ({id:doc.id, ...doc.data()}))
            setPosts(data)
            setLoading(false)
        }))
        return () => unsub()
    }, [refresh])

    if (loading) return (
        <div className='flex justify-center py-12'>
            <div className='w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin'/>
            
        </div>
    )

    if (posts.length === 0) return(
        <div className='text-center py-16 flex flex-col items-center gap-3'>
          <span className='text-5xl'>+</span>
          <p className='text-zinc-400 font-medium'>Henüz gönderi yok</p>
          <p className='text-zinc-600 text-sm'>İlk gönderiyi sen paylaş!</p>
        </div>
    )
   return (
    <div className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            <PostCard post={post} currentUser={user} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default PostList