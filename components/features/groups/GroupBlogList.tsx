'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { hobbyService } from '@/services/api'
import Link from 'next/link'

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
}

export default function GroupBlogList({ groupId }: GroupBlogListProps) {
  const [blogs, setBlogs] = useState<GroupBlog[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalBlogs, setTotalBlogs] = useState(0)
  const pageSize = 10

  useEffect(() => {
    const fetchGroupBlogs = async () => {
      try {
        setLoading(true)
        const response = await hobbyService.getGroupBlogList({
          groupId,
          page: currentPage,
          pageSize
        })

        if (response.success) {
          setBlogs(response.data.records)
          setTotalBlogs(response.data.total)
        }
      } catch (error) {
        console.error('Failed to fetch group blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupBlogs()
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

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!blogs || blogs.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无博文</div>
  }

  const totalPages = Math.ceil(totalBlogs / pageSize)

  return (
    <div className="space-y-4">
      {/* 博文列表 */}
      <div className="bg-white rounded-lg shadow">
        {blogs.map((blog) => (
          <div key={blog.id} className="p-4 border-b last:border-b-0">
            <Link href={`/groups/blog/${blog.blogId}`} className="block">
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
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {blog.likes}
                </span>
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