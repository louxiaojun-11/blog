import { ArrowLeft, Trash2 } from 'lucide-react'

export default function ImagePage() {
  const handleDelete = async (fileId: number) => {
    if (!confirm('确定要删除这张图片吗？')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/cloud/deleteFile/${fileId}`, {
        method: 'DELETE',
        headers: {
          'token': sessionStorage.getItem('token') || ''
        }
      })

      if (response.ok) {
        // 重新获取图片列表
        fetchImageList()
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除图片失败:', error)
      alert('删除失败，请重试')
    }
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">我的图片</h1>
          <button
            onClick={() => router.push('/cloud')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            返回云盘
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : imageList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无图片文件</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageList.map((image) => (
                <div key={image.fileId} className="relative group">
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(image.fileId)}
                      className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-500 text-white rounded-full flex items-center gap-1 hover:bg-red-600 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 truncate">{image.fileName}</p>
                  <p className="text-xs text-gray-400">{formatDate(image.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* ... existing pagination code ... */}
        </div>
      </div>
    </MainLayout>
  )
} 