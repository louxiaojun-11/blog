'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface User {
  userId: number
  account: string
  username: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user')
    const storedToken = sessionStorage.getItem('token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  const login = (userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    sessionStorage.setItem('user', JSON.stringify(userData))
    sessionStorage.setItem('token', userToken)
    Cookies.set('token', userToken)

    // 登录成功后建立WebSocket连接
    // 注意：真正的连接逻辑会在WebSocketContext中执行
    // 这里我们只需要确保用户状态已更新
    console.log('用户登录成功，即将建立WebSocket连接')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    Cookies.remove('token')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 