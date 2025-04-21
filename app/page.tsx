'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/app/layouts/MainLayout'
import BlogList from '@/components/features/blog/BlogList'
import { RefreshCw } from 'lucide-react'
import { BlogPost } from '@/types/api'

interface RecommendedResponse {
  success: boolean
  data: BlogPost[]
  message: string | null
}

export default function HomePage() {
  const { user } = useAuth()
  const [recommendedBlogs, setRecommendedBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRecommendedBlogs = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(
        `http://localhost:8080/api/blog/recommended?userId=${user?.userId}`,
        {
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        }
      )

      const data: RecommendedResponse = await response.json()
      if (data.success) {
        setRecommendedBlogs(data.data)
      }
    } catch (error) {
      console.error('获取推荐博文失败:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user?.userId) {
      fetchRecommendedBlogs()
    }
  }, [user?.userId])

  const handleRefresh = () => {
    fetchRecommendedBlogs()
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">推荐博文</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-[#FF8200] hover:bg-orange-50 rounded-full transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            换一换
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-gray-500">加载中...</div>
          </div>
        ) : recommendedBlogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-gray-500">暂无推荐博文</div>
          </div>
        ) : (
          <BlogList 
            blogList={recommendedBlogs}
            total={recommendedBlogs.length}
            currentPage={1}
            currentPageSize={10}
          />
        )}
      </div>
    </MainLayout>
  )
}
