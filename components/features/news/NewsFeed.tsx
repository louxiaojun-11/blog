'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Eye } from 'lucide-react'

interface NewsItem {
  informationId: number
  title: string
  content: string
  pic: string
  type: string
  createdAt: string
  views: number
}

interface NewsFeedProps {
  selectedType: string | null
}

export default function NewsFeed({ selectedType }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      })
      
      if (selectedType) {
        params.append('type', selectedType)
      }

      const response = await fetch(`http://localhost:8080/api/user/informationList?${params}`, {
        headers: {
          'token': sessionStorage.getItem('token') || ''
        }
      })

      const data = await response.json()
      if (data.success) {
        setNews(data.data.records)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取资讯列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    fetchNews()
  }, [selectedType])

  useEffect(() => {
    fetchNews()
  }, [currentPage])

  const getFirstLine = (content: string) => {
    return content.split('\n')[0]
  }

  const formatDate = (dateString: string) => {
    return dateString.replace('T', ' ').split('.')[0]
  }

  const getPageNumbers = () => {
    const totalPages = Math.ceil(total / pageSize)
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-32 h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="divide-y">
        {news.map((item) => (
          <Link 
            href={`/news/${item.informationId}`}
            key={item.informationId}
            className="block p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2 line-clamp-2">{item.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-1">{getFirstLine(item.content)}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {item.views} 次浏览
                  </div>
                </div>
              </div>
              {item.pic && (
                <div className="relative w-48 h-32 flex-shrink-0">
                  <Image
                    src={item.pic}
                    alt={item.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* 分页控件 */}
      {total > pageSize && (
        <div className="flex justify-center items-center gap-2 p-4 border-t">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            首页
          </button>
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            上一页
          </button>
          
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
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
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === Math.ceil(total / pageSize)}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
          <button
            onClick={() => setCurrentPage(Math.ceil(total / pageSize))}
            disabled={currentPage === Math.ceil(total / pageSize)}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            末页
          </button>
        </div>
      )}
    </div>
  )
}

function getTypeColor(type: string): string {
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