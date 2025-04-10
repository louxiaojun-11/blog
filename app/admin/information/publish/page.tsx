'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { adminService } from '@/services/adminApi'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

const categories = [
  { value: '科技', label: '科技' },
  { value: '时事', label: '时事' },
  { value: '财经', label: '财经' },
  { value: '体育', label: '体育' },
  { value: '娱乐', label: '娱乐' },
  { value: '教育', label: '教育' },
  { value: '汽车', label: '汽车' },
  { value: '时尚', label: '时尚' }
]

export default function PublishInformation() {
  const router = useRouter()
  const { admin } = useAdminAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '',
    pic: ''
  })
  const [previewUrl, setPreviewUrl] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const token = sessionStorage.getItem('token')
      if (!token) {
        throw new Error('未获取到登录信息，请重新登录')
      }

      const response = await fetch('http://localhost:8080/manage/admin/upload', {
        method: 'POST',
        headers: {
          'token': token
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          pic: data.data
        }))
        setPreviewUrl(data.data)
      } else {
        throw new Error(data.message || '上传失败')
      }
    } catch (error) {
      console.error('上传图片失败:', error)
      alert(error instanceof Error ? error.message : '上传图片失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content || !formData.type) {
      alert('请填写所有必填字段')
      return
    }

    if (!admin?.adminId) {
      alert('未获取到管理员信息，请重新登录')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/manage/admin/releaseInformation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': sessionStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          pic: formData.pic,
          adminId: admin.adminId
        })
      })

      if (!response.ok) {
        throw new Error('发布失败')
      }

      const data = await response.json()
      if (data.success) {
        alert('发布成功')
        router.push('/admin/information')
      } else {
        throw new Error(data.message || '发布失败')
      }
    } catch (error) {
      console.error('发布失败:', error)
      alert(error instanceof Error ? error.message : '发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回资讯列表
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">发布资讯</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8200] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8200] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类 <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8200] focus:border-transparent"
                required
              >
                <option value="">请选择分类</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                封面图片
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                选择图片
              </button>
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="max-w-xs rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933] disabled:opacity-50"
              >
                {loading ? '发布中...' : '发布'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 