'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import MainLayout from '@/app/layouts/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { hobbyService, uploadService } from '@/services/api'
import { Check, X, ImagePlus } from 'lucide-react'

export default function PostHobbyBlogPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const groupId = Number(params.id)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>(['', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleImageUpload = async (file: File, index: number) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await uploadService.uploadFile(formData)
      if (response.success) {
        const newImages = [...images]
        newImages[index] = response.data
        setImages(newImages)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('图片上传失败，请重试')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件')
        return
      }
      await handleImageUpload(file, index)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空')
      return
    }

    if (!user?.userId) {
      alert('请先登录')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await hobbyService.postHobbyBlog({
        userId: user.userId,
        groupId,
        title,
        content,
        pic1: images[0] || null,
        pic2: images[1] || null,
        pic3: images[2] || null,
        pic4: images[3] || null
      })

      if (response.success) {
        setShowSuccess(true)
        setTimeout(() => {
          router.push(`/groups/${groupId}`)
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to post blog:', error)
      alert('发布失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
            <div className="bg-green-100 rounded-full p-1">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-green-800">发布成功！</span>
          </div>
        )}

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">发布圈文</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="请输入标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                maxLength={100}
              />
            </div>

            <div>
              <textarea
                placeholder="请输入正文内容..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-60 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8200] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, index)}
                    className="hidden"
                    id={`image-${index}`}
                  />
                  {image ? (
                    <>
                      <Image
                        src={image}
                        alt={`图片 ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...images]
                          newImages[index] = ''
                          setImages(newImages)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <label
                      htmlFor={`image-${index}`}
                      className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#FF8200]"
                    >
                      <ImagePlus className="h-8 w-8 text-gray-400" />
                    </label>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933] disabled:opacity-50"
              >
                {isSubmitting ? '发布中...' : '发布圈文'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
} 