import { useState, useEffect } from 'react'

export interface SavedChart {
  id: string
  name: string
  date: string
  timeIndex: number
  gender: '男' | '女'
  savedAt: string
}

const STORAGE_KEY = 'ziwei_saved_charts'

// 读取已保存的盘
export function loadSavedCharts(): SavedChart[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// 保存盘到列表
export function saveChart(chart: Omit<SavedChart, 'id' | 'savedAt'>): SavedChart[] {
  const charts = loadSavedCharts()
  const newChart: SavedChart = {
    ...chart,
    id: Date.now().toString(),
    savedAt: new Date().toLocaleString('zh-CN'),
  }
  charts.unshift(newChart)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts))
  return charts
}

// 删除盘
export function deleteChart(id: string): SavedChart[] {
  const charts = loadSavedCharts().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts))
  return charts
}

interface SavedChartsPanelProps {
  currentChart: { date: string; timeIndex: number; gender: string } | null
  onLoadChart: (chart: SavedChart) => void
}

export function SavedChartsPanel({ currentChart, onLoadChart }: SavedChartsPanelProps) {
  const [charts, setCharts] = useState<SavedChart[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setCharts(loadSavedCharts())
  }, [])

  const handleSave = () => {
    if (!currentChart) return
    const name = prompt('给这个盘起个名字：')
    if (!name) return
    const updated = saveChart({
      name,
      date: currentChart.date,
      timeIndex: currentChart.timeIndex,
      gender: currentChart.gender as '男' | '女',
    })
    setCharts(updated)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定删除这个盘吗？')) return
    const updated = deleteChart(id)
    setCharts(updated)
  }

  const handleLoad = (chart: SavedChart) => {
    setActiveId(chart.id)
    onLoadChart(chart)
  }

  return (
    <div className="bg-white rounded-lg border border-[#d4c9b8] p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#2c2416]">我的命盘档案</h3>
        <button
          onClick={handleSave}
          disabled={!currentChart}
          className="text-xs px-2 py-1 bg-[#c0392b] text-white rounded hover:bg-[#a93226] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + 保存当前盘
        </button>
      </div>

      {charts.length === 0 ? (
        <div className="text-xs text-[#9a8b75] text-center py-4">
          还没有保存的盘<br />排盘后点"保存当前盘"试试
        </div>
      ) : (
        <ul className="space-y-1.5">
          {charts.map((chart) => (
            <li
              key={chart.id}
              onClick={() => handleLoad(chart)}
              className={`px-3 py-2 rounded cursor-pointer text-sm flex items-center justify-between group ${
                activeId === chart.id
                  ? 'bg-[#fdf0ee] border border-[#c0392b]'
                  : 'bg-[#fdfaf3] border border-[#e8dcc8] hover:bg-[#f5efe0]'
              }`}
            >
              <div className="min-w-0">
                <div className="font-medium text-[#2c2416] truncate">{chart.name}</div>
                <div className="text-xs text-[#9a8b75]">
                  {chart.date} · {chart.gender}
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(chart.id, e)}
                className="text-xs text-[#b8a98f] opacity-0 group-hover:opacity-100 hover:text-[#c0392b] ml-2"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
