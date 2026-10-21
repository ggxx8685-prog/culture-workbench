import { useState } from 'react'
import { STAR_COMBOS, COMBO_MAIN_STARS } from './starCombo'

export function StarComboPanel() {
  const [selectedStar, setSelectedStar] = useState<string | null>(null)

  const list = selectedStar
    ? STAR_COMBOS.filter((c) => c.tags.includes(selectedStar))
    : STAR_COMBOS

  return (
    <div className="space-y-4">
      {/* 主星筛选 */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedStar(null)}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            !selectedStar ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'
          }`}
        >
          全部
        </button>
        {COMBO_MAIN_STARS.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStar(selectedStar === s ? null : s)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              selectedStar === s ? 'bg-[#b8860b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 组合卡 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((c) => (
          <div key={c.id} className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-base font-bold text-[#2c2416]">
                {c.combo} <span className="text-sm text-[#9a8b75] font-normal">· {c.name}</span>
              </h5>
              <span className="text-[11px] text-[#b8a98f] bg-[#f5f0e8] px-2 py-0.5 rounded">
                {c.palace}
              </span>
            </div>
            <p className="text-sm font-medium text-[#c0392b] mb-1.5">{c.summary}</p>
            <p className="text-xs text-[#5c4d3d] leading-relaxed">{c.detail}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {c.tags.map((t) => (
                <span key={t} className="text-[11px] px-1.5 py-0.5 rounded border border-[#e8dcc8] bg-[#fdfaf3] text-[#9a8b75]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#b8a98f]">
        提示：组合断语为传统命理通用内容，实际读盘需结合庙陷、四化与三方四正；宫位为常见同宫位置，"视盘而定"者需看实际安星。
      </p>
    </div>
  )
}
