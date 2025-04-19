'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/app/layouts/MainLayout'
import { ArrowLeft, Trash2, Image, Eye, Download, X } from 'lucide-react'

interface PhotoFile {
  fileName: string
  fileId: number
  url: string
  type: string
  createdAt: string
}

interface PhotoResponse {
  success: boolean
  data: {
    total: number
    records: PhotoFile[]
  }
  message: string | null
}

export default function PhotoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [photoList, setPhotoList] = useState<PhotoFile[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoFile | null>(null)
  const pageSize = 12

  useEffect(() => {
    fetchPhotoList()
  }, [currentPage])

  const fetchPhotoList = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/cloud/photoList?page=${currentPage}&pageSize=${pageSize}`, {
        headers: {
          'token': sessionStorage.getItem('token') || ''
        }
      })

      if (response.ok) {
        const data: PhotoResponse = await response.json()
        if (data.success) {
          setPhotoList(data.data.records)
          setTotalPhotos(data.data.total)
        }
      }
    } catch (error) {
      console.error('获取图片列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId: number) => {
    if (!confirm('确定要删除这张图片吗？')) {
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
        setSelectedPhoto(null)
        fetchPhotoList()
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除图片失败:', error)
      alert('删除失败，请重试')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedPhoto(null)
  }

  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalPhotos / pageSize)
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

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">我的图片</h1>
          <button
            onClick={() => router.push('/cloud')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            返回云盘
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : photoList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无图片文件</div>
          ) : (
            <div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传时间</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {photoList.map((photo) => (
                    <tr key={photo.fileId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPhoto(selectedPhoto?.fileId === photo.fileId ? null : photo)}
                          className="flex items-center gap-2 text-gray-900 hover:text-[#FF8200]"
                        >
                          <Image className="w-5 h-5" />
                          <span>{photo.fileName}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(photo.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDownload(photo.url, photo.fileName)}
                            className="text-[#FF8200] hover:text-[#ff9933] p-2"
                            title="下载"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(photo.fileId)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="删除"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 图片预览悬浮窗 */}
              {selectedPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4">
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => setSelectedPhoto(null)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>
                    <div className="p-4">
                      <img
                        src={selectedPhoto.url}
                        alt={selectedPhoto.fileName}
                        className="w-full rounded-lg"
                      />
                    </div>
                    <div className="px-4 py-3 border-t flex justify-between items-center">
                      <span className="text-gray-600">{selectedPhoto.fileName}</span>
                      <button
                        onClick={() => handleDownload(selectedPhoto.url, selectedPhoto.fileName)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933]"
                      >
                        <Download className="w-4 h-4" />
                        下载
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 分页控件 */}
          {totalPhotos > pageSize && (
            <div className="flex justify-center items-center gap-2 p-4 border-t">
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
                disabled={currentPage === Math.ceil(totalPhotos / pageSize)}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
              <button
                onClick={() => handlePageChange(Math.ceil(totalPhotos / pageSize))}
                disabled={currentPage === Math.ceil(totalPhotos / pageSize)}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                末页
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}