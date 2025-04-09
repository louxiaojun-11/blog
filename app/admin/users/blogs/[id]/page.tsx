'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, ThumbsUp, MessageSquare } from 'lucide-react'
import { adminService } from '@/services/adminApi'

interface BlogDetail {
  id: number;
  title: string;
  content: string;
  userId: number;
  likes: number;
  comments: number;
  createdAt: string;
}

export default function BlogDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const blogId = params.id
  const userId = searchParams.get('userId')
  
  const [blog, setBlog] = useState<BlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogDetail = async () => {
      if (!blogId) {
        setError('博文ID不能为空')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await adminService.getUserBlogDetail(Number(blogId))
        
        if (response.success) {
          setBlog(response.data)
        } else {
          setError(response.message || '获取博文详情失败')
        }
      } catch (error) {
        console.error('Error fetching blog detail:', error)
        setError('获取博文详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogDetail()
  }, [blogId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回博文列表
      </button>
      
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : blog ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">{blog.title}</h1>
          
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(blog.createdAt)}
            </div>
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              {blog.likes} 点赞
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {blog.comments} 评论
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="prose max-w-none">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">博文不存在</div>
      )}
    </div>
  )
} 