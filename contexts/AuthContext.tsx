'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface User {
  id: number
  account: string
  userName: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 从 sessionStorage 恢复登录状态
    const storedUser = sessionStorage.getItem('user')
    const storedToken = sessionStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  const login = (userData: User, newToken: string) => {
    setUser(userData)
    setToken(newToken)
    // 使用 sessionStorage 替代 localStorage
    sessionStorage.setItem('user', JSON.stringify(userData))
    sessionStorage.setItem('token', newToken)
    // Cookie 仍然需要设置，用于路由守卫
    Cookies.set('token', newToken)  // 不设置过期时间，关闭浏览器即失效
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    // 清除所有存储
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    Cookies.remove('token')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
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