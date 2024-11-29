'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
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
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const login = (userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    sessionStorage.setItem('user', JSON.stringify(userData))
    sessionStorage.setItem('token', userToken)
    Cookies.set('token', userToken)
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