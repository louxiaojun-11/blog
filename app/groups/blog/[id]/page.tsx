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
        {/* 添加返回按钮 */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#FF8200]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>返回{source === 'myposts' ? '我的帖子' : '上一页'}</span>
          </button>
        </div>

        {/* 取消点赞确认弹窗 */}
        {showUnlikeConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[300px]">
              <h3 className="text-lg font-bold mb-4">取消点赞</h3>
              <p className="text-gray-600 mb-6">确定要取消对这条博文的点赞吗？</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowUnlikeConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  取消
                </button>
                <button
                  onClick={handleUnlike}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 px-4 flex gap-6">
          {/* 左侧博文内容 */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-4">{blogDetail.title}</h1>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src={userInfo.avatar}
                  alt={userInfo.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">{userInfo.username}</p>
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
          </div>

          {/* 右侧博主信息 */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow p-4 sticky top-20">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={userInfo.avatar}
                  alt={userInfo.username}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h2 className="font-bold text-lg">{userInfo.username}</h2>
                  <Link 
                    href={`/groups/${blogDetail.groupId}`}
                    className="text-sm text-[#FF8200] hover:underline"
                  >
                    返回圈子
                  </Link>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {userInfo.introduce || '这个人很懒，什么都没写~'}
              </p>
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