'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface GroupBlog {
  blogId: number
  title: string
  content: string
  username: string
  likes: number
  comments: number
  createdAt: string
}

interface GroupBlogResponse {
  success: boolean
  data: {
    total: number
    records: GroupBlog[]
  }
  message: string | null
}

export default function GroupBlogListPage() {
  const params = useParams()
  const router = useRouter()
  const [blogs, setBlogs] = useState<GroupBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchGroupBlogs()
  }, [currentPage])

  const fetchGroupBlogs = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:8080/manage/user/groupBlogList?groupId=${params.id}&page=${currentPage}&pageSize=${pageSize}`,
        {
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        }
      )

      const data: GroupBlogResponse = await response.json()
      if (data.success) {
        setBlogs(data.data.records)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取圈子博文失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFirstLine = (content: string) => {
    return content.split('\n')[0]
  }

  const formatDate = (dateString: string) => {
    return dateString.replace('T', ' ').split('.')[0]
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          返回圈子列表
        </button>
        <h1 className="text-2xl font-bold">圈子文章列表</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无圈文</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <div key={blog.blogId} className="p-6">
                <h3 
                  onClick={() => router.push(`/admin/hobby/groups/blog/${blog.blogId}`)}
                  className="text-lg font-medium mb-2 hover:text-[#FF8200] cursor-pointer"
                >
                  {blog.title}
                </h3>
                <p className="text-gray-600 mb-4">{getFirstLine(blog.content)}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex gap-4">
                    <span>作者: {blog.username}</span>
                    <span>点赞: {blog.likes}</span>
                    <span>评论: {blog.comments}</span>
                  </div>
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页控件 */}
        {!loading && blogs.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <div className="text-sm text-gray-700">
              共 {total} 条记录
            </div>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(total / pageSize) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === index + 1
                      ? 'bg-[#FF8200] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 