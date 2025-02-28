'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import MainLayout from '@/app/layouts/MainLayout'
import { hobbyService } from '@/services/api'
import { Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'

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
  const blogId = params.id
  const [blogDetail, setBlogDetail] = useState<BlogDetail | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true)
        // 获取博文详情
        const blogResponse = await hobbyService.getGroupBlogDetail(blogId)
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

    if (blogId) {
      fetchBlogDetail()
    }
  }, [blogId])

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
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <span>{blogDetail.likes}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>{blogDetail.comments}</span>
              </div>
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
    </MainLayout>
  )
} 