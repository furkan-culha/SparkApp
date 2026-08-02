import { create } from "zustand";

const usePostStore = create((set) => ({
  posts: [],
  loading: false,
  setPosts: (posts) => set({ posts }),
  setLoading: (loading) => set({ loading }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  removePost: (id) => set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),
  updatePost: (id, data) => set((state) => ({
    posts: state.posts.map((p) => (p.id === id ? { ...p, ...data } : p)),
  })),
}));

export default usePostStore;