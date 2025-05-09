'use client'

import { useState } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Send } from 'lucide-react'

export default function AnnouncementsPage() {
  const { admin } = useAdminAuth()
  const [content, setContent] = useState('')
  const [target, setTarget] = useState<'all' | 'online' | string>('all')
  const [userId, setUserId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('请输入公告内容')
      return
    }

    if (target === 'userId' && !userId.trim()) {
      alert('请输入用户ID')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('http://localhost:8080/manage/admin/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': sessionStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          content,
          target: target === 'userId' ? userId : target,
          adminId: admin?.adminId
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('公告发布成功')
        // 重置表单
        setContent('')
        setTarget('all')
        setUserId('')
      } else {
        alert(data.message || '发布失败')
      }
    } catch (error) {
      console.error('发布公告失败:', error)
      alert('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">发布公告</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 公告内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              公告内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
              rows={6}
              placeholder="请输入公告内容..."
            />
          </div>

          {/* 发送对象 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发送对象
              </label>
              <select
                value={target === 'userId' ? 'userId' : target}
                onChange={(e) => {
                  const value = e.target.value
                  setTarget(value as 'all' | 'online' | 'userId')
                  if (value !== 'userId') {
                    setUserId('')
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
              >
                <option value="all">向所有用户发送</option>
                <option value="online">向在线用户发送</option>
                <option value="userId">向特定用户发送</option>
              </select>
            </div>

            {/* 用户ID输入框 */}
            {target === 'userId' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                  placeholder="请输入用户ID"
                />
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? '发布中...' : '发布公告'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 