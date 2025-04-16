'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/adminApi'
import { Loader2, Search, Plus, X, Trash2 } from 'lucide-react'

interface SensitiveWord {
  id: number
  word: string
}

interface WordsResponse {
  success: boolean
  data: {
    total: number
    records: SensitiveWord[]
  }
  message: string
}

export default function SensitiveWordsPage() {
  const [loading, setLoading] = useState(false)
  const [words, setWords] = useState<SensitiveWord[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWord, setNewWord] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchWords()
  }, [currentPage, pageSize, searchKeyword])

  const fetchWords = async () => {
    try {
      setLoading(true)
      const response: WordsResponse = await adminService.listWords(currentPage, pageSize, searchKeyword)
      if (response.success) {
        setWords(response.data.records)
        setTotal(response.data.total)
      } else {
        console.error('Failed to fetch sensitive words:', response.message)
      }
    } catch (error) {
      console.error('Error fetching sensitive words:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getPageNumbers = () => {
    const totalPages = Math.ceil(total / pageSize)
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchKeyword(keyword)
    setCurrentPage(1)
  }

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWord.trim()) {
      alert('请输入敏感词')
      return
    }

    try {
      setAddLoading(true)
      const response = await adminService.addWord(newWord.trim())
      if (response.success) {
        alert('添加成功')
        setNewWord('')
        setShowAddModal(false)
        fetchWords() // 刷新列表
      } else {
        alert(response.message || '添加失败')
      }
    } catch (error) {
      console.error('Error adding word:', error)
      alert('添加失败，请重试')
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteWord = async (id: number) => {
    if (!confirm('确定要删除这个敏感词吗？')) {
      return
    }

    try {
      setDeleteLoading(id)
      const response = await adminService.deleteWord(id)
      if (response.success) {
        alert('删除成功')
        fetchWords() // 刷新列表
      } else {
        alert(response.message || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting word:', error)
      alert('删除失败，请重试')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">敏感词管理</h1>
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索敏感词..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              搜索
            </button>
          </form>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            新增敏感词
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    敏感词
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {words.map((word) => (
                  <tr key={word.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {word.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {word.word}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDeleteWord(word.id)}
                        disabled={deleteLoading === word.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deleteLoading === word.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                    ${currentPage === page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* 新增敏感词弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">新增敏感词</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddWord}>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="请输入敏感词"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {addLoading ? '提交中...' : '提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 