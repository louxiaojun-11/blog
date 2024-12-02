'use client'

import { useState, useEffect } from 'react'
import { BlogPost } from '@/types/api'
import { blogService } from '@/services/api'
import Image from 'next/image'
import { MessageCircle, Heart, Share, Eye, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface BlogListProps {
  userId?: number;
  blogList?: BlogPost[];
  isPersonal?: boolean;
}

export default function BlogList({ userId, blogList: initialBlogList, isPersonal = false }: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedBlogs, setExpandedBlogs] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState<number | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (initialBlogList) {
      setBlogs(initialBlogList)
      setLoading(false)
      return
    }

    const loadBlogs = async () => {
      if (!userId && !user?.userId) return
      
      try {
        setLoading(true)
        const response = await blogService.getUserBlogs(userId || user?.userId)
        if (response.success) {
          const sortedBlogs = [...response.data].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
          setBlogs(sortedBlogs)
        }
      } catch (error) {
        console.error('Failed to load blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [userId, initialBlogList, user?.userId])

  const toggleExpand = (blogId: number) => {
    setExpandedBlogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blogId)) {
        newSet.delete(blogId)
      } else {
        newSet.add(blogId)
      }
      return newSet
    })
  }

  const handleDelete = async (blogId: number) => {
    if (!confirm('确定要删除这篇博文吗？')) {
      return
    }

    try {
      setDeleting(blogId)
      const response = await blogService.deleteBlog(blogId)
      if (response.success) {
        setBlogs(blogs.filter(blog => blog.id !== blogId))
        alert('删除成功！')
      }
    } catch (error) {
      console.error('Failed to delete blog:', error)
      alert('删除失败，请重试')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (blogs.length === 0) {
    if (isPersonal) {
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
      )
    }
    return <div className="text-center py-8 text-gray-500">还没有发布任何博文</div>
  }

  return (
    <div className="space-y-4">
      {blogs.map((blog) => {
        const isExpanded = expandedBlogs.has(blog.id)
        const needsExpansion = blog.content.length > 100

        return (
          <article key={blog.id} className={isPersonal ? "bg-white rounded-lg shadow p-6" : "p-4 border-b last:border-b-0"}>
            <h3 className="text-lg font-bold mb-2">{blog.title}</h3>
            <div className="relative">
              <p className={`text-gray-600 mb-2 ${!isExpanded && needsExpansion ? 'line-clamp-2' : ''}`}>
                {blog.content}
              </p>
              {needsExpansion && (
                <button
                  onClick={() => toggleExpand(blog.id)}
                  className="text-[#FF8200] hover:text-[#ff9933]"
                >
                  {isExpanded ? '收起' : '展开全文'}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Image
                  src={blog.author.avatar}
                  alt={blog.author.username}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-gray-600">{blog.author.username}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-400">{blog.createdAt}</span>
              </div>
              <div className="flex gap-6 text-gray-500">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>{blog.views}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span>{blog.likes}</span>
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>{blog.comments}</span>
                </span>
                {isPersonal && (
                  <button
                    onClick={() => handleDelete(blog.id)}
                    disabled={deleting === blog.id}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>{deleting === blog.id ? '删除中...' : '删除'}</span>
                  </button>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
} 