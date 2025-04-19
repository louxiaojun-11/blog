'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/app/layouts/MainLayout'
import { Video, ArrowLeft, Download, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VideoFile {
  fileName: string
  fileId: number
  url: string
  type: string
  createdAt: string
}

interface VideoResponse {
  success: boolean
  data: {
    total: number
    records: VideoFile[]
  }
  message: string | null
}

export default function VideoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [videoList, setVideoList] = useState<VideoFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null)

  useEffect(() => {
    if (user?.userId) {
      fetchVideoList()
    }
  }, [user?.userId, currentPage])

  const fetchVideoList = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch(
        `http://localhost:8080/api/cloud/videoList?userId=${user?.userId}&page=${currentPage}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          }
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data: VideoResponse = await response.json()

      if (data.success) {
        setVideoList(data.data.records)
        setTotal(data.data.total)
      } else {
        console.error('Failed to fetch video list:', data.message)
      }
    } catch (error) {
      console.error('Failed to fetch video list:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async (fileId: number) => {
    if (!confirm('确定要删除这个视频吗？')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/cloud/deleteFile/${fileId}`, {
        method: 'DELETE',
        headers: {
          'token': sessionStorage.getItem('token') || ''
        }
      })

      if (response.ok) {
        // 重新获取视频列表
        fetchVideoList()
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除视频失败:', error)
      alert('删除失败，请重试')
    }
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/cloud')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>返回云盘</span>
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-[#FF8200]" />
              我的视频
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : videoList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无视频文件</div>
          ) : (
            <div className="space-y-6">
              {/* 视频播放器 */}
              {selectedVideo && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-4 rounded-lg z-50 w-[640px] shadow-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-medium text-white">{selectedVideo.fileName}</h2>
                    <button 
                      onClick={() => setSelectedVideo(null)}
                      className="text-white hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                  <video
                    src={selectedVideo.url}
                    controls
                    className="w-full rounded-lg"
                    autoPlay
                  >
                    您的浏览器不支持视频播放
                  </video>
                </div>
              )}

              {/* 添加遮罩层 */}
              {selectedVideo && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setSelectedVideo(null)}
                />
              )}

              {/* 视频列表 */}
              <div className="space-y-4">
                {videoList.map((video) => (
                  <div
                    key={video.fileId}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Video className="h-6 w-6 text-[#FF8200]" />
                    <div className="flex-1">
                      <h3 
                        className="font-medium hover:text-[#FF8200] cursor-pointer"
                        onClick={() => setSelectedVideo(video)}
                      >
                        {video.fileName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        上传时间：{formatDate(video.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleDownload(video.url, video.fileName)}
                        className="px-3 py-1 text-sm text-[#FF8200] hover:bg-orange-50 rounded-full"
                      >
                        下载
                      </button>
                      <button
                        onClick={() => handleDelete(video.fileId)}
                        className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded-full flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页控件 */}
              {total > pageSize && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                  >
                    首页
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  
                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(total / pageSize)}
                    className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.ceil(total / pageSize))}
                    disabled={currentPage === Math.ceil(total / pageSize)}
                    className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                  >
                    末页
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
} 