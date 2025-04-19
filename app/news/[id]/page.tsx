'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import MainLayout from '@/app/layouts/MainLayout'
import { ArrowLeft, Calendar, Eye } from 'lucide-react'

interface NewsDetail {
  title: string
  content: string
  pic: string
  type: string
  createdAt: string
  views: number
  informationId: number
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8080/api/user/informationDetail/${params.id}`, {
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        })

        const data = await response.json()
        if (data.success) {
          setNews(data.data)
        }
      } catch (error) {
        console.error('获取资讯详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchNewsDetail()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return dateString.replace('T', ' ').split('.')[0]
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case '科技':
        return 'bg-blue-50 text-blue-600';
      case '时事':
        return 'bg-orange-50 text-orange-600';
      case '财经':
        return 'bg-green-50 text-green-600';
      case '体育':
        return 'bg-purple-50 text-purple-600';
      case '娱乐':
        return 'bg-pink-50 text-pink-600';
      case '教育':
        return 'bg-indigo-50 text-indigo-600';
      case '汽车':
        return 'bg-red-50 text-red-600';
      case '时尚':
        return 'bg-yellow-50 text-yellow-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto pt-4 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!news) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto pt-4 px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">资讯不存在或已被删除</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pt-4 px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回资讯列表
        </button>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 头部信息 */}
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className={`px-3 py-1 rounded-full ${getTypeColor(news.type)}`}>
                {news.type}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(news.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {news.views} 次浏览
              </div>
            </div>
          </div>

          {/* 图片 */}
          {news.pic && (
            <div className="relative h-[400px] w-full">
              <Image
                src={news.pic}
                alt={news.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* 内容 */}
          <div className="p-6">
            <div className="prose max-w-none">
              {news.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </MainLayout>
  )
} 