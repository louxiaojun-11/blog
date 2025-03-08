'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { musicService } from '@/services/api'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
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
            <h3 className="font-medium mb-4">播放列表</h3>
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
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 