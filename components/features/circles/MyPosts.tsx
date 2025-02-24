'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { hobbyService } from '@/services/api'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

const categories = [
  '动漫', '阅读', '影视', '科技', '军事', 
  '时事', '生活', '旅游', '音乐', '美食', '学习', '汽车'
]

export default function MyPosts() {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [introduce, setIntroduce] = useState('')
  const [avatar, setAvatar] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [submitting, setSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

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

  return (
    <div className="space-y-4">
      {/* 帖子列表 */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-2">帖子标题 {i}</h3>
            <p className="text-gray-600 mb-4">这是帖子的内容描述...</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>发布时间: 2小时前</span>
              <div className="flex gap-4">
                <span>点赞: 12</span>
                <span>评论: 5</span>
              </div>
            </div>
          </div>
        ))}
      </div>

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