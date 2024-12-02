'use client'

import { useState, useRef, useEffect } from 'react'
import MainLayout from '@/app/layouts/MainLayout'
import BlogList from '@/components/features/blog/BlogList'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { X, Eye, EyeOff, Upload, Pencil, Check } from 'lucide-react'
import { uploadService, userService } from '@/services/api'
import Link from 'next/link'

export default function Page() {  // 注意：这里使用 Page 作为组件名
  const { user, token, login } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profile, setProfile] = useState<{
    following: number;
    follower: number;
    introduce: string;
  } | null>(null)
  const [showIntroduceModal, setShowIntroduceModal] = useState(false)
  const [newIntroduce, setNewIntroduce] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // 获取用户资料
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.userId) {
        try {
          const response = await userService.getUserProfile(user.userId)
          if (response.success) {
            setProfile(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
        }
      }
    }

    fetchUserProfile()
  }, [user?.userId])

  const [formData, setFormData] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })

  const [originalPassword, setOriginalPassword] = useState<string | null>(null);

  useEffect(() => {
    if (showEditModal && user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    }
  }, [showEditModal, user])

  useEffect(() => {
    const fetchOriginalPassword = async () => {
      if (showEditModal && user?.userId) {
        try {
          const response = await userService.getUserPassword(user.userId);
          if (response.success) {
            setOriginalPassword(response.data);
          }
        } catch (error) {
          console.error('Failed to get original password:', error);
        }
      }
    };

    fetchOriginalPassword();
  }, [showEditModal, user?.userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.userId || !token) {
      alert('请先登录')
      return
    }

    try {
      // 准备更新数据
      const updateData: {
        userId: number;
        username?: string;
        avatar?: string;
        password?: string;
        oldPassword?: string;
      } = {
        userId: user.userId
      }

      // 只有当用户名被修改时才添加
      if (formData.username && formData.username !== user.username) {
        updateData.username = formData.username
      }

      // 处理密码更新
      if (formData.oldPassword && formData.newPassword && formData.confirmPassword) {
        // 验证原密码
        if (formData.oldPassword !== originalPassword) {
          alert('原密码不正确')
          return
        }
        // 验证新密码一致性
        if (formData.newPassword !== formData.confirmPassword) {
          alert('两次输入的新密码不一致')
          return
        }
        updateData.password = formData.newPassword
      }

      // 处理头像上传
      if (fileInputRef.current?.files?.[0]) {
        const uploadResponse = await uploadService.uploadFile(fileInputRef.current.files[0])
        if (uploadResponse.success) {
          updateData.avatar = uploadResponse.data
        }
      }

      // 如果没有任何修改，直接返回
      if (Object.keys(updateData).length === 1) {
        alert('没有任何修改')
        return
      }

      // 发送更新请求
      const response = await userService.updateUserInfo(updateData)
      
      if (response && response.success) {
        const updatedUser = {
          ...user,
          ...(updateData.username && { username: updateData.username }),
          ...(updateData.avatar && { avatar: updateData.avatar })
        }
        login(updatedUser, token)
        
        setShowEditModal(false)
        // 显示成功提示
        setShowSuccess(true)
        // 3秒后自动隐藏
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        alert(response?.message || '修改失败')
      }
    } catch (error) {
      console.error('Failed to update user info:', error)
      alert('修改失败，请重试')
    }
  }

  const handleUpdateIntroduce = async () => {
    if (!user?.userId) {
      alert('请先登录')
      return
    }

    try {
      const response = await userService.updateUserIntroduce(user.userId, newIntroduce)
      if (response.success) {
        // 更新本地状态
        setProfile(prev => prev ? { ...prev, introduce: newIntroduce } : null)
        setShowIntroduceModal(false)
        // 显示成功提示
        setShowSuccess(true)
        // 3秒后自动隐藏
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        alert(response.message || '修改失败')
      }
    } catch (error) {
      console.error('Failed to update introduce:', error)
      alert('修改失败，请重试')
    }
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        {/* 成功提示组件 */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
            <div className="bg-green-100 rounded-full p-1">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-green-800">修改成功！</span>
          </div>
        )}

        {/* 个人信息卡片 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <Image
                src={user?.avatar || '/default-avatar.png'}
                alt={user?.username || '用户头像'}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{user?.username || '未登录用户'}</h1>
                  <div className="flex gap-4 mb-2">
                    <Link href="/profile/follow?tab=follower" className="text-gray-600 hover:text-[#FF8200]">
                      <span>
                        <strong>{profile?.follower || 0}</strong> 粉丝
                      </span>
                    </Link>
                    <Link href="/profile/follow?tab=following" className="text-gray-600 hover:text-[#FF8200]">
                      <span>
                        <strong>{profile?.following || 0}</strong> 关注
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500">{profile?.introduce || '这个人很懒，还没有写简介...'}</p>
                    <button
                      onClick={() => {
                        setNewIntroduce(profile?.introduce || '')
                        setShowIntroduceModal(true)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933]"
                >
                  修改信息
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 博文列表 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">我的博文</h2>
          <BlogList />
        </div>
      </div>

      {/* 编辑信息模态框 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-xl font-bold mb-6">修改个人信息</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 头像上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  头像
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={avatarPreview || user?.avatar || '/default-avatar.png'}
                      alt="头像预览"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
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
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Upload className="h-5 w-5" />
                    上传新头像
                  </button>
                </div>
              </div>

              {/* 用户名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网名
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                  placeholder="请输入新的网名"
                />
              </div>
              
              {/* 原密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  原密码
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200] pr-10"
                    placeholder="请输入原密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                    className="absolute right-2 top-2.5 text-gray-500"
                  >
                    {showPasswords.old ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* 新密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200] pr-10"
                    placeholder="请输入新密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-2 top-2.5 text-gray-500"
                  >
                    {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* 确认新密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200] pr-10"
                    placeholder="请再次输入新密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-2 top-2.5 text-gray-500"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933]"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 修改简介模态框 */}
      {showIntroduceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowIntroduceModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-xl font-bold mb-6">修改个人简介</h2>
            
            <div className="space-y-4">
              <textarea
                value={newIntroduce}
                onChange={(e) => setNewIntroduce(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                placeholder="请输入个人简介"
                rows={4}
              />
              
              <button
                onClick={handleUpdateIntroduce}
                className="w-full py-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933]"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
} 