'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Users, MessageSquare } from 'lucide-react'
import { hobbyService } from '@/services/api'
import { useRouter } from 'next/navigation'

interface Group {
  groupId: number;
  groupName: string;
  avatar: string;
  introduce: string;
  members: number;
}

export default function GroupsList({ selectedType }: { selectedType: string }) {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalGroups, setTotalGroups] = useState(0)
  const pageSize = 9 // 固定每页显示9个圈子

  // 获取圈子列表
  const fetchGroups = async (page: number) => {
    try {
      setLoading(true)
      const params: {
        page: number;
        pageSize: number;
        type?: string;
      } = {
        page,
        pageSize
      }

      // 如果不是"全部"类别，添加type参数
      if (selectedType !== '全部') {
        params.type = selectedType
      }

      const response = await hobbyService.getGroupList(params)

      if (response.success) {
        setGroups(response.data.records)
        setTotalGroups(response.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }

  // 在组件挂载、页码变化和类别变化时获取圈子列表
  useEffect(() => {
    setCurrentPage(1) // 切换类别时重置到第一页
    fetchGroups(1)
  }, [selectedType])

  useEffect(() => {
    fetchGroups(currentPage)
  }, [currentPage])

  // 生成页码数组
  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalGroups / pageSize)
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

  // 修改进入圈子的处理函数
  const handleEnterGroup = (groupId: number) => {
    router.push(`/groups/${groupId}`)
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无相关圈子
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 圈子列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.groupId} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-32 bg-gray-200 relative">
              <Image
                src={group.avatar}
                alt={group.groupName}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{group.groupName}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{group.introduce}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">成员: {group.members}</span>
                <button 
                  onClick={() => handleEnterGroup(group.groupId)}
                  className="px-4 py-2 rounded-full bg-[#FF8200] text-white hover:bg-[#ff9933]"
                >
                  进入圈子
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 分页控件 */}
      {totalGroups > pageSize && (
        <div className="flex justify-center items-center gap-2 mt-6">
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
            disabled={currentPage === Math.ceil(totalGroups / pageSize)}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
          <button
            onClick={() => setCurrentPage(Math.ceil(totalGroups / pageSize))}
            disabled={currentPage === Math.ceil(totalGroups / pageSize)}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            末页
          </button>
        </div>
      )}
    </div>
  )
} 