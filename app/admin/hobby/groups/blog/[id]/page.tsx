'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ThumbsUp, MessageSquare, Calendar, AlertTriangle, X } from 'lucide-react'
import Image from 'next/image'

interface GroupBlogDetail {
  groupId: string
  blogId: string
  userId: string
  title: string
  content: string
  pic1: string | null
  pic2: string | null
  pic3: string | null
  pic4: string | null
  likes: number
  comments: number
  createdAt: string
}

export default function GroupBlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<GroupBlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showViolationModal, setShowViolationModal] = useState(false)
  const [violationReason, setViolationReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `http://localhost:8080/manage/user/groupBlogDetail?blogId=${params.id}`,
          {
            headers: {
              'token': sessionStorage.getItem('token') || ''
            }
          }
        )

        const data = await response.json()
        if (data.success) {
          setBlog(data.data)
        }
      } catch (error) {
        console.error('获取圈文详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBlogDetail()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return dateString.replace('T', ' ').split('.')[0]
  }

  const handleViolationSubmit = async () => {
    if (!violationReason.trim()) {
      alert('请输入违规原因')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('http://localhost:8080/manage/user/hobbyBlogViolation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': sessionStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          blogId: blog?.blogId,
          reason: violationReason
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('违规处理成功')
        router.back()
      } else {
        alert(data.message || '违规处理失败')
      }
    } catch (error) {
      console.error('违规处理失败:', error)
      alert('违规处理失败，请重试')
    } finally {
      setSubmitting(false)
      setShowViolationModal(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">
          圈文不存在或已被删除
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回圈文列表
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 标题和元信息 */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{blog.title}</h1>
            <button
              onClick={() => setShowViolationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              违规下架
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {blog.likes} 点赞
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {blog.comments} 评论
            </div>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="prose max-w-none mb-6">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* 图片展示 */}
          {(blog.pic1 || blog.pic2 || blog.pic3 || blog.pic4) && (
            <div className="grid grid-cols-4 gap-4">
              {[blog.pic1, blog.pic2, blog.pic3, blog.pic4]
                .filter((pic): pic is string => pic !== null)
                .map((pic, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={pic}
                      alt={`圈文图片 ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 违规处理弹窗 */}
      {showViolationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">违规处理</h2>
              <button
                onClick={() => setShowViolationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                违规原因
              </label>
              <textarea
                value={violationReason}
                onChange={(e) => setViolationReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="请输入违规原因..."
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowViolationModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleViolationSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {submitting ? '处理中...' : '确认提交'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 