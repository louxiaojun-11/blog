'use client'

import { useState } from 'react'
import { Music2, Video, Image, Upload } from 'lucide-react'
import MainLayout from '@/app/layouts/MainLayout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CloudPage() {
  const [uploading, setUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8080/api/cloud/uploadMultimedia', {
        method: 'POST',
        headers: {
          'token': sessionStorage.getItem('token') || ''
        },
        body: formData
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        alert('上传失败，请重试')
      }
    } catch (error) {
      console.error('上传文件失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
      // 清空input的value，这样同一个文件可以重复上传
      e.target.value = ''
    }
  }

  const categories = [
    { icon: Music2, label: '音乐', href: '/cloud/music' },
    { icon: Video, label: '视频', href: '/cloud/video' },
    { icon: Image, label: '照片', href: '/cloud/photos' },
  ]

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">多媒体云盘</h1>
          <div className="relative">
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileUpload}
              className="hidden"
              accept="audio/*,video/*,image/*"
            />
            <label
              htmlFor="fileUpload"
              className={`flex items-center gap-2 px-4 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933] cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-5 h-5" />
              {uploading ? '上传中...' : '上传文件'}
            </label>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg z-50">
            <span className="text-green-800">上传成功！</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#FF8200] bg-opacity-10 flex items-center justify-center">
                  <category.icon className="w-8 h-8 text-[#FF8200]" />
                </div>
                <span className="text-lg font-medium">{category.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  )
} 