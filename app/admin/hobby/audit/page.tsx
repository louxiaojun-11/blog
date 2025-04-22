'use client'

import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, Check, X } from 'lucide-react'
import Image from 'next/image'

interface GroupAudit {
  groupId: number
  groupName: string
  type: string
  userId: number
  username: string
  avatar: string
  createdAt: string
  introduce: string
}

interface AuditResponse {
  success: boolean
  data: {
    total: number
    records: GroupAudit[]
  }
  message: string | null
}

export default function HobbyAuditPage() {
  const [audits, setAudits] = useState<GroupAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchKey, setSearchKey] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchAudits()
  }, [currentPage, pageSize])

  const fetchAudits = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:8080/manage/user/unreviewedGroup?page=${currentPage}&pageSize=${pageSize}`,
        {
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        }
      )
      const data: AuditResponse = await response.json()
      if (data.success) {
        setAudits(data.data.records)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取审核列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAudits()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
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

  const handleReview = async (groupId: number, groupName: string, userId: number, result: 'agree' | 'disagree') => {
    if (reviewing) return

    // 显示确认对话框
    const confirmMessage = result === 'agree' ? '确认审核通过？' : '确认审核失败？'
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setReviewing(true)
      const response = await fetch('http://localhost:8080/manage/user/reviewGroup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': sessionStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          userId,
          result,
          groupId,
          groupName
        })
      })

      const data = await response.json()
      if (data.success) {
        // 显示成功提示
        setShowSuccess(true)
        // 3秒后自动隐藏
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
        // 刷新列表
        fetchAudits()
      } else {
        alert(data.message || '操作失败')
      }
    } catch (error) {
      console.error('审核操作失败:', error)
      alert('操作失败，请重试')
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-600 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <div className="bg-green-100 rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
          <span>审核成功！</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">圈子创建审核</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="搜索圈子名称..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">圈子名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">创建人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">申请时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">简介</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">加载中...</td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">暂无数据</td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.groupId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={audit.avatar}
                          alt={audit.groupName}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                        <span>{audit.groupName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{audit.type}</td>
                    <td className="px-4 py-3">{audit.username}</td>
                    <td className="px-4 py-3">{audit.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate">{audit.introduce}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(audit.groupId, audit.groupName, audit.userId, 'agree')}
                          disabled={reviewing}
                          className="text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="通过"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReview(audit.groupId, audit.groupName, audit.userId, 'disagree')}
                          disabled={reviewing}
                          className="text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="拒绝"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页控件 */}
        {total > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">每页显示</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-500">条</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                首页
              </button>
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded border ${
                    pageNum === currentPage
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.ceil(total / pageSize))}
                disabled={currentPage === Math.ceil(total / pageSize)}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                末页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 添加淡入动画的样式
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
` 