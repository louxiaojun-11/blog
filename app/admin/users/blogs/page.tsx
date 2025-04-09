'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { adminService } from '@/services/adminApi'
import { ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Blog {
  id: number
  title: string
  content: string
  userId: number
  likes: number
  views: number
  comments: number
  createdAt: string
  updatedAt: string
}

export default function UserBlogs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('userId')
  
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalBlogs, setTotalBlogs] = useState(0)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    if (!userId) {
      setError('用户ID不能为空')
      setLoading(false)
      return
    }

    const fetchUserBlogs = async () => {
      try {
        setLoading(true)
        const response = await adminService.getUserBlogList(
          Number(userId),
          page,
          pageSize
        )
        
        if (response.success) {
          setBlogs(response.data.records)
          setTotalBlogs(response.data.total)
          
          // 如果有博文，从第一篇博文中获取用户名
          if (response.data.records.length > 0) {
            const firstBlog = response.data.records[0]
            setUserName(`${firstBlog.userId}号用户`)
          }
        } else {
          setError(response.message || '获取用户博文失败')
        }
      } catch (error) {
        console.error('Error fetching user blogs:', error)
        setError('获取用户博文失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUserBlogs()
  }, [userId, page, pageSize])

  const totalPages = Math.ceil(totalBlogs / pageSize)

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
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <h1 className="text-2xl font-bold">{userName || `用户ID: ${userId}`}的博文</h1>
      </div>
      
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">该用户暂无博文</div>
      ) : (
        <>
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div key={blog.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <Link 
                    href={`/admin/users/blogs/${blog.id}?userId=${userId}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                  >
                    {blog.title}
                  </Link>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(blog.createdAt)}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>浏览: {blog.views}</span>
                  <span>点赞: {blog.likes}</span>
                  <span>评论: {blog.comments}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* 分页控制 */}
          <div className="flex justify-between items-center mt-6">
            <div>
              总共 <span className="font-medium">{totalBlogs}</span> 篇博文
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4">
                {page} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                下一页
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1) // 重置页码
                }}
                className="ml-4 px-2 py-1 border border-gray-300 rounded focus:outline-none"
              >
                <option value={5}>5条/页</option>
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 