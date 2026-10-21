import { useState } from 'react'
import { SAN_YUAN, JIU_XING, ER_SHI_SI, DI_LI_WU_JUE, FENGSHUI_KNOWLEDGE } from './fengshuiKnowledge'

// 年入中星：以三元甲子（1864 一白 / 1924 四绿 / 1984 七赤）为基准，逐年顺飞
function yearRuxing(year: number): number {
  const k = Math.floor((year - 1864) / 60)
  const base = [1, 4, 7][((k % 3) + 3) % 3]
  const start = 1864 + 60 * k
  const r = (base + (year - start)) % 9
  return r === 0 ? 9 : r
}

// 九宫布局（风水盘：上南下北）：[巽,离,坤 / 震,中,兑 / 艮,坎,乾]（洛书后天数 4,9,2 / 3,5,7 / 8,1,6）
const GONG_ORDER: { gong: string; pos: string; luoshu: number }[] = [
  { gong: '巽', pos: '东南', luoshu: 4 }, { gong: '离', pos: '南', luoshu: 9 }, { gong: '坤', pos: '西南', luoshu: 2 },
  { gong: '震', pos: '东', luoshu: 3 }, { gong: '中', pos: '中宫', luoshu: 5 }, { gong: '兑', pos: '西', luoshu: 7 },
  { gong: '艮', pos: '东北', luoshu: 8 }, { gong: '坎', pos: '北', luoshu: 1 }, { gong: '乾', pos: '西北', luoshu: 6 },
]

// 飞星轨迹：入中星 → 乾 → 兑 → 艮 → 离 → 坎 → 坤 → 震 → 巽（顺飞）
const FEI_TRACE: string[] = ['中', '乾', '兑', '艮', '离', '坎', '坤', '震', '巽']

const JI_COLOR: Record<string, string> = {
  吉: 'bg-[#e3f0e6] text-[#2f6b4f]', 凶: 'bg-[#fdeaea] text-[#c0392b]', 中: 'bg-[#fdf8e8] text-[#8a6d3b]',
}

