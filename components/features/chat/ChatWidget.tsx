'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Send, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { Friend } from '@/types/api'
import { friendService } from '@/services/api'

interface ChatMessage {
  id: number
  senderId: number
  receiverId: number
  message: string
  sendTime: string
}

interface ChatWidgetProps {
  onClose: () => void
}

export default function ChatWidget({ onClose }: ChatWidgetProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { socket, isConnected } = useWebSocket()

  // 获取好友列表
  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true)
        const response = await friendService.getFriends()
        if (response.success) {
          const formattedFriends = response.data.map(friend => ({
            ...friend,
            status: friend.status as 'online' | 'offline'
          }))
          setFriends(formattedFriends)
        }
      } catch (error) {
        console.error('Failed to load friends:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFriends()
  }, [])

  // 获取聊天记录
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!selectedFriend) return

      try {
        setLoading(true)
        const token = sessionStorage.getItem('token')
        const response = await fetch(`http://localhost:8080/api/chat/record?receiverId=${selectedFriend.userId}`, {
          headers: {
            'token': token || ''
          }
        })
        const data = await response.json()
        if (data.success) {
          setChatHistory(data.data)
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      } finally {
        setLoading(false)
      }
    }

    if (selectedFriend) {
      loadChatHistory()
    }
  }, [selectedFriend])

  // 监听WebSocket消息
  useEffect(() => {
    if (!socket) return

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.isSystemMessage) return

      setChatHistory(prev => [...prev, {
        id: Date.now(), // 临时ID
        senderId: message.senderId,
        receiverId: user?.userId || 0,
        message: message.data,
        sendTime: new Date().toISOString()
      }])
    }
  }, [socket, user?.userId])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend || !socket) return

    const message = {
      receiverId: selectedFriend.userId.toString(),
      msg: newMessage.trim()
    }

    socket.send(JSON.stringify(message))
    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">聊天</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Friends List */}
          <div className="w-1/3 border-r overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">加载中...</div>
            ) : (
              <div className="space-y-2 p-2">
                {friends.map(friend => (
                  <div
                    key={friend.userId}
                    onClick={() => setSelectedFriend(friend)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedFriend?.userId === friend.userId ? 'bg-gray-100' : ''
                    }`}
                  >
                    <Image
                      src={friend.avatar}
                      alt={friend.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{friend.username}</p>
                      <p className="text-sm text-gray-500">
                        {friend.status === 'online' ? '在线' : '离线'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedFriend ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === user?.userId
                            ? 'bg-[#FF8200] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.sendTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入消息..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      className="p-2 bg-[#FF8200] text-white rounded-lg hover:bg-[#ff9933] disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                请选择聊天对象
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 