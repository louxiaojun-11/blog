'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { hobbyService } from '@/services/api'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface GroupBlog {
  id: number;
  blogId: number;
  title: string;
  content: string;
  username: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface GroupBlogListProps {
  groupId: number;
  initialPage?: number;
}

export default function GroupBlogList({ groupId, initialPage = 1 }: GroupBlogListProps) {
  const [blogs, setBlogs] = useState<GroupBlog[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalBlogs, setTotalBlogs] = useState(0)
  const [showUnlikeConfirm, setShowUnlikeConfirm] = useState(false)
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null)
  const pageSize = 10
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true

    const fetchGroupBlogs = async () => {
      try {
        setLoading(true)
        const response = await hobbyService.getGroupBlogList({
          groupId,
          page: currentPage,
          pageSize
        })

        if (mounted && response.success) {
          setBlogs(response.data.records)
          setTotalBlogs(response.data.total)
        }
      } catch (error) {
        console.error('Failed to fetch group blogs:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchGroupBlogs()

    return () => {
      mounted = false
    }
  }, [currentPage, groupId])

  // 生成页码数组
  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalBlogs / pageSize)
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i)
        }
      }
    }

    return pageNumbers
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleLikeClick = async (blogId: number) => {
    if (!user?.userId) return

    try {
      const response = await hobbyService.clickLike({
        userId: user.userId,
        blogId: blogId
      })

      if (response.success) {
        if (response.data === 0) {
          // 未点赞，执行点赞操作
          const updatedBlogs = blogs.map(blog => {
            if (blog.blogId === blogId) {
              return { ...blog, likes: blog.likes + 1 }
            }
            return blog
          })
          setBlogs(updatedBlogs)
        } else {
          // 已点赞，显示取消确认
          setSelectedBlogId(blogId)
          setShowUnlikeConfirm(true)
        }
      }
    } catch (error) {
      console.error('Failed to handle like:', error)
    }
  }

  const handleUnlike = async () => {
    if (!user?.userId || !selectedBlogId) return

    try {
      const response = await hobbyService.removeLike({
        userId: user.userId,
        blogId: selectedBlogId
      })

      if (response.success) {
        // 更新点赞数
        const updatedBlogs = blogs.map(blog => {
          if (blog.blogId === selectedBlogId) {
            return { ...blog, likes: blog.likes - 1 }
          }
          return blog
        })
        setBlogs(updatedBlogs)
      }
    } catch (error) {
      console.error('Failed to remove like:', error)
    } finally {
      setShowUnlikeConfirm(false)
      setSelectedBlogId(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!blogs || blogs.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无博文</div>
  }

  const totalPages = Math.ceil(totalBlogs / pageSize)

  return (
    <div className="space-y-4">
      {/* 取消点赞确认弹窗 */}
      {showUnlikeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[300px]">
            <h3 className="text-lg font-bold mb-4">取消点赞</h3>
            <p className="text-gray-600 mb-6">确定要取消对这条博文的点赞吗？</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowUnlikeConfirm(false)
                  setSelectedBlogId(null)
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                取消
              </button>
              <button
                onClick={handleUnlike}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 博文列表 */}
      <div className="bg-white rounded-lg shadow">
        {blogs.map((blog) => (
          <div key={blog.id} className="p-4 border-b last:border-b-0">
            <Link href={`/groups/blog/${blog.blogId}?source=group&page=${currentPage}`} className="block">
              <h3 className="text-lg font-bold mb-1 hover:text-[#FF8200]">
                {blog.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                {blog.content}
              </p>
            </Link>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4 text-gray-500">
                <span>{blog.username}</span>
                <span>{blog.createdAt}</span>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    handleLikeClick(blog.blogId)
                  }}
                  className="flex items-center gap-1 hover:text-[#FF8200]"
                >
                  <Heart className="w-4 h-4" />
                  {blog.likes}
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {blog.comments}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 分页控件 */}
      {totalBlogs > pageSize && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            首页
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            上一页
          </button>
          
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded border ${
                pageNum === currentPage
                  ? 'bg-[#FF8200] text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            末页
          </button>
        </div>
      )}
    </div>
  )
} 