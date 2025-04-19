'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/app/layouts/MainLayout'
import { Music2, Play, Pause, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MusicFile {
  fileName: string
  fileId: number
  url: string
  type: string
  createdAt: string
}

interface MusicResponse {
  success: boolean
  data: {
    total: number
    records: MusicFile[]
  }
  message: string | null
}

export default function MusicPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [musicList, setMusicList] = useState<MusicFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null)
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({})

  useEffect(() => {
    if (user?.userId) {
      fetchMusicList()
    }
  }, [user?.userId, currentPage])

  // 添加音频事件监听
  const setupAudioListeners = (audio: HTMLAudioElement, fileId: number) => {
    audio.addEventListener('play', () => {
      // 停止其他正在播放的音频
      Object.entries(audioRefs.current).forEach(([id, otherAudio]) => {
        if (otherAudio && Number(id) !== fileId) {
          otherAudio.pause()
        }
      })
      setCurrentPlayingId(fileId)
    })

    audio.addEventListener('pause', () => {
      if (currentPlayingId === fileId) {
        setCurrentPlayingId(null)
      }
    })

    audio.addEventListener('ended', () => {
      if (currentPlayingId === fileId) {
        setCurrentPlayingId(null)
      }
    })
  }

  // 移除音频事件监听
  const cleanupAudioListeners = (audio: HTMLAudioElement) => {
    audio.removeEventListener('play', () => {})
    audio.removeEventListener('pause', () => {})
    audio.removeEventListener('ended', () => {})
  }

  const handlePlay = (fileId: number) => {
    const currentAudio = audioRefs.current[fileId]
    if (!currentAudio) return

    // 如果点击的是当前正在播放的音乐
    if (currentPlayingId === fileId) {
      if (currentAudio.paused) {
        currentAudio.play()
      } else {
        currentAudio.pause()
      }
      return
    }

    // 停止当前播放的音乐
    if (currentPlayingId !== null && audioRefs.current[currentPlayingId]) {
      audioRefs.current[currentPlayingId]?.pause()
    }

    // 播放新选择的音乐
    currentAudio.play()
  }

  const setAudioRef = (element: HTMLAudioElement | null, fileId: number) => {
    if (element) {
      // 移除旧的事件监听器
      const oldAudio = audioRefs.current[fileId]
      if (oldAudio) {
        cleanupAudioListeners(oldAudio)
      }
      
      // 设置新的音频元素并添加事件监听器
      audioRefs.current[fileId] = element
      setupAudioListeners(element, fileId)
    } else {
      // 如果元素被移除，清理事件监听器
      const oldAudio = audioRefs.current[fileId]
      if (oldAudio) {
        cleanupAudioListeners(oldAudio)
      }
      audioRefs.current[fileId] = null
    }
  }

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const fetchMusicList = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch(
        `http://localhost:8080/api/cloud/musicList?userId=${user?.userId}&page=${currentPage}&pageSize=${pageSize}`,
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

      const data: MusicResponse = await response.json()

      if (data.success) {
        setMusicList(data.data.records)
        setTotal(data.data.total)
      } else {
        console.error('Failed to fetch music list:', data.message)
      }
    } catch (error) {
      console.error('Failed to fetch music list:', error)
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
              <Music2 className="h-6 w-6 text-[#FF8200]" />
              我的音乐
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : musicList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无音乐文件</div>
          ) : (
            <div className="space-y-4">
              {musicList.map((music) => (
                <div
                  key={music.fileId}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <button
                    onClick={() => handlePlay(music.fileId)}
                    className="w-10 h-10 bg-[#FF8200] bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20"
                  >
                    {currentPlayingId === music.fileId ? (
                      <Pause className="h-5 w-5 text-[#FF8200]" />
                    ) : (
                      <Play className="h-5 w-5 text-[#FF8200]" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium">{music.fileName}</h3>
                    <p className="text-sm text-gray-500">
                      上传时间：{formatDate(music.createdAt)}
                    </p>
                  </div>
                  <audio
                    ref={(el) => setAudioRef(el, music.fileId)}
                    src={music.url}
                    controls
                    className="w-80"
                  >
                    您的浏览器不支持音频播放
                  </audio>
                </div>
              ))}

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