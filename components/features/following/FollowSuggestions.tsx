'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface RecommendedUser {
  userId: number
  username: string
  avatar: string
  followerAmount: number
}

interface RecommendedResponse {
  success: boolean
  data: RecommendedUser[]
  message: string | null
}

export default function FollowSuggestions() {
  const { user } = useAuth()
  const router = useRouter()
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendedUsers = async () => {
      if (!user?.userId) return

      try {
        setLoading(true)
        const response = await fetch(
          `http://localhost:8080/api/blog/recommendedUser?userId=${user.userId}`,
          {
            headers: {
              'token': sessionStorage.getItem('token') || ''
            }
          }
        )

        const data: RecommendedResponse = await response.json()
        if (data.success) {
          setRecommendedUsers(data.data)
        }
      } catch (error) {
        console.error('获取推荐用户失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedUsers()
  }, [user?.userId])

  const handleUserClick = (userId: number) => {
    router.push(`/relation/profile?userId=${userId}`)
  }

  if (loading) {
    return (
      <aside className="w-[300px] hidden xl:block">
        <div className="bg-white rounded-lg shadow p-4 sticky top-20">
          <h2 className="font-bold mb-4">推荐关注</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-[300px] hidden xl:block">
      <div className="bg-white rounded-lg shadow p-4 sticky top-20">
        <h2 className="font-bold mb-4">推荐关注</h2>
        <div className="space-y-4">
          {recommendedUsers.map((user) => (
            <div key={user.userId} className="flex gap-3">
              <div 
                onClick={() => handleUserClick(user.userId)}
                className="cursor-pointer"
              >
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="rounded-full hover:opacity-80 transition-opacity"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-medium truncate hover:text-[#FF8200] cursor-pointer"
                  onClick={() => handleUserClick(user.userId)}
                >
                  {user.username}
                </h3>
                <p className="text-sm text-gray-500">{user.followerAmount} 位粉丝</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
} 