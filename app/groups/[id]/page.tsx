'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import MainLayout from '@/app/layouts/MainLayout'
import GroupBlogList from '@/components/features/groups/GroupBlogList'
import { hobbyService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface GroupDetail {
  groupId: number;
  groupName: string;
  avatar: string;
  type: string;
  members: number;
  introduce: string;
  status: number;
}

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = Number(params.id)
  const [groupInfo, setGroupInfo] = useState<GroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchGroupInfo = async () => {
    if (!groupId || !user?.userId) return
    
    try {
      setLoading(true)
      const response = await hobbyService.getGroupInfo(groupId, user.userId)
      if (response.success) {
        setGroupInfo(response.data)
      }
    } catch (error) {
      console.error('Error fetching group info:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (groupId && user?.userId) {
      fetchGroupInfo()
    }
  }, [groupId, user?.userId])

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-4 px-4">
          <div className="text-center py-8">加载中...</div>
        </div>
      </MainLayout>
    )
  }

  if (!groupInfo) {
    return (
      <MainLayout>
        <div className="pt-4 px-4">
          <div className="text-center py-8 text-gray-500">圈子不存在</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4 flex gap-6">
        {/* 左侧博文列表 */}
        <div className="flex-1">
          <GroupBlogList groupId={groupId} />
        </div>

        {/* 右侧圈子信息 */}
        <div className="w-80 bg-white rounded-lg shadow p-4 h-fit sticky top-20">
          <div className="relative h-40 mb-4">
            <Image
              src={groupInfo.avatar}
              alt={groupInfo.groupName}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <h2 className="text-xl font-bold mb-2">{groupInfo.groupName}</h2>
          <p className="text-gray-600 text-sm mb-4">{groupInfo.introduce}</p>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>类型: {groupInfo.type}</span>
              <span>成员: {groupInfo.members}</span>
            </div>
            <button
              disabled={groupInfo.status === 1}
              className={`w-full py-2 rounded-lg ${
                groupInfo.status === 0
                  ? 'bg-[#FF8200] text-white hover:bg-[#ff9933]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {groupInfo.status === 0 ? "加入圈子" : "已加入圈子"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 