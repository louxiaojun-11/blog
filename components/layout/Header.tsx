'use client'

import { Search, Home, Video, MessageCircle, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/services/api'
import { useSearchContext } from '@/contexts/SearchContext'

export default function Header() {
  const [searchType, setSearchType] = useState<'blog' | 'user'>('blog')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('')
  const { setSearchResults, setIsSearching } = useSearchContext()

  // 点击页面其他地方时关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      router.push('/login');
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    // 构建搜索URL
    const searchParams = new URLSearchParams({
      content: searchQuery,
      type: searchType
    })
    
    // 跳转到搜索结果页
    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="container max-w-7xl mx-auto h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Image 
            src="/next.svg" 
            alt="Logo" 
            width={100} 
            height={30}
            className="dark:invert"
          />
          <div className="relative">
            <div className="flex items-center relative">
              <button
                type="button"
                onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                className="absolute left-3 top-2.5 flex items-center gap-1 text-gray-400 hover:text-gray-600 z-10"
              >
                <Search className="h-5 w-5" />
                <span className="text-sm">{searchType === 'blog' ? '博文' : '用户'}</span>
                <span className="text-xs ml-1">▼</span>
              </button>
              <div className="flex items-center">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchType === 'blog' ? '搜索博文...' : '搜索用户...'}
                  className="pl-24 pr-4 py-2 rounded-l-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF8200] w-[300px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
                <button 
                  onClick={handleSearch}
                  className="px-4 py-2 bg-[#FF8200] text-white rounded-r-full hover:bg-[#ff9933]"
                >
                  搜索
                </button>
              </div>

              {/* 搜索类型下拉框 */}
              {showSearchDropdown && (
                <div className="absolute top-full left-3 mt-1 bg-white rounded-lg shadow-lg py-2 w-20">
                  <button
                    onClick={() => {
                      setSearchType('blog')
                      setShowSearchDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    博文
                  </button>
                  <button
                    onClick={() => {
                      setSearchType('user')
                      setShowSearchDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    用户
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-[#FF8200]">
            <Home className="h-6 w-6" />
          </Link>
          <Link href="/video" className="hover:text-[#FF8200]">
            <Video className="h-6 w-6" />
          </Link>
          <Link href="/messages" className="hover:text-[#FF8200]">
            <MessageCircle className="h-6 w-6" />
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="hover:text-[#FF8200] rounded-full overflow-hidden"
            >
              <Image
                src={user?.avatar || `https://picsum.photos/32/32?random=1`}
                alt={user?.username || 'User Avatar'}
                width={32}
                height={32}
                className="rounded-full"
              />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  <span>个人主页</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-500 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
} 