import { useState } from 'react'
import { buildChartReading } from './chartReading'
import type { ReadingSection } from './chartReading'
import { detectPatterns } from './palacePatterns'
import { extractStarBrightness, BRIGHTNESS_STYLE } from './starBrightness'
import type { StarBrightness } from './starBrightness'

const KEY = 'ziwei-reading-archive'

export interface ReadingRecord {
  id: string
  label: string
  solarDate: string
  timeIndex: number
  gender: string
  savedAt: string
  fiveElements: string
  soul: string
  body: string
  reading: ReadingSection[]
  patterns: { name: string; result: string }[]
  brightness: StarBrightness[]
}

function loadArchive(): ReadingRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function ReadingArchivePanel({ chartData, birthInfo }: { chartData: any; birthInfo: any }) {
  const [open, setOpen] = useState(false)
  const [records, setRecords] = useState<ReadingRecord[]>(loadArchive)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  if (!chartData || !birthInfo) return null

  const saveRecord = () => {
    const reading = buildChartReading(chartData)
    const patterns = detectPatterns(chartData)
    const brightness = extractStarBrightness(chartData)
    const rec: ReadingRecord = {
      id: Date.now().toString(36),
      label: `${birthInfo.date} ${birthInfo.gender}命`,
      solarDate: birthInfo.date,
      timeIndex: birthInfo.timeIndex,
      gender: birthInfo.gender,
      savedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      fiveElements: chartData.fiveElementsClass || '',
      soul: chartData.soul || '',
      body: chartData.body || '',
      reading,
      patterns: patterns.map((p) => ({ name: p.name, result: p.result })),
      brightness,
    }
    const next = [rec, ...loadArchive()].slice(0, 50)
    localStorage.setItem(KEY, JSON.stringify(next))
    setRecords(next)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const deleteRecord = (id: string) => {
    const next = records.filter((r) => r.id !== id)
    localStorage.setItem(KEY, JSON.stringify(next))
    setRecords(next)
    if (expanded === id) setExpanded(null)
  }

  return (
    <div className="bg-white rounded-lg border border-[#d4c9b8] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#f8f4ea] hover:bg-[#f5efe0] transition-colors"
      >
        <span className="text-sm font-bold text-[#2c2416]">
          📚 解读档案
          <span className="ml-2 text-xs font-normal text-[#9a8b75]">
            {records.length > 0 ? `${records.length} 份存档 · 便于日后回看验证` : '保存解读报告，积累验证案例'}
          </span>
        </span>
        <span className="text-xs text-[#9a8b75]">{open ? '▴ 收起' : '▾ 展开'}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={saveRecord}
              className={`px-4 py-1.5 text-sm rounded transition-colors ${
                justSaved
                  ? 'bg-[#b8860b] text-white'
                  : 'bg-[#c0392b] text-white hover:bg-[#a83227]'
              }`}
            >
              {justSaved ? '✓ 已保存' : '＋ 保存当前解读'}
            </button>
            <span className="text-xs text-[#9a8b75]">
              当前盘 · {birthInfo.date} {chartData.fiveElementsClass || ''} · {chartData.soul || ''}身{chartData.body || ''}
            </span>
          </div>

          {records.length === 0 ? (
            <div className="text-sm text-[#5c4d3d] py-4 text-center border border-dashed border-[#e8dcc8] rounded-lg">
              暂无存档。排盘后点击"保存当前解读"，把命盘解读、格局、庙陷一并存档，
              过段时间再回看，验证当初的判断是否应验——这就是"互相学习验证"。
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((rec) => (
                <div key={rec.id} className="border border-[#e8dcc8] rounded-lg overflow-hidden">
                  <div className="px-3 py-2 flex items-center justify-between bg-[#fdfaf3] hover:bg-[#f5efe0]">
                    <button
                      onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span className="text-sm font-medium text-[#2c2416]">{rec.label}</span>
                      <span className="text-xs text-[#9a8b75]">{rec.solarDate} · {rec.gender}命</span>
                      <span className="text-xs text-[#b8a98f]">{rec.savedAt}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      {rec.patterns.slice(0, 3).map((p) => (
                        <span key={p.name} className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0e7d8] text-[#8a7a5f]">
                          {p.name}
                        </span>
                      ))}
                      <button
                        onClick={() => deleteRecord(rec.id)}
                        className="text-[10px] text-[#9a8b75] hover:text-[#c0392b]"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  {expanded === rec.id && (
                    <div className="px-3 py-3 bg-white space-y-2.5">
                      <div className="text-xs text-[#9a8b75]">
                        {rec.fiveElements} · 命主{rec.soul} · 身主{rec.body}
                      </div>
                      {rec.reading.map((sec) => (
                        <div key={sec.title}>
                          <div className="text-xs font-bold text-[#2c2416] mb-0.5">
                            {sec.icon} {sec.title}
                          </div>
                          <div className="space-y-1">
                            {sec.items.map((item, i) => (
                              <div key={i} className="text-xs text-[#5c4d3d] leading-relaxed bg-[#fdfaf3] border border-[#f0e7d8] rounded px-2 py-1">
                                {item.split('\n').map((l, j) => <div key={j}>{l}</div>)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {rec.brightness.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-[#2c2416] mb-1">⭐ 星曜亮度</div>
                          <div className="flex flex-wrap gap-1">
                            {rec.brightness.map((s) => (
                              <span key={s.name} className="text-[10px] px-1.5 py-0.5 rounded border border-[#e8dcc8] bg-[#fdfaf3] text-[#5c4d3d]">
                                {s.name}
                                <span className={`ml-1 px-1 rounded text-white ${BRIGHTNESS_STYLE[s.brightness] ?? 'bg-gray-400'}`}>
                                  {s.brightness}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
