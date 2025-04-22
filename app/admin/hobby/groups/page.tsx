'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Group {
  groupId: number
  groupName: string
  avatar: string
  type: string
  members: number
  introduce: string
}

interface GroupResponse {
  success: boolean
  data: {
    total: number
    records: Group[]
  }
  message: string | null
}

export default function HobbyGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedType, setSelectedType] = useState<string>('全部')

  const types = ['全部', '动漫', '阅读', '影视', '科技', '军事', '时事', '生活', '旅游', '音乐', '美食', '学习', '汽车']

  useEffect(() => {
    fetchGroups()
  }, [currentPage, pageSize, selectedType])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const url = selectedType === '全部'
        ? `http://localhost:8080/manage/user/groupList?page=${currentPage}&pageSize=${pageSize}`
        : `http://localhost:8080/manage/user/groupList?page=${currentPage}&pageSize=${pageSize}&type=${selectedType}`
      
      const response = await fetch(url, {
        headers: {
          'token': sessionStorage.getItem('token') || ''
        }
      })

      const data: GroupResponse = await response.json()
      if (data.success) {
        setGroups(data.data.records)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取圈子列表失败:', error)
    } finally {
      setLoading(false)
    }
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

  const handleViewBlogs = (groupId: number) => {
    router.push(`/admin/hobby/groups/${groupId}`)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">兴趣圈子管理</h1>

      {/* 分类筛选 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedType === type
                  ? 'bg-[#FF8200] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 圈子列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">圈子信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成员数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">简介</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.groupId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          src={group.avatar}
                          alt={group.groupName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{group.groupName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {group.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.members}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{group.introduce}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewBlogs(group.groupId)}
                      className="text-[#FF8200] hover:text-[#ff9933]"
                    >
                      查看圈文
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页控件 */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">每页显示</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700">条</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            共 {total} 条
          </span>
          <div className="flex gap-1">
            {Array.from({ length: Math.ceil(total / pageSize) }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? 'bg-[#FF8200] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 