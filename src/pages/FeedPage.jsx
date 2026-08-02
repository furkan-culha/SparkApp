import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostList from "../components/PostList";

const FeedPage = () => {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
        <CreatePost user={user} onPost={() => setRefresh((r) => r + 1)} />
        <PostList user={user} refresh={refresh} />
      </div>
    </div>
  );
};

export default FeedPage;