'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { authService } from '@/services/api'
import { adminService } from '@/services/adminApi'
import { Check } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const { login: adminLogin } = useAdminAuth()

  // 注册表单状态
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [introduce, setIntroduce] = useState('')
  const [registering, setRegistering] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response;
      if (isAdminLogin) {
        response = await adminService.login(account, password)
        console.log('Admin login response:', response)
        if (response.success) {
          const { data } = response
          console.log('Admin data:', data)
          adminLogin({
            adminId: data.adminId,
            account: data.account,
            adminName: data.adminName,
            avatar: data.avatar
          }, data.token)
          router.push('/admin/dashboard')
          return
        }
      } else {
        response = await authService.login(account, password)
        if (response.success) {
          const { data } = response
          login({
            userId: data.userId,
            account: data.account,
            username: data.username,
            avatar: data.avatar
          }, data.token)
          router.push('/')
          return
        }
      }
      
      if (!response.success) {
        setError(response.message || '登录失败')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || '登录时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !account.trim() || !password || !confirmPassword) {
      setError('请填写所有必填项')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    try {
      setLoading(true)
      const response = await authService.register({
        username: username.trim(),
        account: account.trim(),
        password,
        introduce: introduce.trim()
      })

      if (response.success) {
        setShowSuccess(true)
        // 2秒后切换到登录界面
        setTimeout(() => {
          setShowSuccess(false)
          setIsLogin(true)
          // 清空表单
          setUsername('')
          setAccount('')
          setPassword('')
          setConfirmPassword('')
          setIntroduce('')
        }, 2000)
      } else {
        setError(response.message || '注册失败')
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    // 清空所有表单数据
    setAccount('')
    setPassword('')
    setUsername('')
    setConfirmPassword('')
    setIntroduce('')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
          <div className="bg-green-100 rounded-full p-1">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-green-800">注册成功！</span>
        </div>
      )}

      <div className="max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold text-gray-700 italic text-center mb-8">
          写下你想写的一切吧
          <br></br>
        </h1>

        <div className="w-full p-8 bg-white rounded-lg shadow-xl">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              {isLogin ? '登录' : '注册'}
            </h2>
          </div>

          {error && (
            <div className="text-red-500 text-center text-sm mt-4">{error}</div>
          )}

          {isLogin ? (
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="account" className="sr-only">账号</label>
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
                  <label htmlFor="password" className="sr-only">密码</label>
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

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsAdminLogin(!isAdminLogin)}
                  className="text-sm text-[#FF8200] hover:text-[#ff9933]"
                >
                  {isAdminLogin ? '切换到用户登录' : '切换到管理员登录'}
                </button>
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-[#FF8200] hover:text-[#ff9933]"
                >
                  还没有账号？立即注册
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF8200] hover:bg-[#ff9933] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] disabled:opacity-50"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleRegister}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="sr-only">用户名</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200]"
                    placeholder="用户名"
                  />
                </div>
                <div>
                  <label htmlFor="register-account" className="sr-only">账号</label>
                  <input
                    id="register-account"
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
                  <label htmlFor="register-password" className="sr-only">密码</label>
                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200]"
                    placeholder="密码"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">确认密码</label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200]"
                    placeholder="确认密码"
                  />
                </div>
                <div>
                  <label htmlFor="introduce" className="sr-only">个人简介</label>
                  <textarea
                    id="introduce"
                    name="introduce"
                    value={introduce}
                    onChange={(e) => setIntroduce(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200]"
                    placeholder="个人简介（选填）"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-[#FF8200] hover:text-[#ff9933]"
                >
                  已有账号？立即登录
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF8200] hover:bg-[#ff9933] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] disabled:opacity-50"
                >
                  {loading ? '注册中...' : '注册'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 