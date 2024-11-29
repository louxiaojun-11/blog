'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/api'

export default function LoginPage() {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Starting login process...');
      const response = await authService.login(account, password)
      console.log('Login response:', response)
      
      if (response.success) {
        console.log('Login successful, data:', response.data)
        const { data } = response
        const userData = {
          id: data.id,
          account: data.account,
          userName: data.userName
        }
        console.log('Processed user data:', userData)
        login(userData, data.token)
        console.log('Login context updated, redirecting...')
        router.push('/')
      } else {
        console.log('Login failed:', response.message)
        setError(response.message || '登录失败')
      }
    } catch (err: any) {
      console.error('Login error details:', err)
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        })
      }
      setError(err.response?.data?.message || '登录时发生错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">登录</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="account" className="sr-only">
                账号
              </label>
              <input
                id="account"
                name="account"
                type="text"
                required
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200]"
                placeholder="账号"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200]"
                placeholder="密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FF8200] hover:bg-[#ff9933] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 