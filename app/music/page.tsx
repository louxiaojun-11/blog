'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { musicService } from '@/services/api'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, X, Check } from 'lucide-react'
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
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user?.userId) {
      fetchMusicList()
    }
  }, [user?.userId])

  useEffect(() => {
    const audioInstance = new Audio()
    setAudio(audioInstance)

    // 监听音频事件
    audioInstance.addEventListener('timeupdate', handleTimeUpdate)
    audioInstance.addEventListener('loadedmetadata', handleLoadMetadata)
    audioInstance.addEventListener('ended', handleTrackEnd)

    return () => {
      audioInstance.pause()
      audioInstance.src = ''
      audioInstance.removeEventListener('timeupdate', handleTimeUpdate)
      audioInstance.removeEventListener('loadedmetadata', handleLoadMetadata)
      audioInstance.removeEventListener('ended', handleTrackEnd)
    }
  }, [])

  const fetchMusicList = async () => {
    if (!user?.userId) return

    try {
      setLoading(true)
      const response = await musicService.getUserMusic({
        userId: user.userId,
        page: 1,
        pageSize: 10
      })

      if (response.success) {
        setMusicList(response.data.records)
      }
    } catch (error) {
      console.error('Failed to fetch music list:', error)
    } finally {
      setLoading(false)
    }
  }

  // 处理音乐上传
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const validateAudioFile = (file: File): boolean => {
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mpeg']
    const maxSize = 20 * 1024 * 1024 // 20MB
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('不支持的文件类型，仅支持: mp3, wav, ogg, flac')
      return false
    }
    
    if (file.size > maxSize) {
      setUploadError('文件大小不能超过20MB')
      return false
    }
    
    return true
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // 重置状态
    setUploadError('')
    setUploadSuccess(false)
    
    // 验证文件
    if (!validateAudioFile(file)) return
    
    try {
      setUploadLoading(true)
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', file)
      
      // 上传音乐文件，后端会自动保存到数据库
      const response = await musicService.uploadMusic(formData)
      
      if (response.success) {
        setUploadSuccess(true)
        // 重新获取音乐列表
        await fetchMusicList()
        
        // 3秒后隐藏成功提示
        setTimeout(() => {
          setUploadSuccess(false)
        }, 3000)
      } else {
        setUploadError(response.message || '上传失败')
      }
    } catch (error) {
      console.error('上传音乐失败:', error)
      setUploadError('上传音乐失败，请重试')
    } finally {
      setUploadLoading(false)
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audio) {
      setCurrentTime(audio.currentTime)
    }
  }

  const handleLoadMetadata = () => {
    if (audio) {
      setDuration(audio.duration)
    }
  }

  const handleTrackEnd = () => {
    handleNext()
  }

  const handlePlay = (track: MusicItem) => {
    if (!audio) return

    if (currentTrack?.musicId === track.musicId) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    } else {
      audio.src = track.musicUrl
      audio.play()
      setCurrentTrack(track)
      setIsPlaying(true)
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
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 上传音乐按钮 */}
          <div className="flex justify-end mb-4">
            <input
              type="file"
              accept=".mp3,.wav,.ogg,.flac,audio/mp3,audio/wav,audio/ogg,audio/flac,audio/mpeg"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              disabled={uploadLoading}
            />
            <button
              onClick={handleUploadClick}
              disabled={uploadLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933] disabled:opacity-70"
            >
              <Upload className="w-4 h-4" />
              {uploadLoading ? '上传中...' : '上传音乐'}
            </button>
          </div>
          
          {/* 上传状态提示 */}
          {uploadError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <X className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
          
          {uploadSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>音乐上传成功！</span>
            </div>
          )}

          {/* 当前播放信息 */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">
              {currentTrack ? currentTrack.musicName : '未选择音乐'}
            </h2>
          </div>

          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500">{formatTime(duration)}</span>
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
          <div className="flex items-center gap-2 justify-center">
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
          <div className="mt-8">
            <h3 className="font-medium mb-4">播放列表 ({musicList.length})</h3>
            {musicList.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                暂无音乐，请上传音乐文件
              </div>
            ) : (
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
                      {currentTrack?.musicId === track.musicId && isPlaying ? (
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
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 