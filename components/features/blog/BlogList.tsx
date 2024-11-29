'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Eye, Heart, MessageCircle, Trash2 } from 'lucide-react'
import { BlogPost } from '@/types/api'
import { blogService } from '@/services/api'

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getUserBlogs();
      if (response.success) {
        const sortedBlogs = [...response.data].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setBlogs(sortedBlogs);
      }
    } catch (err) {
      setError('Failed to load blogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId: number) => {
    if (!confirm('确定要删除这篇博文吗？')) {
      return;
    }

    try {
      setDeleting(blogId);
      const response = await blogService.deleteBlog(blogId);
      if (response.success) {
        setBlogs(blogs.filter(blog => blog.id !== blogId));
        alert('删除成功！');
      }
    } catch (err) {
      console.error('Failed to delete blog:', err);
      alert('删除失败，请重试');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-6"
        >
          <circle cx="100" cy="100" r="50" fill="#FFB6C1" />
          <circle cx="100" cy="105" r="10" fill="#FF69B4" />
          <circle cx="85" cy="90" r="5" fill="#000" />
          <circle cx="115" cy="90" r="5" fill="#000" />
          <path d="M70 60 Q80 40 90 60" stroke="#FFB6C1" strokeWidth="8" />
          <path d="M130 60 Q120 40 110 60" stroke="#FFB6C1" strokeWidth="8" />
          <rect x="140" y="80" width="40" height="50" fill="#FFF" stroke="#000" strokeWidth="2" />
          <line x1="150" y1="90" x2="170" y2="90" stroke="#000" strokeWidth="2" />
          <line x1="150" y1="100" x2="170" y2="100" stroke="#000" strokeWidth="2" />
          <line x1="150" y1="110" x2="170" y2="110" stroke="#000" strokeWidth="2" />
          <path d="M130 110 Q140 110 145 100" stroke="#FFB6C1" strokeWidth="8" />
        </svg>
        <p className="text-lg font-medium mb-2">这里什么都没有，快去写博文吧！</p>
        <p className="text-sm">点击左侧菜单的"写博文"开始创作</p>
      </div>
    );
  }

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
          
          <div className="flex items-center justify-between text-gray-500">
            <div className="flex items-center gap-6">
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
            <button
              onClick={() => handleDelete(blog.id)}
              disabled={deleting === blog.id}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
              {deleting === blog.id ? '删除中...' : '删除'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
} 