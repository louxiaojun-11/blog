'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MainLayout from '@/app/layouts/MainLayout'
import Image from 'next/image'
import BlogList from '@/components/features/blog/BlogList'
import { userService } from '@/services/api'
import { Check } from 'lucide-react'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { blogService } from '@/services/api'

interface UserProfile {
  relationId: number;
  username: string;
  avatar: string;
  following: number;
  follower: number;
  introduce: string | null;
  status: number;
  pageResult: {
    records: {
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
    total: number;
  };
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
  const router = useRouter()
  const relationId = searchParams.get('relationId')
  const currentPage = Number(searchParams.get('page')) || 1
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [blogList, setBlogList] = useState<BlogPost[]>([])
  const [totalBlogs, setTotalBlogs] = useState(0)
  const [loadingBlogs, setLoadingBlogs] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!relationId) return
      
      try {
        setLoading(true)
        const response = await userService.getUserRelationProfile(Number(relationId), 1, 1)
        if (response.success) {
          setProfile(response.data)
        }
      } catch (error) {
        console.error('获取用户资料失败:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadBlogs = async () => {
      if (!relationId) return

      try {
        setLoadingBlogs(true)
        const response = await blogService.getUserBlogs({
          userId: Number(relationId),
          page: currentPage,
          pageSize
        })
        
        if (response.success) {
          setBlogList(response.data.records)
          setTotalBlogs(response.data.total)
        }
      } catch (error) {
        console.error('获取博文列表失败:', error)
      } finally {
        setLoadingBlogs(false)
      }
    }

    loadProfile()
    loadBlogs()
  }, [relationId, currentPage, pageSize])

  const handleFollowAction = async () => {
    if (!profile || loading) return
    
    try {
      setLoading(true)
      
      if (profile.status === 1 || profile.status === 3) {
        setShowUnfollowConfirm(true)
        setLoading(false)
        return
      }

      const response = await userService.followUser(profile.relationId)
      if (response.success) {
        setProfile(prev => prev ? {
          ...prev,
          status: prev.status === 2 ? 3 : 1
        } : null)
        setSuccessMessage('关注成功！')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('关注操作失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmUnfollow = async () => {
    if (!profile) return
    
    try {
      setLoading(true)
      const response = await userService.unfollowUser(profile.relationId)
      if (response.success) {
        setProfile(prev => prev ? {
          ...prev,
          status: prev.status === 3 ? 2 : 0
        } : null)
        setSuccessMessage('取关成功！')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('取关失败:', error)
    } finally {
      setLoading(false)
      setShowUnfollowConfirm(false)
    }
  }

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    if (relationId) {
      url.searchParams.set('relationId', relationId)
    }
    router.push(url.pathname + url.search)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value)
    setPageSize(newPageSize)
    setPage(1)
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
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
          <div className="bg-green-100 rounded-full p-1">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      <ConfirmDialog
        isOpen={showUnfollowConfirm}
        title="取消关注"
        message="确定要取消关注该用户吗？"
        onConfirm={handleConfirmUnfollow}
        onCancel={() => setShowUnfollowConfirm(false)}
      />

      <div className="pt-4 px-4">
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Ta的博文</h2>
          {profile && (
            <BlogList 
              isPersonal={false}
              blogList={blogList.map(blog => ({
                ...blog,
                author: {
                  userId: profile.relationId,
                  username: profile.username,
                  avatar: profile.avatar
                }
              }))}
              total={totalBlogs}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              currentPage={currentPage}
              currentPageSize={pageSize}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
} 