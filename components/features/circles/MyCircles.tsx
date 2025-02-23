export default function MyCircles() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-bold mb-2">我的圈子 {i}</h3>
          <p className="text-gray-600 text-sm mb-4">这是我加入的圈子...</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">最近更新: 2小时前</span>
            <button className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
              已加入
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 