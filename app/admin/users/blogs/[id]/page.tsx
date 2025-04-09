'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, ThumbsUp, Eye, MessageSquare } from 'lucide-react'

export default function BlogDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const blogId = params.id
  const userId = searchParams.get('userId')
  
  const [blog, setBlog] = useState<{
    id: number;
    title: string;
    content: string;
    userId: number;
    likes: number;
    views: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 这里应该是从后端获取博文详情的API
    // 由于没有提供博文详情的API，我们模拟一个博文详情
    const fetchBlogDetail = async () => {
      try {
        setLoading(true)
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟博文数据
        setBlog({
          id: Number(blogId),
          title: '模拟博文标题',
          content: '这是一篇模拟的博文内容。实际项目中，你应该调用后端API获取真实的博文详情数据。\n\n博文内容可能包含多个段落，这样做只是为了演示效果。\n\n在实际项目中，你可能需要处理博文的格式化和展示，比如支持Markdown或富文本格式。',
          userId: Number(userId),
          likes: 10,
          views: 100,
          comments: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error fetching blog detail:', error)
        setError('获取博文详情失败')
      } finally {
        setLoading(false)
      }
    }

    if (blogId) {
      fetchBlogDetail()
    } else {
      setError('博文ID不能为空')
      setLoading(false)
    }
  }, [blogId, userId])

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
              <Eye className="w-4 h-4 mr-1" />
              {blog.views} 浏览
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
              {blog.content.split('\n\n').map((paragraph, index) => (
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