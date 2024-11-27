'use client'

import { useEffect, useState } from 'react'
import PostComposer from '@/components/features/PostComposer'
import PostCard from '@/components/features/PostCard'
import { Post } from '@/types/api'
import { postService } from '@/services/api'

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await postService.getPosts();
        if (response.success) {
          setPosts(response.data);
        }
      } catch (err) {
        setError('Failed to load posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="flex-1 min-w-[600px] space-y-4">
      <PostComposer />
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
} 