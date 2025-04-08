'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { authService } from '@/services/api'
import { adminService } from '@/services/adminApi'
import { Check } from 'lucide-react'

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
        console.log('Admin login response:', response) // 添加调试日志
        if (response.success) {
          const { data } = response
          console.log('Admin data:', data) // 添加调试日志
          adminLogin({
            adminId: data.adminId,
            account: data.account,
            adminName: data.adminName,
            avatar: data.avatar
          }, data.token)
          router.push('/admin/dashboard')
          return // 添加return确保函数在此处结束
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
          return // 添加return确保函数在此处结束
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
          <div className="bg-green-100 rounded-full p-1">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-green-800">注册成功！</span>
        </div>
      )}

      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isLogin ? '登录' : '注册'}
          </h2>
        </div>

        {error && (
          <div className="text-red-500 text-center text-sm">{error}</div>
        )}

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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FF8200] hover:bg-[#ff9933] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] disabled:opacity-50"
            >
              {loading ? '登录中...' : isAdminLogin ? '管理员登录' : '登录'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={switchMode}
            className="text-[#FF8200] hover:text-[#ff9933]"
          >
            {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </div>
      </div>
    </div>
  )
} 