export function FengshuiPanel() {
  const [tab, setTab] = useState<'yun' | 'luantou' | 'ershi' | 'learn'>('yun')
  const [year, setYear] = useState(2026)

  if (tab === 'learn') {
    return (
      <div className="space-y-4">
        <TabBar tab={tab} setTab={setTab} />
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">地理风水 · 基础知识</h3>
          <div className="space-y-2.5">
            {FENGSHUI_KNOWLEDGE.map((k, i) => (
              <div key={i} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="text-sm font-bold text-[#c0392b]">{k.title}</div>
                <p className="text-xs text-[#5c4d3d] mt-1 leading-relaxed">{k.content}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#b8a98f] mt-3">注：堪舆流派众多（三合/三元/玄空），飞星排法各家口径略异，此处取通行口径，供研习验证。</p>
        </div>
      </div>
    )
  }

  if (tab === 'luantou') {
    return (
      <div className="space-y-4">
        <TabBar tab={tab} setTab={setTab} />
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">地理五诀（峦头）</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {DI_LI_WU_JUE.map((d) => (
              <div key={d.key} className="border border-[#e8dcc8] rounded p-3 bg-[#fdfaf3]">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#c0392b] text-white text-sm font-bold">{d.key}</span>
                  <span className="text-sm font-bold text-[#2c2416]">{d.title}</span>
                </div>
                <p className="text-[11px] text-[#5c4d3d] mt-2 leading-relaxed">{d.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (tab === 'ershi') {
    return (
      <div className="space-y-4">
        <TabBar tab={tab} setTab={setTab} />
        <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
          <h3 className="text-base font-bold text-[#2c2416] mb-3">二十四山罗盘（八卦统三山，每山 15°）</h3>
          <div className="grid grid-cols-4 gap-2">
            {ER_SHI_SI.map((g) => (
              <div key={g.gua} className="border border-[#e8dcc8] rounded p-2.5 bg-[#fdfaf3] text-center">
                <div className="text-[10px] text-[#9a8b75]">{g.pos}</div>
                <div className="text-lg font-bold text-[#c0392b]">{g.gua}</div>
                <div className="text-sm text-[#2c2416]">{g.shan.join(' ')}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#9a8b75] mt-3">四正子午卯酉、四隅乾坤艮巽居中，余为天干地支二十四字；坐向立向皆以此为准。</p>
        </div>
      </div>
    )
  }

  // 推运
  const yun = SAN_YUAN.find((y) => year >= y.yearStart && year <= y.yearEnd)
  const ruxing = yearRuxing(year)
  // 飞星分布：入中星 s，s 在中宫，s+1 在乾…
  const feiMap: Record<string, number> = {}
  FEI_TRACE.forEach((gong, i) => {
    feiMap[gong] = ((ruxing - 1 + i) % 9) + 1
  })

  return (
    <div className="space-y-4">
      <TabBar tab={tab} setTab={setTab} />

      {/* 三元九运 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <h3 className="text-base font-bold text-[#2c2416] mb-3">三元九运 · {year}年</h3>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28 px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]" />
          {yun && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded bg-[#c0392b] text-white text-sm font-bold">{yun.yun}（{yun.yearStart}-{yun.yearEnd}）</span>
              <span className="px-2.5 py-1 rounded bg-[#fdf8e8] border border-[#f0e0b8] text-sm text-[#b8860b]">{yun.gua}运 · {yun.wuxing} · {yun.note}</span>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[560px]">
            <thead>
              <tr className="bg-[#f0e7d8]">
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">元</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">运</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">年份</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">卦·五行</th>
                <th className="border border-[#e8dcc8] px-2 py-1.5 text-[#2c2416]">备注</th>
              </tr>
            </thead>
            <tbody>
              {SAN_YUAN.map((y, i) => (
                <tr key={i} className={yun && y.yun === yun.yun ? 'bg-[#fdf0ee]' : 'bg-white'}>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 text-center">{i < 3 ? '上元' : i < 6 ? '中元' : '下元'}</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 font-bold text-[#c0392b]">{y.yun}</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 text-center">{y.yearStart}-{y.yearEnd}</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5 text-center">{y.gua}·{y.wuxing}</td>
                  <td className="border border-[#e8dcc8] px-2 py-1.5">{y.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 九宫飞星年盘 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="text-sm font-bold text-[#2c2416]">九宫飞星年盘 · {year}年</div>
          <span className="px-2.5 py-1 rounded bg-[#c0392b] text-white text-xs">{ruxing}入中（{JIU_XING[ruxing].star}）</span>
          <span className="text-[11px] text-[#9a8b75]">以三元甲子起星逐年顺飞（口径：1864 一白 / 1924 四绿 / 1984 七赤）</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 max-w-md">
          {GONG_ORDER.map((g) => {
            const starNum = feiMap[g.gong]
            const info = JIU_XING[starNum]
            return (
              <div key={g.gong} className={`rounded border p-2.5 text-center ${g.gong === '中' ? 'border-[#c0392b] bg-[#fdf0ee]' : 'border-[#e8dcc8] bg-[#fdfaf3]'}`}>
                <div className="text-[10px] text-[#9a8b75]">{g.pos}·{g.gong}</div>
                <div className={`text-2xl font-bold ${JI_COLOR[info.ji].split(' ')[1]}`}>{starNum}</div>
                <div className={`text-[11px] font-bold ${JI_COLOR[info.ji].split(' ')[0] === 'bg-[#fdeaea]' ? 'text-[#c0392b]' : 'text-[#2f6b4f]'}`}>{info.star}</div>
                <div className="text-[9px] text-[#9a8b75]">{info.wuxing} · {info.ji}</div>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-[#b8a98f] mt-2.5">五黄（{GONG_ORDER.find((g) => feiMap[g.gong] === 5)?.pos}）、二黑（{GONG_ORDER.find((g) => feiMap[g.gong] === 2)?.pos}）为流年大煞方，宜静不宜动。</p>
      </div>
    </div>
  )
}

function TabBar({ tab, setTab }: { tab: string; setTab: (t: 'yun' | 'luantou' | 'ershi' | 'learn') => void }) {
  const tabs: [string, 'yun' | 'luantou' | 'ershi' | 'learn'][] = [
    ['三元九运', 'yun'], ['地理五诀', 'luantou'], ['二十四山', 'ershi'], ['学习知识', 'learn'],
  ]
  return (
    <div className="flex gap-2">
      {tabs.map(([label, key]) => (
        <button key={key} onClick={() => setTab(key)} className={`px-4 py-1.5 rounded text-sm ${tab === key ? 'bg-[#c0392b] text-white' : 'bg-[#f0e7d8] text-[#5c4d3d] hover:bg-[#e8dcc8]'}`}>{label}</button>
      ))}
    </div>
  )
}
