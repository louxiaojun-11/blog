'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface WebSocketContextType {
  socket: WebSocket | null;
  connect: (userId: number) => void;
  disconnect: () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  // 用户状态变化时，自动处理连接
  useEffect(() => {
    // 当用户登出时，断开WebSocket连接
    if (!user && socket) {
      disconnect()
    }
    
    // 页面卸载时清理连接
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [user])

  // 建立WebSocket连接
  const connect = (userId: number) => {
    if (socket) {
      socket.close()
    }

    try {
      const ws = new WebSocket(`ws://localhost:8080/chat/${userId}`)
      
      ws.onopen = () => {
        console.log('WebSocket连接已建立')
        setIsConnected(true)
      }
      
      ws.onmessage = (event) => {
        console.log('收到消息:', event.data)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
      }
      
      ws.onclose = () => {
        console.log('WebSocket连接已关闭')
        setIsConnected(false)
        setSocket(null)
      }
      
      setSocket(ws)
    } catch (error) {
      console.error('建立WebSocket连接失败:', error)
    }
  }
  
  // 断开WebSocket连接
  const disconnect = () => {
    if (socket) {
      try {
        socket.close()
      } catch (error) {
        console.error('关闭WebSocket连接时出错:', error)
      }
      setSocket(null)
      setIsConnected(false)
    }
  }

  return (
    <WebSocketContext.Provider value={{
      socket,
      connect,
      disconnect,
      isConnected
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
} 