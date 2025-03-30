'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { musicService } from '@/services/api'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, Music } from 'lucide-react'
import MainLayout from '@/app/layouts/MainLayout'

interface MusicItem {
  musicId: number;
  musicUrl: string;
  musicName: string;
  createdAt: string;
}

export default function MusicPage() {
  const { user } = useAuth()
  const [musicList, setMusicList] = useState<MusicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<MusicItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [musicName, setMusicName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [previewTime, setPreviewTime] = useState<number | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const [loadingTrack, setLoadingTrack] = useState<MusicItem | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    if (user?.userId) {
      fetchMusicList(currentPage, pageSize)
    }
  }, [user?.userId, currentPage, pageSize])

  useEffect(() => {
    // 预加载选中音频的元数据
    if (currentTrack && audio) {
      // 设置加载中状态
      setIsBuffering(true)
      
      // 确保audio.src已设置为当前音频URL
      if (audio.src !== currentTrack.musicUrl) {
        audio.src = currentTrack.musicUrl
      }
      
      // 如果音频已准备好就获取元数据
      if (audio.readyState >= 2) {
        setDuration(audio.duration || 0)
        setIsBuffering(false)
      }
    }
  }, [currentTrack, audio])

  useEffect(() => {
    const audioInstance = new Audio()
    setAudio(audioInstance)

    // 特别提高这个事件的优先级，确保它能正常工作
    const onTimeUpdate = () => {
      const newTime = audioInstance.currentTime
      setCurrentTime(newTime)
      if (debug) {
        console.log('Native timeupdate event:', newTime)
      }
    }

    // 监听音频事件
    const handleLoadMetadataEvent = () => handleLoadMetadata()
    const handleTrackEndEvent = () => handleTrackEnd()
    const handleWaitingEvent = () => handleWaiting()
    const handleCanPlayEvent = () => handleCanPlay()
    
    audioInstance.addEventListener('timeupdate', onTimeUpdate)
    audioInstance.addEventListener('loadedmetadata', handleLoadMetadataEvent)
    audioInstance.addEventListener('ended', handleTrackEndEvent)
    audioInstance.addEventListener('waiting', handleWaitingEvent)
    audioInstance.addEventListener('canplay', handleCanPlayEvent)
    
    // 调试日志
    console.log('Audio instance created')

    // 添加加载错误监听
    const handleError = (e: Event) => {
      console.error('Audio loading error:', e)
      setIsBuffering(false)
    }
    audioInstance.addEventListener('error', handleError)

    return () => {
      // 清除定时器
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      
      // 暂停并清除音频源
      audioInstance.pause()
      audioInstance.src = ''
      
      // 移除所有事件监听器
      audioInstance.removeEventListener('timeupdate', onTimeUpdate)
      audioInstance.removeEventListener('loadedmetadata', handleLoadMetadataEvent)
      audioInstance.removeEventListener('ended', handleTrackEndEvent)
      audioInstance.removeEventListener('waiting', handleWaitingEvent)
      audioInstance.removeEventListener('canplay', handleCanPlayEvent)
      audioInstance.removeEventListener('error', handleError)
    }
  }, [debug])

  const fetchMusicList = async (page: number = 1, pageSize: number = 10) => {
    if (!user?.userId) return

    try {
      setLoading(true)
      const response = await musicService.getUserMusic({
        userId: user.userId,
        page: page,
        pageSize: pageSize
      })

      if (response.success) {
        setMusicList(response.data.records)
        setTotalItems(response.data.total)
        setTotalPages(Math.ceil(response.data.total / pageSize))
      }
    } catch (error) {
      console.error('Failed to fetch music list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMetadata = () => {
    if (audio) {
      // 明确设置音频时长
      const audioDuration = audio.duration || 0
      setDuration(audioDuration)
      console.log('Metadata loaded, duration:', audioDuration)
      
      // 如果时长为0或Infinity，尝试延迟获取
      if (audioDuration <= 0 || !isFinite(audioDuration)) {
        console.log('Invalid duration, trying again in 1 second')
        setTimeout(() => {
          if (audio && audio.duration > 0) {
            setDuration(audio.duration)
            console.log('Updated duration:', audio.duration)
          }
        }, 1000)
      }
    }
  }

  const handleTrackEnd = () => {
    handleNext()
  }

  const handleWaiting = () => {
    setIsBuffering(true)
  }

  const handleCanPlay = () => {
    setIsBuffering(false)
    // 再次确认时长已正确加载
    if (audio && audio.duration > 0) {
      setDuration(audio.duration)
    }
  }

  // 添加一个专门用于预加载音频的函数
  const preloadAudio = async (track: MusicItem) => {
    if (!audio) return
    
    try {
      // 设置加载状态
      setIsBuffering(true)
      
      // 先创建一个临时Audio对象来预加载和获取元数据
      const tempAudio = new Audio()
      
      // 创建一个Promise来等待元数据加载完成
      const metadataLoaded = new Promise<number>((resolve, reject) => {
        // 设置超时，防止无限等待
        const timeout = setTimeout(() => {
          // 如果5秒内无法获取元数据，使用一个默认时长
          console.warn('Metadata load timeout')
          resolve(0)
        }, 5000)
        
        tempAudio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout)
          if (tempAudio.duration && isFinite(tempAudio.duration)) {
            console.log('Preload metadata loaded, duration:', tempAudio.duration)
            resolve(tempAudio.duration)
          } else {
            console.warn('Invalid duration from preload')
            resolve(0)
          }
        }, { once: true })
        
        tempAudio.addEventListener('error', (e) => {
          clearTimeout(timeout)
          console.error('Preload error:', e)
          reject(new Error('Failed to preload audio'))
        }, { once: true })
      })
      
      // 设置音频源
      tempAudio.src = track.musicUrl
      tempAudio.preload = 'metadata'
      
      try {
        // 等待元数据加载
        const duration = await metadataLoaded
        
        // 更新实际播放器的源和元数据
        audio.src = track.musicUrl
        setDuration(duration > 0 ? duration : 0)
        
        return true
      } catch (error) {
        console.error('Error preloading audio:', error)
        return false
      } finally {
        // 释放临时对象
        tempAudio.src = ''
      }
    } catch (error) {
      console.error('Preload error:', error)
      return false
    }
  }

  // 修改播放函数以使用预加载
  const handlePlay = async (track: MusicItem) => {
    if (!audio) return

    if (currentTrack?.musicId === track.musicId) {
      if (isPlaying) {
        // 暂停播放
        audio.pause()
        setIsPlaying(false)
        
        // 清除进度更新定时器
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
      } else {
        // 继续播放
        setIsBuffering(true)
        try {
          await audio.play()
          setIsPlaying(true)
          console.log('Playback resumed')
        } catch (err) {
          console.error('Error playing audio:', err)
          setIsBuffering(false)
        }
      }
    } else {
      // 设置加载状态
      setLoadingTrack(track)
      setIsBuffering(true)
      
      // 清除可能存在的进度更新定时器
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      
      // 先重置状态
      setCurrentTime(0)
      
      try {
        // 预加载音频
        const preloadSuccess = await preloadAudio(track)
        
        if (!preloadSuccess) {
          throw new Error('Failed to preload audio')
        }
        
        // 确保我们再次将播放位置重置为开始
        audio.currentTime = 0
        setCurrentTime(0)
        
        // 播放音频
        await audio.play()
        
        // 更新状态
        setCurrentTrack(track)
        setLoadingTrack(null)
        setIsPlaying(true)
        
        // 强制触发一次进度更新
        setTimeout(() => {
          if (audio) {
            setCurrentTime(audio.currentTime)
          }
        }, 100)
        
        // 确认播放已开始
        console.log('Playing started for track:', track.musicName, 'Current time:', audio.currentTime)
      } catch (error) {
        console.error('Error playing audio:', error)
        setIsBuffering(false)
        setLoadingTrack(null)
        alert('播放音乐时出错，请重试')
      }
    }
  }

  const handleNext = () => {
    if (!currentTrack) return
    const currentIndex = musicList.findIndex(track => track.musicId === currentTrack.musicId)
    if (currentIndex < musicList.length - 1) {
      handlePlay(musicList[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (!currentTrack) return
    const currentIndex = musicList.findIndex(track => track.musicId === currentTrack.musicId)
    if (currentIndex > 0) {
      handlePlay(musicList[currentIndex - 1])
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audio) {
      const time = Number(e.target.value)
      audio.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audio) {
      const vol = Number(e.target.value)
      audio.volume = vol
      setVolume(vol)
      setIsMuted(vol === 0)
    }
  }

  const toggleMute = () => {
    if (audio) {
      if (isMuted) {
        audio.volume = volume
        setIsMuted(false)
      } else {
        audio.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity || time < 0) {
      return '0:00'
    }
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('audio/')) {
        alert('请上传音频文件')
        return
      }
      
      // 验证文件大小 (例如限制为20MB)
      if (file.size > 20 * 1024 * 1024) {
        alert('音频大小不能超过20MB')
        return
      }
      
      setSelectedFile(file)
      // 如果没有设置名称，使用文件名作为默认名称（去掉扩展名）
      if (!musicName) {
        const fileName = file.name.replace(/\.[^/.]+$/, "")
        setMusicName(fileName)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !musicName.trim() || !user?.userId) {
      alert('请选择文件并输入音乐名称')
      return
    }
    
    try {
      setUploading(true)
      
      // 创建 FormData 对象
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('userId', user.userId.toString())
      formData.append('musicName', musicName)
      
      // 使用音乐专用上传服务
      const response = await musicService.uploadMusic(formData)
      
      if (response.success) {
        alert('上传成功！')
        setShowUploadModal(false)
        setMusicName('')
        setSelectedFile(null)
        // 刷新音乐列表
        fetchMusicList()
      }
    } catch (error) {
      console.error('Failed to upload music:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value)
    setPageSize(newSize)
    setCurrentPage(1) // 重置到第一页
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // 最多显示的页码数量
    
    if (totalPages <= maxPagesToShow) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // 如果总页数大于最大显示数，显示部分页码
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
      let endPage = startPage + maxPagesToShow - 1
      
      if (endPage > totalPages) {
        endPage = totalPages
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
    }
    
    return pageNumbers
  }

  // 实用函数：安全获取音频时长
  const safeGetDuration = () => {
    if (!audio) return 0
    
    // 检查音频时长是否有效
    if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
      return audio.duration
    }
    
    // 如果从audio获取失败，则使用状态中的值
    if (duration && isFinite(duration) && duration > 0) {
      return duration
    }
    
    // 返回一个默认值
    return 100 // 默认100秒，确保进度条可以使用
  }

  // 新增定时器进度更新机制
  useEffect(() => {
    // 只有在播放时才启动定时器
    if (isPlaying && audio) {
      // 清除可能存在的旧定时器
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      
      // 设置新的定时器，每100ms更新一次进度
      progressIntervalRef.current = setInterval(() => {
        if (audio && !audio.paused) {
          setCurrentTime(audio.currentTime)
          if (debug) {
            console.log('Timer update:', audio.currentTime, '/', audio.duration)
          }
        }
      }, 100)
      
      // 调试日志
      console.log('Progress update timer started')
    }
    
    // 清理函数
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
        console.log('Progress update timer cleared')
      }
    }
  }, [isPlaying, audio, debug])

  // 增强的进度条点击处理函数
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audio || !progressBarRef.current) return
    
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickPosition = e.clientX - rect.left
    const percentage = clickPosition / rect.width
    const currentDuration = safeGetDuration()
    const newTime = percentage * currentDuration
    
    if (newTime >= 0 && newTime <= currentDuration) {
      try {
        // 设置音频时间
        audio.currentTime = newTime
        
        // 手动触发一次时间更新，以便UI立即更新
        setCurrentTime(newTime)
        console.log('Seek to:', newTime)
        
        // 如果当前未播放，则开始播放
        if (!isPlaying && currentTrack) {
          setIsBuffering(true)
          audio.play()
            .then(() => {
              setIsPlaying(true)
              console.log('Playback started after seek')
            })
            .catch(e => {
              console.error('Error playing after seek:', e)
              setIsBuffering(false)
            })
        }
      } catch (error) {
        console.error('Error during seek operation:', error)
      }
    }
  }

  // 处理进度条悬停
  const handleProgressBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return
    
    const rect = progressBarRef.current.getBoundingClientRect()
    const hoverPosition = e.clientX - rect.left
    const percentage = hoverPosition / rect.width
    const currentDuration = safeGetDuration()
    const hoverTime = percentage * currentDuration
    
    if (hoverTime >= 0 && hoverTime <= currentDuration) {
      setPreviewTime(hoverTime)
    }
  }

  const handleProgressBarLeave = () => {
    setPreviewTime(null)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-gray-500">加载中...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          {/* 标题和上传按钮 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">我的音乐</h1>
            <div className="flex gap-2">
              {/* 添加调试模式切换按钮 - 在开发环境可以使用 */}
              <button 
                onClick={() => setDebug(!debug)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {debug ? '关闭调试' : '调试模式'}
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933]"
              >
                <Upload className="w-4 h-4" />
                上传音乐
              </button>
            </div>
          </div>

          {/* 当前播放信息 */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-medium mb-2">
              {currentTrack ? currentTrack.musicName : '未选择音乐'}
            </h2>
            {isBuffering && (
              <div className="text-sm text-gray-500">缓冲中...</div>
            )}
            {debug && (
              <div className="text-xs text-gray-400 mt-1">
                播放状态: {isPlaying ? '播放中' : '已暂停'} | 
                当前时间: {formatTime(currentTime)} | 
                总时长: {formatTime(duration)}
              </div>
            )}
          </div>

          {/* 进度条 - 升级版 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            {/* 自定义进度条 */}
            <div 
              ref={progressBarRef}
              className="h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden group"
              onClick={handleProgressBarClick}
              onMouseMove={handleProgressBarHover}
              onMouseLeave={handleProgressBarLeave}
            >
              {/* 已播放进度 */}
              <div 
                className="absolute top-0 left-0 h-full bg-[#FF8200] rounded-full"
                style={{ 
                  width: `${Math.min(100, (currentTime / Math.max(duration, 1)) * 100)}%` 
                }}
              ></div>
              
              {/* 缓冲指示器 */}
              {isBuffering && (
                <div className="absolute top-0 left-0 h-full w-full">
                  <div className="h-full bg-[#FF8200] bg-opacity-30 animate-pulse"></div>
                </div>
              )}
              
              {/* 拖动手柄 */}
              <div 
                className="absolute top-0 h-2 w-2 bg-white border-2 border-[#FF8200] rounded-full transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ 
                  left: `${Math.min(100, (currentTime / Math.max(duration, 1)) * 100)}%`,
                }}
              ></div>
              
              {/* 预览时间气泡 */}
              {previewTime !== null && (
                <div 
                  className="absolute bottom-full mb-2 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded transform -translate-x-1/2 pointer-events-none"
                  style={{ 
                    left: `${(previewTime / Math.max(duration, 1)) * 100}%`,
                  }}
                >
                  {formatTime(previewTime)}
                </div>
              )}
            </div>
          </div>

          {/* 播放控制 */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={handlePrevious}
              className="p-2 hover:text-[#FF8200] transition-colors"
              disabled={!currentTrack}
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={() => currentTrack && handlePlay(currentTrack)}
              className="p-3 rounded-full bg-[#FF8200] text-white hover:bg-[#ff9933] transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:text-[#FF8200] transition-colors"
              disabled={!currentTrack}
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-2 justify-center mb-8">
            <button onClick={toggleMute} className="hover:text-[#FF8200] transition-colors">
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* 音乐列表 */}
          <div>
            <h3 className="font-medium mb-4 pb-2 border-b">播放列表</h3>
            {musicList.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                还没有音乐，点击上方"上传音乐"按钮添加
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {musicList.map((track) => (
                    <div
                      key={track.musicId}
                      onClick={() => handlePlay(track)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        currentTrack?.musicId === track.musicId ? 'bg-gray-50 text-[#FF8200]' : ''
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {loadingTrack?.musicId === track.musicId ? (
                          <div className="w-5 h-5 border-2 border-[#FF8200] border-t-transparent rounded-full animate-spin"></div>
                        ) : currentTrack?.musicId === track.musicId && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{track.musicName}</div>
                        <div className="text-sm text-gray-500">{track.createdAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 分页控制 */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      共 {totalItems} 首音乐，第 {currentPage}/{totalPages} 页
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value={5}>5条/页</option>
                        <option value={10}>10条/页</option>
                        <option value={20}>20条/页</option>
                      </select>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 text-sm"
                        >
                          首页
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 text-sm"
                        >
                          上一页
                        </button>
                        
                        {getPageNumbers().map(pageNum => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded border ${
                              pageNum === currentPage
                                ? 'bg-[#FF8200] text-white border-[#FF8200]'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 text-sm"
                        >
                          下一页
                        </button>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 text-sm"
                        >
                          末页
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 上传音乐模态框 */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-[#FF8200]" />
                上传音乐
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    音乐名称
                  </label>
                  <input
                    type="text"
                    value={musicName}
                    onChange={(e) => setMusicName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                    placeholder="请输入音乐名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    音乐文件
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="audio/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Upload className="w-5 h-5" />
                      选择文件
                    </button>
                    <span className="text-sm text-gray-500 truncate flex-1">
                      {selectedFile ? selectedFile.name : '未选择文件'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false)
                      setMusicName('')
                      setSelectedFile(null)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile || !musicName.trim()}
                    className="px-4 py-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933] disabled:opacity-50"
                  >
                    {uploading ? '上传中...' : '上传'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 