'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Upload, X, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { hobbyService, uploadService } from '@/services/api'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// 添加分类常量
const categories = [
  '动漫', '阅读', '影视', '科技', '军事', 
  '时事', '生活', '旅游', '音乐', '美食', '学习', '汽车'
]

export default function MyCircles() {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    groupName: '',
    introduce: '',
    type: categories[0],
    avatar: ''
  })
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  // 添加圈子列表状态
  const [groups, setGroups] = useState<{
    groupName: string;
    avatar: string;
    introduce: string;
    members: number;
  }[]>([])
  const [totalGroups, setTotalGroups] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 9 // 固定每页显示9个圈子

  // 获取圈子列表
  const fetchGroups = async (page: number) => {
    if (!user?.userId) return

    try {
      setLoading(true)
      const response = await hobbyService.getGroupList({
        userId: user.userId,
        page,
        pageSize
      })

      if (response.success) {
        setGroups(response.data.records)
        setTotalGroups(response.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }

  // 在组件挂载和页码变化时获取圈子列表
  useEffect(() => {
    fetchGroups(currentPage)
  }, [currentPage, user?.userId])

  // 处理创建圈子成功后的刷新
  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    // 重置表单
    setFormData({
      groupName: '',
      introduce: '',
      type: categories[0],
      avatar: ''
    })
    setAvatarPreview(null)
    // 显示成功提示
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    // 刷新圈子列表
    fetchGroups(1)
    setCurrentPage(1)
  }

  // 生成页码数组
  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalGroups / pageSize)
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

  // 处理头像上传
  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true)
      
      // 创建 FormData 对象
      const formData = new FormData()
      // 使用 'file' 作为key，这要与后端 MultipartFile 参数名一致
      formData.append('file', file)
      
      const response = await uploadService.uploadFile(formData)
      if (response.success) {
        // 设置头像URL和预览
        setFormData(prev => ({ ...prev, avatar: response.data }))
        setAvatarPreview(URL.createObjectURL(file))
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      alert('头像上传失败，请重试')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件')
        return
      }
      
      // 验证文件大小 (例如限制为2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB')
        return
      }

      // 上传头像
      await handleAvatarUpload(file)
    }
  }

  // 修改 handleSubmit 函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.userId) return

    try {
      setLoading(true)

      const response = await hobbyService.createGroup({
        userId: user.userId,
        groupName: formData.groupName,
        introduce: formData.introduce,
        type: formData.type,
        avatar: formData.avatar
      })

      if (response.success) {
        handleCreateSuccess()
      }
    } catch (error) {
      console.error('Failed to create group:', error)
      alert('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 添加进入圈子的处理函数
  const handleEnterGroup = (groupId: number) => {
    router.push(`/groups/${groupId}`)
  }

  return (
    <div className="space-y-4">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
          <div className="bg-green-100 rounded-full p-1">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-green-800">提交创建圈子请求成功，审核结果请关注通知中心！</span>
        </div>
      )}

      {/* 创建圈子按钮 */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933]"
        >
          <Plus className="h-5 w-5" />
          创建圈子
        </button>
      </div>

      {/* 圈子列表 */}
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          还没有加入任何圈子
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, index) => (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-32 bg-gray-200 relative">
                  <Image
                    src={group.avatar}
                    alt={group.groupName}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{group.groupName}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{group.introduce}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">成员: {group.members}</span>
                    <button 
                      onClick={() => handleEnterGroup(group.groupId)}
                      className="px-4 py-2 rounded-full bg-[#FF8200] text-white hover:bg-[#ff9933]"
                    >
                      进入圈子
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页控件 */}
          {totalGroups > pageSize && (
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
                disabled={currentPage === Math.ceil(totalGroups / pageSize)}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
              <button
                onClick={() => setCurrentPage(Math.ceil(totalGroups / pageSize))}
                disabled={currentPage === Math.ceil(totalGroups / pageSize)}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                末页
              </button>
            </div>
          )}
        </>
      )}

      {/* 创建圈子模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-xl font-bold mb-6">创建圈子</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圈子名称
                </label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圈子简介
                </label>
                <textarea
                  value={formData.introduce}
                  onChange={(e) => setFormData({ ...formData, introduce: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圈子分类
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  圈子头像
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={avatarPreview || '/default-avatar.png'}
                      alt="头像预览"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Upload className="h-5 w-5" />
                      {uploadingAvatar ? '上传中...' : '上传头像'}
                    </button>
                    {formData.avatar && (
                      <span className="text-xs text-green-600">头像上传成功</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.avatar} // 必须上传头像才能提交
                  className="px-4 py-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933] disabled:opacity-50"
                >
                  {loading ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 