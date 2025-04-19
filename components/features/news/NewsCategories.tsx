'use client'

interface NewsCategoriesProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

export default function NewsCategories({ selectedType, onTypeChange }: NewsCategoriesProps) {
  const categories = [
    '全部',
    '科技',
    '时事',
    '财经',
    '体育',
    '娱乐',
    '教育',
    '汽车',
    '时尚'
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onTypeChange(category === '全部' ? null : category)}
            className={`px-4 py-2 rounded-full transition-colors ${
              (category === '全部' && selectedType === null) || category === selectedType
                ? 'bg-[#FF8200] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
} 