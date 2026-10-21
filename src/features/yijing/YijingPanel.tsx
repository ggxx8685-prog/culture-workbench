import { useEffect, useRef, useState } from 'react'
import { buildYiChart } from './yijingChart'
import type { YiChart } from './yijingChart'
import { BA_GUA, yaoLabel } from './yijingHexagram'
import { TUAN, DETAIL } from './yijingTuan'
import { YijingLearnPanel } from './YijingLearnPanel'
import { getSharedProfile } from '../../shared/profile'
// @ts-ignore lunar-javascript 无类型声明
import { Solar } from 'lunar-javascript'

const HOURS = [
  '子时（23:00-01:00）', '丑时（01:00-03:00）', '寅时（03:00-05:00）', '卯时（05:00-07:00）',
  '辰时（07:00-09:00）', '巳时（09:00-11:00）', '午时（11:00-13:00）', '未时（13:00-15:00）',
  '申时（15:00-17:00）', '酉时（17:00-19:00）', '戌时（19:00-21:00）', '亥时（21:00-23:00）',
]

const YAO_POSITION: Record<number, string> = {
  1: '初爻 · 根基初始', 2: '二爻 · 时机配合', 3: '三爻 · 过程变动',
  4: '四爻 · 转折外援', 5: '五爻 · 核心成就', 6: '上爻 · 结局归宿',
}

// 六爻卦画（下到上），可标动爻
function HexagramLines({ lines, movingYao, size = 30 }: { lines: number[]; movingYao?: number; size?: number }) {
  const display = [...lines].reverse()
  return (
    <div className="flex flex-col gap-[4px]">
      {display.map((v, i) => {
        const yaoIndex = lines.length - i
        const isMoving = movingYao === yaoIndex
        return (
          <div key={i} className="flex items-center gap-2 justify-center">
            <div
              className={v === 1 ? 'bg-[#2c2416]' : 'bg-[#e8dcc8]'}
              style={{ width: size, height: v === 1 ? 4 : 2, marginTop: v === 1 ? 0 : 1, borderRadius: 1 }}
            />
            {isMoving && <span className="text-[10px] text-[#c0392b] font-bold">●{yaoIndex}</span>}
          </div>
        )
      })}
    </div>
  )
}

