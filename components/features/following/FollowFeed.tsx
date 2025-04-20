'use client'

import { useEffect, useState } from 'react'
import BlogList from '@/components/features/blog/BlogList'
import { useAuth } from '@/contexts/AuthContext'
import { BlogPost } from '@/types/api'

interface FollowingBlogResponse {
  success: boolean
  data: {
    total: number
    records: BlogPost[]
  }
  message: string | null
}

export default function FollowFeed() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (user?.userId) {
      fetchFollowingBlogs(currentPage, pageSize)
    }
  }, [user?.userId, currentPage, pageSize])

  const fetchFollowingBlogs = async (page: number, pageSize: number) => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:8080/api/blog/followingBlogList?userId=${user?.userId}&page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        }
      )

      const data: FollowingBlogResponse = await response.json()
      if (data.success) {
        setBlogs(data.data.records)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取关注用户博文失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value)
    setPageSize(newSize)
    setCurrentPage(1) // 重置到第一页
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!blogs.length) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-gray-500">
          暂无关注用户的博文
        </div>
      </div>
    )
  }

  return (
    <BlogList
      blogList={blogs}
      total={total}
      currentPage={currentPage}
      currentPageSize={pageSize}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  )
} 