import { useState } from 'react'
import { PALACE_QUICK } from './palaceQuick'
import type { PalaceQuick as P } from './palaceQuick'

const GOOD_BAD_STYLE = {
  good: 'bg-[#fdf8e8] text-[#b8860b] border-[#b8860b]',
  bad: 'bg-[#fdf0ee] text-[#c0392b] border-[#c0392b]',
}

export function PalaceQuickPanel() {
  const [selected, setSelected] = useState('命宫')
  const cur: P | undefined = PALACE_QUICK.find((p) => p.name === selected)

  return (
    <div className="space-y-4">
      {/* 宫位选择 */}
      <div className="flex flex-wrap gap-1.5">
        {PALACE_QUICK.map((p) => (
          <button
            key={p.name}
            onClick={() => setSelected(p.name)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              selected === p.name
                ? 'bg-[#c0392b] text-white'
                : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {cur && (
        <div className="space-y-3">
          {/* 主事 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-[#2c2416]">{cur.name}</h4>
              <span className="text-xs text-[#9a8b75] bg-[#f5f0e8] px-2 py-1 rounded">
                核心看星：{cur.key}
              </span>
            </div>
            <p className="text-sm text-[#2c2416] font-medium">{cur.meaning}</p>
            <p className="text-xs text-[#5c4d3d] mt-1">{cur.detail}</p>
          </div>

          {/* 三方四正 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#9a8b75]">三方四正：</span>
              <span className="px-2.5 py-1 bg-[#fdf0ee] text-[#c0392b] rounded border border-[#e8dcc8] font-medium">
                {cur.name}
              </span>
              <span className="text-[#9a8b75]">三合</span>
              {cur.triads.map((t) => (
                <span key={t} className="px-2.5 py-1 bg-[#fdf8e8] text-[#b8860b] rounded border border-[#e8dcc8]">
                  {t}
                </span>
              ))}
              <span className="text-[#9a8b75]">对宫</span>
              <span className="px-2.5 py-1 bg-[#f0ede6] text-[#5c4d3d] rounded border border-[#e8dcc8]">
                {cur.opposite}
              </span>
            </div>
          </div>

          {/* 宜忌星 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#e8dcc8] rounded-lg p-3">
              <div className="text-sm font-bold text-[#b8860b] mb-2">宜见之星</div>
              <div className="flex flex-wrap gap-1.5">
                {cur.goodStars.map((s) => (
                  <span key={s} className={`text-xs px-2 py-1 rounded border ${GOOD_BAD_STYLE.good}`}>{s}</span>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#e8dcc8] rounded-lg p-3">
              <div className="text-sm font-bold text-[#c0392b] mb-2">忌见之星</div>
              <div className="flex flex-wrap gap-1.5">
                {cur.badStars.map((s) => (
                  <span key={s} className={`text-xs px-2 py-1 rounded border ${GOOD_BAD_STYLE.bad}`}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 大限提示 */}
          <div className="bg-[#fdfaf3] border border-[#f0e7d8] rounded-lg p-3">
            <div className="text-xs text-[#9a8b75] mb-1">大限至此</div>
            <p className="text-sm text-[#5c4d3d] leading-relaxed">{cur.decadalHint}</p>
          </div>

          <p className="text-xs text-[#b8a98f]">
            提示：宜忌星为通用断语，实际读盘还需结合星曜庙陷、四化与三方四正同参；可用真实命例验证。
          </p>
        </div>
      )}
    </div>
  )
}
