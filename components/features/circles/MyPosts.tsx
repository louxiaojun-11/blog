'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { hobbyService } from '@/services/api'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

const categories = [
  '动漫', '阅读', '影视', '科技', '军事', 
  '时事', '生活', '旅游', '音乐', '美食', '学习', '汽车'
]

interface HobbyBlogPost {
  userId: number;
  groupId: number;
  blogId: number;
  groupName: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
  type: string;
}

interface MyPostsProps {
  initialPage?: number;
}

export default function MyPosts({ initialPage = 1 }: MyPostsProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [posts, setPosts] = useState<HobbyBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [introduce, setIntroduce] = useState('')
  const [avatar, setAvatar] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [submitting, setSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (user?.userId) {
      fetchUserPosts(currentPage)
    }
  }, [user?.userId, currentPage])

  const fetchUserPosts = async (page: number) => {
    try {
      setLoading(true)
      const response = await hobbyService.getUserHobbyBlogList(user!.userId, page, pageSize)
      console.log('Response from API:', response)
      if (response.success && response.data && Array.isArray(response.data.records)) {
        setPosts(response.data.records)
        setTotal(response.data.total)
      } else {
        console.error('Unexpected response format:', response)
        setPosts([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error)
      setPosts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handlePostClick = (blogId: number) => {
    router.push(`/groups/blog/${blogId}?source=myposts&page=${currentPage}`)
  }

  // 生成页码数组
  const getPageNumbers = () => {
    const totalPages = Math.ceil(total / pageSize)
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i)
        }
      }
    }

    return pageNumbers
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 这里应该调用你的图片上传服务
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.userId) {
      alert('请先登录')
      return
    }

    if (!groupName.trim() || !introduce.trim() || !avatar) {
      alert('请填写完整信息')
      return
    }

    try {
      setSubmitting(true)
      const response = await hobbyService.createGroup({
        userId: user.userId,
        groupName: groupName.trim(),
        introduce: introduce.trim(),
        avatar,
        category
      })

      if (response.success) {
        alert('创建成功！')
        setShowCreateForm(false)
        // 重置表单
        setGroupName('')
        setIntroduce('')
        setAvatar('')
        setCategory(categories[0])
        setPreviewUrl('')
      }
    } catch (error) {
      console.error('Failed to create group:', error)
      alert('创建失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无发布的博文
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 博文列表 */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div 
            key={post.blogId} 
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handlePostClick(post.blogId)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg hover:text-[#FF8200]">{post.title}</h3>
              <span className="text-sm text-[#FF8200] px-2 py-1 bg-orange-50 rounded-full">
                {post.type}
              </span>
            </div>
            <p className="text-gray-600 mb-3 line-clamp-1">{post.content}</p>
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-500">
                <span>发布于 </span>
                <span className="text-[#FF8200]">{post.groupName}</span>
                <span> · {post.createdAt}</span>
              </div>
              <div className="flex gap-4 text-gray-500">
                <span>点赞 {post.likes}</span>
                <span>评论 {post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 分页控件 */}
      {total > pageSize && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            首页
          </button>
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            上一页
          </button>
          
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1 rounded border ${
                pageNum === currentPage
                  ? 'bg-[#FF8200] text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === Math.ceil(total / pageSize)}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
          <button
            onClick={() => setCurrentPage(Math.ceil(total / pageSize))}
            disabled={currentPage === Math.ceil(total / pageSize)}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            末页
          </button>
        </div>
      )}

      {/* 创建圈子表单 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">创建圈子</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圈子名称
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                  placeholder="请输入圈子名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圈子简介
                </label>
                <textarea
                  value={introduce}
                  onChange={(e) => setIntroduce(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200] resize-none"
                  rows={3}
                  placeholder="请输入圈子简介"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圈子头像
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-gray-500">点击上传圈子头像</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圈子类型
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933] disabled:opacity-50"
              >
                {submitting ? '创建中...' : '创建圈子'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 