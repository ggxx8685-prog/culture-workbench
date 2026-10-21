import { useState } from 'react'

interface HoroscopeToolbarProps {
  birthYear: number
  onYearChange: (year: number | null) => void
}

export function HoroscopeToolbar({ birthYear, onYearChange }: HoroscopeToolbarProps) {
  const [mode, setMode] = useState<'natal' | 'horoscope'>('natal')
  const [year, setYear] = useState(new Date().getFullYear())

  const handleModeChange = (newMode: 'natal' | 'horoscope') => {
    setMode(newMode)
    if (newMode === 'natal') {
      onYearChange(null)
    } else {
      onYearChange(year)
    }
  }

  const handleYearChange = (newYear: number) => {
    setYear(newYear)
    onYearChange(newYear)
  }

  const age = year - birthYear

  return (
    <div className="flex items-center justify-between mb-3 px-1">
      {/* 模式切换 */}
      <div className="flex gap-1 bg-[#e8dcc8] rounded-md p-0.5">
        <button
          onClick={() => handleModeChange('natal')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            mode === 'natal'
              ? 'bg-white text-[#c0392b] font-medium shadow-sm'
              : 'text-[#5c4d3d] hover:text-[#2c2416]'
          }`}
        >
          原局
        </button>
        <button
          onClick={() => handleModeChange('horoscope')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            mode === 'horoscope'
              ? 'bg-white text-[#c0392b] font-medium shadow-sm'
              : 'text-[#5c4d3d] hover:text-[#2c2416]'
          }`}
        >
          流年
        </button>
      </div>

      {/* 年份选择（流年模式下显示） */}
      {mode === 'horoscope' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleYearChange(year - 1)}
            className="w-7 h-7 rounded bg-[#fdfaf3] border border-[#d4c9b8] hover:bg-[#f5efe0] text-[#5c4d3d]"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="w-20 px-2 py-1 text-sm border border-[#d4c9b8] rounded text-center bg-[#fdfaf3] focus:outline-none focus:border-[#c0392b]"
            />
            <span className="text-sm text-[#5c4d3d]">年</span>
            <span className="text-sm text-[#9a8b75] ml-2">({age}岁)</span>
          </div>
          <button
            onClick={() => handleYearChange(year + 1)}
            className="w-7 h-7 rounded bg-[#fdfaf3] border border-[#d4c9b8] hover:bg-[#f5efe0] text-[#5c4d3d]"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
