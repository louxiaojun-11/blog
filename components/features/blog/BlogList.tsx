'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Eye, Heart, MessageCircle } from 'lucide-react'
import { BlogPost } from '@/types/api'
import { blogService } from '@/services/api'

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogService.getUserBlogs();
        if (response.success) {
          setBlogs(response.data);
        }
      } catch (err) {
        setError('Failed to load blogs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <article key={blog.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={blog.author.avatar}
              alt={blog.author.username}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-medium">{blog.author.username}</h3>
              <p className="text-sm text-gray-500">{blog.createdAt}</p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
          <p className="text-gray-600 mb-4 line-clamp-3">{blog.content}</p>
          
          <div className="flex items-center gap-6 text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-5 w-5" />
              {blog.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-5 w-5" />
              {blog.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-5 w-5" />
              {blog.comments}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
} 