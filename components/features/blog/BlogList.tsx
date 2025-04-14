'use client'

import { useState, useEffect } from 'react'
import { BlogPost } from '@/types/api'
import { blogService, userService } from '@/services/api'
import Image from 'next/image'
import { MessageCircle, Heart, Share, Eye, Trash2, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import SuccessMessage from '@/components/common/SuccessMessage'
import CommentList from '@/components/features/blog/CommentList'
import { useRouter } from 'next/navigation'

interface BlogListProps {
  userId?: number;
  blogList?: BlogPost[];
  isPersonal?: boolean;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  currentPage?: number;
  currentPageSize?: number;
}

export default function BlogList({ 
  userId, 
  blogList: initialBlogList, 
  isPersonal = false,
  total,
  onPageChange,
  onPageSizeChange,
  currentPage,
  currentPageSize
}: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedBlogs, setExpandedBlogs] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState<number | null>(null)
  const { user } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  
  // Add pagination states
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Add like related states
  const [liking, setLiking] = useState<number | null>(null)
  const [showLikeConfirm, setShowLikeConfirm] = useState(false)
  const [blogToUnlike, setBlogToUnlike] = useState<number | null>(null)

  // Add a state to mark the action type
  const [successAction, setSuccessAction] = useState<'like' | 'unlike' | 'delete' | null>(null)

  // Add new states
  const [showComments, setShowComments] = useState(false)
  const [currentBlogId, setCurrentBlogId] = useState<number | null>(null)

  useEffect(() => {
    if (initialBlogList) {
      setBlogs(initialBlogList)
      setTotalItems(total || initialBlogList.length)
      setTotalPages(Math.ceil((total || initialBlogList.length) / (currentPageSize || pageSize)))
      setLoading(false)
      return
    }

    const loadBlogs = async () => {
      if (!userId && !user?.userId) return
      
      try {
        setLoading(true)
        const response = await blogService.getUserBlogs({
          userId: userId || user?.userId,
          page: currentPage || page,
          pageSize: currentPageSize || pageSize
        })
        
        if (response.success) {
          setBlogs(response.data.records)
          setTotalItems(response.data.total)
          setTotalPages(Math.ceil(response.data.total / (currentPageSize || pageSize)))
        }
      } catch (error) {
        console.error('Failed to load blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [userId, initialBlogList, user?.userId, currentPage, currentPageSize, page, pageSize, total])

  // Add pagination handlers
  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage)
    } else {
      setPage(newPage)
      if (!initialBlogList) {
        loadBlogs(newPage, currentPageSize || pageSize)
      }
    }
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value)
    if (onPageSizeChange) {
      onPageSizeChange(event)
    } else {
      setPageSize(newPageSize)
      setPage(1)
      if (!initialBlogList) {
        loadBlogs(1, newPageSize)
      }
    }
  }

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i)
        }
      } else if (page >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        for (let i = page - 2; i <= page + 2; i++) {
          pageNumbers.push(i)
        }
      }
    }

    return pageNumbers
  }

  // Render pagination controls
  const renderPagination = () => {
    const currentTotalPages = Math.ceil(totalItems / (currentPageSize || pageSize))
    const currentPageNum = currentPage || page

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">每页显示：</span>
          <select
            value={currentPageSize || pageSize}
            onChange={handlePageSizeChange}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="5">5条</option>
            <option value="10">10条</option>
            <option value="20">20条</option>
            <option value="50">50条</option>
          </select>
          <span className="text-sm text-gray-600">
            共 {totalItems} 条记录，{currentTotalPages} 页
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPageNum === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            首页
          </button>
          <button
            onClick={() => handlePageChange(currentPageNum - 1)}
            disabled={currentPageNum === 1}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            上一页
          </button>
          
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded border ${
                pageNum === currentPageNum
                  ? 'bg-[#FF8200] text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={currentPageNum === currentTotalPages}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
          <button
            onClick={() => handlePageChange(currentTotalPages)}
            disabled={currentPageNum === currentTotalPages}
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            末页
          </button>
        </div>
      </div>
    )
  }

  const toggleExpand = (blogId: number) => {
    setExpandedBlogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blogId)) {
        newSet.delete(blogId)
      } else {
        newSet.add(blogId)
      }
      return newSet
    })
  }

  const handleDeleteClick = (blogId: number) => {
    setBlogToDelete(blogId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return
    
    try {
      setDeleting(blogToDelete)
      const response = await blogService.deleteBlog(blogToDelete)
      if (response.success) {
        setBlogs(blogs.filter(blog => blog.id !== blogToDelete))
        setShowDeleteConfirm(false)
        setSuccessAction('delete')
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setSuccessAction(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to delete blog:', error)
      alert('删除失败，请重试')
    } finally {
      setDeleting(null)
      setBlogToDelete(null)
    }
  }

  // Add loading blogs helper
  const loadBlogs = async (pageNum: number, pageSizeNum: number) => {
    if (!userId && !user?.userId) return
    
    try {
      setLoading(true)
      const response = await blogService.getUserBlogs({
        userId: userId || user?.userId,
        page: pageNum,
        pageSize: pageSizeNum
      })
      
      if (response.success) {
        setBlogs(response.data.records)
        setTotalItems(response.data.total)
        setTotalPages(Math.ceil(response.data.total / pageSizeNum))
      }
    } catch (error) {
      console.error('Failed to load blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle like click
  const handleLikeClick = async (blogId: number) => {
    if (!user?.userId) {
      alert('请先登录');
      return;
    }

    try {
      setLiking(blogId);
      const response = await blogService.clickLike(user.userId, blogId);
      
      if (response.success) {
        if (response.data === 0) {
          // 点赞成功
          setSuccessAction('like');
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setSuccessAction(null);
          }, 3000);
          // 更新博文列表中的点赞数
          setBlogs(blogs.map(blog => 
            blog.id === blogId 
              ? { ...blog, likes: blog.likes + 1 }
              : blog
          ));
        } else if (response.data === 1) {
          // 已经点过赞,询问是否取消
          setBlogToUnlike(blogId);
          setShowLikeConfirm(true);
        }
      }
    } catch (error) {
      console.error('Failed to like blog:', error);
      alert('点赞失败，请重试');
    } finally {
      setLiking(null);
    }
  };

  // Handle unlike click
  const handleConfirmUnlike = async () => {
    if (!user?.userId || !blogToUnlike) return;
    
    try {
      setLiking(blogToUnlike);
      const response = await blogService.removeLike(user.userId, blogToUnlike);
      
      if (response.success) {
        setShowLikeConfirm(false);
        setSuccessAction('unlike');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessAction(null);
        }, 3000);
        // 更新博文列表中的点赞数
        setBlogs(blogs.map(blog => 
          blog.id === blogToUnlike 
            ? { ...blog, likes: blog.likes - 1 }
            : blog
        ));
      }
    } catch (error) {
      console.error('Failed to unlike blog:', error);
      alert('取消点赞失败，请重试');
    } finally {
      setLiking(null);
      setBlogToUnlike(null);
    }
  };

  // 处理点击作者头像的事件
  const handleAuthorClick = (userId: number) => {
    router.push(`/relation/profile?userId=${userId}`);
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!blogs || blogs.length === 0) {
    if (isPersonal) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-6"
          >
            <circle cx="100" cy="100" r="50" fill="#FFB6C1" />
            <circle cx="100" cy="105" r="10" fill="#FF69B4" />
            <circle cx="85" cy="90" r="5" fill="#000" />
            <circle cx="115" cy="90" r="5" fill="#000" />
            <path d="M70 60 Q80 40 90 60" stroke="#FFB6C1" strokeWidth="8" />
            <path d="M130 60 Q120 40 110 60" stroke="#FFB6C1" strokeWidth="8" />
            <rect x="140" y="80" width="40" height="50" fill="#FFF" stroke="#000" strokeWidth="2" />
            <line x1="150" y1="90" x2="170" y2="90" stroke="#000" strokeWidth="2" />
            <line x1="150" y1="100" x2="170" y2="100" stroke="#000" strokeWidth="2" />
            <line x1="150" y1="110" x2="170" y2="110" stroke="#000" strokeWidth="2" />
            <path d="M130 110 Q140 110 145 100" stroke="#FFB6C1" strokeWidth="8" />
          </svg>
          <p className="text-lg font-medium mb-2">这里什么都没有，快去写博文吧！</p>
          <p className="text-sm">点击左侧菜单的"写博文"开始创作</p>
        </div>
      )
    }
    return <div className="text-center py-8 text-gray-500">还没有发布任何博文</div>
  }

  return (
    <>
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow-lg flex items-center gap-2 z-50">
          <div className="bg-green-100 rounded-full p-1">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-green-800">
            {successAction === 'unlike' ? '取消点赞成功！' : 
             successAction === 'like' ? '点赞成功！' : 
             '删除成功！'}
          </span>
        </div>
      )}

      <div>
        {blogs.map((blog) => {
          const isExpanded = expandedBlogs.has(blog.id)
          const needsExpansion = blog.content.length > 100
          const authorAvatar = isPersonal 
            ? (user?.avatar || '/default-avatar.png')
            : (blog.author?.avatar || '/default-avatar.png')
          const authorName = isPersonal
            ? (user?.username || '未知用户')
            : (blog.author?.username || '未知用户')
          // 获取作者ID，优先使用博文的 userId 字段
          const authorId = isPersonal
            ? user?.userId
            : blog.userId  // 直接使用博文的 userId 字段
          
          // 判断博文是否为当前用户所写
          const isCurrentUserBlog = user?.userId === authorId

          return (
            <article 
              key={blog.id} 
              className="mb-4 bg-white rounded-lg shadow p-4"
            >
              <h3 className="text-lg font-bold mb-2">
                {blog.title}
                {isCurrentUserBlog && (
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    (我的博文)
                  </span>
                )}
              </h3>
              <div className="relative">
                <p className={`text-gray-600 mb-2 whitespace-pre-wrap break-words ${!isExpanded && needsExpansion ? 'line-clamp-2' : ''}`}>
                  {blog.content}
                </p>
                {needsExpansion && (
                  <button
                    onClick={() => toggleExpand(blog.id)}
                    className="text-[#FF8200] hover:text-[#ff9933]"
                  >
                    {isExpanded ? '收起' : '展开全文'}
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {isCurrentUserBlog ? (
                    // 当前用户自己的博文，头像不可点击
                    <div className="cursor-default">
                      <Image
                        src={authorAvatar}
                        alt={authorName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    // 他人的博文，头像可点击
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleAuthorClick(authorId)}
                    >
                      <Image
                        src={authorAvatar}
                        alt={authorName}
                        width={24}
                        height={24}
                        className="rounded-full hover:opacity-80 transition-opacity"
                      />
                    </div>
                  )}
                  {isCurrentUserBlog ? (
                    // 当前用户自己的博文，用户名不可点击
                    <span className="text-gray-600">{authorName}</span>
                  ) : (
                    // 他人的博文，用户名可点击
                    <span 
                      className="text-gray-600 cursor-pointer hover:text-[#FF8200]"
                      onClick={() => handleAuthorClick(authorId)}
                    >
                      {authorName}
                    </span>
                  )}
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-400">{blog.createdAt}</span>
                </div>
                <div className="flex gap-6 text-gray-500">
                  <span className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    <span>{blog.views || 0}</span>
                  </span>
                  <button
                    onClick={() => handleLikeClick(blog.id)}
                    disabled={liking === blog.id}
                    className="flex items-center gap-2 hover:text-[#FF8200]"
                  >
                    <Heart className="h-5 w-5" />
                    <span>{blog.likes}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentBlogId(blog.id)
                      setShowComments(true)
                    }}
                    className="flex items-center gap-2 hover:text-[#FF8200]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{blog.comments || 0}</span>
                  </button>
                  {isPersonal && (
                    <button
                      onClick={() => handleDeleteClick(blog.id)}
                      disabled={deleting === blog.id}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>{deleting === blog.id ? '删除中...' : '删除'}</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Add pagination controls */}
      {blogs && blogs.length > 0 && renderPagination()}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除博文"
        message="确定要删除这篇博文吗？此操作不可撤销。"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setBlogToDelete(null)
        }}
      />

      {/* Like confirmation dialog */}
      <ConfirmDialog
        isOpen={showLikeConfirm}
        title="取消点赞"
        message="是否取消对该条博文的点赞?"
        onConfirm={handleConfirmUnlike}
        onCancel={() => {
          setShowLikeConfirm(false);
          setBlogToUnlike(null);
        }}
      />

      {/* Comment list */}
      {showComments && currentBlogId && (
        <CommentList
          blogId={currentBlogId}
          isOpen={showComments}
          onClose={() => {
            setShowComments(false)
            setCurrentBlogId(null)
          }}
          onCommentSuccess={() => {
            // 更新博文的评论数
            setBlogs(blogs.map(blog => 
              blog.id === currentBlogId
                ? { ...blog, comments: (blog.comments || 0) + 1 }
                : blog
            ))
          }}
        />
      )}
    </>
  )
} 