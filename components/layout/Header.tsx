'use client'

import { Search, Home, Video, MessageCircle, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout, user } = useAuth();

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
            <input
              type="search"
              placeholder="搜索"
              className="pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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