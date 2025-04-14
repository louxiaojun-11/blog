'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import MainLayout from '@/app/layouts/MainLayout'
import { hobbyService } from '@/services/api'
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import HobbyCommentList from '@/components/features/hobby/HobbyCommentList'
import { userService } from '@/services/api'

interface BlogDetail {
  groupId: string;
  blogId: string;
  userId: string;
  title: string;
  content: string;
  pic1: string | null;
  pic2: string | null;
  pic3: string | null;
  pic4: string | null;
  likes: number;
  comments: number;
  createdAt: string;
}

interface UserInfo {
  username: string;
  avatar: string;
  introduce: string;
}

export default function GroupBlogDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [blogDetail, setBlogDetail] = useState<BlogDetail | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUnlikeConfirm, setShowUnlikeConfirm] = useState(false)
  const [showComments, setShowComments] = useState(false)

  // 获取来源页面和页码
  const source = searchParams.get('source')
  const page = searchParams.get('page')

  // 添加返回按钮处理函数
  const handleBack = () => {
    if (source === 'myposts') {
      router.push(`/groups?activeTab=myPosts${page ? `&page=${page}` : ''}`)
    } else if (source === 'group' && params.id) {
      // 从博文ID中提取圈子ID
      const blogId = params.id
      router.push(`/groups/${blogDetail?.groupId}${page ? `?page=${page}` : ''}`)
    } else {
      router.back()
    }
  }

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true)
        // 获取博文详情
        const blogResponse = await hobbyService.getGroupBlogDetail(params.id)
        if (blogResponse.success) {
          setBlogDetail(blogResponse.data)
          
          // 获取博主信息
          const userResponse = await hobbyService.getGroupBlogUser(blogResponse.data.userId)
          if (userResponse.success) {
            setUserInfo(userResponse.data)
          }
        }
      } catch (error) {
        console.error('Error fetching blog detail:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBlogDetail()
    }
  }, [params.id])

  const handleLikeClick = async () => {
    if (!user?.userId || !blogDetail) return

    try {
      const response = await hobbyService.clickLike({
        userId: user.userId,
        blogId: Number(blogDetail.blogId)
      })

      if (response.success) {
        if (response.data === 0) {
          // 未点赞，执行点赞操作
          setBlogDetail(prev => prev ? {
            ...prev,
            likes: prev.likes + 1
          } : null)
        } else {
          // 已点赞，显示取消确认
          setShowUnlikeConfirm(true)
        }
      }
    } catch (error) {
      console.error('Failed to handle like:', error)
    }
  }

  const handleUnlike = async () => {
    if (!user?.userId || !blogDetail) return

    try {
      const response = await hobbyService.removeLike({
        userId: user.userId,
        blogId: Number(blogDetail.blogId)
      })

      if (response.success) {
        // 更新点赞数
        setBlogDetail(prev => prev ? {
          ...prev,
          likes: prev.likes - 1
        } : null)
      }
    } catch (error) {
      console.error('Failed to remove like:', error)
    } finally {
      setShowUnlikeConfirm(false)
    }
  }

  // 添加跳转到用户主页的函数
  const handleUserProfileClick = async () => {
    if (!blogDetail?.userId) return

    try {
      // 使用userService中的getUserRelationProfile方法
      const response = await userService.getUserRelationProfile(Number(blogDetail.userId))
      
      if (response.success) {
        // 将用户资料存储到 sessionStorage，与个人主页保持一致
        sessionStorage.setItem('visitedProfile', JSON.stringify(response.data))
        // 跳转到用户主页，使用userId作为参数
        router.push(`/relation/profile?userId=${blogDetail.userId}`)
      } else {
        console.error('Failed to fetch user profile:', response.message)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
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

  if (!blogDetail || !userInfo) {
    return (
      <MainLayout>
        <div className="pt-4 px-4">
          <div className="text-center py-8 text-gray-500">博文不存在</div>
        </div>
      </MainLayout>
    )
  }

  // 获取所有非空的图片URL
  const images = [blogDetail.pic1, blogDetail.pic2, blogDetail.pic3, blogDetail.pic4].filter(
    (pic): pic is string => pic !== null
  )

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            返回
          </button>

          <div className="flex gap-6">
            {/* 左侧博文内容 */}
            <div className="flex-1 bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-4">{blogDetail.title}</h1>
              {/* 添加作者头像点击事件 */}
              <div className="flex items-center gap-3 mb-6">
                <div 
                  onClick={handleUserProfileClick}
                  className="cursor-pointer"
                >
                  <Image
                    src={userInfo.avatar}
                    alt={userInfo.username}
                    width={40}
                    height={40}
                    className="rounded-full hover:opacity-80 transition-opacity"
                  />
                </div>
                <div>
                  <p 
                    className="font-medium hover:text-[#FF8200] cursor-pointer"
                    onClick={handleUserProfileClick}
                  >
                    {userInfo.username}
                  </p>
                  <p className="text-sm text-gray-500">{blogDetail.createdAt}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{blogDetail.content}</p>
              
              {/* 图片展示 */}
              {images.length > 0 && (
                <div className={`grid gap-4 mb-6 ${
                  images.length === 1 ? 'grid-cols-1' : 
                  images.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2 md:grid-cols-3'
                }`}>
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image}
                        alt={`图片 ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 互动数据 */}
              <div className="flex items-center gap-6 text-gray-500">
                <button 
                  onClick={handleLikeClick}
                  className="flex items-center gap-2 hover:text-[#FF8200]"
                >
                  <Heart className="h-5 w-5" />
                  <span>{blogDetail.likes}</span>
                </button>
                <button 
                  onClick={() => setShowComments(true)}
                  className="flex items-center gap-2 hover:text-[#FF8200]"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{blogDetail.comments}</span>
                </button>
              </div>
            </div>

            {/* 右侧作者信息 */}
            <div className="w-80">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center">
                  {/* 头像可点击区域 */}
                  <div 
                    onClick={handleUserProfileClick}
                    className="cursor-pointer w-20 h-20 relative mb-3"
                  >
                    <Image
                      src={userInfo.avatar}
                      alt={userInfo.username}
                      fill
                      className="rounded-full hover:opacity-80 transition-opacity object-cover"
                    />
                  </div>
                  {/* 用户名可点击区域 */}
                  <h3 
                    onClick={handleUserProfileClick}
                    className="font-bold text-lg hover:text-[#FF8200] cursor-pointer"
                  >
                    {userInfo.username}
                  </h3>
                  {userInfo.introduce && (
                    <p className="text-gray-500 text-sm mt-3 text-center">
                      {userInfo.introduce}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 评论列表 */}
        {showComments && blogDetail && (
          <HobbyCommentList
            blogId={Number(blogDetail.blogId)}
            isOpen={showComments}
            onClose={() => setShowComments(false)}
            onCommentSuccess={() => {
              // 更新博文的评论数
              setBlogDetail(prev => prev ? {
                ...prev,
                comments: prev.comments + 1
              } : null)
            }}
          />
        )}
      </div>
    </MainLayout>
  )
} 