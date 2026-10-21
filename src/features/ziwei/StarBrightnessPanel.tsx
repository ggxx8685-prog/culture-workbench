import { useState } from 'react'
import { extractStarBrightness, BRIGHTNESS_INFO, BRIGHTNESS_STYLE } from './starBrightness'
import type { StarBrightness } from './starBrightness'

export function StarBrightnessPanel({ chartData }: { chartData: any }) {
  const [open, setOpen] = useState(false)

  if (!chartData) return null
  const stars = extractStarBrightness(chartData)
  if (stars.length === 0) return null

  // 统计强星（庙旺得）与弱星（平陷）
  const strong = stars.filter((s) => (BRIGHTNESS_INFO[s.brightness]?.level ?? 0) >= 4)
  const weak = stars.filter((s) => (BRIGHTNESS_INFO[s.brightness]?.level ?? 0) <= 2)

  return (
    <div className="bg-white rounded-lg border border-[#d4c9b8] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#f8f4ea] hover:bg-[#f5efe0] transition-colors"
      >
        <span className="text-sm font-bold text-[#2c2416]">
          ⭐ 星曜庙陷总览
          <span className="ml-2 text-xs font-normal text-[#9a8b75]">
            十四主星亮度 · 庙旺得利平陷
          </span>
        </span>
        <span className="text-xs text-[#9a8b75]">{open ? '▴ 收起' : '▾ 展开'}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          {/* 亮度等级图例 */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(BRIGHTNESS_INFO).map(([key, info]) => (
              <span key={key} className={`text-[11px] px-2 py-0.5 rounded ${BRIGHTNESS_STYLE[key]}`}>
                {info.label} — {info.desc.slice(0, 18)}…
              </span>
            ))}
          </div>

          {/* 强弱统计 */}
          <div className="text-xs text-[#5c4d3d] bg-[#fdfaf3] border border-[#f0e7d8] rounded px-3 py-2 leading-relaxed">
            <span className="text-[#c0392b] font-medium">本盘亮度：</span>
            强星（庙旺得）{strong.length} 颗，弱星（平陷）{weak.length} 颗。
            庙旺星多的领域是命盘"发力点"；平陷星多的领域需多留意，其宫位代表该方面较费心或较平淡。
          </div>

          {/* 亮度表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#fdfaf3]">
                  <th className="px-3 py-2 text-left text-[#5c4d3d] font-medium">星曜</th>
                  <th className="px-3 py-2 text-left text-[#5c4d3d] font-medium">亮度</th>
                  <th className="px-3 py-2 text-left text-[#5c4d3d] font-medium">所在宫</th>
                  <th className="px-3 py-2 text-left text-[#5c4d3d] font-medium">星性</th>
                  <th className="px-3 py-2 text-left text-[#5c4d3d] font-medium">关键词</th>
                </tr>
              </thead>
              <tbody>
                {stars.map((s: StarBrightness, i: number) => (
                  <tr key={s.name} className={i % 2 === 0 ? 'bg-[#fdfaf3]' : 'bg-white'}>
                    <td className="px-3 py-2 border-t border-[#e8dcc8] font-medium text-[#2c2416] whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="px-3 py-2 border-t border-[#e8dcc8]">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${BRIGHTNESS_STYLE[s.brightness] ?? 'bg-gray-300 text-gray-700'}`}>
                        {s.brightness}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-t border-[#e8dcc8] text-[#5c4d3d] whitespace-nowrap">
                      {s.palace}宫 <span className="text-[#9a8b75] text-xs">{s.branch}</span>
                    </td>
                    <td className="px-3 py-2 border-t border-[#e8dcc8] text-[#9a8b75] text-xs">{s.nature}</td>
                    <td className="px-3 py-2 border-t border-[#e8dcc8] text-[#9a8b75] text-xs">
                      {s.keywords.slice(0, 4).join('、')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 亮度含义速查 */}
          <div className="text-xs text-[#5c4d3d] leading-relaxed border-t border-[#e8dcc8] pt-2">
            <span className="text-[#c0392b] font-medium">庙陷速解：</span>
            庙旺之星落本命强宫、又逢吉化，力量倍增；平陷之星逢煞忌则雪上加霜。
            断盘时先看"强星在哪些宫"（人生发力点），再看"弱星在哪些宫"（需经营的领域），最后以四化定吉凶应期。
          </div>
        </div>
      )}
    </div>
  )
}
