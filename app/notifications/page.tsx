'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/app/layouts/MainLayout'
import { Bell, Heart, MessageCircle, UserPlus, AlertTriangle, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Notice {
  noticeId: number
  content: string
  type: 'blogLike' | 'blogComment' | 'userFollow' | 'system'
  createdAt: string
  operationUserId: number | null
}

interface NoticeResponse {
  success: boolean
  data: {
    total: number
    records: Notice[]
  }
  message: string | null
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)
  const pageSize = 10

  useEffect(() => {
    if (user?.userId) {
      fetchNotices(currentPage)
    }
  }, [user?.userId, currentPage])

  const fetchNotices = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:8080/api/user/notice?userId=${user?.userId}&page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        }
      )

      const data: NoticeResponse = await response.json()
      if (data.success) {
        setNotices(data.data.records)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取通知失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNoticeIcon = (type: Notice['type']) => {
    switch (type) {
      case 'blogLike':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'blogComment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'userFollow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const handleDelete = async (noticeId: number) => {
    if (!confirm('确定要删除这条通知吗？')) {
      return
    }

    try {
      setDeleting(noticeId)
      const response = await fetch(
        `http://localhost:8080/api/user/deleteNotice/${noticeId}`,
        {
          method: 'DELETE',
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        }
      )

      if (response.ok) {
        // 从列表中移除该通知
        setNotices(prev => prev.filter(notice => notice.noticeId !== noticeId))
        setTotal(prev => prev - 1)
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除通知失败:', error)
      alert('删除失败，请重试')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteAll = async () => {
    if (!user?.userId || !confirm('确定要删除所有通知吗？')) {
      return
    }

    try {
      setDeletingAll(true)
      const response = await fetch(
        `http://localhost:8080/api/user/deleteAllNotice/${user.userId}`,
        {
          method: 'DELETE',
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        }
      )

      if (response.ok) {
        setNotices([])
        setTotal(0)
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除所有通知失败:', error)
      alert('删除失败，请重试')
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#FF8200]" />
              <h1 className="text-xl font-bold">通知中心</h1>
            </div>
            {notices.length > 0 && (
              <button
                onClick={handleDeleteAll}
                disabled={deletingAll}
                className={`flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ${
                  deletingAll ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{deletingAll ? '删除中...' : '全部删除'}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : notices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">暂无通知</div>
          ) : (
            <div className="divide-y">
              {notices.map((notice) => (
                <div key={notice.noticeId} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNoticeIcon(notice.type)}</div>
                    <div className="flex-1">
                      <div className="text-gray-700">{notice.content}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(notice.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(notice.noticeId)}
                      disabled={deleting === notice.noticeId}
                      className={`p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ${
                        deleting === notice.noticeId ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
      </div>
    </MainLayout>
  )
} 