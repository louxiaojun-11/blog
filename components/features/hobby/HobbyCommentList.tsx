'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { hobbyService } from '@/services/api'
import { Check } from 'lucide-react'

interface Comment {
  id: number;
  blogId: number;
  content: string;
  userId: number;
  username: string;
  avatar: string;
  createdAt: string;
}

interface HobbyCommentListProps {
  blogId: number;
  isOpen: boolean;
  onClose: () => void;
  onCommentSuccess?: () => void;
}

export default function HobbyCommentList({ blogId, isOpen, onClose, onCommentSuccess }: HobbyCommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { user } = useAuth()
  const pageSize = 6

  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, page, blogId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await hobbyService.getComments(blogId, page, pageSize)
      if (response.success) {
        setComments(response.data.records)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.userId) {
      alert('请先登录')
      return
    }

    if (!content.trim()) {
      alert('请输入评论内容')
      return
    }

    try {
      setSubmitting(true)
      const response = await hobbyService.addComment({
        userId: user.userId,
        blogId,
        content: content.trim()
      })

      if (response.success) {
        setContent('')
        setShowSuccess(true)
        loadComments()
        onCommentSuccess?.()
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('发表评论失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">评论列表</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2">
            <div className="bg-green-100 rounded-full p-1">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-green-800">评论发表成功！</span>
          </div>
        )}

        <div className="flex h-[calc(80vh-60px)]">
          {/* Comments list - Left side */}
          <div className="flex-1 overflow-y-auto p-4 border-r">
            {loading ? (
              <div className="text-center py-4">加载中...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">暂无评论</div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Image
                      src={comment.avatar || '/default-avatar.png'}
                      alt={comment.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{comment.username}</span>
                        <span className="text-sm text-gray-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > pageSize && (
              <div className="flex justify-center pt-4">
                {Array.from({ length: Math.ceil(total / pageSize) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`mx-1 px-3 py-1 rounded ${
                      page === i + 1
                        ? 'bg-[#FF8200] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comment form - Right side */}
          <div className="w-80 p-4 flex flex-col">
            <h4 className="font-medium mb-4">发表评论</h4>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的评论..."
                className="flex-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200] resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 px-4 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933] disabled:opacity-50"
              >
                {submitting ? '发表中...' : '发表评论'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 