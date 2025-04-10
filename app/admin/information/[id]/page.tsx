'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminService } from '@/services/adminApi'
import Image from 'next/image'
import { ArrowLeft, Calendar, Eye } from 'lucide-react'

interface InformationDetail {
  title: string
  content: string
  pic: string
  type: string
  createdAt: string
  views: number
}

export default function InformationDetail() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [information, setInformation] = useState<InformationDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInformationDetail = async () => {
      if (!params.id) {
        setError('资讯ID不能为空')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await adminService.getInformationDetail(Number(params.id))
        
        if (response.success) {
          setInformation(response.data)
        } else {
          setError(response.message || '获取资讯详情失败')
        }
      } catch (error) {
        console.error('Error fetching information detail:', error)
        setError('获取资讯详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchInformationDetail()
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !information) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <div className="text-center py-8 text-red-500">
            {error || '资讯不存在'}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          返回资讯列表
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 头部 */}
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{information.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(information.type)}`}>
                  {information.type}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{information.createdAt}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{information.views} 次浏览</span>
              </div>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-8">
            {information.pic && (
              <div className="mb-8 flex justify-center">
                <div className="relative h-[300px] w-full max-w-2xl rounded-lg overflow-hidden shadow-md transform transition-transform hover:scale-[1.01]">
                  <Image
                    src={information.pic}
                    alt={information.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                  />
                </div>
              </div>
            )}
            
            <div className="prose prose-lg max-w-none">
              {information.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 根据分类获取不同的颜色样式
function getCategoryColor(type: string): string {
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