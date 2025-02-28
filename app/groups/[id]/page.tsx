'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import MainLayout from '@/app/layouts/MainLayout'
import GroupBlogList from '@/components/features/groups/GroupBlogList'
import { hobbyService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { X } from 'lucide-react'
import Link from 'next/link'

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
  const [processing, setProcessing] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
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

  const handleJoinGroup = async () => {
    if (!user?.userId || processing) return

    try {
      setProcessing(true)
      const response = await hobbyService.joinGroup(groupId, user.userId)
      if (response.success) {
        await fetchGroupInfo()
      }
    } catch (error) {
      console.error('Error joining group:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleQuitGroup = async () => {
    if (!user?.userId || processing) return

    try {
      setProcessing(true)
      const response = await hobbyService.quitGroup(groupId, user.userId)
      if (response.success) {
        await fetchGroupInfo()
        setShowQuitConfirm(false)
      }
    } catch (error) {
      console.error('Error quitting group:', error)
    } finally {
      setProcessing(false)
    }
  }

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
      {/* 退出确认模态框 */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] relative">
            <button 
              onClick={() => setShowQuitConfirm(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">退出确认</h3>
            <p className="text-gray-600 mb-6">
              确定要退出 "{groupInfo.groupName}" 圈子吗？
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleQuitGroup}
                disabled={processing}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {processing ? "退出中..." : "确认退出"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              onClick={groupInfo.status === 0 ? handleJoinGroup : () => setShowQuitConfirm(true)}
              disabled={processing}
              className={`w-full py-2 rounded-lg ${
                groupInfo.status === 0
                  ? 'bg-[#FF8200] text-white hover:bg-[#ff9933]'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {processing ? "处理中..." : groupInfo.status === 0 ? "加入圈子" : "已加入圈子"}
            </button>
            {groupInfo.status === 1 && (
              <Link 
                href={`/groups/${groupId}/post`}
                className="w-full py-2 rounded-lg bg-[#FF8200] text-white hover:bg-[#ff9933] text-center"
              >
                发布圈文
              </Link>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 