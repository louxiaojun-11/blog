'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { Admin, AdminAuthContextType } from '@/types/admin'

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem('admin')
    const storedToken = sessionStorage.getItem('token')
    
    if (storedAdmin && storedToken) {
      setAdmin(JSON.parse(storedAdmin))
      setToken(storedToken)
    }
  }, [])

  const login = (adminData: Admin, adminToken: string) => {
    setAdmin(adminData)
    setToken(adminToken)
    sessionStorage.setItem('admin', JSON.stringify(adminData))
    sessionStorage.setItem('token', adminToken)
    Cookies.set('token', adminToken)
  }

  const logout = () => {
    setAdmin(null)
    setToken(null)
    sessionStorage.removeItem('admin')
    sessionStorage.removeItem('token')
    Cookies.remove('token')
  }

  return (
    <AdminAuthContext.Provider value={{
      admin,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
} 