'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { UserMinus, UserX } from 'lucide-react'
import { userService } from '@/services/api'
import { useSearchParams, useRouter } from 'next/navigation'

interface FollowUser {
  relationId: number;
  username: string;
  avatar: string;
}

export default function FollowList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') as 'following' | 'follower'
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        if (tab === 'following') {
          const response = await userService.getFollowing(1) // 暂时hardcode userId
          if (response.success) {
            setFollowing(response.data)
          }
        } else {
          const response = await userService.getFollowers(1) // 暂时hardcode userId
          if (response.success) {
            setFollowers(response.data)
          }
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tab])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tab 切换按钮 */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full ${
            tab === 'follower'
              ? 'bg-[#FF8200] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => router.push('/profile/follow?tab=follower')}
        >
          粉丝列表
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            tab === 'following'
              ? 'bg-[#FF8200] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => router.push('/profile/follow?tab=following')}
        >
          关注列表
        </button>
      </div>

      {/* 列表内容 */}
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="space-y-4">
          {(tab === 'following' ? following : followers).map((user) => (
            <div key={user.relationId} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg">
              <Image
                src={user.avatar}
                alt={user.username}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium">{user.username}</h3>
              </div>
              {tab === 'following' ? (
                <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-full">
                  <UserMinus className="w-4 h-4" />
                  <span>取消关注</span>
                </button>
              ) : (
                <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-full">
                  <UserX className="w-4 h-4" />
                  <span>移除粉丝</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 