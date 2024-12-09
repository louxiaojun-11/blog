'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { blogService } from '@/services/api'
import MainLayout from '@/app/layouts/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Check } from 'lucide-react'

export default function WriteBlogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空')
      return
    }

    if (!user?.userId) {
      alert('请先登录')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await blogService.createBlog({
        title,
        content,
        userId: user.userId
      })

      if (response.success) {
        setShowSuccess(true)
        // 3秒后刷新页面
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to create blog:', error)
      alert('发布失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        {/* 成功提示组件 */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
            <div className="bg-green-100 rounded-full p-1">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-green-800">发布成功！</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">写博文</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="请输入标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                maxLength={100}
              />
            </div>
            <div>
              <textarea
                placeholder="请输入正文内容..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8200] resize-none"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933] disabled:opacity-50"
              >
                {isSubmitting ? '发布中...' : '发布博文'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
} 