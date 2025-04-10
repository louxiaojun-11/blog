'use client'

import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminApi'
import { useRouter } from 'next/navigation'
import { Trash2, Check, Plus } from 'lucide-react'
import Link from 'next/link'

interface Information {
  informationId: number;
  title: string;
  content: string;
  pic: string | null;
  type: string;
  createdAt: string;
  views: number;
}

interface InformationResponse {
  total: number
  records: Information[]
}

export default function InformationManagement() {
  const [loading, setLoading] = useState(true)
  const [informationList, setInformationList] = useState<Information[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const categories = [
    '全部',
    '科技',
    '时事',
    '财经',
    '体育',
    '娱乐',
    '教育',
    '汽车',
    '时尚'
  ]

  useEffect(() => {
    fetchInformation()
  }, [currentPage, pageSize, selectedType])

  const fetchInformation = async () => {
    try {
      setLoading(true)
      const response = await adminService.getInformationList(currentPage, pageSize, selectedType)
      if (response.success) {
        setInformationList(response.data.records)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('获取资讯列表失败:', error)
      setError('获取资讯列表失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type)
    setCurrentPage(1) // 切换分类时重置到第一页
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1) // 改变每页显示数量时重置到第一页
  }

  const handleDeleteClick = (e: React.MouseEvent, informationId: number) => {
    e.stopPropagation() // 阻止事件冒泡
    setDeleteItemId(informationId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return

    try {
      setIsDeleting(true)
      const response = await adminService.deleteInformation(deleteItemId)
      
      if (response.success) {
        // 显示成功消息
        setSuccessMessage('资讯删除成功！')
        setShowSuccessMessage(true)
        
        // 3秒后隐藏成功消息
        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 3000)
        
        // 删除成功，刷新列表
        fetchInformation()
      } else {
        alert(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除资讯失败:', error)
      alert('删除失败，请重试')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteItemId(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeleteItemId(null)
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">资讯管理</h1>
          
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleTypeChange(category === '全部' ? null : category)}
                  className={`px-4 py-2 rounded-lg ${
                    (selectedType === null && category === '全部') || selectedType === category
                      ? 'bg-[#FF8200] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <Link
              href="/admin/information/publish"
              className="px-4 py-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933]"
            >
              发布资讯
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : informationList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">标题</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">类型</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">发布时间</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">浏览量</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {informationList.map((info) => (
                    <tr key={info.informationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/information/${info.informationId}`}
                          className="text-[#FF8200] hover:underline"
                        >
                          {info.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{info.type}</td>
                      <td className="px-6 py-4">{info.createdAt}</td>
                      <td className="px-6 py-4">{info.views}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => handleDeleteClick(e, info.informationId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 分页控件 */}
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">每页显示:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border rounded px-2 py-1"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-sm text-gray-500">
                第 {currentPage} 页，共 {Math.ceil((total || 0) / pageSize)} 页
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil((total || 0) / pageSize)}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">确认删除</h3>
            <p className="text-gray-500 mb-6">确定要删除这条资讯吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 