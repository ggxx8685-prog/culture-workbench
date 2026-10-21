import { useState } from 'react'
import { buildChartReading } from './chartReading'
import type { ReadingSection } from './chartReading'
import { starKnowledge } from './starKnowledge'

// 星名识别：文本开头的星名（十四主星+常见辅星煞星）
const STAR_NAMES = Object.keys(starKnowledge)
const STAR_RE = new RegExp(`^(${STAR_NAMES.join('|')})(?=属|：|:)`)

export function ChartReadingPanel({ chartData, onOpenLearnStar }: {
  chartData: any
  onOpenLearnStar?: (star: string) => void
}) {
  const [open, setOpen] = useState(false)

  if (!chartData) return null
  const sections = buildChartReading(chartData)

  // 渲染单条解读：若以星名开头，追加"查看星曜详解"按钮
  const renderItem = (item: string, key: string) => {
    const m = item.match(STAR_RE)
    const star = m ? m[1] : null
    return (
      <div key={key} className="text-xs text-[#5c4d3d] leading-relaxed bg-[#fdfaf3] border border-[#f0e7d8] rounded px-2.5 py-1.5">
        {item.split('\n').map((line, j) => <div key={j}>{line}</div>)}
        {star && onOpenLearnStar && (
          <button
            onClick={() => onOpenLearnStar(star)}
            className="mt-1 text-[11px] text-[#c0392b] hover:text-[#8c2219]"
          >
            查看{star}星曜详解 →
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-[#d4c9b8] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#f8f4ea] hover:bg-[#f5efe0] transition-colors"
      >
        <span className="text-sm font-bold text-[#2c2416]">
          📖 命盘解读
          <span className="ml-2 text-xs font-normal text-[#9a8b75]">
            性格 · 事业 · 财运 · 感情 · 健康（星曜知识规则生成，供研习参考）
          </span>
        </span>
        <span className="text-xs text-[#9a8b75]">{open ? '▴ 收起' : '▾ 展开'}</span>
      </button>

      {open && (
        <div className="p-4 space-y-4">
          <p className="text-xs text-[#9a8b75] leading-relaxed border-l-2 border-[#b8860b] pl-2">
            本解读由星曜知识库规则自动生成：先看命宫主星定性格，再看身宫、官禄、财帛、夫妻、疾厄各宫主星，
            结合四化与格局综合提示。仅供研习命理时对照验证，不可作为人生决策依据。
          </p>

          {sections.map((sec: ReadingSection) => (
            <div key={sec.title}>
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#2c2416] mb-1.5">
                <span>{sec.icon}</span>
                <span>{sec.title}</span>
              </div>
              <div className="space-y-1.5">
                {sec.items.map((item, i) => renderItem(item, `${sec.title}-${i}`))}
              </div>
            </div>
          ))}

          <div className="text-xs text-[#9a8b75] leading-relaxed border-t border-[#e8dcc8] pt-2">
            <span className="text-[#c0392b] font-medium">研习提示：</span>
            断盘讲究"星曜×宫位×四化×三方四正×庙陷"五维同参，本解读为单维提示。
            建议用真实命例验证每条判断，记录应验与不应验之处，逐步校正自己的读盘方法。
          </div>
        </div>
      )}
    </div>
  )
}
