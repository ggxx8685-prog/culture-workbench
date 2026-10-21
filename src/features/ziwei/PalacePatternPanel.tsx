import { useState } from 'react'
import { detectPatterns } from './palacePatterns'
import type { PalacePattern } from './palacePatterns'

const RESULT_STYLE: Record<string, string> = {
  吉: 'bg-[#c0392b] text-white',
  凶: 'bg-[#4a5568] text-white',
  中性: 'bg-[#b8860b] text-white',
}

export function PalacePatternPanel({ chartData }: { chartData: any }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!chartData) return null
  const patterns = detectPatterns(chartData)

  return (
    <div className="bg-white rounded-lg border border-[#d4c9b8] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#f8f4ea] hover:bg-[#f5efe0] transition-colors"
      >
        <span className="text-sm font-bold text-[#2c2416]">
          🏛 命盘格局识别
          <span className="ml-2 text-xs font-normal text-[#9a8b75]">
            {patterns.length > 0
              ? `命中 ${patterns.length} 个经典格局`
              : '未命中典型格局（多为主星平淡组合）'}
          </span>
        </span>
        <span className="text-xs text-[#9a8b75]">{open ? '▴ 收起' : '▾ 展开'}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#9a8b75] leading-relaxed">
            按经典格局条件自动匹配当前命盘（参考三合派说法，供研习验证；吉凶需结合庙陷、四化与三方四正综合判断）。
          </p>

          {patterns.length === 0 ? (
            <div className="text-sm text-[#5c4d3d] py-4 text-center border border-dashed border-[#e8dcc8] rounded-lg">
              暂未检测到典型格局。命盘由主星平淡分布、辅星煞星较少组合而成，属"平常之格"——
              断盘时更应重视四化流转、大限流年与各宫星曜庙陷的强弱。
            </div>
          ) : (
            patterns.map((p: PalacePattern) => (
              <div key={p.id} className="border border-[#e8dcc8] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  className="w-full px-3 py-2.5 flex items-center justify-between bg-[#fdfaf3] hover:bg-[#f5efe0] text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${RESULT_STYLE[p.result]}`}>
                      {p.result}格
                    </span>
                    <span className="text-sm font-bold text-[#2c2416]">{p.name}</span>
                  </span>
                  <span className="text-xs text-[#9a8b75]">{expanded === p.id ? '▴' : '▾'}</span>
                </button>
                {expanded === p.id && (
                  <div className="px-3 py-3 bg-white space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <span className="w-10 shrink-0 text-[#9a8b75] font-medium">组成</span>
                      <span className="text-[#c0392b]">{p.condition}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs leading-relaxed">
                      <span className="w-10 shrink-0 text-[#9a8b75] font-medium">详解</span>
                      <span className="text-[#5c4d3d]">{p.desc}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
