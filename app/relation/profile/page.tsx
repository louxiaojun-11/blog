'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MainLayout from '@/app/layouts/MainLayout'
import Image from 'next/image'
import BlogList from '@/components/features/blog/BlogList'
import { userService } from '@/services/api'

interface UserProfile {
  relationId: number;
  username: string;
  avatar: string;
  following: number;
  follower: number;
  introduce: string | null;
  status: number;
  blogList: {
    id: number;
    title: string;
    content: string;
    userID: number;
    likes: number;
    views: number;
    comments: number;
    createdAt: string;
    author: {
      id: number | null;
      avatar: string;
      username: string;
    };
  }[];
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '关注';
    case 1:
      return '已关注';
    case 2:
      return '回关';
    case 3:
      return '已互关';
    default:
      return '关注';
  }
}

export default function UserProfilePage() {
  const searchParams = useSearchParams()
  const relationId = searchParams.get('relationId')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!relationId) return
      
      try {
        setLoading(true)
        const response = await userService.getUserRelationProfile(Number(relationId))
        if (response.success) {
          setProfile(response.data)
        }
      } catch (error) {
        console.error('获取用户资料失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [relationId])

  const handleFollowAction = async () => {
    if (!profile || loading) return
    
    try {
      setLoading(true)
      
      if (profile.status === 1 || profile.status === 3) {
        if (!confirm('你要取关该用户吗?')) {
          return
        }
        const response = await userService.unfollowUser(profile.relationId)
        if (response.success) {
          setProfile(prev => prev ? {
            ...prev,
            status: prev.status === 3 ? 2 : 0
          } : null)
        }
      } else {
        const response = await userService.followUser(profile.relationId)
        if (response.success) {
          setProfile(prev => prev ? {
            ...prev,
            status: prev.status === 2 ? 3 : 1
          } : null)
        }
      }
    } catch (error) {
      console.error('关注操作失败:', error)
    } finally {
      setLoading(false)
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

  if (!profile) {
    return (
      <MainLayout>
        <div className="pt-4 px-4">
          <div className="text-center py-8">用户不存在</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        {/* 个人信息卡片 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <Image
                src={profile.avatar}
                alt={profile.username}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{profile.username}</h1>
                  <div className="flex gap-4 mb-2">
                    <span className="text-gray-600">
                      <strong>{profile.follower}</strong> 粉丝
                    </span>
                    <span className="text-gray-600">
                      <strong>{profile.following}</strong> 关注
                    </span>
                  </div>
                  <p className="text-gray-500">
                    {profile.introduce || '这个人很懒，还没有写简介...'}
                  </p>
                </div>
                <button
                  onClick={handleFollowAction}
                  disabled={loading}
                  className={`px-4 py-2 rounded-full ${
                    loading ? 'bg-gray-300' : 'bg-[#FF8200] hover:bg-[#ff9933]'
                  } text-white`}
                >
                  {loading ? '处理中...' : getStatusText(profile.status)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 博文列表 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Ta的博文</h2>
          <BlogList blogList={profile.blogList} />
        </div>
      </div>
    </MainLayout>
  )
} 