// 单卦卡：卦画 + 卦名 + 动爻 + 卦辞 + 动爻爻辞 + 大象 + 卦意 + 变卦
function GuaCard({ title, subtitle, chart, accent, flowLabel }: {
  title: string
  subtitle: string
  chart: YiChart
  accent: boolean
  flowLabel?: string
}) {
  if (!chart.benGua || !chart.bianGua) return null
  return (
    <div className={`bg-white rounded-lg p-4 ${accent ? 'border-2 border-[#c0392b]' : 'border border-[#e8dcc8]'}`}>
      <div className="text-xs text-[#9a8b75] mb-1">{title} · {subtitle}{flowLabel ? `（${flowLabel}）` : ''}</div>
      <div className="flex justify-center my-2">
        <HexagramLines lines={chart.benLines} movingYao={chart.movingYao} size={34} />
      </div>
      <div className="text-center">
        <span className="text-xl font-bold text-[#2c2416]">{chart.benGua.name}卦</span>
        <span className="ml-2 text-xs text-[#c0392b] font-medium">第{chart.movingYao}爻动</span>
      </div>
      <div className="text-center text-[11px] text-[#9a8b75] mt-0.5">
        {BA_GUA[chart.upperGua]}{chart.upperGua}上 · {BA_GUA[chart.lowerGua]}{chart.lowerGua}下
      </div>

      <div className="mt-3 pt-3 border-t border-[#f0e7d8] space-y-2 text-sm">
        <div>
          <span className="text-[11px] text-[#b8860b] font-medium">卦辞 </span>
          <p className="text-[#2c2416] leading-relaxed text-[13px]">{chart.benGua.gua}</p>
        </div>
        <div>
          <span className="text-[11px] text-[#b8860b] font-medium">彖传 </span>
          <p className="text-[#5c4d3d] leading-relaxed text-[12px]">{TUAN[chart.benGua.num - 1]}</p>
        </div>
        <div className="bg-[#fdf8e8] border border-[#f0e7d8] rounded p-2">
          <span className="text-[11px] text-[#b8860b] font-medium">动爻 {YAO_POSITION[chart.movingYao]} </span>
          <p className="text-[#2c2416] leading-relaxed text-[13px] font-medium">
            {yaoLabel(chart.benLines, chart.movingYao - 1)}：{chart.benGua.yaos[chart.movingYao - 1]}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-[#b8860b] font-medium">大象 </span>
          <p className="text-[#5c4d3d] leading-relaxed text-[13px]">{chart.benGua.daXiang}</p>
        </div>
        <div className="text-[11px] text-[#9a8b75] leading-relaxed">
          <p className="text-[#b8860b] font-medium mb-0.5">{chart.benGua.meaning}</p>
          <p>{DETAIL[chart.benGua.num - 1]}</p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#9a8b75]">
          <span>变 → {chart.bianGua.name}卦</span>
        </div>
      </div>
    </div>
  )
}

// 流年年支（按立春换年，取当年立春后之农历年支）
function getFlowYearZhi(year: number): string {
  try {
    const lunar = Solar.fromYmdHms(year, 3, 1, 0, 0, 0).getLunar()
    const zhi = (lunar as unknown as Record<string, () => string>).getYearZhiByLiChun?.()
    return zhi ?? lunar.getYearZhi()
  } catch {
    return '子'
  }
}

export function YijingPanel() {
  const [tab, setTab] = useState<'chart' | 'learn'>('chart')
  const [date, setDate] = useState('1990-01-01')
  const [hourIndex, setHourIndex] = useState(0)
  const [flowYear, setFlowYear] = useState(2026)
  const [charts, setCharts] = useState<{ xian: YiChart | null; hou: YiChart | null; liu: YiChart | null } | null>(null)
  const [source, setSource] = useState<string>('')

  // 跨模块联动：读共享档案自动起卦（仅挂载时一次）
  const appliedRef = useRef(false)
  useEffect(() => {
    if (appliedRef.current) return
    const p = getSharedProfile()
    if (p) {
      appliedRef.current = true
      setDate(p.date)
      setHourIndex(p.timeIndex)
      runChart(p.date, p.timeIndex, flowYear, '四柱联动')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (tab === 'learn') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">排盘推算</button>
          <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">学习知识</button>
        </div>
        <YijingLearnPanel />
      </div>
    )
  }

  const runChart = (d: string, h: number, fy: number, src: string) => {
    const [y, m, day] = d.split('-').map(Number)
    const xian = buildYiChart({ year: y, month: m, day, hourIndex: h })
    const hou = buildYiChart({ year: y, month: m, day, hourIndex: h }, { includeYear: false })
    const liuZhi = getFlowYearZhi(fy)
    const liu = buildYiChart({ year: y, month: m, day, hourIndex: h }, { yearBranchSeq: { 子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12 }[liuZhi] })
    setCharts({ xian, hou, liu })
    setSource(src)
  }

  const nowChart = () => {
    const now = new Date()
    const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const h = now.getHours()
    const idx = h >= 23 || h < 1 ? 0 : Math.floor((h + 1) / 2)
    runChart(d, idx, now.getFullYear(), '当前时间')
  }

  return (
    <div className="space-y-4">
      {/* Tab */}
      <div className="flex gap-2">
        <button onClick={() => setTab('chart')} className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm">排盘推算</button>
        <button onClick={() => setTab('learn')} className="px-4 py-1.5 bg-[#f0e7d8] text-[#5c4d3d] rounded text-sm hover:bg-[#e8dcc8]">学习知识</button>
      </div>

      {/* 起卦表单 */}
      <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
        <h3 className="text-base font-bold text-[#2c2416] mb-3">三卦推命 · 先天 / 后天 / 流年</h3>
        <p className="text-xs text-[#9a8b75] mb-3">
          参考四柱推命通行口径：<b>先天卦</b>以生年月日时全数起（重年支，命之体）；<b>后天卦</b>去年支以月日时重起（重日柱，运之用）；<b>流年卦</b>以流年支换年支逐年起（当年之运）。各家起法略有差异，供研习验证。
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生日期（阳历）</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]"
            />
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">出生时辰</div>
            <select
              value={hourIndex}
              onChange={(e) => setHourIndex(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]"
            >
              {HOURS.map((h, i) => <option key={h} value={i}>{h}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs text-[#9a8b75] mb-1">流年（占流年卦）</div>
            <select
              value={flowYear}
              onChange={(e) => setFlowYear(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-[#d4c9b8] rounded bg-[#fdfaf3] text-sm text-[#2c2416]"
            >
              {Array.from({ length: 41 }, (_, i) => 2000 + i).map((y) => <option key={y} value={y}>{y}年</option>)}
            </select>
          </div>
          <button
            onClick={() => runChart(date, hourIndex, flowYear, '生辰')}
            className="px-4 py-1.5 bg-[#c0392b] text-white rounded text-sm hover:bg-[#a93226]"
          >
            起卦推命
          </button>
          <button
            onClick={nowChart}
            className="px-4 py-1.5 border border-[#b8860b] text-[#b8860b] rounded text-sm hover:bg-[#fdf8e8]"
          >
            以当前时间起卦
          </button>
        </div>
      </div>

      {charts && (charts.xian || charts.hou || charts.liu) && (
        <div className="space-y-4">
          {/* 三卦并列 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {charts.xian && <GuaCard title="先天卦" subtitle="命之体 · 重年支" chart={charts.xian} accent />}
            {charts.hou && <GuaCard title="后天卦" subtitle="运之用 · 重日柱" chart={charts.hou} accent={false} />}
            {charts.liu && <GuaCard title="流年卦" subtitle="当年之运" chart={charts.liu} accent={false} flowLabel={`${flowYear}年`} />}
          </div>

          {/* 起卦信息 */}
          {charts.xian && (
            <div className="bg-[#fdfaf3] border border-[#f0e7d8] rounded-lg p-3 text-xs text-[#9a8b75]">
              起卦依据（{source}）：{charts.xian.yearZhi}年 · 农历{charts.xian.lunarMonth}月{charts.xian.lunarDay}日 · {charts.xian.hourZhi}时
              （流年卦以 {flowYear} 年年支换年，其余同法）
            </div>
          )}

          {/* 三卦合参 */}
          <div className="bg-white border border-[#e8dcc8] rounded-lg p-4">
            <div className="text-sm font-bold text-[#c0392b] mb-2">三卦合参</div>
            {charts.xian?.benGua && charts.hou?.benGua && charts.liu?.benGua && (
              <p className="text-sm text-[#5c4d3d] leading-relaxed">
                先天{charts.xian.benGua.name}卦为一生格局之体（{charts.xian.benGua.meaning}，第{charts.xian.movingYao}爻动）；
                后天{charts.hou.benGua.name}卦示后天造化之用（{charts.hou.benGua.meaning}，第{charts.hou.movingYao}爻动）；
                {flowYear}年流年卦为{charts.liu.benGua.name}（{charts.liu.benGua.meaning}，第{charts.liu.movingYao}爻动），主此年运势走向。
                体用互参、逐年印证，是"以卦推命"的根本法门。
              </p>
            )}
            <p className="text-xs text-[#b8a98f] mt-2">
              提示：卦象推命为传统占法之一，宜与紫微、八字等体系互证，不作绝对论断。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
