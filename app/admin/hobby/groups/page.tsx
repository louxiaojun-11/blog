'use client'

import { useState, useEffect } from 'react'
import { Search, MoreVertical } from 'lucide-react'

interface Group {
  groupId: number
  groupName: string
  avatar: string
  type: string
  members: number
  introduce: string
  createdAt: string
  status: number // 0: 正常, 1: 已封禁
}

export default function HobbyGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchKey, setSearchKey] = useState('')
  const [selectedType, setSelectedType] = useState<string>('全部')

  const types = [
    '全部', '动漫', '阅读', '影视', '科技', '军事', 
    '时事', '生活', '旅游', '音乐', '美食', '学习', '汽车'
  ]

  useEffect(() => {
    fetchGroups()
  }, [currentPage, pageSize, selectedType])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      // TODO: 实现获取圈子列表的API调用
      // const response = await adminService.getHobbyGroups({
      //   page: currentPage,
      //   pageSize,
      //   type: selectedType === '全部' ? undefined : selectedType,
      //   keyword: searchKey
      // })
      // if (response.success) {
      //   setGroups(response.data.records)
      //   setTotal(response.data.total)
      // }
    } catch (error) {
      console.error('获取圈子列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGroups()
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">圈子管理</h1>
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
        <div className="p-4 border-b">
          <div className="flex gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">圈子名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">成员数</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">加载中...</td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">暂无数据</td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.groupId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={group.avatar}
                          alt={group.groupName}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span>{group.groupName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{group.type}</td>
                    <td className="px-4 py-3">{group.members}</td>
                    <td className="px-4 py-3">{group.createdAt}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        group.status === 0
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {group.status === 0 ? '正常' : '已封禁'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
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