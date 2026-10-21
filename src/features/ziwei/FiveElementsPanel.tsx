import { useMemo, useState, useEffect, useRef } from 'react'
import { NAYIN_TABLE, lookupNayin, ELEMENT_STYLE } from './nayinTable'
import type { NayinEntry } from './nayinTable'

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 自绘下拉选择器：避免原生 select 在受控渲染下的弹回/误触问题
function Dropdown({ options, value, onChange }: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`px-3 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416] min-w-[64px] text-center hover:border-[#b8860b] transition-colors ${
          open ? 'border-[#b8860b] ring-1 ring-[#b8860b]' : ''
        }`}
      >
        {value}
        <span className="ml-1 text-[10px] text-[#9a8b75]">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 bg-white border border-[#d4c9b8] rounded shadow-lg max-h-56 overflow-y-auto w-full min-w-[64px]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full px-3 py-1.5 text-sm text-left hover:bg-[#f5efe0] transition-colors ${
                opt === value ? 'bg-[#fdf0ee] text-[#c0392b] font-medium' : 'text-[#2c2416]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FiveElementsPanel() {
  const [gan, setGan] = useState('甲')
  const [zhi, setZhi] = useState('子')
  const [filter, setFilter] = useState<string | null>(null)

  const entry = lookupNayin(gan + zhi)
  const table = useMemo(() => {
    // 六十甲子按 6 行 × 10 列展示
    return filter ? NAYIN_TABLE.filter((e) => e.element === filter) : NAYIN_TABLE
  }, [filter])

  if (!entry) return null

  return (
    <div className="space-y-4">
      {/* 查询区 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="text-sm font-bold text-[#2c2416] mb-3">年干支查五行局</div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#9a8b75]">天干</span>
            <Dropdown options={TIAN_GAN} value={gan} onChange={setGan} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#9a8b75]">地支</span>
            <Dropdown options={DI_ZHI} value={zhi} onChange={setZhi} />
          </div>
        </div>

        {/* 结果 */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className={`px-4 py-2 rounded border border-[#e8dcc8] ${ELEMENT_STYLE[entry.element]}`}>
            <div className="text-[11px] text-[#9a8b75]">干支</div>
            <div className="text-lg font-bold">{entry.ganZhi}</div>
          </div>
          <div className={`px-4 py-2 rounded border border-[#e8dcc8] ${ELEMENT_STYLE[entry.element]}`}>
            <div className="text-[11px] text-[#9a8b75]">纳音</div>
            <div className="text-lg font-bold">{entry.nayin}</div>
          </div>
          <div className={`px-4 py-2 rounded border border-[#e8dcc8] ${ELEMENT_STYLE[entry.element]}`}>
            <div className="text-[11px] text-[#9a8b75]">五行局</div>
            <div className="text-lg font-bold">{entry.juName}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-[#5c4d3d] bg-[#fdfaf3] border border-[#f0e7d8] rounded px-3 py-2">
          <span className="text-[#c0392b] font-medium">解读：</span>
          {entry.juName} · {(() => ({ 水二局: '起运 2 岁，二日进一宫定紫微', 木三局: '起运 3 岁，三日进一宫定紫微', 金四局: '起运 4 岁，四日进一宫定紫微', 土五局: '起运 5 岁，五日进一宫定紫微', 火六局: '起运 6 岁，六日进一宫定紫微' } as Record<string, string>))()[entry.juName]}。五行局由年干支纳音五行决定：金=四局、木=三局、水=二局、火=六局、土=五局。
        </div>
      </div>

      {/* 六十甲子速查表 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="text-sm font-bold text-[#2c2416]">六十甲子纳音速查表</div>
          <div className="flex gap-1.5">
            <button onClick={() => setFilter(null)}
              className={`text-[11px] px-2 py-0.5 rounded ${filter === null ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>
              全部
            </button>
            {(['金', '木', '水', '火', '土'] as const).map((el) => (
              <button key={el} onClick={() => setFilter(el)}
                className={`text-[11px] px-2 py-0.5 rounded ${filter === el ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>
                {el}（{NAYIN_TABLE.filter((e) => e.element === el).length}）
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
          {table.map((e: NayinEntry) => (
            <div key={e.ganZhi}
              className={`px-2 py-1.5 rounded text-center border ${ELEMENT_STYLE[e.element]} ${e.ganZhi === entry.ganZhi ? 'ring-2 ring-[#c0392b]' : 'border-transparent'}`}>
              <div className="text-xs font-bold text-[#2c2416]">{e.ganZhi}</div>
              <div className="text-[11px]">{e.nayin}</div>
              <div className="text-[10px] text-[#9a8b75]">{e.juName}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
