'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import MainLayout from '@/app/layouts/MainLayout'
import GroupBlogList from '@/components/features/groups/GroupBlogList'
import { hobbyService } from '@/services/api'

interface GroupDetail {
  groupId: number;
  groupName: string;
  avatar: string;
  type: string;
  members: number;
  introduce: string;
}

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = Number(params.id)
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroupInfo = async () => {
      if (!groupId) return
      
      try {
        setLoading(true)
        const response = await hobbyService.getGroupInfo(groupId)
        if (response.success) {
          setGroupDetail(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch group info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupInfo()
  }, [groupId])

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-4 px-4">
          <div className="text-center py-8">加载中...</div>
        </div>
      </MainLayout>
    )
  }

  if (!groupDetail) {
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
              src={groupDetail.avatar}
              alt={groupDetail.groupName}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <h2 className="text-xl font-bold mb-2">{groupDetail.groupName}</h2>
          <p className="text-gray-600 text-sm mb-4">{groupDetail.introduce}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>类型: {groupDetail.type}</span>
            <span>成员: {groupDetail.members}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 